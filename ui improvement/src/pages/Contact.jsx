import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Clock, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { api } from "@/lib/api";
import { BufferedVideoBackground } from "@/components/layout/BufferedVideoBackground";
import { useRandomVideoBackground } from "@/hooks/use-random-video-background";

const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };

const inquiryTypes = [
  { value: "general", label: "General enquiry" },
  { value: "walkthrough", label: "Project walkthrough" },
  { value: "feedback", label: "Product feedback" },
  { value: "support", label: "Support" },
  { value: "partnership", label: "Partnership" },
];

const contactDetails = [
  {
    icon: Mail,
    label: "Email",
    content: (
      <a
        href="mailto:hello@u2invest.com"
        className="text-sm font-medium text-white hover:text-white/85 transition-colors"
      >
        hello@u2invest.com
      </a>
    ),
  },
  {
    icon: Clock,
    label: "Response time",
    content: <p className="text-sm text-white/82">As soon as possible for this build</p>,
  },
];

export default function Contact() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    company: "",
    role: "",
    inquiry_type: "general",
    message: "",
    consent: false,
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const {
    activeSlot,
    handleVideoAdvance,
    handleVideoError,
    handleVideoReady,
    sectionRef,
    setVideoNode,
    videoSlots,
  } = useRandomVideoBackground({
    listEndpoint: "/api/contact-videos",
    mediaBasePath: "/contact-media",
    staticListPath: "/background-media/contact/index.json",
    staticMediaBasePath: "/background-media/contact",
    activeThreshold: 0.4,
  });

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

  return (
    <section
      ref={sectionRef}
      className="relative mt-16 min-h-[calc(100svh-4rem)] overflow-hidden"
    >
      <div className="absolute inset-0">
        <BufferedVideoBackground
          activeSlot={activeSlot}
          handleVideoAdvance={handleVideoAdvance}
          handleVideoError={handleVideoError}
          handleVideoReady={handleVideoReady}
          setVideoNode={setVideoNode}
          videoSlots={videoSlots}
        />
        <div className="absolute inset-0 bg-[linear-gradient(116deg,rgba(2,6,23,0.97)_8%,rgba(15,23,42,0.84)_36%,rgba(15,23,42,0.66)_60%,rgba(2,6,23,0.92)_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(226,232,240,0.10),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(191,219,254,0.12),transparent_24%)]" />
      </div>

      <div className="relative flex min-h-[calc(100svh-4rem)] items-center">
        <div className="mx-auto w-full max-w-7xl px-6 py-6 lg:py-5">
          {submitted ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mx-auto max-w-md rounded-[32px] border border-white/18 bg-white/14 p-10 text-center text-slate-50 shadow-[0_35px_120px_-55px_rgba(15,23,42,0.8)] backdrop-blur-xl"
            >
              <div className="mb-6 flex justify-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/12">
                  <CheckCircle className="h-7 w-7 text-emerald-300" />
                </div>
              </div>
              <h2 className="font-serif text-3xl mb-3">Message received</h2>
              <p className="text-sm text-white/76 mb-6">
                Thank you for getting in touch. Your message has been recorded by the current build.
              </p>
              <button
                onClick={() => setSubmitted(false)}
                className="text-sm text-slate-100 hover:text-slate-200 transition-colors"
              >
                Send another message
              </button>
            </motion.div>
          ) : (
            <div className="grid items-stretch gap-6 lg:grid-cols-[0.9fr_1.1fr]">
              <motion.div
                initial="hidden"
                animate="visible"
                variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
                className="h-full rounded-[34px] border border-white/16 bg-white/12 p-8 text-slate-50 shadow-[0_35px_120px_-55px_rgba(15,23,42,0.8)] backdrop-blur-xl lg:p-10 flex flex-col"
              >
                <motion.p variants={fadeUp} className="text-xs uppercase tracking-[0.28em] text-slate-200/65 mb-4">
                  Contact
                </motion.p>
                <motion.h1 variants={fadeUp} className="font-serif text-5xl md:text-6xl leading-[1.02] mb-6 text-slate-50">
                  Get in touch.
                </motion.h1>
                <motion.p variants={fadeUp} className="max-w-md text-slate-200/88 leading-relaxed">
                  Use this form for project questions, feedback, or walkthrough requests.
                  Submissions are routed into the current backend for review.
                </motion.p>

                <div className="mt-auto pt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
                  {contactDetails.map((detail) => (
                    <motion.div
                      key={detail.label}
                      variants={fadeUp}
                      className="flex items-start gap-4 rounded-[24px] border border-white/10 bg-black/10 px-5 py-4"
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10 flex-shrink-0">
                        <detail.icon className="h-4 w-4 text-slate-100/80" />
                      </div>
                      <div>
                        <p className="text-[11px] uppercase tracking-[0.22em] text-slate-200/55 mb-1">
                          {detail.label}
                        </p>
                        {detail.content}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              <motion.form
                initial="hidden"
                animate="visible"
                variants={{ visible: { transition: { staggerChildren: 0.08 } } }}
                onSubmit={handleSubmit}
                className="h-full rounded-[34px] border border-white/16 bg-white/88 p-6 shadow-[0_35px_120px_-55px_rgba(15,23,42,0.8)] backdrop-blur-xl lg:p-7 flex flex-col"
              >
                <motion.div variants={fadeUp} className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-900 mb-1.5">Name *</label>
                    <input
                      value={form.name}
                      onChange={(event) => setForm({ ...form, name: event.target.value })}
                      className={`w-full rounded-2xl border px-4 py-3 text-sm bg-white/75 focus:outline-none focus:ring-2 focus:ring-navy/20 transition-all ${
                        errors.name ? "border-red-400" : "border-slate-200"
                      }`}
                      placeholder="Your full name"
                    />
                    {errors.name ? <p className="text-xs text-red-500 mt-1">{errors.name}</p> : null}
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-900 mb-1.5">Email *</label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={(event) => setForm({ ...form, email: event.target.value })}
                      className={`w-full rounded-2xl border px-4 py-3 text-sm bg-white/75 focus:outline-none focus:ring-2 focus:ring-navy/20 transition-all ${
                        errors.email ? "border-red-400" : "border-slate-200"
                      }`}
                      placeholder="you@example.com"
                    />
                    {errors.email ? <p className="text-xs text-red-500 mt-1">{errors.email}</p> : null}
                  </div>
                </motion.div>

                <motion.div variants={fadeUp} className="mt-4 grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-900 mb-1.5">Company</label>
                    <input
                      value={form.company}
                      onChange={(event) => setForm({ ...form, company: event.target.value })}
                      className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm bg-white/75 focus:outline-none focus:ring-2 focus:ring-navy/20 transition-all"
                      placeholder="Optional"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-900 mb-1.5">Role</label>
                    <input
                      value={form.role}
                      onChange={(event) => setForm({ ...form, role: event.target.value })}
                      className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm bg-white/75 focus:outline-none focus:ring-2 focus:ring-navy/20 transition-all"
                      placeholder="Optional"
                    />
                  </div>
                </motion.div>

                <motion.div variants={fadeUp} className="mt-4">
                  <label className="block text-xs font-medium text-slate-900 mb-1.5">Enquiry type</label>
                  <select
                    value={form.inquiry_type}
                    onChange={(event) => setForm({ ...form, inquiry_type: event.target.value })}
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm bg-white/75 focus:outline-none focus:ring-2 focus:ring-navy/20 transition-all"
                  >
                    {inquiryTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </motion.div>

                <motion.div variants={fadeUp} className="mt-4">
                  <label className="block text-xs font-medium text-slate-900 mb-1.5">Message *</label>
                  <textarea
                    value={form.message}
                    onChange={(event) => setForm({ ...form, message: event.target.value })}
                    rows={4}
                    className={`w-full rounded-2xl border px-4 py-3 text-sm bg-white/75 focus:outline-none focus:ring-2 focus:ring-navy/20 transition-all resize-none ${
                      errors.message ? "border-red-400" : "border-slate-200"
                    }`}
                    placeholder="Tell us how we can help..."
                  />
                  {errors.message ? <p className="text-xs text-red-500 mt-1">{errors.message}</p> : null}
                </motion.div>

                <motion.div variants={fadeUp} className="mt-4 flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="consent"
                    checked={form.consent}
                    onChange={(event) => setForm({ ...form, consent: event.target.checked })}
                    className="mt-1 accent-navy"
                  />
                  <label htmlFor="consent" className="text-xs text-slate-600 leading-relaxed">
                    I confirm that I have read the{" "}
                    <Link to="/legal/privacy" className="underline text-navy">
                      Privacy Policy
                    </Link>{" "}
                    and consent to this project storing my enquiry so it can be reviewed.
                  </label>
                </motion.div>
                {errors.consent ? <p className="text-xs text-red-500 mt-2">{errors.consent}</p> : null}

                <motion.div variants={fadeUp} className="mt-auto pt-5">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-2xl bg-navy py-3 text-sm font-semibold text-white hover:bg-navy/90 transition-colors disabled:opacity-60"
                  >
                    {loading ? "Sending..." : "Send Message"}
                  </button>
                </motion.div>
              </motion.form>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
