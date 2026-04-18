import { Link } from "react-router-dom";

const footerSections = [
  {
    title: "Product",
    links: [
      { label: "Overview", href: "/product" },
      { label: "Knowledge Academy", href: "/product/academy" },
      { label: "Trading Lab", href: "/product/trading-lab" },
      { label: "U2CHAT", href: "/product/u2chat" },
    ],
  },
  {
    title: "Project",
    links: [
      { label: "About", href: "/about" },
      { label: "Contact", href: "/contact" },
      { label: "Get Started", href: "/get-started" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "FAQ", href: "/faq" },
      { label: "Resources", href: "/resources" },
      { label: "Project Access", href: "/pricing" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy Policy", href: "/legal/privacy" },
      { label: "Terms of Service", href: "/legal/terms" },
      { label: "Disclaimer", href: "/legal/disclaimer" },
      { label: "Risk Disclosure", href: "/legal/risk-disclosure" },
      { label: "Cookie Policy", href: "/legal/cookies" },
      { label: "Accessibility", href: "/legal/accessibility" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="bg-navy text-white/80">
      <div className="border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-16 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h2 className="font-serif text-2xl text-white mb-2">Ready to explore the stock agent?</h2>
            <p className="text-white/60 text-sm">
              Learn with the Academy, practice in the Lab, and research with U2CHAT.
            </p>
          </div>
          <div className="flex gap-3">
            <Link
              to="/product"
              className="px-5 py-2.5 border border-white/20 rounded-lg text-sm hover:bg-white/10 transition-colors"
            >
              Explore Product
            </Link>
            <Link
              to="/app"
              className="px-5 py-2.5 bg-gold text-navy rounded-lg text-sm font-semibold hover:bg-gold/90 transition-colors"
            >
              Enter App
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-14">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-10">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <img src="/static/images/LOGO_final.png" alt="U2INVEST" className="h-8 w-auto object-contain" />
              <span className="font-semibold text-white text-sm">U2INVEST</span>
            </div>
            <p className="text-white/50 text-xs leading-relaxed mb-5">
              A three-pillar stock education and research project: structured learning,
              simulated trading, and a tool-using stock agent.
            </p>
            <div className="flex gap-3">
              <a
                href="mailto:hello@u2invest.com"
                className="text-white/50 hover:text-white/80 transition-colors text-xs"
              >
                hello@u2invest.com
              </a>
            </div>
          </div>

          {footerSections.map((section) => (
            <div key={section.title}>
              <h3 className="text-white text-xs font-semibold uppercase tracking-wider mb-4">
                {section.title}
              </h3>
              <ul className="space-y-2.5">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      to={link.href}
                      className="text-white/50 hover:text-white/80 text-xs transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-white/10 mt-12 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-white/30 text-xs">© {new Date().getFullYear()} U2INVEST. All rights reserved.</p>
          <p className="text-white/20 text-xs text-center md:text-right max-w-xl">
            U2INVEST is an educational platform. Market data may be delayed or simulated, and nothing on this project constitutes financial advice.
          </p>
        </div>
      </div>
    </footer>
  );
}
