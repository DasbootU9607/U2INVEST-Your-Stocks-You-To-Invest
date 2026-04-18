import { Toaster } from "@/components/ui/toaster";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClientInstance } from "@/lib/query-client";
import { BrowserRouter, HashRouter, Route, Routes } from "react-router-dom";
import PageNotFound from "./lib/PageNotFound";
import { AuthProvider } from "@/lib/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";

// Layouts
import PublicLayout from "./components/layout/PublicLayout";
import AppShell from "./components/layout/AppShell";

// Public pages
import Home from "./pages/Home";
import ProductOverview from "./pages/ProductOverview";
import ProductAcademy from "./pages/ProductAcademy";
import ProductTradingLab from "./pages/ProductTradingLab";
import ProductU2Chat from "./pages/ProductU2Chat";
import Pricing from "./pages/Pricing";
import About from "./pages/About";
import Contact from "./pages/Contact";
import FAQ from "./pages/FAQ";
import BookDemo from "./pages/BookDemo";
import GetStarted from "./pages/GetStarted";
import Resources from "./pages/Resources";
import SignIn from "./pages/SignIn";

// Legal pages
import Privacy from "./pages/legal/Privacy";
import Terms from "./pages/legal/Terms";
import Disclaimer from "./pages/legal/Disclaimer";
import RiskDisclosure from "./pages/legal/RiskDisclosure";
import Cookies from "./pages/legal/Cookies";
import Accessibility from "./pages/legal/Accessibility";

// App pages
import AppHome from "./pages/app/AppHome";
import Academy from "./pages/app/Academy";
import TradingLab from "./pages/app/TradingLab";
import Chat from "./pages/app/Chat";
import News from "./pages/app/News";

function App() {
  const Router = typeof window !== "undefined" && window.location.hostname.endsWith("github.io")
    ? HashRouter
    : BrowserRouter;

  return (
    <QueryClientProvider client={queryClientInstance}>
      <AuthProvider>
        <Router>
          <Routes>
            <Route element={<PublicLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/product" element={<ProductOverview />} />
              <Route path="/product/academy" element={<ProductAcademy />} />
              <Route path="/product/trading-lab" element={<ProductTradingLab />} />
              <Route path="/product/u2chat" element={<ProductU2Chat />} />
              <Route path="/pricing" element={<Pricing />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/faq" element={<FAQ />} />
              <Route path="/book-demo" element={<BookDemo />} />
              <Route path="/get-started" element={<GetStarted />} />
              <Route path="/resources" element={<Resources />} />
              <Route path="/legal/privacy" element={<Privacy />} />
              <Route path="/legal/terms" element={<Terms />} />
              <Route path="/legal/disclaimer" element={<Disclaimer />} />
              <Route path="/legal/risk-disclosure" element={<RiskDisclosure />} />
              <Route path="/legal/cookies" element={<Cookies />} />
              <Route path="/legal/accessibility" element={<Accessibility />} />
            </Route>

            <Route path="/signin" element={<SignIn />} />

            <Route element={<ProtectedRoute />}>
              <Route path="/app" element={<AppShell />}>
                <Route index element={<AppHome />} />
                <Route path="academy" element={<Academy />} />
                <Route path="lab" element={<TradingLab />} />
                <Route path="news" element={<News />} />
                <Route path="chat" element={<Chat />} />
              </Route>
            </Route>

            <Route path="*" element={<PageNotFound />} />
          </Routes>
        </Router>
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
