import math
from datetime import datetime, timedelta

MARKET_POOL = {
    "Mega Cap": ["AAPL", "MSFT", "NVDA", "AMZN", "META"],
    "Growth": ["TSLA", "AMD", "PLTR", "COIN"],
    "ETFs": ["SPY", "QQQ", "IWM", "GLD"],
    "Crypto": ["BTC-USD", "ETH-USD", "SOL-USD"],
}

MARKET_META = {
    "AAPL": {"name": "Apple", "base_price": 212.0, "sector": "Mega Cap", "asset_type": "equity"},
    "MSFT": {"name": "Microsoft", "base_price": 428.0, "sector": "Mega Cap", "asset_type": "equity"},
    "NVDA": {"name": "NVIDIA", "base_price": 134.0, "sector": "Mega Cap", "asset_type": "equity"},
    "AMZN": {"name": "Amazon", "base_price": 186.0, "sector": "Mega Cap", "asset_type": "equity"},
    "META": {"name": "Meta", "base_price": 498.0, "sector": "Mega Cap", "asset_type": "equity"},
    "TSLA": {"name": "Tesla", "base_price": 196.0, "sector": "Growth", "asset_type": "equity"},
    "AMD": {"name": "AMD", "base_price": 168.0, "sector": "Growth", "asset_type": "equity"},
    "PLTR": {"name": "Palantir", "base_price": 28.0, "sector": "Growth", "asset_type": "equity"},
    "COIN": {"name": "Coinbase", "base_price": 238.0, "sector": "Growth", "asset_type": "equity"},
    "SPY": {"name": "SPDR S&P 500 ETF", "base_price": 518.0, "sector": "ETFs", "asset_type": "etf"},
    "QQQ": {"name": "Invesco QQQ", "base_price": 443.0, "sector": "ETFs", "asset_type": "etf"},
    "IWM": {"name": "iShares Russell 2000 ETF", "base_price": 204.0, "sector": "ETFs", "asset_type": "etf"},
    "GLD": {"name": "SPDR Gold Shares", "base_price": 216.0, "sector": "ETFs", "asset_type": "etf"},
    "BTC-USD": {"name": "Bitcoin", "base_price": 84200.0, "sector": "Crypto", "asset_type": "crypto"},
    "ETH-USD": {"name": "Ethereum", "base_price": 3980.0, "sector": "Crypto", "asset_type": "crypto"},
    "SOL-USD": {"name": "Solana", "base_price": 176.0, "sector": "Crypto", "asset_type": "crypto"},
}

MARKET_NAMES = {symbol: meta["name"] for symbol, meta in MARKET_META.items()}


def normalize_symbol(symbol):
    return str(symbol or "").strip().upper()


def get_market_meta(symbol):
    normalized = normalize_symbol(symbol)
    fallback = {
        "name": normalized or "Unknown Asset",
        "base_price": 100.0,
        "sector": "General",
        "asset_type": "equity",
    }
    return normalized, MARKET_META.get(normalized, fallback)


def symbol_seed(symbol):
    return sum(ord(char) for char in str(symbol))


def generate_kline(symbol, days=60):
    normalized, meta = get_market_meta(symbol)
    seed = symbol_seed(normalized)
    total_days = max(5, int(days))
    today = datetime.utcnow()
    close = meta["base_price"] + (seed % 11) * 1.25
    crypto = meta["asset_type"] == "crypto"
    points = []

    for index in range(total_days):
        day_index = total_days - index
        date = today - timedelta(days=day_index)
        trend = math.sin((index + seed) / 6.0) * 1.6 + math.cos((index + seed) / 13.0) * 0.9
        drift = ((seed % 7) - 3) * 0.08
        if crypto:
            trend *= 2.2
            drift *= 1.5

        open_price = close + math.sin((index + seed) / 4.0) * (1.2 if crypto else 0.8)
        next_close = max(meta["base_price"] * 0.25, open_price + trend * 0.45 + drift)
        wick = 1.5 if crypto else 0.6
        high = max(open_price, next_close) + wick + ((seed + index) % 5) * 0.12
        low = min(open_price, next_close) - wick - ((seed + index) % 4) * 0.1
        volume_base = 900000000 if crypto else 3000000
        volume_span = 800000000 if crypto else 5000000
        volume = volume_base + ((seed * 113) + (index * 9173)) % volume_span

        points.append({
            "date": date.strftime("%Y-%m-%d"),
            "open": round(open_price, 2),
            "close": round(next_close, 2),
            "high": round(high, 2),
            "low": round(low, 2),
            "volume": int(volume),
        })
        close = next_close

    return points


def generate_quote(symbol):
    normalized, meta = get_market_meta(symbol)
    history = generate_kline(normalized, 61)
    latest = history[-1]
    previous = history[-2]
    change = round(latest["close"] - previous["close"], 2)
    change_pct = round((change / previous["close"]) * 100, 2) if previous["close"] else 0.0

    return {
        "symbol": normalized,
        "name": meta["name"],
        "price": latest["close"],
        "change": change,
        "change_pct": change_pct,
        "high": latest["high"],
        "low": latest["low"],
        "open": latest["open"],
        "volume": latest["volume"],
        "turnover": round(latest["volume"] * latest["close"], 2),
    }


def generate_quotes(symbols):
    return [generate_quote(symbol) for symbol in symbols if normalize_symbol(symbol)]


def generate_news(symbol):
    normalized, meta = get_market_meta(symbol)
    now = datetime.utcnow()
    templates = [
        (
            f"{meta['name']} stays on the U2INVEST watchlist as traders track {meta['sector'].lower()} leadership",
            "U2INVEST Feed",
            "This preview uses deterministic demo headlines so the app stays stable without a live market-data backend.",
        ),
        (
            f"{meta['name']} highlights the difference between momentum and long-term fundamentals",
            "Market Note",
            "Use the Trading Lab chart alongside U2CHAT to compare price action with valuation and risk context.",
        ),
        (
            f"What to review before analysing {meta['name']} in depth",
            "Learning Desk",
            "Start with trend, concentration risk, and whether the thesis depends on optimistic assumptions.",
        ),
    ]

    return [
        {
            "title": title,
            "source": source,
            "time": (now - timedelta(hours=index * 3)).strftime("%Y-%m-%d %H:%M"),
            "summary": summary,
        }
        for index, (title, source, summary) in enumerate(templates)
    ]


def generate_fundamentals(symbol):
    normalized, meta = get_market_meta(symbol)
    seed = symbol_seed(normalized)

    if meta["asset_type"] == "crypto":
        return {
            "asset_type": "Crypto",
            "PE_ratio": "N/A",
            "PB_ratio": "N/A",
            "ROE": "N/A",
            "network_growth": f"{18 + (seed % 21)}%",
            "volatility_profile": "High",
        }

    pe_ratio = round(18 + (seed % 20) + ((seed % 5) * 0.4), 1)
    pb_ratio = round(3.2 + ((seed % 9) * 0.45), 1)
    roe = 10 + (seed % 18)

    return {
        "asset_type": meta["asset_type"].title(),
        "PE_ratio": pe_ratio,
        "PB_ratio": pb_ratio,
        "ROE": f"{roe}%",
    }
