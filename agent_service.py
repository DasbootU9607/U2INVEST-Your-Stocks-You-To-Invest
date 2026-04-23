import os
import re
from concurrent.futures import ThreadPoolExecutor, TimeoutError as FuturesTimeoutError
from datetime import datetime, timedelta
from typing import Any, Dict, List, Optional, Tuple

from langchain_core.messages import HumanMessage

from market_demo import MARKET_META
from runtime_config import DATA_DIR

TICKER_STOPWORDS = {
    "A",
    "AI",
    "AM",
    "API",
    "ARE",
    "ETF",
    "ETFS",
    "FOR",
    "I",
    "IS",
    "JSON",
    "NOW",
    "OF",
    "ON",
    "PE",
    "PM",
    "RSI",
    "THE",
    "TO",
    "U2",
    "USD",
}

TRADINGAGENTS_TRIGGER_KEYWORDS = {
    "analyze",
    "analysis",
    "deep analysis",
    "full analysis",
    "multi-agent",
    "tradingagents",
    "bull case",
    "bear case",
    "bullish",
    "bearish",
    "buy",
    "sell",
    "hold",
    "rating",
    "outlook",
    "thesis",
    "price target",
    "recommend",
    "recommendation",
    "risk",
    "portfolio",
}

KNOWN_SYMBOLS = sorted(MARKET_META.keys(), key=len, reverse=True)
KNOWN_NAMES = {
    meta["name"].lower(): symbol
    for symbol, meta in MARKET_META.items()
}
TICKER_PATTERN = re.compile(r"\$?([A-Z]{1,5}(?:-[A-Z]{2,5}|(?:\.[A-Z]{1,4}))?)\b")
DATE_PATTERN = re.compile(r"\b(20\d{2})[-/](\d{2})[-/](\d{2})\b")


def get_agent_backend_mode() -> str:
    return os.getenv("AGENT_BACKEND", "auto").strip().lower() or "auto"


def get_tradingagents_provider() -> str:
    return os.getenv("TRADINGAGENTS_PROVIDER", "openai").strip().lower() or "openai"


def agent_is_configured() -> bool:
    backend = get_agent_backend_mode()

    if backend == "legacy":
        return bool(os.getenv("DEEPSEEK_API_KEY"))

    if backend == "tradingagents":
        return _tradingagents_is_configured()

    if backend == "auto":
        return _tradingagents_is_configured() or bool(os.getenv("DEEPSEEK_API_KEY"))

    return bool(os.getenv("DEEPSEEK_API_KEY"))


def run_agent_message(user_message: str, session_id: str) -> Tuple[str, List[Dict[str, Any]], str]:
    backend = get_agent_backend_mode()
    legacy_configured = bool(os.getenv("DEEPSEEK_API_KEY"))

    if backend in {"tradingagents", "auto"}:
        trading_request = resolve_tradingagents_request(user_message)

        if backend == "tradingagents" or trading_request:
            try:
                response, tools_used = run_tradingagents_message_with_timeout(
                    user_message,
                    trading_request=trading_request,
                )
                return response, tools_used, "tradingagents"
            except Exception as error:
                if backend == "tradingagents" and not legacy_configured:
                    raise RuntimeError(f"TradingAgents backend failed: {error}") from error

                print(f"TradingAgents fallback triggered: {error}")
                if legacy_configured:
                    response, tool_results = run_legacy_message(user_message, session_id)
                    fallback_note = (
                        "TradingAgents timed out on this deployment, so I used the fast fallback agent.\n\n"
                        if isinstance(error, TimeoutError)
                        else "TradingAgents was unavailable on this deployment, so I used the fast fallback agent.\n\n"
                    )
                    tool_results = [
                        {
                            "tool": "tradingagents_fallback",
                            "args": {
                                "reason": str(error),
                            },
                        },
                        *tool_results,
                    ]
                    return fallback_note + response, tool_results, "legacy-fallback"

    response, tools_used = run_legacy_message(user_message, session_id)
    return response, tools_used, "legacy"


def run_legacy_message(user_message: str, session_id: str) -> Tuple[str, List[Dict[str, Any]]]:
    if not os.getenv("DEEPSEEK_API_KEY"):
        raise RuntimeError(
            "Legacy agent is not configured. Set DEEPSEEK_API_KEY in your environment."
        )

    from agent_graph import stock_agent_app

    config = {"configurable": {"thread_id": session_id}}
    initial_state = {"messages": [HumanMessage(content=user_message)]}

    response_content = ""
    tool_results: List[Dict[str, Any]] = []

    for event in stock_agent_app.stream(initial_state, config):
        for output in event.values():
            if "messages" not in output:
                continue

            last_msg = output["messages"][-1]
            if hasattr(last_msg, "content") and last_msg.content:
                response_content = last_msg.content

            if hasattr(last_msg, "tool_calls") and last_msg.tool_calls:
                for tool_call in last_msg.tool_calls:
                    tool_results.append(
                        {
                            "tool": tool_call.get("name", "unknown"),
                            "args": tool_call.get("args", {}),
                        }
                    )

    return response_content or "Please rephrase your question.", tool_results


def run_tradingagents_message(
    user_message: str,
    trading_request: Optional[Dict[str, str]] = None,
) -> Tuple[str, List[Dict[str, Any]]]:
    trading_request = trading_request or resolve_tradingagents_request(user_message)
    if not trading_request:
        raise RuntimeError(
            "TradingAgents needs a stock ticker or company name in the message."
        )

    _prime_tradingagents_env()

    from tradingagents.default_config import DEFAULT_CONFIG
    from tradingagents.graph.trading_graph import TradingAgentsGraph

    config = DEFAULT_CONFIG.copy()
    config["llm_provider"] = get_tradingagents_provider()
    config["deep_think_llm"] = _resolve_tradingagents_model(
        override_name="TRADINGAGENTS_DEEP_MODEL",
        default_model=config.get("deep_think_llm", "gpt-5.4"),
    )
    config["quick_think_llm"] = _resolve_tradingagents_model(
        override_name="TRADINGAGENTS_QUICK_MODEL",
        default_model=config.get("quick_think_llm", "gpt-5.4-mini"),
    )

    backend_url = _resolve_tradingagents_backend_url(
        default_backend_url=config.get("backend_url", "https://api.openai.com/v1"),
    )
    if backend_url:
        config["backend_url"] = backend_url

    config["max_debate_rounds"] = _get_positive_int_env("TRADINGAGENTS_MAX_DEBATE_ROUNDS", 1)
    config["max_risk_discuss_rounds"] = _get_positive_int_env(
        "TRADINGAGENTS_MAX_RISK_ROUNDS",
        1,
    )
    config["output_language"] = os.getenv("TRADINGAGENTS_OUTPUT_LANGUAGE", "English")
    config["results_dir"] = str(DATA_DIR / "tradingagents-logs")
    config["data_cache_dir"] = str(DATA_DIR / "tradingagents-cache")

    data_vendor = os.getenv("TRADINGAGENTS_DATA_VENDOR", "yfinance").strip().lower() or "yfinance"
    config["data_vendors"] = {
        "core_stock_apis": data_vendor,
        "technical_indicators": data_vendor,
        "fundamental_data": data_vendor,
        "news_data": data_vendor,
    }

    selected_analysts = [
        analyst.strip()
        for analyst in os.getenv(
            "TRADINGAGENTS_SELECTED_ANALYSTS",
            "market,fundamentals",
        ).split(",")
        if analyst.strip()
    ]

    trading_graph = TradingAgentsGraph(
        selected_analysts=selected_analysts,
        debug=False,
        config=config,
    )

    full_state, decision = trading_graph.propagate(
        trading_request["symbol"],
        trading_request["trade_date"],
    )

    response = build_tradingagents_response(
        symbol=trading_request["symbol"],
        trade_date=trading_request["trade_date"],
        decision=decision,
        full_state=full_state,
    )

    tools_used = [
        {
            "tool": "tradingagents",
            "args": {
                "symbol": trading_request["symbol"],
                "trade_date": trading_request["trade_date"],
                "llm_provider": config["llm_provider"],
                "data_vendor": data_vendor,
            },
        }
    ]

    return response, tools_used


def run_tradingagents_message_with_timeout(
    user_message: str,
    trading_request: Optional[Dict[str, str]] = None,
) -> Tuple[str, List[Dict[str, Any]]]:
    timeout_seconds = _get_positive_int_env("TRADINGAGENTS_TIMEOUT_SECONDS", 25)

    with ThreadPoolExecutor(max_workers=1) as executor:
        future = executor.submit(run_tradingagents_message, user_message, trading_request)
        try:
            return future.result(timeout=timeout_seconds)
        except FuturesTimeoutError as error:
            future.cancel()
            raise TimeoutError(
                f"TradingAgents exceeded {timeout_seconds}s timeout"
            ) from error


def resolve_tradingagents_request(user_message: str) -> Optional[Dict[str, str]]:
    normalized_message = user_message.strip()
    if not normalized_message:
        return None

    symbol = (
        extract_focus_stock(normalized_message)
        or extract_known_symbol(normalized_message)
        or extract_known_company(normalized_message)
        or extract_generic_ticker(normalized_message)
    )
    if not symbol:
        return None

    lower_message = normalized_message.lower()
    force_for_stocks = os.getenv("TRADINGAGENTS_FORCE_FOR_STOCKS", "false").strip().lower() == "true"
    has_trigger = any(keyword in lower_message for keyword in TRADINGAGENTS_TRIGGER_KEYWORDS)
    if not force_for_stocks and not has_trigger:
        return None

    return {
        "symbol": symbol,
        "trade_date": extract_trade_date(normalized_message),
    }


def extract_focus_stock(message: str) -> Optional[str]:
    match = re.search(r"focus stocks:\s*(.+)$", message, flags=re.IGNORECASE | re.DOTALL)
    if not match:
        return None

    stock_list = [
        item.strip().upper()
        for item in re.split(r"[,/\n]", match.group(1))
        if item.strip()
    ]
    for item in stock_list:
        if item in MARKET_META:
            return item

    return None


def extract_known_symbol(message: str) -> Optional[str]:
    upper_message = message.upper()
    for symbol in KNOWN_SYMBOLS:
        if re.search(rf"(?<![A-Z0-9]){re.escape(symbol)}(?![A-Z0-9])", upper_message):
            return symbol
    return None


def extract_known_company(message: str) -> Optional[str]:
    lower_message = message.lower()
    for company_name, symbol in KNOWN_NAMES.items():
        if re.search(rf"\b{re.escape(company_name)}\b", lower_message):
            return symbol
    return None


def extract_generic_ticker(message: str) -> Optional[str]:
    for match in TICKER_PATTERN.finditer(message.upper()):
        candidate = match.group(1).strip("$")
        if candidate in TICKER_STOPWORDS:
            continue
        return candidate
    return None


def extract_trade_date(message: str) -> str:
    explicit_date = DATE_PATTERN.search(message)
    if explicit_date:
        return f"{explicit_date.group(1)}-{explicit_date.group(2)}-{explicit_date.group(3)}"

    lower_message = message.lower()
    today = datetime.utcnow().date()
    if "yesterday" in lower_message:
        return (today - timedelta(days=1)).isoformat()

    return today.isoformat()


def build_tradingagents_response(
    symbol: str,
    trade_date: str,
    decision: str,
    full_state: Dict[str, Any],
) -> str:
    sections = [
        "### TradingAgents Decision",
        f"- Symbol: {symbol}",
        f"- Analysis date: {trade_date}",
        f"- Final rating: {decision}",
        "",
        "### Portfolio Manager",
        _truncate_text(full_state.get("final_trade_decision")),
        "",
        "### Investment Plan",
        _truncate_text(full_state.get("investment_plan")),
        "",
        "### Analyst Highlights",
        f"- Market: {_summarize_text(full_state.get('market_report'))}",
        f"- Sentiment: {_summarize_text(full_state.get('sentiment_report'))}",
        f"- News: {_summarize_text(full_state.get('news_report'))}",
        f"- Fundamentals: {_summarize_text(full_state.get('fundamentals_report'))}",
    ]

    return "\n".join(line for line in sections if line is not None and line != "")


def _truncate_text(text: Any, limit: int = 1800) -> str:
    cleaned = _clean_text(text)
    if not cleaned:
        return "No detailed portfolio-manager report was returned."

    if len(cleaned) <= limit:
        return cleaned

    return cleaned[: limit - 3].rstrip() + "..."


def _summarize_text(text: Any, limit: int = 240) -> str:
    cleaned = _clean_text(text)
    if not cleaned:
        return "No analyst report returned."

    if len(cleaned) <= limit:
        return cleaned

    return cleaned[: limit - 3].rstrip() + "..."


def _clean_text(text: Any) -> str:
    if text is None:
        return ""
    return re.sub(r"\s+", " ", str(text)).strip()


def _prime_tradingagents_env() -> None:
    provider = get_tradingagents_provider()

    if provider == "openai":
        if not os.getenv("OPENAI_API_KEY") and os.getenv("DEEPSEEK_API_KEY"):
            os.environ["OPENAI_API_KEY"] = os.getenv("DEEPSEEK_API_KEY", "")
        if not os.getenv("OPENAI_API_KEY"):
            raise RuntimeError(
                "TradingAgents openai-compatible provider needs OPENAI_API_KEY or DEEPSEEK_API_KEY."
            )


def _tradingagents_is_configured() -> bool:
    provider = get_tradingagents_provider()

    if provider == "openai":
        return bool(os.getenv("OPENAI_API_KEY") or os.getenv("DEEPSEEK_API_KEY"))

    provider_key_map = {
        "google": "GOOGLE_API_KEY",
        "anthropic": "ANTHROPIC_API_KEY",
        "xai": "XAI_API_KEY",
        "openrouter": "OPENROUTER_API_KEY",
        "ollama": "OLLAMA_HOST",
    }
    required_key = provider_key_map.get(provider)
    return bool(required_key and os.getenv(required_key))


def _get_positive_int_env(name: str, default: int) -> int:
    raw_value = os.getenv(name, "").strip()
    if not raw_value:
        return default

    try:
        parsed = int(raw_value)
    except ValueError:
        return default

    return parsed if parsed > 0 else default


def _resolve_tradingagents_model(override_name: str, default_model: str) -> str:
    if os.getenv(override_name):
        return os.getenv(override_name, "").strip()

    if os.getenv("DEEPSEEK_API_KEY"):
        return os.getenv("DEEPSEEK_MODEL", "deepseek-chat").strip()

    return default_model


def _resolve_tradingagents_backend_url(default_backend_url: str) -> str:
    if os.getenv("TRADINGAGENTS_BACKEND_URL"):
        return os.getenv("TRADINGAGENTS_BACKEND_URL", "").strip()

    if os.getenv("DEEPSEEK_API_KEY"):
        return os.getenv("DEEPSEEK_BASE_URL", "https://api.deepseek.com").strip()

    return default_backend_url
