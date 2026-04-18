import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Target, Eye, Heart } from "lucide-react";

const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };

const values = [
  { icon: Target, label: "Clarity over hype", desc: "The project separates education from advice and simulation from real execution." },
  { icon: Eye, label: "Visible orchestration", desc: "Frontend actions map back to the current backend routes, tools, and stock-agent workflow." },
  { icon: Heart, label: "Built for the serious learner", desc: "U2INVEST focuses on concepts, process, and practice instead of gamified shortcuts." },
];

export default function About() {
  return (
    <div className="bg-background">
      <section className="pt-32 pb-20 px-6 border-b border-border">
        <div className="max-w-4xl mx-auto">
          <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.1 } } }}>
            <motion.p variants={fadeUp} className="text-xs uppercase tracking-widest text-muted-foreground mb-4">About</motion.p>
            <motion.h1 variants={fadeUp} className="font-serif text-5xl md:text-6xl text-foreground mb-6">
              A better way to
              <br />
              learn stock investing.
            </motion.h1>
            <motion.p variants={fadeUp} className="text-lg text-muted-foreground max-w-2xl leading-relaxed">
              U2INVEST was rebuilt around a simple idea: learning, practice, and research should live in one system, and the orchestration between frontend and backend should stay transparent.
            </motion.p>
          </motion.div>
        </div>
      </section>

      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={{ visible: { transition: { staggerChildren: 0.1 } } }}>
            <motion.div variants={fadeUp} className="grid md:grid-cols-2 gap-12 items-start mb-20">
              <div>
                <h2 className="font-serif text-3xl text-foreground mb-6">This build</h2>
                <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
                  <p>U2INVEST combines a 50-module Academy, a simulated Trading Lab, and a stock agent that can call quotes, headlines, K-line history, fundamentals, and local knowledge retrieval tools.</p>
                  <p>The current redesign keeps the new UI language while restoring the project’s original backend flows: comments and ratings for Academy modules, session-backed chat, portfolio simulation, and tool-driven agent responses.</p>
                  <p>The result is a single project where the frontend is polished, but the underlying functionality still reflects the real stock-agent structure.</p>
                </div>
              </div>
              <div className="bg-navy rounded-2xl p-8 text-white">
                <h3 className="font-serif text-2xl mb-6">The goal</h3>
                <p className="text-white/70 text-sm leading-relaxed">
                  Make stock learning practical: study the concepts, test the decisions, and use a transparent agent workflow to accelerate research without pretending that education is financial advice.
                </p>
              </div>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-6">
              {values.map((value) => (
                <motion.div key={value.label} variants={fadeUp} className="bg-card border border-border rounded-2xl p-6">
                  <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center mb-5">
                    <value.icon className="w-5 h-5 text-foreground" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2 text-sm">{value.label}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{value.desc}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-20 px-6 bg-muted/30 border-y border-border text-center">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
          <h2 className="font-serif text-3xl text-foreground mb-4">Need a walkthrough or have feedback?</h2>
          <p className="text-muted-foreground text-sm mb-8 max-w-md mx-auto">Use the contact page if you want to discuss the build, ask about the project, or request a guided walkthrough.</p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link to="/contact" className="px-5 py-2.5 bg-navy text-white rounded-xl text-sm font-medium hover:bg-navy/90 transition-colors">
              Contact Us
            </Link>
            <Link to="/app" className="px-5 py-2.5 border border-border rounded-xl text-sm hover:bg-muted transition-colors">
              Enter App
            </Link>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
