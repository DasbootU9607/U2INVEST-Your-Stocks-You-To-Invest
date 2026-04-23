import json
from functools import lru_cache

from langchain_core.tools import tool

from market_demo import generate_fundamentals, generate_kline, generate_news, generate_quote


@lru_cache(maxsize=1)
def get_retriever():
    try:
        from vector_store import build_vector_db

        return build_vector_db()
    except Exception as error:
        print(f"Knowledge base initialization failed: {error}")
        return None


@tool
def get_realtime_quote(symbol: str):
    """Get a real-time style quote for a supported US stock, ETF, or crypto symbol. Example input: 'AAPL' or 'BTC-USD'."""
    try:
        quote = generate_quote(symbol)
        return {
            "name": quote["name"],
            "latest_price": quote["price"],
            "change_percent": f"{quote['change_pct']}%",
            "high": quote["high"],
            "low": quote["low"],
        }
    except Exception as e:
        return f"Failed to get real-time quote: {str(e)}"


@tool
def get_stock_news(symbol: str):
    """Get the latest demo headlines for a supported US stock, ETF, or crypto symbol."""
    try:
        headlines = generate_news(symbol)[:5]
        return "\n".join([f"- {headline['title']}" for headline in headlines])
    except Exception as e:
        return f"News service temporarily unavailable: {str(e)}"


@tool
def get_historical_kline(symbol: str):
    """Get historical K-line data for generating charts. Returns JSON containing [date, open, close, low, high]."""
    try:
        chart_data = []
        for row in generate_kline(symbol, 60):
            chart_data.append([
                row["date"],
                row["open"],
                row["close"],
                row["low"],
                row["high"],
            ])

        return json.dumps({
            "symbol": symbol,
            "type": "kline_data",
            "data": chart_data,
        }, ensure_ascii=False)
    except Exception as e:
        return f"Failed to parse K-line data: {str(e)}"


@tool
def get_fundamental_data(symbol: str):
    """Get key financial indicators for a supported US stock, ETF, or crypto symbol."""
    try:
        return generate_fundamentals(symbol)
    except Exception as e:
        return f"Failed to get fundamental data: {str(e)}"


@tool
def query_knowledge_base(query: str):
    """Retrieve investment guides and industry research from local PDF documents."""
    retriever = get_retriever()
    if not retriever:
        return "Knowledge base not initialized."

    try:
        docs = retriever.invoke(query)
        return "\n\n".join([doc.page_content for doc in docs[:2]])
    except Exception as e:
        return f"Error querying knowledge base: {str(e)}"


tools = [
    get_realtime_quote,
    get_stock_news,
    get_historical_kline,
    get_fundamental_data,
    query_knowledge_base,
]
