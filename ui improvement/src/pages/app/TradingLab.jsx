import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  RefreshCw,
  AlertTriangle,
  Plus,
  Minus,
  BarChart2,
  Activity,
  CandlestickChart,
  LineChart as LineIcon,
  ShieldAlert,
  X,
  Loader2,
  Newspaper,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  ComposedChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Cell,
} from "recharts";
import { api, formatIsoDate } from "@/lib/api";

const CHART_MODES = [
  { key: "area", label: "Area", icon: Activity },
  { key: "candle", label: "Candle", icon: CandlestickChart },
  { key: "bar", label: "Volume", icon: BarChart2 },
  { key: "return", label: "Return", icon: LineIcon },
];

function formatMoney(value, maximumFractionDigits = 2) {
  return `USD ${Number(value || 0).toLocaleString("en-US", {
    minimumFractionDigits: maximumFractionDigits,
    maximumFractionDigits,
  })}`;
}

function formatCompact(value) {
  return new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(
    Number(value || 0)
  );
}

function normalizeQuote(quote) {
  return {
    ...quote,
    price: Number(quote.price || 0),
    change: Number(quote.change || 0),
    change_pct: Number(quote.change_pct || 0),
    high: Number(quote.high || 0),
    low: Number(quote.low || 0),
    open: Number(quote.open || 0),
    volume: Number(quote.volume || 0),
    turnover: Number(quote.turnover || 0),
  };
}

function normalizeKline(data = []) {
  return data.map((point) => ({
    ...point,
    open: Number(point.open || 0),
    close: Number(point.close || 0),
    high: Number(point.high || 0),
    low: Number(point.low || 0),
    volume: Number(point.volume || 0),
    price: Number(point.close || 0),
    displayDate: new Date(point.date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
  }));
}

function normalizePortfolio(payload) {
  return {
    cash: Number(payload.cash || 0),
    holdings: Object.entries(payload.holdings || {}).map(([symbol, holding]) => ({
      symbol,
      shares: Number(holding.shares || 0),
      avgPrice: Number(holding.avg_price || 0),
      costBasis: Number(holding.cost_basis || 0),
    })),
    history: [...(payload.history || [])].sort((left, right) =>
      String(right.timestamp).localeCompare(String(left.timestamp))
    ),
  };
}

function computeRiskMetrics(history) {
  if (history.length < 15) return null;

  const returns = history.slice(1).map((point, index) => {
    const previous = history[index].close;
    return previous > 0 ? (point.close - previous) / previous : 0;
  });

  const mean = returns.reduce((sum, value) => sum + value, 0) / returns.length;
  const variance =
    returns.reduce((sum, value) => sum + (value - mean) ** 2, 0) / returns.length;
  const std = Math.sqrt(variance);
  const annVol = std * Math.sqrt(252) * 100;
  const sharpe = std > 0 ? (mean / std) * Math.sqrt(252) : 0;
  const sortedReturns = [...returns].sort((left, right) => left - right);
  const var95 = (sortedReturns[Math.floor(sortedReturns.length * 0.05)] || 0) * 100;

  let peak = history[0].close;
  let maxDrawdown = 0;

  history.forEach((point) => {
    peak = Math.max(peak, point.close);
    const drawdown = peak > 0 ? (peak - point.close) / peak : 0;
    maxDrawdown = Math.max(maxDrawdown, drawdown);
  });

  return {
    annVol: annVol.toFixed(1),
    sharpe: sharpe.toFixed(2),
    var95: var95.toFixed(2),
    maxDD: (maxDrawdown * 100).toFixed(1),
  };
}

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;

  const point = payload[0]?.payload;

  if (!point) return null;

  return (
    <div className="bg-white border border-border rounded-xl px-3 py-2.5 shadow-lg text-xs">
      <p className="text-muted-foreground mb-1.5">{point.displayDate || label}</p>
      {"close" in point ? (
        <>
          <div className="grid grid-cols-2 gap-x-4 gap-y-0.5">
            <span className="text-muted-foreground">Open</span>
            <span className="font-mono font-medium">{formatMoney(point.open)}</span>
            <span className="text-muted-foreground">High</span>
            <span className="font-mono font-medium text-emerald-600">{formatMoney(point.high)}</span>
            <span className="text-muted-foreground">Low</span>
            <span className="font-mono font-medium text-red-500">{formatMoney(point.low)}</span>
            <span className="text-muted-foreground">Close</span>
            <span className="font-mono font-medium">{formatMoney(point.close)}</span>
          </div>
          <p className="text-muted-foreground mt-1">Volume {formatCompact(point.volume)}</p>
        </>
      ) : (
        payload.map((entry) => (
          <p key={entry.name} className="font-mono font-medium">
            {entry.name}: {typeof entry.value === "number" ? entry.value.toFixed(2) : entry.value}
          </p>
        ))
      )}
    </div>
  );
}

function StatCard({ label, value, sub, up }) {
  return (
    <div className="bg-background border border-border rounded-xl p-4 flex flex-col gap-1">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span
        className={`text-lg font-semibold tracking-tight font-mono ${
          up === true
            ? "text-emerald-600"
            : up === false
              ? "text-red-500"
              : "text-foreground"
        }`}
      >
        {value}
      </span>
      {sub && <span className="text-xs text-muted-foreground">{sub}</span>}
    </div>
  );
}

function RiskPanel({ metrics }) {
  if (!metrics) {
    return (
      <div className="bg-background border border-border rounded-xl p-4 text-center text-xs text-muted-foreground py-8">
        Not enough chart history to compute risk metrics.
      </div>
    );
  }

  const items = [
    { label: "Annualised Volatility", value: `${metrics.annVol}%`, hint: "Std. dev. of daily returns" },
    { label: "Sharpe Ratio", value: metrics.sharpe, hint: "Risk-adjusted return" },
    { label: "Value at Risk (95%)", value: `${metrics.var95}%`, hint: "Estimated daily downside" },
    { label: "Max Drawdown", value: `-${metrics.maxDD}%`, hint: "Largest peak-to-trough decline" },
  ];

  const rating = Number(metrics.annVol) < 20
    ? { label: "Low", color: "text-emerald-600" }
    : Number(metrics.annVol) < 40
      ? { label: "Moderate", color: "text-amber-500" }
      : { label: "High", color: "text-red-500" };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-1">
        <ShieldAlert className="w-4 h-4 text-muted-foreground" />
        <span className="text-sm font-medium text-foreground">Risk Profile</span>
        <span className={`ml-auto text-xs font-semibold px-2 py-0.5 rounded-full bg-muted ${rating.color}`}>
          {rating.label}
        </span>
      </div>

      {items.map((item) => (
        <div key={item.label} className="flex items-center justify-between py-2 border-b border-border last:border-0">
          <div>
            <p className="text-xs font-medium text-foreground">{item.label}</p>
            <p className="text-xs text-muted-foreground">{item.hint}</p>
          </div>
          <span className="text-sm font-mono font-semibold text-foreground">{item.value}</span>
        </div>
      ))}
    </div>
  );
}

function NewsDrawer({ symbol, name, onClose }) {
  const [headlines, setHeadlines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadNews() {
      try {
        setLoading(true);
        setError("");
        const response = await api.getStockNews(symbol);
        if (!cancelled) {
          setHeadlines(response.data || []);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "Failed to load news.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadNews();

    return () => {
      cancelled = true;
    };
  }, [symbol]);

  return (
    <motion.div
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "100%" }}
      transition={{ type: "spring", damping: 30, stiffness: 300 }}
      className="fixed right-0 top-0 bottom-0 z-50 w-96 bg-white border-l border-border shadow-2xl flex flex-col"
    >
      <div className="flex items-center justify-between px-5 py-4 border-b border-border">
        <div>
          <p className="text-xs text-muted-foreground">{symbol}</p>
          <h3 className="font-semibold text-foreground text-sm">{name} news</h3>
        </div>
        <button onClick={onClose} className="p-1.5 hover:bg-muted rounded-lg transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin">
        {loading && (
          <div className="flex items-center justify-center py-12 gap-2 text-xs text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin" /> Loading news...
          </div>
        )}

        {!loading && error && (
          <div className="px-5 py-4 text-sm text-red-500">{error}</div>
        )}

        {!loading && !error && headlines.length === 0 && (
          <div className="px-5 py-6 text-sm text-muted-foreground">
            No recent headlines were returned for this asset. Try again later or ask U2CHAT for broader context.
          </div>
        )}

        {!loading &&
          !error &&
          headlines.map((headline, index) => (
            <div key={`${headline.title || headline.headline || headline}-${index}`} className="px-5 py-4 border-b border-border">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-medium text-navy">{headline.source || "Market Feed"}</span>
                {headline.time && (
                  <span className="text-xs text-muted-foreground">{headline.time}</span>
                )}
              </div>
              <p className="text-sm font-medium text-foreground leading-snug">
                {headline.title || headline.headline || headline}
              </p>
              {headline.summary && (
                <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                  {headline.summary}
                </p>
              )}
            </div>
          ))}
      </div>

      <div className="px-5 py-3 border-t border-border text-xs text-muted-foreground bg-muted/30">
        Headlines are provided for educational research. Use U2CHAT if you want deeper analysis or context.
      </div>
    </motion.div>
  );
}

export default function TradingLab() {
  const [stockPool, setStockPool] = useState({});
  const [activeCategory, setActiveCategory] = useState("");
  const [selectedSymbol, setSelectedSymbol] = useState("");
  const [quotesBySymbol, setQuotesBySymbol] = useState({});
  const [klineData, setKlineData] = useState([]);
  const [portfolio, setPortfolio] = useState({ cash: 100000, holdings: [], history: [] });
  const [shares, setShares] = useState(100);
  const [chartMode, setChartMode] = useState("area");
  const [chartRange, setChartRange] = useState(60);
  const [showNews, setShowNews] = useState(false);
  const [activeTab, setActiveTab] = useState("trade");
  const [tradeMsg, setTradeMsg] = useState(null);
  const [loadingPool, setLoadingPool] = useState(true);
  const [loadingChart, setLoadingChart] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const categories = Object.keys(stockPool);
  const categorySymbols = stockPool[activeCategory] || [];

  const loadPortfolio = async () => {
    const response = await api.getPortfolio();
    setPortfolio(normalizePortfolio(response));
  };

  const loadQuotes = async (symbols) => {
    if (!symbols.length) return;

    const response = await api.getQuotes(symbols);
    const nextQuotes = Object.fromEntries((response.data || []).map((quote) => [quote.symbol, normalizeQuote(quote)]));
    setQuotesBySymbol((prev) => ({ ...prev, ...nextQuotes }));
  };

  useEffect(() => {
    let cancelled = false;

    async function loadInitialState() {
      try {
        setLoadingPool(true);
        setError("");

        const [poolResponse, portfolioResponse] = await Promise.all([
          api.getStockPool(),
          api.getPortfolio(),
        ]);

        if (cancelled) return;

        const nextCategories = Object.keys(poolResponse);
        const firstCategory = nextCategories[0] || "";
        const firstSymbol = poolResponse[firstCategory]?.[0] || "";

        setStockPool(poolResponse);
        setActiveCategory(firstCategory);
        setSelectedSymbol(firstSymbol);
        setPortfolio(normalizePortfolio(portfolioResponse));
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "Failed to load the Trading Lab.");
        }
      } finally {
        if (!cancelled) {
          setLoadingPool(false);
        }
      }
    }

    loadInitialState();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!categorySymbols.length) return;
    if (!selectedSymbol || !categorySymbols.includes(selectedSymbol)) {
      setSelectedSymbol(categorySymbols[0]);
    }
  }, [categorySymbols, selectedSymbol]);

  const trackedSymbols = useMemo(
    () =>
      [...new Set([...categorySymbols, ...portfolio.holdings.map((holding) => holding.symbol), selectedSymbol].filter(Boolean))],
    [categorySymbols, portfolio.holdings, selectedSymbol]
  );

  useEffect(() => {
    if (!trackedSymbols.length) return;

    loadQuotes(trackedSymbols).catch((err) => {
      setTradeMsg({ msg: err.message || "Failed to load quotes.", type: "error" });
    });
  }, [trackedSymbols]);

  useEffect(() => {
    if (!selectedSymbol) return;

    let cancelled = false;

    async function loadChart() {
      try {
        setLoadingChart(true);
        const response = await api.getKline(selectedSymbol, chartRange);

        if (!cancelled) {
          setKlineData(normalizeKline(response.data || []));
        }
      } catch (err) {
        if (!cancelled) {
          setTradeMsg({ msg: err.message || "Failed to load chart data.", type: "error" });
          setKlineData([]);
        }
      } finally {
        if (!cancelled) {
          setLoadingChart(false);
        }
      }
    }

    loadChart();

    return () => {
      cancelled = true;
    };
  }, [chartRange, selectedSymbol]);

  useEffect(() => {
    if (!tradeMsg) return undefined;
    const timer = window.setTimeout(() => setTradeMsg(null), 3200);
    return () => window.clearTimeout(timer);
  }, [tradeMsg]);

  const currentQuote = quotesBySymbol[selectedSymbol] || {
    symbol: selectedSymbol,
    name: selectedSymbol,
    price: 0,
    change: 0,
    change_pct: 0,
    high: 0,
    low: 0,
    open: 0,
    volume: 0,
    turnover: 0,
  };

  const currentPrice = Number(currentQuote.price || klineData[klineData.length - 1]?.close || 0);
  const isUp = Number(currentQuote.change || 0) >= 0;

  const returnChartData = useMemo(() => {
    const baseline = klineData[0]?.close || 0;
    return klineData.map((point) => ({
      ...point,
      return: baseline > 0 ? ((point.close - baseline) / baseline) * 100 : 0,
    }));
  }, [klineData]);

  const holdingsWithQuotes = portfolio.holdings.map((holding) => {
    const quote = quotesBySymbol[holding.symbol];
    return {
      ...holding,
      currentPrice: Number(quote?.price || holding.avgPrice),
      name: quote?.name || holding.symbol,
    };
  });

  const totalInvested = holdingsWithQuotes.reduce(
    (sum, holding) => sum + holding.avgPrice * holding.shares,
    0
  );
  const totalMarketValue = holdingsWithQuotes.reduce(
    (sum, holding) => sum + holding.currentPrice * holding.shares,
    0
  );
  const totalAssets = portfolio.cash + totalMarketValue;
  const unrealisedPnl = totalMarketValue - totalInvested;
  const returnPct = totalInvested > 0 ? (unrealisedPnl / totalInvested) * 100 : 0;
  const riskMetrics = useMemo(() => computeRiskMetrics(klineData), [klineData]);

  const refreshLab = async () => {
    try {
      setRefreshing(true);
      await Promise.all([
        loadPortfolio(),
        loadQuotes(trackedSymbols),
        selectedSymbol ? api.getKline(selectedSymbol, chartRange).then((response) => setKlineData(normalizeKline(response.data || []))) : Promise.resolve(),
      ]);
      setTradeMsg({ msg: "Lab data refreshed.", type: "success" });
    } catch (err) {
      setTradeMsg({ msg: err.message || "Failed to refresh the lab.", type: "error" });
    } finally {
      setRefreshing(false);
    }
  };

  const resetLab = async () => {
    try {
      await api.resetPortfolio();
      await loadPortfolio();
      await loadQuotes(trackedSymbols);
      setTradeMsg({ msg: "Portfolio reset to the starting balance.", type: "success" });
    } catch (err) {
      setTradeMsg({ msg: err.message || "Failed to reset the portfolio.", type: "error" });
    }
  };

  const executeTrade = async (action) => {
    try {
      await api.trade({
        action,
        symbol: selectedSymbol,
        shares,
        price: currentPrice,
      });

      await loadPortfolio();
      await loadQuotes(trackedSymbols);
      setTradeMsg({
        msg: `${action === "buy" ? "Bought" : "Sold"} ${shares} shares of ${selectedSymbol}.`,
        type: "success",
      });
    } catch (err) {
      setTradeMsg({ msg: err.message || "Trade failed.", type: "error" });
    }
  };

  if (loadingPool) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <Loader2 className="w-5 h-5 animate-spin" />
          <p className="text-sm">Loading Trading Lab...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center p-8">
        <div className="max-w-md text-center">
          <h1 className="font-serif text-3xl text-foreground mb-3">Trading Lab unavailable</h1>
          <p className="text-sm text-muted-foreground mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-navy text-white rounded-xl text-sm font-medium hover:bg-navy/90 transition-colors"
          >
            Reload
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-background overflow-hidden">
      <div className="px-6 h-12 border-b border-border flex items-center justify-between flex-shrink-0 bg-background/95 backdrop-blur">
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-foreground">Trading Lab</span>
          <span className="text-xs text-muted-foreground bg-amber-50 border border-amber-200 text-amber-700 px-2 py-0.5 rounded-full flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" /> Simulated
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowNews((prev) => !prev)}
            className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition-colors ${
              showNews
                ? "bg-foreground text-background border-foreground"
                : "border-border text-muted-foreground hover:bg-muted"
            }`}
          >
            <Newspaper className="w-3.5 h-3.5" /> News
          </button>

          <button
            onClick={refreshLab}
            disabled={refreshing}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-border text-muted-foreground hover:bg-muted transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} /> Refresh
          </button>

          <button
            onClick={resetLab}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-border text-muted-foreground hover:bg-muted transition-colors"
          >
            Reset
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <div className="w-56 border-r border-border flex flex-col flex-shrink-0 overflow-hidden">
          <div className="px-3 py-2.5 border-b border-border">
            <div className="flex gap-1 overflow-x-auto scrollbar-hide">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={`text-xs px-2 py-1 rounded-md whitespace-nowrap flex-shrink-0 transition-colors ${
                    activeCategory === category
                      ? "bg-foreground text-background"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto scrollbar-thin">
            {categorySymbols.map((symbol) => {
              const quote = quotesBySymbol[symbol] || { symbol, name: symbol, price: 0, change_pct: 0 };
              const active = selectedSymbol === symbol;

              return (
                <button
                  key={symbol}
                  onClick={() => setSelectedSymbol(symbol)}
                  className={`w-full flex items-center justify-between px-3 py-3 border-b border-border/50 transition-colors text-left ${
                    active ? "bg-muted" : "hover:bg-muted/50"
                  }`}
                >
                  <div>
                    <p className="text-xs font-semibold text-foreground">{quote.symbol}</p>
                    <p className="text-xs text-muted-foreground truncate max-w-[100px]">{quote.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-mono font-medium text-foreground">{formatMoney(quote.price)}</p>
                    <p className={`text-xs font-mono ${Number(quote.change_pct) >= 0 ? "text-emerald-600" : "text-red-500"}`}>
                      {Number(quote.change_pct) >= 0 ? "+" : ""}
                      {Number(quote.change_pct || 0).toFixed(2)}%
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
          <div className="px-5 py-3.5 border-b border-border flex items-start justify-between flex-shrink-0">
            <div className="flex items-baseline gap-3">
              <h2 className="text-2xl font-semibold tracking-tight font-mono text-foreground">
                {formatMoney(currentPrice)}
              </h2>
              <div className={`flex items-center gap-1 text-sm font-medium ${isUp ? "text-emerald-600" : "text-red-500"}`}>
                {isUp ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                {isUp ? "+" : ""}
                {formatMoney(currentQuote.change || 0)} ({isUp ? "+" : ""}
                {Number(currentQuote.change_pct || 0).toFixed(2)}%)
              </div>
              <span className="text-xs text-muted-foreground">
                {currentQuote.symbol} | {currentQuote.name}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex gap-0.5 bg-muted rounded-lg p-0.5">
                {CHART_MODES.map((mode) => (
                  <button
                    key={mode.key}
                    onClick={() => setChartMode(mode.key)}
                    className={`flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
                      chartMode === mode.key
                        ? "bg-background shadow-sm text-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <mode.icon className="w-3.5 h-3.5" />
                    {mode.label}
                  </button>
                ))}
              </div>

              <div className="flex gap-0.5 bg-muted rounded-lg p-0.5">
                {[30, 60, 120, 240].map((range) => (
                  <button
                    key={range}
                    onClick={() => setChartRange(range)}
                    className={`px-2 py-1.5 rounded-md text-xs font-medium transition-colors ${
                      chartRange === range
                        ? "bg-background shadow-sm text-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {range}D
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex-1 px-4 pt-4 pb-2 min-h-0 relative">
            {loadingChart && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/80">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="w-4 h-4 animate-spin" /> Loading chart...
                </div>
              </div>
            )}

            {klineData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-sm text-muted-foreground">
                No chart data available for the selected asset.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                {chartMode === "area" ? (
                  <AreaChart data={klineData} margin={{ top: 4, right: 8, left: -10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="labArea" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={isUp ? "#22c55e" : "#ef4444"} stopOpacity={0.15} />
                        <stop offset="100%" stopColor={isUp ? "#22c55e" : "#ef4444"} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="2 4" stroke="hsl(0,0%,91%)" />
                    <XAxis dataKey="displayDate" tick={{ fontSize: 10, fill: "hsl(0,0%,45%)" }} tickLine={false} axisLine={false} interval={Math.max(1, Math.floor(klineData.length / 6))} />
                    <YAxis tick={{ fontSize: 10, fill: "hsl(0,0%,45%)" }} tickLine={false} axisLine={false} width={65} tickFormatter={(value) => formatMoney(value, 0)} />
                    <Tooltip content={<ChartTooltip />} />
                    <Area type="monotone" dataKey="close" name="Price" stroke={isUp ? "#22c55e" : "#ef4444"} strokeWidth={1.5} fill="url(#labArea)" dot={false} />
                  </AreaChart>
                ) : chartMode === "bar" ? (
                  <BarChart data={klineData} margin={{ top: 4, right: 8, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="2 4" stroke="hsl(0,0%,91%)" />
                    <XAxis dataKey="displayDate" tick={{ fontSize: 10, fill: "hsl(0,0%,45%)" }} tickLine={false} axisLine={false} interval={Math.max(1, Math.floor(klineData.length / 6))} />
                    <YAxis tick={{ fontSize: 10, fill: "hsl(0,0%,45%)" }} tickLine={false} axisLine={false} width={55} tickFormatter={(value) => formatCompact(value)} />
                    <Tooltip content={<ChartTooltip />} />
                    <Bar dataKey="volume" name="Volume" radius={[2, 2, 0, 0]}>
                      {klineData.map((point) => (
                        <Cell key={`${point.date}-volume`} fill={point.close >= point.open ? "#22c55e" : "#ef4444"} fillOpacity={0.72} />
                      ))}
                    </Bar>
                  </BarChart>
                ) : chartMode === "candle" ? (
                  <ComposedChart data={klineData} margin={{ top: 4, right: 8, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="2 4" stroke="hsl(0,0%,91%)" />
                    <XAxis dataKey="displayDate" tick={{ fontSize: 10, fill: "hsl(0,0%,45%)" }} tickLine={false} axisLine={false} interval={Math.max(1, Math.floor(klineData.length / 6))} />
                    <YAxis tick={{ fontSize: 10, fill: "hsl(0,0%,45%)" }} tickLine={false} axisLine={false} width={65} tickFormatter={(value) => formatMoney(value, 0)} />
                    <Tooltip content={<ChartTooltip />} />
                    <Bar dataKey="high" fill="transparent" stroke="transparent" />
                    {klineData.map((point) => (
                      <ReferenceLine
                        key={`${point.date}-wick`}
                        segment={[
                          { x: point.displayDate, y: point.low },
                          { x: point.displayDate, y: point.high },
                        ]}
                        stroke={point.close >= point.open ? "#22c55e" : "#ef4444"}
                        strokeWidth={1}
                      />
                    ))}
                    <Bar dataKey="close" minPointSize={1}>
                      {klineData.map((point) => (
                        <Cell key={`${point.date}-body`} fill={point.close >= point.open ? "#22c55e" : "#ef4444"} />
                      ))}
                    </Bar>
                  </ComposedChart>
                ) : (
                  <AreaChart data={returnChartData} margin={{ top: 4, right: 8, left: -10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="labReturn" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#22c55e" stopOpacity={0.12} />
                        <stop offset="100%" stopColor="#22c55e" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="2 4" stroke="hsl(0,0%,91%)" />
                    <XAxis dataKey="displayDate" tick={{ fontSize: 10, fill: "hsl(0,0%,45%)" }} tickLine={false} axisLine={false} interval={Math.max(1, Math.floor(returnChartData.length / 6))} />
                    <YAxis tick={{ fontSize: 10, fill: "hsl(0,0%,45%)" }} tickLine={false} axisLine={false} width={50} tickFormatter={(value) => `${value.toFixed(0)}%`} />
                    <Tooltip content={<ChartTooltip />} />
                    <ReferenceLine y={0} stroke="hsl(0,0%,80%)" strokeWidth={1} />
                    <Area type="monotone" dataKey="return" name="Return %" stroke="#22c55e" strokeWidth={1.5} fill="url(#labReturn)" dot={false} />
                  </AreaChart>
                )}
              </ResponsiveContainer>
            )}
          </div>

          <div className="px-5 py-3 border-t border-border grid grid-cols-4 gap-3 flex-shrink-0 bg-background">
            <div>
              <p className="text-[11px] text-muted-foreground mb-1">Open</p>
              <p className="text-xs font-mono font-medium text-foreground">{formatMoney(currentQuote.open)}</p>
            </div>
            <div>
              <p className="text-[11px] text-muted-foreground mb-1">High</p>
              <p className="text-xs font-mono font-medium text-foreground">{formatMoney(currentQuote.high)}</p>
            </div>
            <div>
              <p className="text-[11px] text-muted-foreground mb-1">Low</p>
              <p className="text-xs font-mono font-medium text-foreground">{formatMoney(currentQuote.low)}</p>
            </div>
            <div>
              <p className="text-[11px] text-muted-foreground mb-1">Volume</p>
              <p className="text-xs font-mono font-medium text-foreground">{formatCompact(currentQuote.volume)}</p>
            </div>
          </div>
        </div>

        <div className="w-80 border-l border-border flex flex-col flex-shrink-0 overflow-hidden">
          <div className="flex border-b border-border px-1 pt-1 gap-0.5 flex-shrink-0">
            {[
              { key: "trade", label: "Trade" },
              { key: "positions", label: "Positions" },
              { key: "history", label: "History" },
              { key: "risk", label: "Risk" },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex-1 text-xs py-2 font-medium rounded-t-md transition-colors ${
                  activeTab === tab.key
                    ? "bg-background text-foreground border border-b-0 border-border"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto scrollbar-thin p-4">
            <div className="grid grid-cols-2 gap-2 mb-4">
              <StatCard label="Total Assets" value={formatMoney(totalAssets, 0)} />
              <StatCard label="Cash" value={formatMoney(portfolio.cash, 0)} />
              <StatCard label="Unrealised P&L" value={`${unrealisedPnl >= 0 ? "+" : ""}${formatMoney(unrealisedPnl, 0)}`} up={unrealisedPnl >= 0} />
              <StatCard label="Return" value={`${returnPct >= 0 ? "+" : ""}${returnPct.toFixed(2)}%`} up={returnPct >= 0} />
            </div>

            {activeTab === "trade" && (
              <div className="space-y-3">
                <div className="bg-muted/50 rounded-xl px-3.5 py-3 flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Price</span>
                  <span className="font-mono font-semibold text-foreground">{formatMoney(currentPrice)}</span>
                </div>

                <div>
                  <label className="text-xs text-muted-foreground mb-1.5 block">Shares</label>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShares(Math.max(1, shares - 100))}
                      className="w-8 h-8 border border-border rounded-lg flex items-center justify-center hover:bg-muted transition-colors text-muted-foreground"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <input
                      type="number"
                      value={shares}
                      onChange={(event) => setShares(Math.max(1, parseInt(event.target.value, 10) || 1))}
                      className="flex-1 border border-border rounded-xl px-3 py-2 text-sm text-center font-mono focus:outline-none focus:ring-2 focus:ring-ring bg-background"
                    />
                    <button
                      onClick={() => setShares(shares + 100)}
                      className="w-8 h-8 border border-border rounded-lg flex items-center justify-center hover:bg-muted transition-colors text-muted-foreground"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs px-0.5">
                  <span className="text-muted-foreground">Order value</span>
                  <span className="font-mono font-semibold text-foreground">{formatMoney(currentPrice * shares)}</span>
                </div>

                <div className="flex items-center justify-between text-xs px-0.5 pb-1">
                  <span className="text-muted-foreground">% of cash</span>
                  <span
                    className={`font-mono font-semibold ${
                      currentPrice * shares > portfolio.cash * 0.3 ? "text-amber-600" : "text-muted-foreground"
                    }`}
                  >
                    {portfolio.cash > 0 ? (((currentPrice * shares) / portfolio.cash) * 100).toFixed(1) : "0.0"}%
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    onClick={() => executeTrade("buy")}
                    className="py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-700 active:scale-95 transition-all"
                  >
                    Buy
                  </button>
                  <button
                    onClick={() => executeTrade("sell")}
                    className="py-2.5 bg-red-500 text-white rounded-xl text-sm font-semibold hover:bg-red-600 active:scale-95 transition-all"
                  >
                    Sell
                  </button>
                </div>

                <AnimatePresence>
                  {tradeMsg && (
                    <motion.div
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className={`text-xs px-3 py-2.5 rounded-xl font-medium ${
                        tradeMsg.type === "error"
                          ? "bg-red-50 text-red-600 border border-red-100"
                          : "bg-emerald-50 text-emerald-700 border border-emerald-100"
                      }`}
                    >
                      {tradeMsg.msg}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {activeTab === "positions" && (
              <div className="space-y-2">
                {holdingsWithQuotes.length === 0 ? (
                  <div className="text-center py-8 text-xs text-muted-foreground">No open positions</div>
                ) : (
                  holdingsWithQuotes.map((holding) => {
                    const pnl = (holding.currentPrice - holding.avgPrice) * holding.shares;
                    const pnlPct = holding.avgPrice > 0 ? ((holding.currentPrice - holding.avgPrice) / holding.avgPrice) * 100 : 0;

                    return (
                      <div key={holding.symbol} className="bg-muted/40 rounded-xl p-3.5">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <span className="font-semibold text-foreground text-sm">{holding.symbol}</span>
                            <p className="text-xs text-muted-foreground">{holding.name}</p>
                          </div>
                          <span className={`text-xs font-mono font-semibold ${pnl >= 0 ? "text-emerald-600" : "text-red-500"}`}>
                            {pnl >= 0 ? "+" : ""}{formatMoney(pnl, 0)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>{holding.shares} sh | avg {formatMoney(holding.avgPrice)}</span>
                          <span className={`font-medium ${pnl >= 0 ? "text-emerald-600" : "text-red-500"}`}>
                            {pnl >= 0 ? "+" : ""}{pnlPct.toFixed(2)}%
                          </span>
                        </div>
                        <div className="mt-2 h-1 bg-border rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${pnl >= 0 ? "bg-emerald-500" : "bg-red-500"}`}
                            style={{ width: `${Math.min(100, Math.abs(pnlPct))}%` }}
                          />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {activeTab === "history" && (
              <div className="space-y-1.5">
                {portfolio.history.length === 0 ? (
                  <div className="text-center py-8 text-xs text-muted-foreground">No trades yet</div>
                ) : (
                  portfolio.history.map((trade) => (
                    <div key={trade.id} className="flex items-center gap-2.5 py-2.5 border-b border-border last:border-0">
                      <span className={`text-xs font-semibold px-1.5 py-0.5 rounded ${
                        trade.action === "BUY"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-red-100 text-red-600"
                      }`}>
                        {trade.action}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-foreground">{trade.symbol} | {trade.shares} sh</p>
                        <p className="text-xs text-muted-foreground">
                          {formatIsoDate(trade.timestamp)} | {formatMoney(trade.price)}
                        </p>
                      </div>
                      <span className="text-xs font-mono text-foreground font-medium">{formatMoney(trade.total, 0)}</span>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === "risk" && <RiskPanel metrics={riskMetrics} />}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showNews && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/20"
              onClick={() => setShowNews(false)}
            />
            <NewsDrawer
              symbol={currentQuote.symbol}
              name={currentQuote.name}
              onClose={() => setShowNews(false)}
            />
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
