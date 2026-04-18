import { useState } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { BookOpen, BarChart2, MessageSquare, Newspaper, Menu, X, ChevronLeft, LogOut } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/lib/AuthContext";

const navItems = [
  { href: "/app/academy", icon: BookOpen,     label: "Academy"     },
  { href: "/app/lab",     icon: BarChart2,    label: "Trading Lab" },
  { href: "/app/news",    icon: Newspaper,    label: "News"        },
  { href: "/app/chat",    icon: MessageSquare,label: "U2CHAT"      },
];

export default function AppShell() {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout } = useAuth();

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar — desktop */}
      <aside className="hidden md:flex flex-col w-52 bg-sidebar border-r border-sidebar-border flex-shrink-0">
        {/* Logo */}
        <div className="px-4 h-12 flex items-center border-b border-sidebar-border">
          <Link to="/" className="flex items-center gap-2 group">
            <img src="/static/images/LOGO_final.png" alt="U2INVEST" className="h-6 w-auto object-contain" />
            <span className="text-sidebar-foreground font-semibold text-sm tracking-tight">U2INVEST</span>
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2 py-3 space-y-0.5">
          {navItems.map((item) => {
            const active = location.pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                to={item.href}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                  active
                    ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                    : "text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/60"
                }`}
              >
                <item.icon className="w-4 h-4 flex-shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="px-2 py-3 border-t border-sidebar-border">
          {user?.email && (
            <div className="px-3 py-2 mb-2">
              <p className="text-[11px] uppercase tracking-wider text-sidebar-foreground/35 mb-1">Signed in</p>
              <p className="text-xs text-sidebar-foreground/70 truncate">{user.email}</p>
            </div>
          )}
          <button
            onClick={logout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-sidebar-foreground/40 hover:text-sidebar-foreground/70 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign out
          </button>
          <Link
            to="/"
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-sidebar-foreground/40 hover:text-sidebar-foreground/70 transition-colors"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            Back to site
          </Link>
        </div>
      </aside>

      {/* Mobile header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 h-12 bg-background border-b border-border px-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <img src="/static/images/LOGO_final.png" alt="U2INVEST" className="h-6 w-auto object-contain" />
          <span className="font-semibold text-sm text-foreground">U2INVEST</span>
        </Link>
        <button onClick={() => setMobileOpen(!mobileOpen)} className="p-1.5 hover:bg-muted rounded-lg transition-colors">
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile nav */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            className="md:hidden fixed top-12 left-0 right-0 z-40 bg-background border-b border-border p-3 space-y-0.5 shadow-lg"
          >
            {navItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-foreground hover:bg-muted transition-colors"
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </Link>
            ))}
            <button
              onClick={async () => {
                await logout();
                setMobileOpen(false);
              }}
              className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-foreground hover:bg-muted transition-colors w-full"
            >
              <LogOut className="w-4 h-4" />
              Sign out
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Page content */}
      <main className="flex-1 overflow-auto md:pt-0 pt-12 min-w-0">
        <Outlet />
      </main>
    </div>
  );
}
