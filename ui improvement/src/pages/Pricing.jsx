import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Check, ArrowRight } from "lucide-react";

const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };

const sections = [
  {
    name: "Core Experience",
    desc: "What the current repository build already includes.",
    features: [
      "50-module Knowledge Academy",
      "Trading Lab with simulated portfolio state",
      "U2CHAT session memory and stock-agent tools",
      "Frontend to backend orchestration already wired",
    ],
  },
  {
    name: "Current Access Model",
    desc: "How this build is positioned right now.",
    features: [
      "No active paid tier in this repository",
      "No separate account signup flow required",
      "Educational and project-focused usage",
      "Suitable for local exploration and further development",
    ],
  },
  {
    name: "Extension Paths",
    desc: "What teams could add later if they productise the build.",
    features: [
      "Commercial plans and auth",
      "Usage limits and billing",
      "Advanced analytics or exports",
      "Expanded content or market coverage",
    ],
  },
];

export default function Pricing() {
  return (
    <div className="bg-background">
      <section className="pt-32 pb-16 px-6 text-center border-b border-border">
        <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.1 } } }}>
          <motion.p variants={fadeUp} className="text-xs uppercase tracking-widest text-muted-foreground mb-3">Project Access</motion.p>
          <motion.h1 variants={fadeUp} className="font-serif text-5xl md:text-6xl text-foreground mb-4">What this build includes.</motion.h1>
          <motion.p variants={fadeUp} className="text-muted-foreground max-w-md mx-auto text-sm">This page describes the current repository build rather than active subscription plans.</motion.p>
        </motion.div>
      </section>

      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-6">
          {sections.map((section, index) => (
            <motion.div
              key={section.name}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              transition={{ delay: index * 0.08 }}
              className={`rounded-2xl p-8 border flex flex-col ${index === 1 ? "bg-navy text-white border-navy shadow-2xl" : "bg-card border-border"}`}
            >
              <div className="mb-6">
                <p className={`text-xs font-semibold uppercase tracking-wider mb-2 ${index === 1 ? "text-white/60" : "text-muted-foreground"}`}>{section.name}</p>
                <p className={`text-sm leading-relaxed ${index === 1 ? "text-white/70" : "text-muted-foreground"}`}>{section.desc}</p>
              </div>

              <ul className="space-y-3 flex-1">
                {section.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2.5 text-sm">
                    <Check className={`w-4 h-4 mt-0.5 flex-shrink-0 ${index === 1 ? "text-gold" : "text-emerald-600"}`} />
                    <span className={index === 1 ? "text-white/85" : "text-foreground"}>{feature}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="py-20 px-6 text-center bg-muted/30 border-y border-border">
        <h2 className="font-serif text-3xl text-foreground mb-4">Need a walkthrough?</h2>
        <p className="text-muted-foreground text-sm mb-8">Use the contact page if you want to discuss the build or how it could be extended.</p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link to="/contact" className="px-6 py-3 bg-navy text-white rounded-xl font-medium text-sm hover:bg-navy/90 transition-colors inline-flex items-center gap-2">
            Contact <ArrowRight className="w-4 h-4" />
          </Link>
          <Link to="/app" className="px-6 py-3 border border-border rounded-xl text-sm hover:bg-muted transition-colors">
            Enter App
          </Link>
        </div>
      </section>
    </div>
  );
}
