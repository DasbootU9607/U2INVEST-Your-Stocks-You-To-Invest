export default function PillBadge({ children, variant = "default" }) {
  const variants = {
    default: "bg-muted text-muted-foreground",
    gold: "bg-gold/10 text-gold border border-gold/20",
    navy: "bg-navy/10 text-navy border border-navy/20",
    green: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    red: "bg-red-50 text-red-700 border border-red-200",
  };
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[variant]}`}>
      {children}
    </span>
  );
}