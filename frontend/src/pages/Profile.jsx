import LoadingStatus from "../components/LoadingStatus";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import api from "../api";
import { setToken } from "../session";

export default function Profile() {
  const [account, setAccount] = useState(null);
  const [loadError, setLoadError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const navigate = useNavigate();
  useEffect(() => {
    let active = true;
    async function loadAccount() {
      try {
        const response = await api.get("/auth/me");
        if (active) setAccount(response.data);
      } catch {
        if (active)
          setLoadError(
            "Unable to load your account. Please refresh to try again.",
          );
      }
    }
    loadAccount();
    return () => {
      active = false;
    };
  }, []);
  async function changePassword(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const currentPassword = formData.get("currentPassword");
    const newPassword = formData.get("newPassword");
    const confirmPassword = formData.get("confirmPassword");
    setPasswordError("");
    setMessage("");
    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }
    setBusy(true);
    try {
      const { data } = await api.put("/auth/password", {
        currentPassword,
        newPassword,
      });
      setToken(data.token);
      setMessage("Password changed. Other sessions have been signed out.");
      form.reset();
    } catch (err) {
      setPasswordError(
        err.response?.data?.message ||
          "Unable to change password. Please try again.",
      );
    } finally {
      setBusy(false);
    }
  }
  async function deleteAccount(event) {
    event.preventDefault();
    const password = new FormData(event.currentTarget).get("password");
    setBusy(true);
    setDeleteError("");
    try {
      await api.delete("/auth/me", { data: { password } });
      setToken(null);
      navigate("/login?deleted=1", { replace: true });
    } catch (err) {
      setDeleteError(
        err.response?.data?.message ||
          "Unable to delete account. Please try again.",
      );
    } finally {
      setBusy(false);
    }
  }
  async function logout() {
    setBusy(true);
    setLoadError("");
    try {
      await api.post("/auth/logout");
      setToken(null);
      navigate("/login", { replace: true });
    } catch (err) {
      setLoadError(
        err.response?.data?.message ||
          "Unable to log out securely. Please try again.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="bg-slate-50 flex h-dvh min-h-0 flex-col overflow-hidden">
      <Header />
      <main className="mx-auto w-full min-h-0 flex-1 px-5 pt-3 md:px-6 md:pt-6 max-w-account overflow-y-auto overscroll-contain pb-6">
        <Link
          to="/todos"
          className="mb-5 inline-flex items-center gap-2 text-control text-muted"
        >
          <i className="bi bi-arrow-left" aria-hidden="true" /> Back to tasks
        </Link>
        <div className="mb-4 md:mb-7">
          <h1 className="mb-2">Account settings</h1>
        </div>
        {loadError && (
          <p role="alert" className="form-error">
            {loadError}
          </p>
        )}
        {!account && !loadError && <LoadingStatus />}
        {account && (
          <>
            <section className="rounded-md border border-line bg-surface shadow-sm p-5 md:p-7 mb-5 flex flex-wrap items-center gap-3 break-words">
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-md bg-blue-50 text-2xl text-primary">
                <i className="bi bi-person" aria-hidden="true" />
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="">{account.username}</h2>
                <p className="muted">{account.email}</p>
              </div>
              <button
                className="border border-line bg-surface text-muted hover:bg-blue-50 button ml-auto inline-flex shrink-0 items-center gap-2"
                disabled={busy}
                onClick={logout}
              >
                {busy ? (
                  <LoadingStatus />
                ) : (
                  <>
                    <i className="bi bi-box-arrow-right" aria-hidden="true" />{" "}
                    Log out
                  </>
                )}
              </button>
            </section>
            <section className="rounded-md border border-line bg-surface shadow-sm p-5 md:p-7 mb-5">
              <h2 className="mb-2">
                <i
                  className="bi bi-shield-lock mr-2 text-primary"
                  aria-hidden="true"
                />{" "}
                Change password
              </h2>
              <p className="muted">
                Choose a strong password you do not use elsewhere.
              </p>
              {message && (
                <p role="status" className="notice">
                  {message}
                </p>
              )}
              {passwordError && (
                <p role="alert" className="form-error">
                  {passwordError}
                </p>
              )}
              <form
                className="mt-4 flex flex-col gap-3"
                onSubmit={changePassword}
              >
                <label className="flex flex-col gap-1.5 text-control font-semibold text-content">
                  Current password
                  <input
                    className="input-field"
                    type="password"
                    name="currentPassword"
                    autoComplete="current-password"
                    required
                  />
                </label>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <label className="flex flex-col gap-1.5 text-control font-semibold text-content">
                    New password
                    <input
                      className="input-field"
                      type="password"
                      name="newPassword"
                      autoComplete="new-password"
                      minLength={8}
                      required
                    />
                  </label>
                  <label className="flex flex-col gap-1.5 text-control font-semibold text-content">
                    Confirm new password
                    <input
                      className="input-field"
                      type="password"
                      name="confirmPassword"
                      autoComplete="new-password"
                      minLength={8}
                      required
                    />
                  </label>
                </div>
                <p className="field-hint">
                  At least 8 characters, up to 72 bytes.
                </p>
                <button className="primary-button self-start" disabled={busy}>
                  {busy ? <LoadingStatus /> : "Update password"}
                </button>
              </form>
            </section>
            <section className="rounded-md border border-line bg-surface shadow-sm p-5 md:p-7 mb-5 border-rose-200">
              <h2 className="mb-2 text-rose-700">
                <i
                  className="bi bi-trash3 mr-2 text-rose-700"
                  aria-hidden="true"
                />{" "}
                Delete account
              </h2>
              <p className="muted">
                Permanently delete your account and all your tasks. This cannot
                be undone.
              </p>
              {!confirmDelete ? (
                <button
                  className="danger-button mt-4"
                  disabled={busy}
                  onClick={() => setConfirmDelete(true)}
                >
                  Delete my account
                </button>
              ) : (
                <form
                  className="mt-4 flex flex-col gap-3"
                  onSubmit={deleteAccount}
                >
                  <p className="text-control text-rose-700">
                    Confirm deletion by entering your current password.
                  </p>
                  <label className="flex flex-col gap-1.5 text-control font-semibold text-content">
                    Password
                    <input
                      className="input-field"
                      name="password"
                      type="password"
                      autoComplete="current-password"
                      required
                      autoFocus
                    />
                  </label>
                  {deleteError && (
                    <p role="alert" className="form-error">
                      {deleteError}
                    </p>
                  )}
                  <div className="flex flex-wrap items-center gap-2">
                    <button className="danger-button mt-0" disabled={busy}>
                      {busy ? <LoadingStatus /> : "Permanently delete account"}
                    </button>
                    <button
                      type="button"
                      className="secondary-button"
                      disabled={busy}
                      onClick={() => {
                        setConfirmDelete(false);
                        setDeleteError("");
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </section>
          </>
        )}
      </main>
    </div>
  );
}
