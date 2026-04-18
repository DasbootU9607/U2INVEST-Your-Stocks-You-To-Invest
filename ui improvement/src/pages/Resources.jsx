import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };

const resources = [
  { category: "Getting Started", items: [
    { title: "How to use the Knowledge Academy", desc: "A walkthrough of the Academy's modules, roadmap, and progress tracking.", type: "Guide" },
    { title: "Your first simulated trade", desc: "Step-by-step guide to executing your first trade in the Trading Lab.", type: "Guide" },
    { title: "Getting started with U2CHAT", desc: "How to use U2CHAT effectively for market research and education.", type: "Guide" },
  ]},
  { category: "Investing Concepts", items: [
    { title: "Fundamental vs Technical Analysis", desc: "Understanding the two core schools of investing analysis.", type: "Article" },
    { title: "Understanding Market Indices", desc: "What the S&P 500, Nasdaq, and FTSE 100 actually measure.", type: "Article" },
    { title: "The time value of money", desc: "Why a pound today is worth more than a pound tomorrow.", type: "Article" },
  ]},
];

export default function Resources() {
  return (
    <div className="bg-background">
      <section className="pt-32 pb-16 px-6 border-b border-border">
        <div className="max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
            <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">Resources</p>
            <h1 className="font-serif text-5xl text-foreground mb-4">Learning resources.</h1>
            <p className="text-muted-foreground">Guides, articles, and references to support your investing education.</p>
          </motion.div>
        </div>
      </section>

      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto space-y-14">
          {resources.map((section, i) => (
            <motion.div key={section.category} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
              <h2 className="font-semibold text-xs uppercase tracking-wider text-muted-foreground mb-6 pb-3 border-b border-border">{section.category}</h2>
              <div className="grid md:grid-cols-3 gap-4">
                {section.items.map((item) => (
                  <div key={item.title} className="bg-card border border-border rounded-2xl p-5 hover:shadow-md transition-all">
                    <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">{item.type}</span>
                    <h3 className="font-semibold text-foreground text-sm mt-3 mb-2">{item.title}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        <div className="max-w-4xl mx-auto mt-14 bg-navy rounded-2xl p-8 text-white text-center">
          <h2 className="font-serif text-2xl mb-3">Ready to go deeper?</h2>
          <p className="text-white/60 text-sm mb-6">All 50+ learning modules are available in the Academy.</p>
          <Link to="/app/academy" className="px-5 py-2.5 bg-gold text-navy rounded-xl font-semibold text-sm hover:bg-gold/90 transition-colors inline-flex items-center gap-2">
            Open Academy <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
