import akshare as ak
import pandas as pd
import time
import json
from langchain_core.tools import tool
from vector_store import build_vector_db

# Initialize RAG retriever
try:
    retriever = build_vector_db()
except Exception:
    retriever = None

# Stock names mapping (English)
STOCK_NAMES = {
    "600519": "Moutai", "000858": "Wuliangye", "601318": "Ping An",
    "600036": "CMB", "000001": "Ping An Bank",
    "000063": "ZTE", "002230": "iFLYTEK", "002415": "Hikvision",
    "300059": "East Money", "300750": "CATL",
    "002594": "BYD", "601012": "LONGi", "600733": "BAIC BluePark",
    "601398": "ICBC", "601166": "Industrial Bank", "600030": "CITIC"
}

# --- Tool 1: Real-time Quote ---
@tool
def get_realtime_quote(symbol: str):
    """Get real-time quote for a 6-digit stock code. Example input: '600519'"""
    try:
        # Use spot_em to get market snapshot, filter for target
        df = ak.stock_zh_a_spot_em()
        target = df[df['代码'] == symbol].iloc[0]
        
        # Try to get English name, fallback to Chinese name from API
        name = STOCK_NAMES.get(symbol, target['名称'])
        
        return {
            "name": name,
            "latest_price": float(target['最新价']),
            "change_percent": f"{target['涨跌幅']}%",
            "high": float(target['最高']),
            "low": float(target['最低'])
        }
    except Exception as e:
        return f"Failed to get real-time quote: {str(e)}"

# --- Tool 2: Stock News ---
@tool
def get_stock_news(symbol: str):
    """Get the latest 5 news headlines for a specific stock."""
    try:
        news_df = ak.stock_news_em(symbol=symbol)
        if news_df.empty: return "No relevant news found."
        return "\n".join([f"- {t}" for t in news_df['title'].head(5).tolist()])
    except Exception as e:
        return f"News service temporarily unavailable: {str(e)}"

# --- Tool 3: Historical K-Line (For Charting) ---
@tool
def get_historical_kline(symbol: str):
    """Get historical K-line data for generating ECharts. Returns JSON containing [date, open, close, low, high]."""
    try:
        # Use stable East Money history interface
        df = ak.stock_zh_a_hist(symbol=symbol, period="daily", adjust="qfq")
        if df.empty: return "No historical data found."
        
        df = df.tail(60) # Get last 60 days
        # Force column mapping to ensure frontend ECharts compatibility
        # Interface return is usually: date, open, close, high, low, ...
        chart_data = []
        for _, row in df.iterrows():
            chart_data.append([
                str(row['日期']), 
                float(row['开盘']), 
                float(row['收盘']), 
                float(row['最低']), 
                float(row['最高'])
            ])
        
        return json.dumps({
            "symbol": symbol,
            "type": "kline_data",
            "data": chart_data
        }, ensure_ascii=False)
    except Exception as e:
        return f"Failed to parse K-line data: {str(e)}"

# --- Tool 4: Fundamental Data ---
@tool
def get_fundamental_data(symbol: str):
    """Get key financial indicators (PE, PB, ROE, etc.) for a stock."""
    try:
        # Use more stable indicator interface
        df = ak.stock_a_indicator_lg(symbol=symbol)
        latest = df.iloc[-1]
        return {
            "PE_ratio": float(latest['pe']),
            "PB_ratio": float(latest['pb']),
            "ROE": f"{latest['net_profit_growth_rate']}%"
        }
    except Exception as e:
        return f"Failed to get fundamental data: {str(e)}"

# --- Tool 5: Knowledge Base Retrieval ---
@tool
def query_knowledge_base(query: str):
    """Retrieve investment guides and industry research from local PDF documents."""
    if not retriever: return "Knowledge base not initialized."
    try:
        docs = retriever.invoke(query)
        return "\n\n".join([d.page_content for d in docs[:2]])
    except Exception as e:
        return f"Error querying knowledge base: {str(e)}"

tools = [get_realtime_quote, get_stock_news, get_historical_kline, get_fundamental_data, query_knowledge_base]