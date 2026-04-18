import { Link } from "react-router-dom";
import { BookOpen, BarChart2, MessageSquare, Newspaper, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

const pillars = [
  { href: "/app/academy", icon: BookOpen, label: "Knowledge Academy", desc: "Continue through the 50-module learning path and track your progress." },
  { href: "/app/lab", icon: BarChart2, label: "Trading Lab", desc: "Practice with the live stock pool, portfolio simulation, and chart tools." },
  { href: "/app/news", icon: Newspaper, label: "Market News", desc: "Review the latest watchlist headlines before you move into analysis or chat." },
  { href: "/app/chat", icon: MessageSquare, label: "U2CHAT", desc: "Use the stock agent for quotes, news, historical analysis, and knowledge retrieval." },
];

export default function AppHome() {
  return (
    <div className="p-8 max-w-3xl">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
        <p className="text-xs text-muted-foreground uppercase tracking-widest mb-2">U2INVEST</p>
        <h1 className="font-serif text-4xl text-foreground mb-3">Welcome back.</h1>
        <p className="text-muted-foreground text-sm">Choose a section to continue.</p>
      </motion.div>

      <div className="space-y-4">
        {pillars.map((p, i) => (
          <motion.div
            key={p.href}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
          >
            <Link
              to={p.href}
              className="flex items-center gap-5 p-6 bg-card border border-border rounded-2xl hover:shadow-md hover:border-navy/20 transition-all group"
            >
              <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center flex-shrink-0">
                <p.icon className="w-6 h-6 text-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="font-semibold text-foreground mb-1">{p.label}</h2>
                <p className="text-sm text-muted-foreground">{p.desc}</p>
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-navy group-hover:translate-x-1 transition-all flex-shrink-0" />
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
