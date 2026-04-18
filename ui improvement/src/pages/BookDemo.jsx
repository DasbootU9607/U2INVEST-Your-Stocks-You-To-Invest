import { useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle, Calendar, Clock, Users } from "lucide-react";
import { api } from "@/lib/api";

const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };

const walkthroughPoints = [
  "Overview of the three-pillar structure",
  "How the redesigned UI maps onto the current backend",
  "A guided pass through Academy, Lab, and U2CHAT",
  "Questions about extending or adapting the build",
];

export default function BookDemo() {
  const [form, setForm] = useState({ name: "", email: "", company: "", role: "", message: "", consent: false });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!form.name || !form.email || !form.consent) return;

    try {
      setLoading(true);
      await api.submitInquiry({ ...form, inquiry_type: "walkthrough", source: "book_demo" });
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6 pt-24">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center max-w-md">
          <div className="w-14 h-14 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-7 h-7 text-emerald-600" />
          </div>
          <h2 className="font-serif text-3xl text-foreground mb-3">Walkthrough request received</h2>
          <p className="text-muted-foreground text-sm mb-2">Thank you. Your request has been recorded in the current backend.</p>
          <p className="text-muted-foreground text-xs">Questions in the meantime? Email <a href="mailto:hello@u2invest.com" className="text-navy underline">hello@u2invest.com</a></p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="bg-background">
      <section className="pt-32 pb-20 px-6 border-b border-border">
        <div className="max-w-4xl mx-auto">
          <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.1 } } }}>
            <motion.p variants={fadeUp} className="text-xs uppercase tracking-widest text-muted-foreground mb-3">Request a Walkthrough</motion.p>
            <motion.h1 variants={fadeUp} className="font-serif text-5xl md:text-6xl text-foreground mb-6">See how the build<br />fits together.</motion.h1>
            <motion.p variants={fadeUp} className="text-muted-foreground max-w-lg">Use this page if you want a guided walkthrough of the redesigned UI, the current backend structure, and the stock-agent orchestration.</motion.p>
          </motion.div>
        </div>
      </section>

      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-14 items-start">
          <div>
            <h2 className="font-serif text-2xl text-foreground mb-6">What to expect</h2>
            <ul className="space-y-3 mb-10">
              {walkthroughPoints.map((point) => (
                <li key={point} className="flex items-start gap-3 text-sm text-foreground">
                  <CheckCircle className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                  {point}
                </li>
              ))}
            </ul>
            <div className="bg-muted/50 border border-border rounded-2xl p-6 space-y-4">
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <Calendar className="w-4 h-4" /> Coordinated manually
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <Clock className="w-4 h-4" /> Length depends on the request
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <Users className="w-4 h-4" /> Suitable for individuals or small teams
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-foreground mb-1.5">Name *</label>
                <input required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} className="w-full border border-border rounded-xl px-4 py-3 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-navy/20 transition-all" placeholder="Full name" />
              </div>
              <div>
                <label className="block text-xs font-medium text-foreground mb-1.5">Email *</label>
                <input required type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} className="w-full border border-border rounded-xl px-4 py-3 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-navy/20 transition-all" placeholder="Email" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-foreground mb-1.5">Company</label>
                <input value={form.company} onChange={(event) => setForm({ ...form, company: event.target.value })} className="w-full border border-border rounded-xl px-4 py-3 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-navy/20 transition-all" placeholder="Optional" />
              </div>
              <div>
                <label className="block text-xs font-medium text-foreground mb-1.5">Role</label>
                <input value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value })} className="w-full border border-border rounded-xl px-4 py-3 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-navy/20 transition-all" placeholder="Optional" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-foreground mb-1.5">What do you want to cover?</label>
              <textarea value={form.message} onChange={(event) => setForm({ ...form, message: event.target.value })} rows={4} className="w-full border border-border rounded-xl px-4 py-3 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-navy/20 transition-all resize-none" placeholder="Tell us what you want to see in the walkthrough..." />
            </div>
            <div className="flex items-start gap-3">
              <input type="checkbox" id="consent" checked={form.consent} onChange={(event) => setForm({ ...form, consent: event.target.checked })} className="mt-1 accent-navy" />
              <label htmlFor="consent" className="text-xs text-muted-foreground">I have read the <a href="/legal/privacy" className="underline text-navy">Privacy Policy</a> and consent to this project storing my walkthrough request.</label>
            </div>
            <button type="submit" disabled={loading || !form.consent} className="w-full py-3 bg-navy text-white rounded-xl text-sm font-semibold hover:bg-navy/90 transition-colors disabled:opacity-50">
              {loading ? "Submitting..." : "Request Walkthrough"}
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
