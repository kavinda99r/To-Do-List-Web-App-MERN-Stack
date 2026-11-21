import { Link } from "react-router-dom";
import Header from "../components/Header";
import { useSessionToken } from "../session";

export default function Home() {
  const token = useSessionToken();
  const destination = token ? "/todos" : "/login";

  return (
    <div className="[--color-text:#e4e4e7] [--color-muted:#a1a1aa] [--color-border:rgba(255,255,255,.15)] flex min-h-dvh flex-col bg-black bg-home bg-cover bg-center text-content md:h-svh md:min-h-[580px]">
      <Header />
      <main className="mx-auto flex w-full max-w-workspace flex-1 flex-col px-5 pb-3 md:px-6 md:pt-3">
        <figure className="m-0 shrink-0 overflow-hidden rounded-md border border-line bg-black">
          <img
            src="/workspace-banner.png"
            alt="A sunlit desk with a notebook and a plant, ready for a fresh start."
            className="h-[90px] w-full object-cover object-[center_65%] md:h-[clamp(110px,20svh,180px)]"
            width="2172"
            height="724"
            fetchPriority="high"
          />
        </figure>
        <section
          className="flex flex-none items-center justify-center py-5 text-center md:py-6"
          aria-labelledby="home-title"
        >
          <div className="w-full max-w-[820px] [--heading-size:2.5rem] sm:[--heading-size:3rem] md:[--heading-size:3.75rem] lg:[--heading-size:4.5rem]">
            <p className="eyebrow text-xs text-indigo-200 md:text-control">
              <span className="mr-2 inline-block h-1.5 w-1.5 rounded-full bg-indigo-300" />{" "}
              A little clarity, every day
            </p>
            <h1 className="leading-[1.08] text-white" id="home-title">
              Less on your mind.
              <br />
              <em className="not-italic text-indigo-300">More in your day.</em>
            </h1>
            <p className="mx-auto mt-4 max-w-[720px] text-body md:text-lg lg:text-xl">
              Give your everyday plans a place to land. Collect your tasks, find
              your focus, and enjoy getting things done.
            </p>
            <div className="mt-5 flex justify-center">
              <Link to={destination} className="primary-button px-10 py-3 text-lg font-medium my-4">
                Get Started
              </Link>
            </div>
            <p className="mt-3 text-control text-muted">
              Simple tools. A little more headspace.
            </p>
          </div>
        </section>
        <section
          className="border-t border-line pt-4"
          aria-label="TaskMate features"
        >
          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-3 md:gap-x-8">
            <article className="flex items-center justify-center gap-2">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-control bg-white/10 text-indigo-200">
                <i className="bi bi-pencil-square" aria-hidden="true" />
              </span>
              <h3 className="text-control font-semibold md:text-body">
                Capture it in a moment
              </h3>
            </article>
            <article className="flex items-center justify-center gap-2">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-control bg-white/10 text-indigo-200">
                <i className="bi bi-check2-circle" aria-hidden="true" />
              </span>
              <h3 className="text-control font-semibold md:text-body">
                See your progress
              </h3>
            </article>
            <article className="flex items-center justify-center gap-2">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-control bg-white/10 text-indigo-200">
                <i className="bi bi-shield-lock" aria-hidden="true" />
              </span>
              <h3 className="text-control font-semibold md:text-body">
                A space of your own
              </h3>
            </article>
          </div>
        </section>
      </main>
      <footer className="mx-auto flex w-full max-w-[920px] shrink-0 flex-wrap items-center justify-between gap-2 px-5 pb-4 pt-2 text-xs text-[#8190a6] md:px-6 text-muted">
        <p>&copy; {new Date().getFullYear()} TaskMate</p>
        <p>One task at a time.</p>
      </footer>
    </div>
  );
}
