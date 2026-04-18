import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Newspaper, Loader2 } from "lucide-react";
import { api } from "@/lib/api";

const WATCHLIST = [
  { symbol: "600519", name: "Moutai" },
  { symbol: "000858", name: "Wuliangye" },
  { symbol: "601318", name: "Ping An" },
  { symbol: "300750", name: "CATL" },
];

export default function News() {
  const [activeSymbol, setActiveSymbol] = useState(WATCHLIST[0].symbol);
  const [headlines, setHeadlines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadNews() {
      try {
        setLoading(true);
        setError("");
        const response = await api.getStockNews(activeSymbol);
        if (!cancelled) {
          setHeadlines(response.data || []);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "Failed to load news.");
          setHeadlines([]);
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
  }, [activeSymbol]);

  return (
    <div className="p-8 max-w-5xl">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <p className="text-xs text-muted-foreground uppercase tracking-widest mb-2">Market News</p>
        <h1 className="font-serif text-4xl text-foreground mb-3">Headline watchlist.</h1>
        <p className="text-muted-foreground text-sm">Browse recent headlines by tracked stock and ask U2CHAT for deeper context.</p>
      </motion.div>

      <div className="flex flex-wrap gap-2 mb-8">
        {WATCHLIST.map((item) => (
          <button
            key={item.symbol}
            onClick={() => setActiveSymbol(item.symbol)}
            className={`px-4 py-2 rounded-full text-sm border transition-colors ${
              activeSymbol === item.symbol
                ? "bg-navy text-white border-navy"
                : "bg-background text-foreground border-border hover:border-navy/30"
            }`}
          >
            {item.symbol} | {item.name}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="w-4 h-4 animate-spin" /> Loading headlines...
        </div>
      ) : error ? (
        <p className="text-sm text-red-500">{error}</p>
      ) : (
        <div className="grid gap-4">
          {headlines.map((headline, index) => (
            <motion.div
              key={`${headline.title || headline.headline || index}`}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.04 }}
              className="bg-card border border-border rounded-2xl p-5"
            >
              <div className="flex items-center gap-2 mb-3 text-xs text-muted-foreground">
                <Newspaper className="w-3.5 h-3.5" />
                <span>{headline.source || "Market Feed"}</span>
                {headline.time && <span>• {headline.time}</span>}
              </div>
              <h2 className="text-base font-semibold text-foreground mb-2">
                {headline.title || headline.headline || "Untitled headline"}
              </h2>
              {headline.summary && (
                <p className="text-sm text-muted-foreground leading-relaxed">{headline.summary}</p>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
