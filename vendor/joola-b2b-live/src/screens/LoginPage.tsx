import { useState, type FormEvent } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { MockApiError } from "../api/mock";
import { useStore } from "../state/Store";
import { Button, ErrorState, Input } from "../components/ui/primitives";
import { publicAsset } from "../lib/publicAsset";

export function LoginPage() {
  const { session, login } = useStore();
  const navigate = useNavigate();
  const [email, setEmail] = useState("maya.okonkwo@dicks.com");
  const [password, setPassword] = useState("wholesale");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<MockApiError | null>(null);

  if (session) {
    return (
      <Navigate
        to={session.role === "admin" ? "/admin/approvals" : "/quick-order"}
        replace
      />
    );
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const asAdmin = email.toLowerCase().includes("admin");
      await login(email, asAdmin);
      const next = asAdmin ? "/admin/approvals" : "/quick-order";
      const qs = window.location.search;
      navigate(`${next}${qs}`, { replace: true });
    } catch (err) {
      setError(
        err instanceof MockApiError
          ? err
          : new MockApiError("Sign-in failed.", "server"),
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="app login-page">
      <form className="login-page__card" onSubmit={onSubmit}>
        <img
          className="login-page__brand"
          src={publicAsset("joola-logo.png")}
          alt="JOOLA"
        />
        <h1>Wholesale sign in</h1>
        <p className="login-page__lede">
          Order paddles, balls, and bags for your distributor account.
        </p>

        {error ? (
          <ErrorState
            title="Could not sign in"
            message={error.message}
            fix={error.fix}
            onRetry={() => setError(null)}
          />
        ) : null}

        <div className="login-page__field">
          <label htmlFor="login-email">Email</label>
          <Input
            id="login-email"
            type="email"
            autoComplete="username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="login-page__field">
          <label htmlFor="login-password">Password</label>
          <Input
            id="login-password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <div className="login-page__links">
          <a href="#forgot">Forgot password?</a>
          <a href="mailto:wholesale@joola.com">Contact support</a>
        </div>

        <Button type="submit" variant="primary" disabled={busy} style={{ width: "100%" }}>
          {busy ? "Signing in…" : "Sign in"}
        </Button>

        <p className="login-page__tip">
          Tip: use <Link to="/login">admin@joola.com</Link> (any password) to open
          the admin approvals view.
        </p>
      </form>
    </div>
  );
}

export default LoginPage;
