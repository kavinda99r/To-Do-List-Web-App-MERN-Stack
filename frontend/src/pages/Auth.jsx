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
    <div className="flex h-dvh min-h-0 flex-col overflow-hidden bg-slate-50">
      <Header />
      <main className="flex min-h-0 flex-1 items-start justify-center overflow-hidden px-5 pt-6 pb-4 sm:pt-10 lg:pt-12 md:px-6">
        <section
          className="flex max-h-full min-h-0 w-full max-w-auth flex-col overflow-hidden rounded-md border border-line bg-surface shadow-sm"
          aria-labelledby="auth-title"
        >
          <div className="min-h-0 shrink-0 p-4 sm:p-5 md:p-6">
            <h1
              className="text-center text-2xl leading-tight md:text-3xl mb-2"
              id="auth-title"
            >
              {signup ? "SIGN UP" : "LOGIN"}
            </h1>
            <p className="muted text-center leading-snug mb-6 max-w-[250px] mx-auto">
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
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <i
                      className={`bi bi-${showPassword ? "eye-slash" : "eye"}`}
                      aria-hidden="true"
                    />
                  </button>
                </span>
              </label>
              {signup && (
                <p className="field-hint">Use at least 8 characters.</p>
              )}
              <button
                className="primary-button py-2 text-base mt-4"
                disabled={busy}
                aria-busy={busy}
              >
                {busy ? (
                  <LoadingStatus />
                ) : signup ? (
                  "Create account"
                ) : (
                  "Log in"
                )}
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
          </div>
        </section>
      </main>
    </div>
  );
}
