import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Clock, CheckCircle } from "lucide-react";
import { api } from "@/lib/api";

const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };

const inquiryTypes = [
  { value: "general", label: "General enquiry" },
  { value: "walkthrough", label: "Project walkthrough" },
  { value: "feedback", label: "Product feedback" },
  { value: "support", label: "Support" },
  { value: "partnership", label: "Partnership" },
];

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", company: "", role: "", inquiry_type: "general", message: "", consent: false });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const nextErrors = {};
    if (!form.name.trim()) nextErrors.name = "Name is required";
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) nextErrors.email = "Valid email is required";
    if (!form.message.trim()) nextErrors.message = "Please include a message";
    if (!form.consent) nextErrors.consent = "Please confirm your consent";
    return nextErrors;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = validate();
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    try {
      setLoading(true);
      await api.submitInquiry({ ...form, source: "contact_page" });
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
          <h2 className="font-serif text-3xl text-foreground mb-3">Message received</h2>
          <p className="text-muted-foreground text-sm mb-6">Thank you for getting in touch. Your message has been recorded by the current build.</p>
          <button onClick={() => setSubmitted(false)} className="text-sm text-navy hover:underline">Send another message</button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="bg-background">
      <section className="pt-32 pb-20 px-6 border-b border-border">
        <div className="max-w-4xl mx-auto">
          <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.1 } } }}>
            <motion.p variants={fadeUp} className="text-xs uppercase tracking-widest text-muted-foreground mb-3">Contact</motion.p>
            <motion.h1 variants={fadeUp} className="font-serif text-5xl md:text-6xl text-foreground mb-6">Get in touch.</motion.h1>
            <motion.p variants={fadeUp} className="text-muted-foreground max-w-lg">Use this form for project questions, feedback, or walkthrough requests. Submissions are now routed into the current backend for review.</motion.p>
          </motion.div>
        </div>
      </section>

      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto grid md:grid-cols-3 gap-10">
          <div className="space-y-6">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                <Mail className="w-4 h-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Email</p>
                <a href="mailto:hello@u2invest.com" className="text-sm font-medium text-foreground hover:text-navy transition-colors">hello@u2invest.com</a>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                <Clock className="w-4 h-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Response time</p>
                <p className="text-sm text-foreground">As soon as possible for this build</p>
              </div>
            </div>
          </div>

          <div className="md:col-span-2">
            <motion.form initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.08 } } }} onSubmit={handleSubmit} className="space-y-5">
              <motion.div variants={fadeUp} className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1.5">Name *</label>
                  <input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} className={`w-full border rounded-xl px-4 py-3 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-navy/20 transition-all ${errors.name ? "border-red-400" : "border-border"}`} placeholder="Your full name" />
                  {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
                </div>
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1.5">Email *</label>
                  <input type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} className={`w-full border rounded-xl px-4 py-3 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-navy/20 transition-all ${errors.email ? "border-red-400" : "border-border"}`} placeholder="you@example.com" />
                  {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
                </div>
              </motion.div>

              <motion.div variants={fadeUp} className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1.5">Company</label>
                  <input value={form.company} onChange={(event) => setForm({ ...form, company: event.target.value })} className="w-full border border-border rounded-xl px-4 py-3 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-navy/20 transition-all" placeholder="Optional" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1.5">Role</label>
                  <input value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value })} className="w-full border border-border rounded-xl px-4 py-3 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-navy/20 transition-all" placeholder="Optional" />
                </div>
              </motion.div>

              <motion.div variants={fadeUp}>
                <label className="block text-xs font-medium text-foreground mb-1.5">Enquiry type</label>
                <select value={form.inquiry_type} onChange={(event) => setForm({ ...form, inquiry_type: event.target.value })} className="w-full border border-border rounded-xl px-4 py-3 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-navy/20 transition-all">
                  {inquiryTypes.map((type) => <option key={type.value} value={type.value}>{type.label}</option>)}
                </select>
              </motion.div>

              <motion.div variants={fadeUp}>
                <label className="block text-xs font-medium text-foreground mb-1.5">Message *</label>
                <textarea value={form.message} onChange={(event) => setForm({ ...form, message: event.target.value })} rows={5} className={`w-full border rounded-xl px-4 py-3 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-navy/20 transition-all resize-none ${errors.message ? "border-red-400" : "border-border"}`} placeholder="Tell us how we can help..." />
                {errors.message && <p className="text-xs text-red-500 mt-1">{errors.message}</p>}
              </motion.div>

              <motion.div variants={fadeUp} className="flex items-start gap-3">
                <input type="checkbox" id="consent" checked={form.consent} onChange={(event) => setForm({ ...form, consent: event.target.checked })} className="mt-1 accent-navy" />
                <label htmlFor="consent" className="text-xs text-muted-foreground leading-relaxed">
                  I confirm that I have read the <a href="/legal/privacy" className="underline text-navy">Privacy Policy</a> and consent to this project storing my enquiry so it can be reviewed.
                </label>
              </motion.div>
              {errors.consent && <p className="text-xs text-red-500">{errors.consent}</p>}

              <motion.div variants={fadeUp}>
                <button type="submit" disabled={loading} className="w-full py-3 bg-navy text-white rounded-xl text-sm font-semibold hover:bg-navy/90 transition-colors disabled:opacity-60">
                  {loading ? "Sending..." : "Send Message"}
                </button>
              </motion.div>
            </motion.form>
          </div>
        </div>
      </section>
    </div>
  );
}
