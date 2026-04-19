import { Outlet, useLocation } from "react-router-dom";
import PublicNav from "./PublicNav";
import Footer from "./Footer";

export default function PublicLayout() {
  const location = useLocation();
  const hideFooter = location.pathname === "/contact";

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <PublicNav />
      <main className="flex-1">
        <Outlet />
      </main>
      {!hideFooter ? <Footer /> : null}
    </div>
  );
}
