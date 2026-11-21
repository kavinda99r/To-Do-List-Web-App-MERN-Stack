import LoadingStatus from "../components/LoadingStatus";
import Header from "../components/Header";
import { useState } from "react";
import {
  Link,
  useNavigate,
  useSearchParams,
  useLocation,
} from "react-router-dom";
import api from "../api";
import { setToken } from "../session";

export default function Auth() {
  const mode = useLocation().pathname === "/signup" ? "signup" : "login";
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const signup = mode === "signup";
  async function submit(event) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const values = {
      email: formData.get("email"),
      password: formData.get("password"),
    };
    if (signup) values.username = formData.get("username");
    setBusy(true);
    setError("");
    try {
      const { data } = await api.post(`/auth/${mode}`, values);
      setToken(data.token);
      navigate("/todos", { replace: true });
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to connect. Please try again.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <main className="flex flex-col items-center px-5 pb-12 pt-7 md:px-6">
        <div className="mb-4 md:mb-7 text-center">
          <p className="eyebrow mb-2">Your day, with a little more clarity</p>
          <h1>
            {signup ? "Make space for progress." : "Good to have you here."}
          </h1>
        </div>
        <section
          className="rounded-md border border-line bg-surface shadow-sm p-5 md:p-7 w-full max-w-auth"
          aria-labelledby="auth-title"
        >
          <h2 className="mb-2" id="auth-title">
            {signup ? "A little more organized." : "Welcome back."}
          </h2>
          <p className="muted">
            {signup
              ? "Create your account and make room for what matters."
              : "Your tasks, your pace. Pick up where you left off."}
          </p>
          {params.has("expired") && (
            <p role="status" className="notice">
              Your session expired. Please log in again.
            </p>
          )}
          {params.has("deleted") && (
            <p role="status" className="notice">
              Your account and tasks have been deleted.
            </p>
          )}
          {error && (
            <p role="alert" className="form-error">
              {error}
            </p>
          )}
          <form
            onSubmit={submit}
            key={mode}
            className="mt-4 flex flex-col gap-3"
          >
            {signup && (
              <label className="flex flex-col gap-1.5 text-control font-semibold text-content">
                Your name
                <input
                  className="input-field"
                  name="username"
                  autoComplete="name"
                  placeholder="Alex Morgan"
                  required
                  maxLength={80}
                />
              </label>
            )}
            <label className="flex flex-col gap-1.5 text-control font-semibold text-content">
              Email address
              <input
                className="input-field"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                required
              />
            </label>
            <label className="flex flex-col gap-1.5 text-control font-semibold text-content">
              Password
              <span className="relative">
                <input
                  className="input-field pr-11"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete={signup ? "new-password" : "current-password"}
                  placeholder={
                    signup ? "Create a password" : "Enter your password"
                  }
                  required
                  minLength={signup ? 8 : undefined}
                />
                <button
                  type="button"
                  className="absolute bottom-1 right-1 top-1 w-8 rounded-control text-muted"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <i
                    className={`bi bi-${showPassword ? "eye-slash" : "eye"}`}
                    aria-hidden="true"
                  />
                </button>
              </span>
            </label>
            {signup && <p className="field-hint">Use at least 8 characters.</p>}
            <button className="primary-button" disabled={busy} aria-busy={busy}>
              {busy ? <LoadingStatus /> : signup ? "Create account" : "Log in"}
            </button>
          </form>
          <p className="text-control leading-7 mt-5 text-center">
            {signup ? "Already have an account? " : "New to TaskMate? "}
            <Link
              className="font-semibold text-primary"
              to={signup ? "/login" : "/signup"}
            >
              {signup ? "Log in" : "Create an account"}
            </Link>
          </p>
          <p className="text-xs mt-6 border-t border-line pt-6 text-center">
            <i className="bi bi-lock" aria-hidden="true" /> A private space for
            your everyday plans.
          </p>
        </section>
      </main>
    </div>
  );
}
