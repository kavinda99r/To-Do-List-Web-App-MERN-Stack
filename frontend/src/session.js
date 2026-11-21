import { useEffect, useState } from "react";

// Keep token storage in one place so login and logout update every page.
export function getToken() {
  return localStorage.getItem("token");
}

export function setToken(token) {
  if (token) {
    localStorage.setItem("token", token);
  } else {
    localStorage.removeItem("token");
  }
  // This event updates the current tab. The storage event updates other tabs.
  window.dispatchEvent(new Event("session-change"));
}

export function useSessionToken() {
  const [token, updateToken] = useState(getToken);

  useEffect(() => {
    function readStoredToken() {
      updateToken(getToken());
    }

    window.addEventListener("session-change", readStoredToken);
    window.addEventListener("storage", readStoredToken);
    readStoredToken();

    return () => {
      window.removeEventListener("session-change", readStoredToken);
      window.removeEventListener("storage", readStoredToken);
    };
  }, []);

  return token;
}
