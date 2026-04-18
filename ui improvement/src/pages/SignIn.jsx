import { Link, Navigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import GoogleSignInButton from "@/components/GoogleSignInButton";
import { useAuth } from "@/lib/AuthContext";

export default function SignIn() {
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/app";
  const { isAuthenticated, user } = useAuth();

  if (isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6 py-20">
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-card border border-border rounded-3xl p-8 shadow-sm"
      >
        <Link to="/" className="flex items-center gap-3 mb-8">
          <img src="/static/images/LOGO_final.png" alt="U2INVEST" className="h-9 w-auto object-contain" />
          <span className="font-semibold text-foreground tracking-tight">U2INVEST</span>
        </Link>

        <div className="space-y-3 mb-8">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">Sign In</p>
          <h1 className="font-serif text-4xl text-foreground">Continue with Google.</h1>
          <p className="text-sm text-muted-foreground">
            Use your Google account to access the app experience and keep your agent session tied to a real identity.
          </p>
        </div>

        <GoogleSignInButton />

        {user?.email && (
          <p className="text-xs text-muted-foreground text-center mt-4">{user.email}</p>
        )}

        <p className="text-xs text-muted-foreground text-center mt-6">
          By signing in you agree to the policies linked on this site.
        </p>
      </motion.div>
    </div>
  );
}
