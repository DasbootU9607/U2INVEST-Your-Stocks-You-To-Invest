import { motion } from "framer-motion";

export default function LegalPage({ title, updated, children }) {
  return (
    <div className="bg-background">
      <section className="pt-32 pb-12 px-6 border-b border-border">
        <div className="max-w-3xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
            <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">Legal</p>
            <h1 className="font-serif text-4xl md:text-5xl text-foreground mb-3">{title}</h1>
            {updated && <p className="text-xs text-muted-foreground">Last updated: {updated}</p>}
          </motion.div>
        </div>
      </section>
      <section className="py-16 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="prose prose-sm max-w-none text-foreground
            [&_h2]:font-semibold [&_h2]:text-foreground [&_h2]:text-base [&_h2]:mt-10 [&_h2]:mb-3 [&_h2]:pb-2 [&_h2]:border-b [&_h2]:border-border
            [&_h3]:font-medium [&_h3]:text-foreground [&_h3]:text-sm [&_h3]:mt-6 [&_h3]:mb-2
            [&_p]:text-sm [&_p]:text-muted-foreground [&_p]:leading-relaxed [&_p]:mb-4
            [&_ul]:space-y-2 [&_ul]:mb-4 [&_ul]:pl-0
            [&_li]:text-sm [&_li]:text-muted-foreground [&_li]:flex [&_li]:items-start [&_li]:gap-2 [&_li]:leading-relaxed
            [&_strong]:text-foreground [&_strong]:font-medium
          ">
            {children}
          </div>
        </div>
      </section>
    </div>
  );
}