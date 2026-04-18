import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { MessageSquare, Zap, Database, TrendingUp, BookOpen, AlertTriangle, ArrowRight } from "lucide-react";

const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };

const capabilities = [
  { icon: TrendingUp, label: "Quote and K-line tools", desc: "Use the agent to pull stock quotes and historical price context from the backend." },
  { icon: Database, label: "Fundamentals", desc: "Ask for the project's fundamental-data tool when you need valuation and company metrics." },
  { icon: Zap, label: "Headline retrieval", desc: "Surface recent stock headlines directly through the stock-agent toolchain." },
  { icon: BookOpen, label: "Knowledge retrieval", desc: "Answers can pull from the U2INVEST local knowledge base built from curated finance documents." },
  { icon: MessageSquare, label: "Session memory", desc: "Chat sessions are persisted so conversations can continue over time." },
];

const canDo = [
  "Answer investing and finance questions",
  "Pull stock quotes and market headlines",
  "Explain financial concepts clearly",
  "Return historical K-line chart blocks",
  "Retrieve relevant knowledge-base passages",
  "Show which tools were used in a response",
];

const cantDo = [
  "Give personalised financial advice",
  "Guarantee that every output is correct",
  "Execute real trades or access a brokerage",
  "Replace independent verification",
  "Predict market movements with certainty",
];

export default function ProductU2Chat() {
  return (
    <div className="bg-background">
      <section className="pt-32 pb-20 px-6 border-b border-border">
        <div className="max-w-4xl mx-auto">
          <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.1 } } }}>
            <motion.div variants={fadeUp} className="w-12 h-12 rounded-2xl bg-gold/30 flex items-center justify-center mb-6">
              <MessageSquare className="w-6 h-6 text-navy" />
            </motion.div>
            <motion.p variants={fadeUp} className="text-xs uppercase tracking-widest text-muted-foreground mb-3">U2CHAT</motion.p>
            <motion.h1 variants={fadeUp} className="font-serif text-5xl md:text-6xl text-foreground mb-6">
              A stock agent
              <br />
              grounded in tools.
            </motion.h1>
            <motion.p variants={fadeUp} className="text-lg text-muted-foreground max-w-xl leading-relaxed mb-8">
              U2CHAT connects the redesigned frontend to the project's stock-agent backend. It combines market tools, session memory, and the local knowledge base in a single chat workflow.
            </motion.p>
            <motion.div variants={fadeUp} className="flex gap-3">
              <Link to="/app/chat" className="px-5 py-2.5 bg-navy text-white rounded-xl text-sm font-medium hover:bg-navy/90 transition-colors inline-flex items-center gap-2">
                Try U2CHAT <ArrowRight className="w-4 h-4" />
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
            <motion.h2 variants={fadeUp} className="font-serif text-3xl text-foreground mb-10 text-center">What U2CHAT can do</motion.h2>
            <div className="grid md:grid-cols-3 gap-5 mb-16">
              {capabilities.map((capability) => (
                <motion.div key={capability.label} variants={fadeUp} className="bg-card border border-border rounded-2xl p-6">
                  <div className="w-9 h-9 rounded-lg bg-gold/30 flex items-center justify-center mb-4">
                    <capability.icon className="w-4 h-4 text-navy" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2 text-sm">{capability.label}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{capability.desc}</p>
                </motion.div>
              ))}
            </div>

            <motion.div variants={fadeUp} className="grid md:grid-cols-2 gap-6">
              <div className="bg-card border border-border rounded-2xl p-7">
                <p className="text-xs uppercase tracking-wider text-muted-foreground mb-4 font-medium">U2CHAT can</p>
                <ul className="space-y-2.5">
                  {canDo.map((item) => (
                    <li key={item} className="flex items-start gap-2.5 text-sm text-foreground">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-amber-50/50 border border-amber-100 rounded-2xl p-7">
                <div className="flex items-center gap-2 mb-4">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <p className="text-xs uppercase tracking-wider text-amber-700 font-medium">U2CHAT cannot</p>
                </div>
                <ul className="space-y-2.5">
                  {cantDo.map((item) => (
                    <li key={item} className="flex items-start gap-2.5 text-sm text-foreground">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-2 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <section className="py-20 px-6 bg-navy text-white">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-serif text-3xl mb-4">Ask your first question</h2>
          <p className="text-white/60 text-sm mb-8">Open a session and explore how the stock agent orchestrates quotes, headlines, charts, and knowledge retrieval.</p>
          <Link to="/app/chat" className="px-6 py-3 bg-gold text-navy rounded-xl font-semibold text-sm hover:bg-gold/90 transition-colors inline-flex items-center gap-2">
            Open U2CHAT <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
