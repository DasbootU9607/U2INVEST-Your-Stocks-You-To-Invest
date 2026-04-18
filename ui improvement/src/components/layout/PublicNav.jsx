import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ChevronDown } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";

const navLinks = [
  {
    label: "Product",
    href: "/product",
    children: [
      { label: "Overview", href: "/product" },
      { label: "Knowledge Academy", href: "/product/academy" },
      { label: "Trading Lab", href: "/product/trading-lab" },
      { label: "U2CHAT", href: "/product/u2chat" },
    ],
  },
  { label: "About", href: "/about" },
  { label: "FAQ", href: "/faq" },
  { label: "Contact", href: "/contact" },
];

export default function PublicNav() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [productOpen, setProductOpen] = useState(false);
  const location = useLocation();
  const { isAuthenticated, user, logout } = useAuth();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setProductOpen(false);
  }, [location]);

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-white/95 backdrop-blur-md border-b border-border shadow-sm"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <img src="/static/images/LOGO_final.png" alt="U2INVEST" className="h-8 w-auto object-contain" />
            <span className="font-semibold text-foreground tracking-tight text-sm">U2INVEST</span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) =>
              link.children ? (
                <div key={link.label} className="relative">
                  <button
                    onMouseEnter={() => setProductOpen(true)}
                    onMouseLeave={() => setProductOpen(false)}
                    className="flex items-center gap-1 px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors rounded-md"
                  >
                    {link.label}
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>
                  <AnimatePresence>
                    {productOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 8 }}
                        transition={{ duration: 0.15 }}
                        onMouseEnter={() => setProductOpen(true)}
                        onMouseLeave={() => setProductOpen(false)}
                        className="absolute top-full left-0 pt-2"
                      >
                        <div className="bg-white border border-border rounded-xl shadow-lg p-2 min-w-[220px]">
                          {link.children.map((child) => (
                            <Link
                              key={child.href}
                              to={child.href}
                              className="block px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
                            >
                              {child.label}
                            </Link>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <Link
                  key={link.href}
                  to={link.href}
                  className="px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors rounded-md"
                >
                  {link.label}
                </Link>
              )
            )}
          </div>

          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <span className="text-sm text-muted-foreground px-3 py-2">
                  {user?.name || user?.email || "Signed in"}
                </span>
                <button
                  onClick={logout}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors px-3 py-2"
                >
                  Sign Out
                </button>
                <Link
                  to="/app"
                  className="text-sm px-4 py-2 bg-navy text-white rounded-lg hover:bg-navy/90 transition-colors font-medium"
                >
                  Enter App
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/signin"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors px-3 py-2"
                >
                  Sign In
                </Link>
                <Link
                  to="/app"
                  className="text-sm px-4 py-2 bg-navy text-white rounded-lg hover:bg-navy/90 transition-colors font-medium"
                >
                  Enter App
                </Link>
              </>
            )}
          </div>

          <button
            onClick={() => setMobileOpen((prev) => !prev)}
            className="md:hidden p-2 rounded-lg hover:bg-muted transition-colors"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed top-16 left-0 right-0 z-40 bg-white border-b border-border shadow-lg md:hidden"
          >
            <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col gap-1">
              {navLinks.map((link) =>
                link.children ? (
                  <div key={link.label}>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-2 py-1 mt-2">
                      {link.label}
                    </p>
                    {link.children.map((child) => (
                      <Link
                        key={child.href}
                        to={child.href}
                        className="block px-2 py-2 text-sm text-foreground hover:bg-muted rounded-lg transition-colors"
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                ) : (
                  <Link
                    key={link.href}
                    to={link.href}
                    className="px-2 py-2 text-sm text-foreground hover:bg-muted rounded-lg transition-colors"
                  >
                    {link.label}
                  </Link>
                )
              )}
              <div className="border-t border-border mt-3 pt-3 flex flex-col gap-2">
                {isAuthenticated ? (
                  <>
                    <div className="text-center text-xs text-muted-foreground px-4 py-1">
                      {user?.name || user?.email || "Signed in"}
                    </div>
                    <button
                      onClick={async () => {
                        await logout();
                        setMobileOpen(false);
                      }}
                      className="text-center text-sm px-4 py-2.5 border border-border rounded-lg hover:bg-muted transition-colors"
                    >
                      Sign Out
                    </button>
                    <Link
                      to="/app"
                      className="text-center text-sm px-4 py-2.5 bg-navy text-white rounded-lg font-medium"
                    >
                      Enter App
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      to="/signin"
                      className="text-center text-sm px-4 py-2.5 border border-border rounded-lg hover:bg-muted transition-colors"
                    >
                      Sign In
                    </Link>
                    <Link
                      to="/app"
                      className="text-center text-sm px-4 py-2.5 bg-navy text-white rounded-lg font-medium"
                    >
                      Enter App
                    </Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
