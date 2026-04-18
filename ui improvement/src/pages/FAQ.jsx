import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };

const faqs = [
  {
    category: "About U2INVEST",
    items: [
      {
        q: "What is U2INVEST?",
        a: "U2INVEST is a three-pillar stock education platform. It combines a structured Knowledge Academy, a simulated Trading Lab, and a stock agent called U2CHAT.",
      },
      {
        q: "Who is U2INVEST for?",
        a: "Learners who want to study investing properly, practice safely, and use a tool-backed agent to speed up research and concept explanation.",
      },
      {
        q: "Is U2INVEST a financial advisor?",
        a: "No. U2INVEST is an educational project. Nothing on the platform constitutes personalised financial advice or an investment recommendation.",
      },
    ],
  },
  {
    category: "Trading Lab",
    items: [
      {
        q: "Is the Trading Lab using real money?",
        a: "No. All trading activity is simulated. The Lab starts with virtual cash and records virtual portfolio changes only.",
      },
      {
        q: "What market data does the Lab use?",
        a: "The Lab uses the current project’s stock-pool, quote, and K-line endpoints. Real market data may be used when available, with simulated fallbacks when needed.",
      },
      {
        q: "What happens if I lose all my virtual capital?",
        a: "You can reset the portfolio at any time and the backend will restore the starting balance while clearing the trade history.",
      },
    ],
  },
  {
    category: "U2CHAT",
    items: [
      {
        q: "What can U2CHAT do?",
        a: "U2CHAT can answer investing questions, call quote and headline tools, analyse historical K-line data, retrieve fundamentals, and search the U2INVEST knowledge base.",
      },
      {
        q: "Can U2CHAT give me personalised financial advice?",
        a: "No. It is designed as an educational assistant. It should not be treated as a substitute for regulated financial advice.",
      },
      {
        q: "How accurate is U2CHAT?",
        a: "It is only as reliable as its tools, data, and model output. Always verify important information independently before making financial decisions.",
      },
      {
        q: "Are my chat sessions saved?",
        a: "Yes. The current build persists chat sessions so you can revisit prior conversations in the redesigned UI.",
      },
    ],
  },
  {
    category: "Project Access",
    items: [
      {
        q: "Is there a paid tier in this build?",
        a: "No. The repository currently exposes the core experience rather than a commercial pricing model.",
      },
      {
        q: "Do I need an account to use the current build?",
        a: "No separate account flow is required in this repository build. The app uses session-based state on the backend.",
      },
      {
        q: "What is the pricing page for now?",
        a: "It documents the current project-access model and scope of the build rather than active subscription plans.",
      },
    ],
  },
  {
    category: "Support",
    items: [
      {
        q: "How do I get support?",
        a: "Use the contact form in the site or email hello@u2invest.com if you want to discuss the project or request a walkthrough.",
      },
      {
        q: "Is there a community or forum?",
        a: "Not in this build. The Academy comment threads are the main in-product discussion surface at the moment.",
      },
    ],
  },
];

function FAQItem({ q, a }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-border last:border-0">
      <button onClick={() => setOpen((prev) => !prev)} className="w-full flex items-start justify-between gap-4 py-5 text-left">
        <span className="text-sm font-medium text-foreground">{q}</span>
        <ChevronDown className={`w-4 h-4 text-muted-foreground flex-shrink-0 transition-transform mt-0.5 ${open ? "rotate-180" : ""}`} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <p className="text-sm text-muted-foreground leading-relaxed pb-5">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function FAQ() {
  return (
    <div className="bg-background">
      <section className="pt-32 pb-16 px-6 border-b border-border">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.1 } } }}>
            <motion.p variants={fadeUp} className="text-xs uppercase tracking-widest text-muted-foreground mb-3">FAQ</motion.p>
            <motion.h1 variants={fadeUp} className="font-serif text-5xl md:text-6xl text-foreground mb-4">Frequently asked<br />questions.</motion.h1>
            <motion.p variants={fadeUp} className="text-muted-foreground text-sm">Everything you need to know about the current U2INVEST build.</motion.p>
          </motion.div>
        </div>
      </section>

      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={{ visible: { transition: { staggerChildren: 0.1 } } }} className="space-y-12">
            {faqs.map((section) => (
              <motion.div key={section.category} variants={fadeUp}>
                <h2 className="font-semibold text-xs uppercase tracking-widest text-muted-foreground mb-1 pb-4 border-b border-border">{section.category}</h2>
                <div>
                  {section.items.map((item) => (
                    <FAQItem key={item.q} q={item.q} a={item.a} />
                  ))}
                </div>
              </motion.div>
            ))}
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="mt-16 bg-muted/30 border border-border rounded-2xl p-8 text-center">
            <h3 className="font-serif text-2xl text-foreground mb-2">Still have questions?</h3>
            <p className="text-sm text-muted-foreground mb-6">Reach out if you want to discuss the build or request a walkthrough.</p>
            <Link to="/contact" className="px-5 py-2.5 bg-navy text-white rounded-xl text-sm font-medium hover:bg-navy/90 transition-colors">
              Contact Us
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
