export function Logo({ className }: { className?: string }) {
  return (
    <img
      src="/nextopsai-logo-1.png"
      alt="NextOps AI"
      className={className ?? "h-9 w-auto"}
      loading="eager"
      decoding="async"
    />
  );
}
