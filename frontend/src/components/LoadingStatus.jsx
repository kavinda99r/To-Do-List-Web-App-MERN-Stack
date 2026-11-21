export default function LoadingStatus() {
  return (
    <span
      className="flex-wrap items-center gap-2 inline-flex justify-center"
      role="status"
    >
      Please wait...{" "}
      <i
        className="bi bi-arrow-repeat inline-block animate-loading-spin motion-reduce:animate-none"
        aria-hidden="true"
      />
    </span>
  );
}
