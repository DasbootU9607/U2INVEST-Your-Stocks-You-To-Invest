import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { BookOpen, Map, Video, CheckCircle, MessageSquare, BarChart, ArrowRight } from "lucide-react";

const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };

const features = [
  { icon: BookOpen, label: "50 Modules", desc: "Covering foundations, economics, analysis, strategy, psychology, and regulation." },
  { icon: Map, label: "Knowledge Tree", desc: "A structured path through the Academy with completion tracking across modules." },
  { icon: Video, label: "Video Lessons", desc: "Each module carries a video, outcomes, and takeaways drawn from the current project data." },
  { icon: CheckCircle, label: "Progress Tracking", desc: "Mark modules complete and carry that status through the redesigned interface." },
  { icon: MessageSquare, label: "Discussion Threads", desc: "Comment, reply, like, and rate modules directly against the Flask backend." },
  { icon: BarChart, label: "Difficulty Levels", desc: "Beginner, Intermediate, and Advanced levels map to the original course structure." },
];

const categories = [
  "Foundations",
  "Economics",
  "Analysis",
  "Strategy",
  "Psychology",
  "Regulations",
  "Advanced",
];

export default function ProductAcademy() {
  return (
    <div className="bg-background">
      <section className="pt-32 pb-20 px-6 border-b border-border">
        <div className="max-w-4xl mx-auto">
          <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.1 } } }}>
            <motion.div variants={fadeUp} className="w-12 h-12 rounded-2xl bg-navy/10 flex items-center justify-center mb-6">
              <BookOpen className="w-6 h-6 text-navy" />
            </motion.div>
            <motion.p variants={fadeUp} className="text-xs uppercase tracking-widest text-muted-foreground mb-3">Knowledge Academy</motion.p>
            <motion.h1 variants={fadeUp} className="font-serif text-5xl md:text-6xl text-foreground mb-6">
              Learn investing
              <br />
              with structure.
            </motion.h1>
            <motion.p variants={fadeUp} className="text-lg text-muted-foreground max-w-xl leading-relaxed mb-8">
              The Academy preserves the current project's learning structure while fitting it into the redesigned UI: 50 modules, real completion state, ratings, comments, and video-based lessons.
            </motion.p>
            <motion.div variants={fadeUp} className="flex gap-3">
              <Link to="/app/academy" className="px-5 py-2.5 bg-navy text-white rounded-xl text-sm font-medium hover:bg-navy/90 transition-colors inline-flex items-center gap-2">
                Start Learning <ArrowRight className="w-4 h-4" />
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
            <motion.h2 variants={fadeUp} className="font-serif text-3xl text-foreground mb-10 text-center">What the Academy includes</motion.h2>
            <div className="grid md:grid-cols-3 gap-5">
              {features.map((feature) => (
                <motion.div key={feature.label} variants={fadeUp} className="bg-card border border-border rounded-2xl p-6">
                  <div className="w-9 h-9 rounded-lg bg-navy/10 flex items-center justify-center mb-4">
                    <feature.icon className="w-4 h-4 text-navy" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2 text-sm">{feature.label}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{feature.desc}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-20 px-6 bg-muted/30 border-y border-border">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
            <h2 className="font-serif text-3xl text-foreground mb-4">Topics we cover</h2>
            <p className="text-muted-foreground text-sm mb-10">The categories below reflect the current Academy dataset.</p>
            <div className="flex flex-wrap justify-center gap-2">
              {categories.map((category) => (
                <span key={category} className="px-4 py-2 bg-card border border-border rounded-full text-sm text-foreground">
                  {category}
                </span>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-serif text-3xl text-foreground mb-4">Ready to learn?</h2>
          <p className="text-muted-foreground text-sm mb-8">Enter the Academy and start the current 50-module learning path.</p>
          <Link to="/app/academy" className="px-6 py-3 bg-navy text-white rounded-xl font-medium text-sm hover:bg-navy/90 transition-colors inline-flex items-center gap-2">
            Open Academy <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
