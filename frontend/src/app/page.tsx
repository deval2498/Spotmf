export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-primary text-primary-foreground">
      <h1 className="text-4xl font-bold">✅ Tailwind is Working!</h1>
      <p className="text-lg mt-4 text-muted-foreground">
        If you see colored background + styled text, Tailwind is active.
      </p>
      <button className="btn-primary mt-6">Click Me</button>
    </main>
  );
}
