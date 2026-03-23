export default function TitleScreen() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-8">
      <h1 className="text-4xl font-bold tracking-tight">LifePath</h1>
      <p className="max-w-md text-center text-lg text-zinc-600 dark:text-zinc-400">
        Live an entire human life. Make choices that ripple across generations.
      </p>
      <div className="flex flex-col gap-3">
        <button className="rounded-full bg-foreground px-8 py-3 text-background transition-colors hover:bg-foreground/80">
          New Life
        </button>
        <button className="rounded-full border border-foreground/20 px-8 py-3 transition-colors hover:bg-foreground/5">
          Continue
        </button>
        <button className="rounded-full border border-foreground/20 px-8 py-3 transition-colors hover:bg-foreground/5">
          Settings
        </button>
      </div>
    </main>
  );
}
