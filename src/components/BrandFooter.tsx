export function BrandFooter() {
  return (
    <footer className="mx-auto mt-10 flex max-w-6xl flex-col items-center gap-3 border-t border-sand/45 px-4 pb-32 pt-8 text-center sm:px-6 lg:pb-8">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-graphite/60">Realização</p>
      <div className="flex items-center justify-center gap-5">
        <img alt="Santo Circuito" className="h-12 w-12 rounded-2xl object-contain" src="/logo-santo-circuito.png" />
        <span className="h-8 w-px bg-sand" />
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-graphite/65">Powered by</span>
          <img alt="Mugô" className="h-8 w-8 rounded-xl object-contain" src="/logo-mugo.png" />
        </div>
      </div>
    </footer>
  );
}
