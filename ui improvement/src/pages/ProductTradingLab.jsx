import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { BarChart2, Shield, TrendingUp, DollarSign, Clock, AlertTriangle, ArrowRight } from "lucide-react";

const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };

const features = [
  { icon: DollarSign, label: "¥100,000 Virtual Capital", desc: "Begin each simulation with virtual cash and practice position sizing without risking real capital." },
  { icon: TrendingUp, label: "Stock Pool & Quotes", desc: "Browse the current stock pool, inspect quotes, and switch symbols from the redesigned sidebar." },
  { icon: BarChart2, label: "K-line Charting", desc: "View historical K-line data in multiple chart modes while keeping the new UI layout." },
  { icon: Clock, label: "Trade History", desc: "Every buy and sell is logged by the backend and reflected in the redesigned history panel." },
  { icon: Shield, label: "Zero Financial Risk", desc: "All activity is simulated. No real money is used and no real orders are transmitted." },
];

export default function ProductTradingLab() {
  return (
    <div className="bg-background">
      <section className="pt-32 pb-20 px-6 border-b border-border">
        <div className="max-w-4xl mx-auto">
          <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.1 } } }}>
            <motion.div variants={fadeUp} className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center mb-6">
              <BarChart2 className="w-6 h-6 text-emerald-600" />
            </motion.div>
            <motion.p variants={fadeUp} className="text-xs uppercase tracking-widest text-muted-foreground mb-3">Trading Lab</motion.p>
            <motion.h1 variants={fadeUp} className="font-serif text-5xl md:text-6xl text-foreground mb-6">
              Practice stock decisions.
              <br />
              No real money.
            </motion.h1>
            <motion.p variants={fadeUp} className="text-lg text-muted-foreground max-w-xl leading-relaxed mb-8">
              The Trading Lab keeps the redesigned interface but now runs on the current project’s stock pool, quote routes, K-line APIs, and simulated portfolio backend.
            </motion.p>
            <motion.div variants={fadeUp}>
              <div className="inline-flex items-center gap-2 px-4 py-2.5 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800 mb-8">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                All trading activity is simulated. No real money is ever used.
              </div>
            </motion.div>
            <motion.div variants={fadeUp} className="flex gap-3">
              <Link to="/app/lab" className="px-5 py-2.5 bg-navy text-white rounded-xl text-sm font-medium hover:bg-navy/90 transition-colors inline-flex items-center gap-2">
                Try the Lab <ArrowRight className="w-4 h-4" />
              </Link>
              <Link to="/product" className="px-5 py-2.5 border border-border rounded-xl text-sm hover:bg-muted transition-colors">
                Product Overview
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={{ visible: { transition: { staggerChildren: 0.08 } } }}>
            <motion.h2 variants={fadeUp} className="font-serif text-3xl text-foreground mb-10 text-center">What the Lab gives you</motion.h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {features.map((feature) => (
                <motion.div key={feature.label} variants={fadeUp} className="bg-card border border-border rounded-2xl p-6">
                  <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center mb-4">
                    <feature.icon className="w-4 h-4 text-emerald-600" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2 text-sm">{feature.label}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{feature.desc}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-20 px-6 bg-navy text-white">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-serif text-3xl mb-4">Start your first simulated trade</h2>
          <p className="text-white/60 text-sm mb-8">Pick a stock from the pool, inspect the chart, and place a simulated order through the redesigned Trading Lab.</p>
          <Link to="/app/lab" className="px-6 py-3 bg-gold text-navy rounded-xl font-semibold text-sm hover:bg-gold/90 transition-colors inline-flex items-center gap-2">
            Enter the Lab <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
