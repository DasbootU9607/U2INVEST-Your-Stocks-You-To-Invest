import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, BookOpen, BarChart2, MessageSquare } from "lucide-react";

const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };

const steps = [
  { icon: BookOpen, num: "01", label: "Open the app", desc: "Jump straight into the current build. No separate account flow is required in this repository version." },
  { icon: BarChart2, num: "02", label: "Start with the Academy", desc: "Use the 50-module learning path to build context before making decisions in the Lab." },
  { icon: MessageSquare, num: "03", label: "Practice and analyse", desc: "Use the Trading Lab to simulate trades and U2CHAT to research stocks, headlines, and concepts." },
];

export default function GetStarted() {
  return (
    <div className="bg-background min-h-screen">
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.1 } } }}>
            <motion.p variants={fadeUp} className="text-xs uppercase tracking-widest text-muted-foreground mb-3">Get Started</motion.p>
            <motion.h1 variants={fadeUp} className="font-serif text-5xl md:text-6xl text-foreground mb-6">Your stock-learning<br />workflow starts here.</motion.h1>
            <motion.p variants={fadeUp} className="text-muted-foreground max-w-md mx-auto mb-12">Three steps to get the most from the current U2INVEST build.</motion.p>

            <div className="space-y-5 mb-12">
              {steps.map((step) => (
                <motion.div key={step.num} variants={fadeUp} className="flex items-start gap-5 text-left bg-card border border-border rounded-2xl p-6">
                  <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center flex-shrink-0">
                    <step.icon className="w-5 h-5 text-foreground" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-mono mb-1">{step.num}</p>
                    <h3 className="font-semibold text-foreground mb-1">{step.label}</h3>
                    <p className="text-sm text-muted-foreground">{step.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            <motion.div variants={fadeUp} className="flex flex-wrap justify-center gap-3">
              <Link to="/app" className="px-6 py-3 bg-navy text-white rounded-xl font-medium text-sm hover:bg-navy/90 transition-colors inline-flex items-center gap-2">
                Enter the App <ArrowRight className="w-4 h-4" />
              </Link>
              <Link to="/product" className="px-6 py-3 border border-border rounded-xl text-sm hover:bg-muted transition-colors">
                Explore the Product
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
