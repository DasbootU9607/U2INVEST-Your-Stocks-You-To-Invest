import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BookOpen,
  BarChart2,
  MessageSquare,
  ChevronRight,
  Star,
  CheckCircle,
} from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

const pillars = [
  {
    icon: BookOpen,
    color: "text-navy",
    bg: "bg-navy/10",
    label: "Knowledge Academy",
    tagline: "Learn with structure",
    desc: "50 curated modules spanning the foundations of investing, analysis, psychology, and strategy. Each module includes a video, outcomes, and takeaways.",
    href: "/product/academy",
    cta: "Explore Academy",
  },
  {
    icon: BarChart2,
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    label: "Trading Lab",
    tagline: "Practice without risk",
    desc: "A simulated trading environment with a live stock pool, quote lookups, K-line charts, and a portfolio that starts with 100,000 in virtual cash.",
    href: "/product/trading-lab",
    cta: "Try the Lab",
  },
  {
    icon: MessageSquare,
    color: "text-navy",
    bg: "bg-gold/30",
    label: "U2CHAT",
    tagline: "Analyse with AI",
    desc: "A stock agent backed by market tools and the U2INVEST knowledge base. Ask about quotes, headlines, K-line history, and investing concepts.",
    href: "/product/u2chat",
    cta: "Try U2CHAT",
  },
];

const trustPoints = [
  { label: "Educational focus", desc: "Built for learning, not speculation." },
  { label: "Simulated trading", desc: "All Lab activity is virtual. No real orders are placed." },
  { label: "Tool-backed AI", desc: "U2CHAT can call stock tools and the local knowledge base." },
  { label: "Visible orchestration", desc: "The agent surfaces which tools it used in each response." },
];

const stats = [
  { value: "50", label: "Learning modules" },
  { value: "100K", label: "Starting virtual cash" },
  { value: "3", label: "Integrated pillars" },
  { value: "Saved", label: "Agent sessions" },
];

const faqs = [
  {
    q: "Is this real trading?",
    a: "No. The Trading Lab is fully simulated. You practice with virtual money and no real trades are executed.",
  },
  {
    q: "Who is U2INVEST for?",
    a: "Learners who want to study investing properly, practice safely, and use an agent for faster market research and concept explanation.",
  },
  {
    q: "What can U2CHAT do?",
    a: "It can answer investing questions, pull stock quotes and headlines, analyse K-line data, and retrieve relevant context from the U2INVEST knowledge base.",
  },
  {
    q: "What does this project focus on?",
    a: "Structured education, a zero-risk lab, and a stock agent that connects the frontend to backend tools and knowledge retrieval.",
  },
];

export default function Home() {
  return (
    <div className="bg-background">
      <section className="relative pt-32 pb-24 px-6 overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-navy/4 rounded-full blur-3xl transform translate-x-1/3 -translate-y-1/4" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gold/8 rounded-full blur-3xl transform -translate-x-1/3 translate-y-1/4" />
        </div>

        <div className="max-w-5xl mx-auto">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.12 } } }}
          >
            <motion.div variants={fadeUp} className="mb-6">
              <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-gold/10 text-gold border border-gold/20 rounded-full text-xs font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" />
                Learn | Practice | Analyse
              </span>
            </motion.div>

            <motion.h1
              variants={fadeUp}
              className="font-serif text-5xl md:text-7xl text-foreground leading-[1.05] mb-6 text-balance"
            >
              Build investing
              <br />
              <span className="text-navy italic">understanding.</span>
            </motion.h1>

            <motion.p
              variants={fadeUp}
              className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-10 leading-relaxed"
            >
              U2INVEST combines a structured Academy, a simulated Trading Lab, and a
              tool-using stock agent so you can study markets, practice decisions, and
              research faster in one workflow.
            </motion.p>

            <motion.div variants={fadeUp} className="flex flex-wrap gap-3">
              <Link
                to="/app"
                className="inline-flex items-center gap-2 px-6 py-3 bg-navy text-white rounded-xl font-medium hover:bg-navy/90 transition-colors"
              >
                Enter App <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/product"
                className="inline-flex items-center gap-2 px-6 py-3 border border-border rounded-xl text-sm hover:bg-muted transition-colors"
              >
                Explore Product
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <section className="border-y border-border bg-muted/30">
        <div className="max-w-5xl mx-auto px-6 py-10 grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="font-serif text-3xl text-navy mb-1">{stat.value}</div>
              <div className="text-xs text-muted-foreground uppercase tracking-wider">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
          >
            <motion.div variants={fadeUp} className="text-center mb-16">
              <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">The three pillars</p>
              <h2 className="font-serif text-4xl md:text-5xl text-foreground mb-4">One platform. Three tools.</h2>
              <p className="text-muted-foreground max-w-xl mx-auto">
                Each pillar does a distinct job. Together they form a complete stock education workflow.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-6">
              {pillars.map((pillar) => (
                <motion.div
                  key={pillar.label}
                  variants={fadeUp}
                  className="group bg-card border border-border rounded-2xl p-7 hover:shadow-lg transition-all duration-300 hover:border-navy/20 flex flex-col"
                >
                  <div className={`w-10 h-10 rounded-xl ${pillar.bg} flex items-center justify-center mb-5`}>
                    <pillar.icon className={`w-5 h-5 ${pillar.color}`} />
                  </div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">{pillar.tagline}</p>
                  <h3 className="font-semibold text-foreground text-lg mb-3">{pillar.label}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed flex-1 mb-6">{pillar.desc}</p>
                  <Link
                    to={pillar.href}
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-navy hover:gap-3 transition-all"
                  >
                    {pillar.cta} <ChevronRight className="w-4 h-4" />
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-24 px-6 bg-navy text-white">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
          >
            <motion.div variants={fadeUp} className="mb-14">
              <p className="text-xs uppercase tracking-widest text-white/40 mb-3">Why U2INVEST</p>
              <h2 className="font-serif text-4xl md:text-5xl text-white mb-4">Built for serious learners.</h2>
              <p className="text-white/60 max-w-lg">
                This project focuses on fundamentals, practice, and transparent agent behavior instead of hype.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-5">
              {trustPoints.map((point) => (
                <motion.div
                  key={point.label}
                  variants={fadeUp}
                  className="flex gap-4 p-6 bg-white/5 rounded-2xl border border-white/10"
                >
                  <CheckCircle className="w-5 h-5 text-gold flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-white mb-1">{point.label}</h4>
                    <p className="text-white/60 text-sm">{point.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            <motion.div variants={fadeUp} className="mt-12 flex gap-4">
              <Link
                to="/about"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/10 text-white border border-white/20 rounded-xl text-sm hover:bg-white/15 transition-colors"
              >
                About U2INVEST
              </Link>
              <Link
                to="/app"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-gold text-navy rounded-xl text-sm font-semibold hover:bg-gold/90 transition-colors"
              >
                Enter the App <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
            <div className="text-center mb-14">
              <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">Built around the workflow</p>
              <h2 className="font-serif text-4xl text-foreground">What this build gives you</h2>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  name: "Academy",
                  role: "Structured learning",
                  quote: "The roadmap and module dependencies turn a scattered topic list into an actual learning path.",
                },
                {
                  name: "Trading Lab",
                  role: "Practice safely",
                  quote: "The portfolio simulator lets you test decisions with live-style data before any real capital is on the line.",
                },
                {
                  name: "U2CHAT",
                  role: "Research support",
                  quote: "The stock agent combines quotes, headlines, K-line history, and knowledge retrieval in a single workflow.",
                },
              ].map((item) => (
                <div key={item.name} className="bg-card border border-border rounded-2xl p-7">
                  <div className="flex gap-0.5 mb-4">
                    {[...Array(5)].map((_, index) => (
                      <Star key={index} className="w-3.5 h-3.5 fill-gold text-gold" />
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-5 italic">{item.quote}</p>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{item.name}</p>
                    <p className="text-xs text-muted-foreground">{item.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-24 px-6 bg-muted/30 border-y border-border">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={{ visible: { transition: { staggerChildren: 0.08 } } }}
          >
            <motion.div variants={fadeUp} className="text-center mb-12">
              <h2 className="font-serif text-4xl text-foreground mb-3">Common questions</h2>
              <p className="text-muted-foreground text-sm">Quick answers to what people ask most.</p>
            </motion.div>
            <div className="space-y-4">
              {faqs.map((faq) => (
                <motion.div key={faq.q} variants={fadeUp} className="bg-card border border-border rounded-xl p-6">
                  <h4 className="font-semibold text-foreground mb-2 text-sm">{faq.q}</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">{faq.a}</p>
                </motion.div>
              ))}
            </div>
            <motion.div variants={fadeUp} className="text-center mt-8">
              <Link to="/faq" className="text-sm text-navy font-medium hover:underline">
                View all FAQs -&gt;
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
