export function Spinner({ size = 24 }: { size?: number }) {
  return (
    <div
      className="rounded-full border-2 border-border border-t-brand animate-spin"
      style={{ width: size, height: size }}
    />
  );
}

export function FullScreenLoader() {
  return (
    <div className="h-screen w-screen flex items-center justify-center bg-bg">
      <Spinner size={40} />
    </div>
  );
}