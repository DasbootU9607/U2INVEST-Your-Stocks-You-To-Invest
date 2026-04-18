import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { BookOpen, BarChart2, MessageSquare, ArrowRight, Check } from "lucide-react";

const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };

const pillars = [
  {
    num: "01",
    icon: BookOpen,
    color: "text-navy",
    bg: "bg-navy/10",
    border: "border-navy/10",
    label: "Knowledge Academy",
    headline: "Learn investing with structure and depth.",
    desc: "The Academy contains 50 modules across foundations, economics, analysis, strategy, psychology, and regulation. Each module includes a learning video, outcomes, takeaways, and progress tracking.",
    features: [
      "50 curated learning modules",
      "Video-led lessons with structured outcomes",
      "Knowledge tree and progress tracking",
      "Module ratings, comments, and replies",
      "Difficulty-based filtering",
    ],
    cta: "Explore Academy",
    href: "/product/academy",
  },
  {
    num: "02",
    icon: BarChart2,
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    border: "border-emerald-100",
    label: "Trading Lab",
    headline: "Practice stock decisions without financial risk.",
    desc: "The Trading Lab is a simulated stock environment using the project's stock pool, quote APIs, K-line charts, and a portfolio that starts with virtual cash.",
    features: [
      "100,000 in virtual starting capital",
      "Quote lookups across the stock pool",
      "Historical K-line chart views",
      "Portfolio holdings and trade history",
      "Frontend risk metrics and news side panel",
    ],
    cta: "Try the Lab",
    href: "/product/trading-lab",
  },
  {
    num: "03",
    icon: MessageSquare,
    color: "text-navy",
    bg: "bg-gold/30",
    border: "border-gold/30",
    label: "U2CHAT",
    headline: "Use a stock agent grounded in backend tools.",
    desc: "U2CHAT connects the frontend to the stock-agent backend, which can call quote, headline, K-line, fundamentals, and knowledge-base tools while persisting chat sessions.",
    features: [
      "Session-based chat history",
      "Real-time quote and headline tool access",
      "Historical K-line support",
      "Knowledge-base retrieval from local documents",
      "Tool usage surfaced in the UI",
    ],
    cta: "Try U2CHAT",
    href: "/product/u2chat",
  },
];

export default function ProductOverview() {
  return (
    <div className="bg-background">
      <section className="pt-32 pb-20 px-6 border-b border-border">
        <div className="max-w-4xl mx-auto">
          <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.1 } } }}>
            <motion.p variants={fadeUp} className="text-xs uppercase tracking-widest text-muted-foreground mb-4">
              The Product
            </motion.p>
            <motion.h1 variants={fadeUp} className="font-serif text-5xl md:text-6xl text-foreground mb-6">
              Learn. Practice. Analyse.
            </motion.h1>
            <motion.p variants={fadeUp} className="text-lg text-muted-foreground max-w-2xl leading-relaxed">
              U2INVEST is a three-pillar stock education system. Each pillar has a clear role, and together they connect the frontend experience to the stock-agent backend.
            </motion.p>
          </motion.div>
        </div>
      </section>

      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto space-y-24">
          {pillars.map((pillar, index) => (
            <motion.div
              key={pillar.label}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
              className={`grid md:grid-cols-2 gap-12 items-center ${index % 2 !== 0 ? "md:grid-flow-dense" : ""}`}
            >
              <motion.div variants={fadeUp} className={index % 2 !== 0 ? "md:col-start-2" : ""}>
                <p className="text-xs text-muted-foreground font-mono mb-3">{pillar.num}</p>
                <div className={`w-10 h-10 rounded-xl ${pillar.bg} flex items-center justify-center mb-5`}>
                  <pillar.icon className={`w-5 h-5 ${pillar.color}`} />
                </div>
                <h2 className="font-serif text-3xl md:text-4xl text-foreground mb-4">{pillar.headline}</h2>
                <p className="text-muted-foreground leading-relaxed mb-6 text-sm">{pillar.desc}</p>
                <Link
                  to={pillar.href}
                  className="inline-flex items-center gap-2 text-sm font-medium text-navy hover:gap-4 transition-all"
                >
                  {pillar.cta} <ArrowRight className="w-4 h-4" />
                </Link>
              </motion.div>

              <motion.div variants={fadeUp} className={`bg-card border ${pillar.border} rounded-2xl p-7`}>
                <p className="text-xs uppercase tracking-wider text-muted-foreground mb-4 font-medium">
                  {pillar.label} - Key features
                </p>
                <ul className="space-y-3">
                  {pillar.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3 text-sm text-foreground">
                      <Check className={`w-4 h-4 ${pillar.color} mt-0.5 flex-shrink-0`} />
                      {feature}
                    </li>
                  ))}
                </ul>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="py-20 px-6 bg-navy text-white">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-serif text-4xl mb-4">Ready to start?</h2>
          <p className="text-white/60 mb-8">
            Enter the app to explore the Academy, the Trading Lab, and the stock agent in one place.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link to="/app" className="px-6 py-3 bg-gold text-navy rounded-xl font-semibold text-sm hover:bg-gold/90 transition-colors">
              Enter App
            </Link>
            <Link to="/contact" className="px-6 py-3 border border-white/20 rounded-xl text-sm hover:bg-white/10 transition-colors">
              Contact
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
