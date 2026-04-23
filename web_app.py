import os
import sys
import json
import uuid
import time
import random
import builtins
from pathlib import Path
from datetime import datetime
from flask import Flask, abort, render_template, request, jsonify, send_from_directory, session
from flask_cors import CORS
from dotenv import load_dotenv
from collections import defaultdict
from werkzeug.middleware.proxy_fix import ProxyFix
from market_demo import MARKET_POOL, generate_kline, generate_news, generate_quotes
from runtime_config import (
    CHROMA_DB_DIR,
    CHECKPOINTS_DB_PATH,
    DATA_DIR,
    KNOWLEDGE_BASE_PATH,
    ROOT_DIR,
)


def safe_print(*args, **kwargs):
    try:
        builtins.print(*args, **kwargs)
    except UnicodeEncodeError:
        file = kwargs.get("file", sys.stdout)
        encoding = getattr(file, "encoding", None) or "utf-8"
        cleaned_args = [
            str(arg).encode(encoding, errors="ignore").decode(encoding, errors="ignore")
            for arg in args
        ]
        builtins.print(*cleaned_args, **kwargs)


print = safe_print

# Load environment variables
load_dotenv()

app = Flask(__name__)
if os.getenv("TRUST_PROXY_HEADERS", "true").lower() == "true":
    app.wsgi_app = ProxyFix(app.wsgi_app, x_for=1, x_proto=1, x_host=1, x_port=1)

# Use environment variable for secret key (SECURITY BEST PRACTICE)
app.secret_key = os.getenv('FLASK_SECRET_KEY')
if not app.secret_key:
    print("WARNING: FLASK_SECRET_KEY not set.")
    print("Using a development secret key. Set FLASK_SECRET_KEY before deploying.")
    app.secret_key = 'dev-key-CHANGE-ME-in-production'

app.config['SESSION_COOKIE_SAMESITE'] = os.getenv('SESSION_COOKIE_SAMESITE', 'Lax')
app.config['SESSION_COOKIE_SECURE'] = os.getenv('SESSION_COOKIE_SECURE', 'false').lower() == 'true'
app.config['SESSION_COOKIE_HTTPONLY'] = True


def get_cors_origins():
    defaults = [
        'http://127.0.0.1:5173',
        'http://localhost:5173',
        'http://127.0.0.1:5000',
        'http://localhost:5000',
    ]
    extra = [
        origin.strip()
        for origin in os.getenv('FRONTEND_ORIGINS', '').split(',')
        if origin.strip()
    ]
    return sorted(set(defaults + extra))


CORS(app, supports_credentials=True, origins=get_cors_origins())

UI_DIST_DIR = ROOT_DIR / "ui improvement" / "dist"
VIDEO_DIR = ROOT_DIR / "video"
CONTACT_VIDEO_DIR = ROOT_DIR / "contact"
HERO_VIDEO_EXTENSIONS = {".mp4", ".webm", ".ogg", ".m4v", ".mov"}


def get_positive_float_env(name):
    value = os.getenv(name, "").strip()
    if not value:
        return None

    try:
        parsed = float(value)
    except ValueError:
        print(f"WARNING: Invalid value for {name}: {value}")
        return None

    return parsed if parsed > 0 else None


def get_positive_int_env(name):
    value = os.getenv(name, "").strip()
    if not value:
        return None

    try:
        parsed = int(value)
    except ValueError:
        print(f"WARNING: Invalid value for {name}: {value}")
        return None

    return parsed if parsed > 0 else None


def list_media_files(directory):
    if not directory.exists():
        return []

    media_files = [
        path
        for path in directory.iterdir()
        if path.is_file() and path.suffix.lower() in HERO_VIDEO_EXTENSIONS
    ]

    max_file_mb = get_positive_float_env("BACKGROUND_VIDEO_MAX_MB")
    if max_file_mb is not None:
        max_bytes = max_file_mb * 1024 * 1024
        filtered_files = [path for path in media_files if path.stat().st_size <= max_bytes]
        if filtered_files:
            media_files = filtered_files

    max_count = get_positive_int_env("BACKGROUND_VIDEO_MAX_COUNT")
    if max_count is not None and len(media_files) > max_count:
        media_files = sorted(
            media_files,
            key=lambda path: (path.stat().st_size, path.name.lower()),
        )[:max_count]

    return [path.name for path in sorted(media_files, key=lambda path: path.name.lower())]


def directory_is_writable(directory):
    try:
        directory.mkdir(parents=True, exist_ok=True)
        probe_path = directory / ".write-test"
        probe_path.write_text("ok", encoding="utf-8")
        probe_path.unlink(missing_ok=True)
        return True, None
    except OSError as error:
        return False, str(error)

# --- Academy Database (50 Modules for Beginners) ---
ACADEMY_DATA = [
    {"id": 1, "parent": None, "cat": "Foundations", "difficulty": 1, "name": "Time Value of Money", "video": "cy4PiY5ERTI", "source": "Patrick Boyle", "views": "280k", "completed": False, "ratings": [5, 4, 5], "video_intro": "The foundation of all valuation.", "outcomes": ["Calculate Present & Future Value", "Understand Discount Rates"], "takeaways": ["Money today is worth more than tomorrow", "Compounding is exponential"]},
    {"id": 2, "parent": 1, "cat": "Economics", "difficulty": 1, "name": "Market Microstructure", "video": "zi78J-h1XgY", "source": "The Plain Bagel", "views": "142k", "completed": False, "ratings": [4, 5], "video_intro": "Order book dynamics.", "outcomes": ["Analyze Bid-Ask Spreads", "Understand Liquidity Providers"], "takeaways": ["Market depth impacts trade execution", "Spreads reflect liquidity costs"]},
    {"id": 3, "parent": 2, "cat": "Foundations", "difficulty": 1, "name": "Stock Market for Beginners", "video": "T_2b2d_y64Q", "source": "Humphrey Yang", "views": "1.2M", "completed": False, "ratings": [5], "video_intro": "A complete guide to starting your journey.", "outcomes": ["Open Brokerage Accounts", "Place First Trade"], "takeaways": ["Start early to maximize growth", "Consistency is key to success"]},
    {"id": 4, "parent": 3, "cat": "Foundations", "difficulty": 1, "name": "What is a Stock?", "video": "C_3f_3_J_00", "source": "Khan Academy", "views": "850k", "completed": False, "ratings": [5], "video_intro": "Understanding equity ownership.", "outcomes": ["Define Equity Ownership", "Differentiate Common vs Preferred"], "takeaways": ["Stocks represent real business ownership", "Shareholders have voting rights"]},
    {"id": 5, "parent": 4, "cat": "Foundations", "difficulty": 1, "name": "How the Stock Market Works", "video": "p7HKvqRI_Bo", "source": "TED-Ed", "views": "2.1M", "completed": False, "ratings": [4], "video_intro": "The mechanics of the exchange.", "outcomes": ["Explain Exchange Mechanisms", "Understand IPO Process"], "takeaways": ["Markets efficiently allocate capital", "Supply and demand drive prices"]},
    {"id": 6, "parent": 5, "cat": "Foundations", "difficulty": 1, "name": "Types of Investments", "video": "f5px_b_y_1Q", "source": "The Plain Bagel", "views": "600k", "completed": False, "ratings": [5], "video_intro": "Stocks, Bonds, and more.", "outcomes": ["Compare Asset Classes", "Assess Risk vs Reward"], "takeaways": ["Diversification reduces portfolio risk", "Different assets serve different goals"]},
    {"id": 7, "parent": 6, "cat": "Foundations", "difficulty": 1, "name": "Power of Compound Interest", "video": "X_D_J_y_Q_g_Q", "source": "Khan Academy", "views": "900k", "completed": False, "ratings": [5], "video_intro": "The 8th wonder of the world.", "outcomes": ["Calculate Compound Returns", "Project Long-term Growth"], "takeaways": ["Time in market beats timing market", "Reinvesting earnings accelerates wealth"]},
    {"id": 8, "parent": 7, "cat": "Analysis", "difficulty": 2, "name": "Understanding Financials", "video": "21STUhQ-iP0", "source": "The Plain Bagel", "views": "450k", "completed": False, "ratings": [5], "video_intro": "How to read the big three statements.", "outcomes": ["Read Balance Sheets", "Analyze Income Statements"], "takeaways": ["Financials reveal true company health", "Look for consistent performance"]},
    {"id": 9, "parent": 8, "cat": "Analysis", "difficulty": 2, "name": "P/E Ratio Explained", "video": "4KkTGx2bK_4", "source": "Investopedia", "views": "300k", "completed": False, "ratings": [4], "video_intro": "Valuing a company via earnings.", "outcomes": ["Calculate Price-to-Earnings", "Compare Valuation Metrics"], "takeaways": ["High P/E implies high growth expectations", "Price alone tells you nothing"]},
    {"id": 10, "parent": 9, "cat": "Analysis", "difficulty": 2, "name": "EPS & Earnings Growth", "video": "_u_J9g_D_FM", "source": "Patrick Boyle", "views": "120k", "completed": False, "ratings": [4], "video_intro": "Tracking profitability per share.", "outcomes": ["Calculate Earnings Per Share", "Analyze Growth Trends"], "takeaways": ["EPS growth drives stock prices", "Watch for dilution risks"]},
    {"id": 11, "parent": 10, "cat": "Analysis", "difficulty": 2, "name": "Technical Analysis Basics", "video": "p7HKvqRI_Bo", "source": "TED-Ed", "views": "500k", "completed": False, "ratings": [5], "video_intro": "Reading charts and patterns.", "outcomes": ["Identify Support & Resistance", "Recognize Chart Patterns"], "takeaways": ["Price action reflects market psychology", "Trend is your friend until it bends"]},
    {"id": 12, "parent": 11, "cat": "Analysis", "difficulty": 2, "name": "Fundamental Analysis", "video": "21STUhQ-iP0", "source": "The Plain Bagel", "views": "350k", "completed": False, "ratings": [5], "video_intro": "Digging into company value.", "outcomes": ["Evaluate Business Moats", "Assess Management Quality"], "takeaways": ["Value depends on future cash flows", "Buy quality businesses at fair prices"]},
    {"id": 13, "parent": 12, "cat": "Strategy", "difficulty": 2, "name": "Portfolio Management", "video": "f5px_b_y_1Q", "source": "The Plain Bagel", "views": "200k", "completed": False, "ratings": [4], "video_intro": "Organizing your investments.", "outcomes": ["Construct Balanced Portfolios", "Execute Rebalancing"], "takeaways": ["Asset allocation drives returns", "Regular maintenance reduces risk"]},
    {"id": 14, "parent": 13, "cat": "Strategy", "difficulty": 2, "name": "Risk Management", "video": "p7HKvqRI_Bo", "source": "TED-Ed", "views": "180k", "completed": False, "ratings": [5], "video_intro": "Avoiding catastrophic losses.", "outcomes": ["Determine Position Sizing", "Set Stop-Loss Levels"], "takeaways": ["Capital preservation is priority #1", "Never risk more than you can lose"]},
    {"id": 15, "parent": 14, "cat": "Strategy", "difficulty": 1, "name": "Long-Term vs Short-Term", "video": "p7HKvqRI_Bo", "source": "TED-Ed", "views": "400k", "completed": False, "ratings": [4], "video_intro": "Investing vs Trading.", "outcomes": ["Define Investment Horizon", "Understand Tax Implications"], "takeaways": ["Investing is for wealth building", "Trading is for income generation"]},
    {"id": 16, "parent": 15, "cat": "Foundations", "difficulty": 1, "name": "Bonds, Funds, and ETFs", "video": "f5px_b_y_1Q", "source": "The Plain Bagel", "views": "320k", "completed": False, "ratings": [5], "video_intro": "Diverse investment vehicles.", "outcomes": ["Distinguish ETFs vs Mutual Funds", "Understand Fixed Income"], "takeaways": ["ETFs offer low-cost diversification", "Bonds provide stability and income"]},
    {"id": 17, "parent": 16, "cat": "Foundations", "difficulty": 1, "name": "S&P 500 Explained", "video": "p7HKvqRI_Bo", "source": "TED-Ed", "views": "1.1M", "completed": False, "ratings": [5], "video_intro": "The benchmark of the US market.", "outcomes": ["Understand Market Indices", "Analyze Index Weighting"], "takeaways": ["S&P 500 represents US economy", "Passive indexing beats most active funds"]},
    {"id": 18, "parent": 17, "cat": "Analysis", "difficulty": 1, "name": "Market Capitalization", "video": "p7HKvqRI_Bo", "source": "TED-Ed", "views": "250k", "completed": False, "ratings": [4], "video_intro": "Understanding company size.", "outcomes": ["Categorize Cap Sizes", "Evaluate Growth vs Stability"], "takeaways": ["Small caps offer higher growth potential", "Large caps offer stability and dividends"]},
    {"id": 19, "parent": 18, "cat": "Analysis", "difficulty": 2, "name": "Reading a Balance Sheet", "video": "21STUhQ-iP0", "source": "The Plain Bagel", "views": "150k", "completed": False, "ratings": [5], "video_intro": "What a company owns and owes.", "outcomes": ["Calculate Working Capital", "Assess Debt-to-Equity"], "takeaways": ["Assets = Liabilities + Equity", "Solvency is key to survival"]},
    {"id": 20, "parent": 19, "cat": "Analysis", "difficulty": 2, "name": "Income Statement Basics", "video": "21STUhQ-iP0", "source": "The Plain Bagel", "views": "180k", "completed": False, "ratings": [4], "video_intro": "Revenue, expenses, and profit.", "outcomes": ["Analyze Revenue Streams", "Calculate Profit Margins"], "takeaways": ["Top line is vanity, bottom line is sanity", "Margins indicate competitive advantage"]},
    {"id": 21, "parent": 20, "cat": "Analysis", "difficulty": 2, "name": "Cash Flow Statement", "video": "21STUhQ-iP0", "source": "The Plain Bagel", "views": "110k", "completed": False, "ratings": [4], "video_intro": "Tracking the movement of money.", "outcomes": ["Analyze Operating Cash Flow", "Calculate Free Cash Flow"], "takeaways": ["Cash flow creates shareholder value", "Profits can be manipulated, cash cannot"]},
    {"id": 22, "parent": 21, "cat": "Analysis", "difficulty": 2, "name": "Candlestick Patterns", "video": "p7HKvqRI_Bo", "source": "TED-Ed", "views": "600k", "completed": False, "ratings": [5], "video_intro": "Decoding price action.", "outcomes": ["Identify Reversal Patterns", "Interpret Market Sentiment"], "takeaways": ["Candlesticks reveal buyer/seller battle", "Context is crucial for pattern accuracy"]},
    {"id": 23, "parent": 22, "cat": "Economics", "difficulty": 1, "name": "Bull vs Bear Markets", "video": "p7HKvqRI_Bo", "source": "TED-Ed", "views": "3.5M", "completed": False, "ratings": [5], "video_intro": "Cycles of optimism and pessimism.", "outcomes": ["Identify Market Cycles", "Adjust Strategy per Cycle"], "takeaways": ["Bull markets climb a wall of worry", "Bear markets transfer wealth to patient"]},
    {"id": 24, "parent": 23, "cat": "Strategy", "difficulty": 2, "name": "Dividend Investing", "video": "f5px_b_y_1Q", "source": "The Plain Bagel", "views": "1.5M", "completed": False, "ratings": [5], "video_intro": "Building passive income.", "outcomes": ["Calculate Dividend Yield", "Evaluate Payout Ratios"], "takeaways": ["Dividends provide passive income stream", "Dividend growth signals company health"]},
    {"id": 25, "parent": 24, "cat": "Strategy", "difficulty": 1, "name": "Index Fund Investing", "video": "f5px_b_y_1Q", "source": "The Plain Bagel", "views": "700k", "completed": False, "ratings": [5], "video_intro": "Low-cost wealth building.", "outcomes": ["Minimize Expense Ratios", "Automate Monthly Investing"], "takeaways": ["You don't need to beat the market", "Low costs lead to higher net returns"]},
    {"id": 26, "parent": 25, "cat": "Analysis", "difficulty": 2, "name": "How to Research Stocks", "video": "21STUhQ-iP0", "source": "The Plain Bagel", "views": "400k", "completed": False, "ratings": [5], "video_intro": "Step-by-step due diligence.", "outcomes": ["Find Reliable Data Sources", "Perform SWOT Analysis"], "takeaways": ["Do your own due diligence (DYODD)", "Information asymmetry is your enemy"]},
    {"id": 27, "parent": 26, "cat": "Strategy", "difficulty": 2, "name": "Stock Trading Basics", "video": "p7HKvqRI_Bo", "source": "TED-Ed", "views": "250k", "completed": False, "ratings": [4], "video_intro": "Buying and selling mechanics.", "outcomes": ["Understand Order Types", "Execute Trades Efficiently"], "takeaways": ["Market orders for speed, limit for price", "Emotional discipline is mandatory"]},
    {"id": 28, "parent": 27, "cat": "Advanced", "difficulty": 3, "name": "Options Trading 101", "video": "p7HKvqRI_Bo", "source": "TED-Ed", "views": "1.2M", "completed": False, "ratings": [5], "video_intro": "Leveraging your capital.", "outcomes": ["Differentiate Calls vs Puts", "Understand Option Greeks"], "takeaways": ["Options offer leverage and hedging", "Time decay works against buyers"]},
    {"id": 29, "parent": 28, "cat": "Strategy", "difficulty": 2, "name": "REITs Explained", "video": "f5px_b_y_1Q", "source": "The Plain Bagel", "views": "190k", "completed": False, "ratings": [4], "video_intro": "Investing in real estate via stocks.", "outcomes": ["Analyze FFO vs EPS", "Assess Property Sectors"], "takeaways": ["Real estate exposure with liquidity", "REITs must pay 90% of income as dividends"]},
    {"id": 30, "parent": 29, "cat": "Foundations", "difficulty": 2, "name": "Cryptocurrency Intro", "video": "p7HKvqRI_Bo", "source": "TED-Ed", "views": "5M", "completed": False, "ratings": [5], "video_intro": "Bitcoin, Blockchain, and more.", "outcomes": ["Understand Blockchain Tech", "Secure Digital Wallets"], "takeaways": ["Decentralization removes intermediaries", "High volatility requires high risk tolerance"]},
    {"id": 31, "parent": 30, "cat": "Psychology", "difficulty": 2, "name": "Behavioral Finance", "video": "p7HKvqRI_Bo", "source": "TED-Ed", "views": "100k", "completed": False, "ratings": [5], "video_intro": "Why we make bad money choices.", "outcomes": ["Identify Cognitive Biases", "Overcome FOMO & Panic"], "takeaways": ["Investing is 90% emotional control", "Self-awareness improves decision making"]},
    {"id": 32, "parent": 31, "cat": "Strategy", "difficulty": 1, "name": "Dollar Cost Averaging", "video": "f5px_b_y_1Q", "source": "The Plain Bagel", "views": "300k", "completed": False, "ratings": [5], "video_intro": "Smoothing out market entry.", "outcomes": ["Implement Automatic Deposits", "Reduce Timing Risk"], "takeaways": ["Buy more shares when prices are low", "Removes emotion from investing"]},
    {"id": 33, "parent": 32, "cat": "Strategy", "difficulty": 2, "name": "Asset Allocation", "video": "f5px_b_y_1Q", "source": "The Plain Bagel", "views": "150k", "completed": False, "ratings": [5], "video_intro": "The only free lunch in finance.", "outcomes": ["Determine Risk Tolerance", "Diversify Across Sectors"], "takeaways": ["Diversification reduces unsystematic risk", "Rebalance to maintain target allocation"]},
    {"id": 34, "parent": 33, "cat": "Economics", "difficulty": 2, "name": "Market Cycles", "video": "p7HKvqRI_Bo", "source": "TED-Ed", "views": "8M", "completed": False, "ratings": [5], "video_intro": "How the economic machine works.", "outcomes": ["Recognize Cycle Stages", "Anticipate Sector Rotation"], "takeaways": ["Economies expand and contract naturally", "Positioning depends on the cycle phase"]},
    {"id": 35, "parent": 34, "cat": "Strategy", "difficulty": 2, "name": "Growth vs Value", "video": "p7HKvqRI_Bo", "source": "TED-Ed", "views": "220k", "completed": False, "ratings": [4], "video_intro": "Two distinct paths to profit.", "outcomes": ["Screen for Growth Stocks", "Identify Value Traps"], "takeaways": ["Growth focuses on future potential", "Value focuses on current bargains"]},
    {"id": 36, "parent": 35, "cat": "Economics", "difficulty": 2, "name": "Inflation & Stocks", "video": "p7HKvqRI_Bo", "source": "TED-Ed", "views": "1M", "completed": False, "ratings": [4], "video_intro": "The hidden tax on savings.", "outcomes": ["Assess Purchasing Power", "Identify Inflation Hedges"], "takeaways": ["Cash loses value over time", "Real assets protect against inflation"]},
    {"id": 37, "parent": 36, "cat": "Economics", "difficulty": 2, "name": "Interest Rates & Fed", "video": "p7HKvqRI_Bo", "source": "TED-Ed", "views": "240k", "completed": False, "ratings": [5], "video_intro": "The engine of the economy.", "outcomes": ["Monitor Fed Policy", "Understand Yield Curve"], "takeaways": ["Rates act as gravity on asset prices", "Don't fight the Federal Reserve"]},
    {"id": 38, "parent": 37, "cat": "Foundations", "difficulty": 2, "name": "IPOs Explained", "video": "p7HKvqRI_Bo", "source": "TED-Ed", "views": "300k", "completed": False, "ratings": [4], "video_intro": "Going public.", "outcomes": ["Analyze S-1 Filings", "Understand Lock-up Periods"], "takeaways": ["IPOs often underperform initially", "Insiders sell into liquidity events"]},
    {"id": 39, "parent": 38, "cat": "Foundations", "difficulty": 1, "name": "Stock Splits & Buybacks", "video": "p7HKvqRI_Bo", "source": "TED-Ed", "views": "150k", "completed": False, "ratings": [4], "video_intro": "Corporate actions.", "outcomes": ["Calculate Adjusted Price", "Evaluate Shareholder Yield"], "takeaways": ["Splits are cosmetic, buybacks are real", "Buybacks increase ownership share"]},
    {"id": 40, "parent": 39, "cat": "Strategy", "difficulty": 3, "name": "Short Selling Basics", "video": "p7HKvqRI_Bo", "source": "TED-Ed", "views": "200k", "completed": False, "ratings": [3], "video_intro": "Profiting from declines.", "outcomes": ["Understand Borrowing Costs", "Identify Short Squeezes"], "takeaways": ["Shorting has unlimited downside risk", "Timing is critical for short sellers"]},
    {"id": 41, "parent": 40, "cat": "Economics", "difficulty": 2, "name": "Economic Indicators", "video": "p7HKvqRI_Bo", "source": "TED-Ed", "views": "120k", "completed": False, "ratings": [4], "video_intro": "Reading the dashboard.", "outcomes": ["Interpret GDP & Jobs Data", "Track Consumer Confidence"], "takeaways": ["Macro data drives market trends", "Leading indicators predict turning points"]},
    {"id": 42, "parent": 41, "cat": "Strategy", "difficulty": 2, "name": "Recession Strategies", "video": "p7HKvqRI_Bo", "source": "TED-Ed", "views": "500k", "completed": False, "ratings": [5], "video_intro": "Investing in downturns.", "outcomes": ["Select Defensive Stocks", "Build Cash Reserves"], "takeaways": ["Recessions create generation buying opps", "Cash provides optionality in crashes"]},
    {"id": 43, "parent": 42, "cat": "Foundations", "difficulty": 1, "name": "Tax-Advantaged Accounts", "video": "p7HKvqRI_Bo", "source": "TED-Ed", "views": "100k", "completed": False, "ratings": [5], "video_intro": "Saving on taxes.", "outcomes": ["Compare 401k vs IRA", "Maximize Tax Savings"], "takeaways": ["Taxes are your biggest expense", "Asset location matters as much as allocation"]},
    {"id": 44, "parent": 43, "cat": "Regulations", "difficulty": 2, "name": "Capital Gains Taxes", "video": "p7HKvqRI_Bo", "source": "TED-Ed", "views": "80k", "completed": False, "ratings": [4], "video_intro": "Selling for a profit.", "outcomes": ["Calculate Tax Liability", "Harvest Tax Losses"], "takeaways": ["Long-term rates are lower than short-term", "Never let taxes dictate a bad trade"]},
    {"id": 45, "parent": 44, "cat": "Strategy", "difficulty": 1, "name": "Market vs Limit Orders", "video": "p7HKvqRI_Bo", "source": "TED-Ed", "views": "140k", "completed": False, "ratings": [5], "video_intro": "How to execute trades.", "outcomes": ["Choose Correct Order Type", "Avoid Slippage Costs"], "takeaways": ["Limit orders guarantee price, not execution", "Market orders guarantee execution, not price"]},
    {"id": 46, "parent": 45, "cat": "Strategy", "difficulty": 2, "name": "Stop Loss Orders", "video": "p7HKvqRI_Bo", "source": "TED-Ed", "views": "110k", "completed": False, "ratings": [4], "video_intro": "Automation for protection.", "outcomes": ["Set Trailing Stops", "Manage Downside Risk"], "takeaways": ["Cut losers short, let winners run", "Automated stops remove emotional hesitation"]},
    {"id": 47, "parent": 46, "cat": "Analysis", "difficulty": 2, "name": "Analyzing Tech Stocks", "video": "p7HKvqRI_Bo", "source": "TED-Ed", "views": "300k", "completed": False, "ratings": [5], "video_intro": "Valuing innovation.", "outcomes": ["Analyze SaaS Metrics", "Evaluate Total Addressable Market"], "takeaways": ["Growth rates justify higher valuations", "Profitability may be delayed for scale"]},
    {"id": 48, "parent": 47, "cat": "Strategy", "difficulty": 2, "name": "Global Investing", "video": "p7HKvqRI_Bo", "source": "TED-Ed", "views": "90k", "completed": False, "ratings": [4], "video_intro": "Emerging markets.", "outcomes": ["Invest in Emerging Markets", "Manage Currency Risk"], "takeaways": ["Home bias limits your opportunity set", "Global diversification smooths returns"]},
    {"id": 49, "parent": 48, "cat": "Psychology", "difficulty": 2, "name": "Psychology of Trading", "video": "p7HKvqRI_Bo", "source": "TED-Ed", "views": "200k", "completed": False, "ratings": [5], "video_intro": "Mastering your mind.", "outcomes": ["Develop Trading Discipline", "Maintain Emotional Balance"], "takeaways": ["Your mindset is your biggest asset", "Stick to your plan when emotions run high"]},
    {"id": 50, "parent": 49, "cat": "Foundations", "difficulty": 2, "name": "Investment Banking", "video": "p7HKvqRI_Bo", "source": "TED-Ed", "views": "150k", "completed": False, "ratings": [4], "video_intro": "Inside Wall Street.", "outcomes": ["Understand M&A Process", "Analyze Capital Markets"], "takeaways": ["Investment banks facilitate global flows", "Understanding incentives explains market moves"]},
]

ACADEMY_DB = {m["id"]: m for m in ACADEMY_DATA}

COMMENTS_STORE = {i: [
    {"id": f"init-{i}", "user": "Analyst_Pro", "text": "Essential for any serious trader.", "likes": random.randint(1, 20), "timestamp": 1738900000, "replies": [
        {"id": f"r{i}", "user": f"User_{random.randint(1000, 9999)}", "text": "Agree, very helpful!", "likes": random.randint(0, 5)}
    ]}
] for i in range(1, 51)}


# --- Lab: Stock Pool (US equities, ETFs, and crypto) ---
STOCK_POOL = MARKET_POOL

USER_PORTFOLIOS = defaultdict(lambda: {
    "cash": 100000.0,
    "holdings": {},
    "history": [],
})

CHAT_SESSIONS = defaultdict(lambda: {})
INQUIRY_STORE = []


def ensure_user_session():
    if 'user_id' not in session:
        session['user_id'] = str(uuid.uuid4())


@app.before_request
def assign_user_session():
    ensure_user_session()



def build_fallback_news(symbol):
    return generate_news(symbol)


def serve_spa_entry(path=""):
    if UI_DIST_DIR.exists():
        candidate = UI_DIST_DIR / path if path else UI_DIST_DIR / "index.html"
        if path and candidate.is_file():
            return send_from_directory(UI_DIST_DIR, path)

        index_file = UI_DIST_DIR / "index.html"
        if index_file.exists():
            return send_from_directory(UI_DIST_DIR, "index.html")

    if path in ("", "index.html"):
        return render_template('index.html')

    return abort(404)


@app.route('/api/hero-videos')
def get_hero_videos():
    return jsonify({"videos": list_media_files(VIDEO_DIR)})


@app.route('/api/contact-videos')
def get_contact_videos():
    return jsonify({"videos": list_media_files(CONTACT_VIDEO_DIR)})


@app.route('/api/health')
def health_check():
    writable, error = directory_is_writable(DATA_DIR)
    status = {
        "status": "ok" if writable else "degraded",
        "service": "u2invest",
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "agent_configured": bool(os.getenv("DEEPSEEK_API_KEY")),
        "storage": {
            "data_dir": str(DATA_DIR),
            "checkpoints_db": str(CHECKPOINTS_DB_PATH),
            "chroma_db_dir": str(CHROMA_DB_DIR),
            "knowledge_base_path": str(KNOWLEDGE_BASE_PATH),
            "writable": writable,
        },
        "frontend": {
            "ui_dist_exists": UI_DIST_DIR.exists(),
            "hero_video_count": len(list_media_files(VIDEO_DIR)),
            "contact_video_count": len(list_media_files(CONTACT_VIDEO_DIR)),
        },
    }

    if error:
        status["storage"]["error"] = error

    return jsonify(status), 200 if writable else 503


def serve_media_file(directory, filename):
    requested_path = Path(filename)
    if ".." in requested_path.parts:
        return abort(404)

    if requested_path.suffix.lower() not in HERO_VIDEO_EXTENSIONS:
        return abort(404)

    target = directory / requested_path
    if not target.is_file():
        return abort(404)

    return send_from_directory(directory, str(requested_path), conditional=True)


@app.route('/video/<path:filename>')
def serve_hero_video(filename):
    return serve_media_file(VIDEO_DIR, filename)


@app.route('/contact-media/<path:filename>')
def serve_contact_video(filename):
    return serve_media_file(CONTACT_VIDEO_DIR, filename)

# ==================== Academy APIs (100% Preserved) ====================
@app.route('/api/academy')
def get_academy():
    return jsonify(list(ACADEMY_DB.values()))

@app.route('/api/academy/<int:cid>')
def get_course(cid):
    course = ACADEMY_DB.get(cid).copy()
    rates = course.get('ratings', [5])
    course['avg_rating'] = round(sum(rates) / len(rates), 1)
    course['comments'] = COMMENTS_STORE.get(cid, [])
    return jsonify(course)

@app.route('/api/comment', methods=['POST'])
def post_comment():
    data = request.json
    cid = data.get('id')
    text = data.get('text')
    parent_id = data.get('parentId')

    if not cid or not text:
        return jsonify({"status": "error", "message": "Missing content"}), 400

    new_id = str(uuid.uuid4())[:8]
    user_name = f"User_{uuid.uuid4().hex[:4]}"
    
    if parent_id:
        for c in COMMENTS_STORE.get(cid, []):
            if c['id'] == parent_id:
                c['replies'].append({
                    "id": new_id,
                    "user": user_name,
                    "text": text,
                    "likes": 0,
                    "timestamp": int(time.time())
                })
                break
    else:
        COMMENTS_STORE[cid].insert(0, {
            "id": new_id,
            "user": user_name,
            "text": text,
            "likes": 0,
            "replies": [],
            "timestamp": int(time.time())
        })

    return jsonify({"status": "success", "comments": COMMENTS_STORE[cid]})

@app.route('/api/comment/like', methods=['POST'])
def like_comment_main():
    data = request.json
    cid, cmid, action = data.get('courseId'), data.get('commentId'), data.get('action')
    for c in COMMENTS_STORE[cid]:
        if c['id'] == cmid:
            c['likes'] += 1 if action == 'inc' else -1
            return jsonify({"status": "success", "likes": c['likes']})
    return jsonify({"status": "error"}), 404

@app.route('/api/comment/reply/like', methods=['POST'])
def like_reply_unique():
    data = request.json
    cid, cmid, rid, action = data.get('courseId'), data.get('commentId'), data.get('replyId'), data.get('action')
    for c in COMMENTS_STORE[cid]:
        if c['id'] == cmid:
            for r in c['replies']:
                if r['id'] == rid:
                    r['likes'] = r.get('likes', 0) + (1 if action == 'inc' else -1)
                    return jsonify({"status": "success", "comments": COMMENTS_STORE[cid]})
    return jsonify({"status": "error"}), 404

@app.route('/api/complete', methods=['POST'])
def toggle_complete():
    data = request.json
    cid, status = data.get('id'), data.get('status')
    if cid in ACADEMY_DB:
        ACADEMY_DB[cid]['completed'] = status
        return jsonify({"status": "success"})
    return jsonify({"status": "error"}), 404

@app.route('/api/rate', methods=['POST'])
def rate_course():
    data = request.json
    cid, score = data.get('id'), data.get('score')
    ACADEMY_DB[cid]['ratings'].append(score)
    avg = round(sum(ACADEMY_DB[cid]['ratings']) / len(ACADEMY_DB[cid]['ratings']), 1)
    return jsonify({"status": "success", "avg": avg})

@app.route('/api/market/data')
def get_market_data():
    symbol = request.args.get('symbol', 'AAPL').strip() or 'AAPL'
    data = []
    for index, point in enumerate(generate_kline(symbol, 120)):
        data.append({
            "time": index,
            "open": point["open"],
            "close": point["close"],
            "high": point["high"],
            "low": point["low"],
            "vol": point["volume"],
        })
    return jsonify(data)


@app.route('/api/lab/stocks')
def get_stock_pool():
    """Return the Trading Lab asset universe."""
    print(f"Stock pool requested: {list(STOCK_POOL.keys())}")
    return jsonify(STOCK_POOL)


@app.route('/api/lab/quote')
def get_real_quote():
    """Return demo quotes for supported US stocks, ETFs, and crypto assets."""
    symbols = [symbol.strip() for symbol in request.args.get('symbols', 'AAPL').split(',') if symbol.strip()]
    print(f"Quote requested for: {symbols}")
    return jsonify({"status": "success", "data": generate_quotes(symbols)})


@app.route('/api/lab/kline')
def get_kline_data():
    """Return demo K-line data for supported US stocks, ETFs, and crypto assets."""
    symbol = request.args.get('symbol', 'AAPL')
    days = int(request.args.get('days', 60))
    print(f"K-line requested: {symbol}, {days} days")
    return jsonify({"status": "success", "symbol": symbol, "data": generate_kline(symbol, days)})


@app.route('/api/lab/news')
def get_stock_news_feed():
    """Return demo news for supported US stocks, ETFs, and crypto assets."""
    symbol = request.args.get('symbol', 'AAPL').strip()
    return jsonify({"status": "success", "symbol": symbol, "data": build_fallback_news(symbol)})


@app.route('/api/lab/portfolio')
def get_portfolio():
    """Get portfolio"""
    user_id = session.get('user_id', 'default')
    return jsonify(USER_PORTFOLIOS[user_id])

@app.route('/api/lab/trade', methods=['POST'])
def execute_trade():
    """Execute trade"""
    user_id = session.get('user_id', 'default')
    portfolio = USER_PORTFOLIOS[user_id]
    
    data = request.json
    action = data.get('action')
    symbol = data.get('symbol')
    shares = int(data.get('shares', 0))
    price = float(data.get('price', 0))
    
    if shares <= 0 or price <= 0:
        return jsonify({"status": "error", "message": "Invalid input"}), 400
    
    total_value = shares * price
    
    if action == 'buy':
        if portfolio["cash"] < total_value:
            return jsonify({"status": "error", "message": "Insufficient cash"}), 400
        
        portfolio["cash"] -= total_value
        
        if symbol in portfolio["holdings"]:
            old_shares = portfolio["holdings"][symbol]["shares"]
            old_cost = portfolio["holdings"][symbol]["cost_basis"]
            new_shares = old_shares + shares
            new_cost = old_cost + total_value
            
            portfolio["holdings"][symbol] = {
                "shares": new_shares,
                "avg_price": new_cost / new_shares,
                "cost_basis": new_cost
            }
        else:
            portfolio["holdings"][symbol] = {
                "shares": shares,
                "avg_price": price,
                "cost_basis": total_value
            }
        
        portfolio["history"].append({
            "id": str(uuid.uuid4())[:8],
            "timestamp": datetime.now().isoformat(),
            "action": "BUY",
            "symbol": symbol,
            "shares": shares,
            "price": price,
            "total": total_value
        })
        
        print(f"鉁?BUY: {shares} x {symbol} @ ${price}")
        return jsonify({"status": "success", "message": f"Bought {shares} shares"})
    
    elif action == 'sell':
        if symbol not in portfolio["holdings"]:
            return jsonify({"status": "error", "message": "No holdings"}), 400
        
        if portfolio["holdings"][symbol]["shares"] < shares:
            return jsonify({"status": "error", "message": "Insufficient shares"}), 400
        
        portfolio["cash"] += total_value
        portfolio["holdings"][symbol]["shares"] -= shares
        portfolio["holdings"][symbol]["cost_basis"] -= shares * portfolio["holdings"][symbol]["avg_price"]
        
        if portfolio["holdings"][symbol]["shares"] == 0:
            del portfolio["holdings"][symbol]
        
        portfolio["history"].append({
            "id": str(uuid.uuid4())[:8],
            "timestamp": datetime.now().isoformat(),
            "action": "SELL",
            "symbol": symbol,
            "shares": shares,
            "price": price,
            "total": total_value
        })
        
        print(f"鉁?SELL: {shares} x {symbol} @ ${price}")
        return jsonify({"status": "success", "message": f"Sold {shares} shares"})
    
    return jsonify({"status": "error", "message": "Invalid action"}), 400

@app.route('/api/lab/reset', methods=['POST'])
def reset_portfolio():
    """Reset portfolio"""
    user_id = session.get('user_id', 'default')
    USER_PORTFOLIOS[user_id] = {
        "cash": 100000.0,
        "holdings": {},
        "history": [],
    }
    print(f"馃攧 Portfolio reset for {user_id}")
    return jsonify({"status": "success"})

# ==================== Agent APIs ====================

@app.route('/api/agent/chat', methods=['POST'])
def agent_chat():
    """Agent chat"""
    user_id = session.get('user_id', 'default')
    data = request.json
    user_message = data.get('message', '')
    session_id = data.get('session_id')
    
    if not user_message.strip():
        return jsonify({"status": "error", "message": "Empty message"}), 400
    
    # Generate new session if not provided or doesn't exist
    if not session_id or session_id not in CHAT_SESSIONS[user_id]:
        session_id = str(uuid.uuid4())
        CHAT_SESSIONS[user_id][session_id] = {
            "id": session_id,
            "title": (user_message[:30] + "...") if len(user_message) > 30 else user_message,
            "messages": [],
            "timestamp": datetime.now().isoformat()
        }
    
    current_session = CHAT_SESSIONS[user_id][session_id]
    if not os.getenv('DEEPSEEK_API_KEY'):
        current_session["messages"].append({
            "role": "user",
            "content": user_message,
            "timestamp": datetime.now().isoformat()
        })
        error_msg = "DeepSeek is not configured. Set DEEPSEEK_API_KEY in .env or in your cloud service environment."
        current_session["messages"].append({
            "role": "assistant",
            "content": error_msg,
            "timestamp": datetime.now().isoformat(),
            "tools_used": []
        })
        return jsonify({"status": "error", "response": error_msg}), 503
    
    current_session["messages"].append({
        "role": "user",
        "content": user_message,
        "timestamp": datetime.now().isoformat()
    })
    
    print(f"馃挰 User message ({session_id}): {user_message}")
    
    # Try real agent
    try:
        from agent_graph import stock_agent_app
        from langchain_core.messages import HumanMessage
        
        # Use session_id as thread_id for LangGraph persistence
        config = {"configurable": {"thread_id": session_id}}
        initial_state = {"messages": [HumanMessage(content=user_message)]}
        
        response_content = ""
        tool_results = []
        
        for event in stock_agent_app.stream(initial_state, config):
            for node_name, output in event.items():
                if "messages" in output:
                    last_msg = output["messages"][-1]
                    if hasattr(last_msg, 'content') and last_msg.content:
                        response_content = last_msg.content
                    
                    if hasattr(last_msg, 'tool_calls') and last_msg.tool_calls:
                        for tool_call in last_msg.tool_calls:
                            tool_results.append({
                                "tool": tool_call.get('name', 'unknown'),
                                "args": tool_call.get('args', {})
                            })
        
        current_session["messages"].append({
            "role": "assistant",
            "content": response_content or "I analyzed your question. Please try rephrasing.",
            "timestamp": datetime.now().isoformat(),
            "tools_used": tool_results
        })
        
        print(f"鉁?Agent response: {response_content[:100]}...")
        return jsonify({
            "status": "success",
            "session_id": session_id,
            "response": response_content or "Please rephrase your question.",
            "tools_used": tool_results
        })
        
    except ImportError as e:
        error_msg = f"鈿狅笍  Agent not configured. Check agent_graph.py and .env file. Error: {str(e)}"
        print(error_msg)
        
        current_session["messages"].append({
            "role": "assistant",
            "content": error_msg,
            "timestamp": datetime.now().isoformat()
        })
        
        return jsonify({"status": "error", "response": error_msg}), 500
        
    except Exception as e:
        error_msg = f"Agent error: {str(e)}"
        print(f"鉂?{error_msg}")
        
        current_session["messages"].append({
            "role": "assistant",
            "content": error_msg,
            "timestamp": datetime.now().isoformat()
        })
        
        return jsonify({"status": "error", "response": error_msg}), 500

@app.route('/api/agent/sessions')
def get_chat_sessions():
    """Get list of chat sessions"""
    user_id = session.get('user_id', 'default')
    user_sessions = CHAT_SESSIONS[user_id]
    # Return list sorted by timestamp desc
    session_list = sorted(
        [{"id": s["id"], "title": s["title"], "timestamp": s["timestamp"]} for s in user_sessions.values()],
        key=lambda x: x["timestamp"],
        reverse=True
    )
    return jsonify({"status": "success", "sessions": session_list})

@app.route('/api/agent/history')
def get_chat_history():
    """Get chat history for a specific session"""
    user_id = session.get('user_id', 'default')
    session_id = request.args.get('session_id')
    
    if not session_id or session_id not in CHAT_SESSIONS[user_id]:
        return jsonify({"status": "error", "message": "Session not found"}), 404
        
    return jsonify({"status": "success", "history": CHAT_SESSIONS[user_id][session_id]["messages"]})

@app.route('/api/agent/clear', methods=['POST'])
def clear_chat_history():
    """Clear chat history (specific session or all)"""
    user_id = session.get('user_id', 'default')
    data = request.json or {}
    session_id = data.get('session_id')
    
    if session_id:
        if session_id in CHAT_SESSIONS[user_id]:
            del CHAT_SESSIONS[user_id][session_id]
            print(f"馃棏锔? Session {session_id} cleared for {user_id}")
    else:
        CHAT_SESSIONS[user_id] = {}
        print(f"馃棏锔? All chats cleared for {user_id}")
        
    return jsonify({"status": "success"})


@app.route('/api/inquiry', methods=['POST'])
def submit_inquiry():
    """Record public-site enquiries from the redesigned UI."""
    data = request.json or {}
    name = str(data.get('name', '')).strip()
    email = str(data.get('email', '')).strip()
    consent = bool(data.get('consent'))

    if not name or not email or not consent:
        return jsonify({"status": "error", "message": "Name, email, and consent are required."}), 400

    inquiry = {
        "id": str(uuid.uuid4())[:8],
        "timestamp": datetime.now().isoformat(),
        "source": str(data.get('source', 'website')).strip() or "website",
        "inquiry_type": str(data.get('inquiry_type', 'general')).strip() or "general",
        "name": name,
        "email": email,
        "company": str(data.get('company', '')).strip(),
        "role": str(data.get('role', '')).strip(),
        "message": str(data.get('message', '')).strip(),
        "user_id": session.get('user_id'),
    }

    INQUIRY_STORE.insert(0, inquiry)
    del INQUIRY_STORE[200:]

    print(f"Inquiry received: {inquiry['id']} ({inquiry['inquiry_type']}) from {email}")
    return jsonify({"status": "success", "id": inquiry["id"]})


@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve_frontend(path):
    if path.startswith('api/'):
        return abort(404)

    return serve_spa_entry(path)

if __name__ == '__main__':
    print("\n" + "="*60)
    print("U2INVEST Server Starting...")
    print("="*60)
    if not os.getenv('FLASK_SECRET_KEY'):
        print("WARNING: Using development secret key.")
    print(f"Stock Pool: {list(STOCK_POOL.keys())}")
    print(f"Academy Modules: {len(ACADEMY_DB)}")
    print("="*60 + "\n")
    
    debug_default = 'false' if os.getenv('PORT') else 'true'
    app.run(
        debug=os.getenv('FLASK_DEBUG', debug_default).lower() == 'true',
        host=os.getenv('FLASK_HOST', '0.0.0.0'),
        port=int(os.getenv('PORT', os.getenv('FLASK_PORT', '5000')))
    )


