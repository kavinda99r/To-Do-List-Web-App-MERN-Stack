import { Link, useLocation } from "react-router-dom";
import { useSessionToken } from "../session";

export default function Header() {
  const { pathname } = useLocation();
  const signedIn = Boolean(useSessionToken());
  const showProfile = signedIn && pathname === "/todos";
  let headerClass =
    "mx-auto my-0 flex w-full shrink-0 items-center justify-between px-5 py-4 md:py-6";
  if (["/", "/login", "/signup", "/todos"].includes(pathname)) {
    headerClass += " max-w-workspace md:px-6";
  } else {
    headerClass += " max-w-7xl md:px-12";
  }
  return (
    <header className={headerClass}>
      <Link
        className="inline-flex items-center gap-1 font-sans tracking-tight text-2xl font-extrabold text-content"
        to={signedIn ? "/todos" : "/"}
      >
        <img
          className="mr-2 h-9 w-9 rounded-md bg-primary"
          src="/taskmate-icon.png"
          alt=""
          width="36"
          height="36"
        />
        Task
        <span className={pathname === "/" ? "text-indigo-300" : "text-primary"}>
          Mate
        </span>
      </Link>
      {(showProfile || !signedIn) && (
        <nav aria-label="Main navigation">
          {showProfile ? (
            <Link
              className="grid h-11 w-11 place-items-center rounded-full border border-line bg-surface text-2xl text-primary hover:bg-blue-50"
              to="/profile"
              aria-label="Your account"
            >
              <i className="bi bi-person" aria-hidden="true" />
            </Link>
          ) : (
            <Link className="font-semibold text-content" to="/login">
              Log in
            </Link>
          )}
        </nav>
      )}
    </header>
  );
}
