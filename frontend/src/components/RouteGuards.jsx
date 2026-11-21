import LoadingStatus from "./LoadingStatus";
import { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import api from "../api";
import { useSessionToken } from "../session";

export function ProtectedRoute() {
  const token = useSessionToken();
  const { pathname } = useLocation();
  const [verification, setVerification] = useState(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!token) return;
    let active = true;
    let requestInProgress = false;
    let sessionWasVerified = false;
    const controller = new AbortController();
    async function verify() {
      if (requestInProgress) return;
      requestInProgress = true;
      try {
        await api.get("/auth/me", {
          signal: controller.signal,
          timeout: 10000,
        });
        if (active) {
          sessionWasVerified = true;
          setVerification({ token, pathname, allowed: true });
        }
      } catch (error) {
        // A temporary connection failure must not reset an already verified page.
        // Real 401 responses are handled by the API interceptor and sign the user out.
        if (active && !sessionWasVerified && error.code !== "ERR_CANCELED") {
          setVerification({ token, pathname, allowed: false });
        }
      } finally {
        requestInProgress = false;
      }
    }
    verify();
    // Revalidate silently so switching windows does not unmount forms or task edits.
    const recheck = () => {
      verify();
    };
    window.addEventListener("focus", recheck);
    window.addEventListener("pageshow", recheck);
    // Recheck when the tab returns, and every minute while it stays open.
    const interval = window.setInterval(verify, 60000);
    return () => {
      active = false;
      controller.abort();
      window.clearInterval(interval);
      window.removeEventListener("focus", recheck);
      window.removeEventListener("pageshow", recheck);
    };
  }, [token, pathname, attempt]);

  if (!token) return <Navigate to="/login" replace />;
  // Never reuse verification from an old token or a different private page.
  const isCurrentSession =
    verification?.token === token && verification?.pathname === pathname;
  if (!isCurrentSession)
    return (
      <main className="mx-auto w-full min-h-0 flex-1 px-5 pt-3 md:px-6 md:pt-6 max-w-account overflow-y-auto overscroll-contain pb-6">
        <LoadingStatus />
      </main>
    );
  if (!verification.allowed)
    return (
      <main className="mx-auto w-full min-h-0 flex-1 px-5 pt-3 md:px-6 md:pt-6 max-w-account overflow-y-auto overscroll-contain pb-6">
        <p role="alert">Unable to verify your session. Please try again.</p>
        <button
          className="primary-button"
          onClick={() => {
            setVerification(null);
            setAttempt((value) => value + 1);
          }}
        >
          Try again
        </button>
      </main>
    );
  return <Outlet />;
}

export function GuestRoute() {
  const token = useSessionToken();
  return token ? <Navigate to="/todos" replace /> : <Outlet />;
}
