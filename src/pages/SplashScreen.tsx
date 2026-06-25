export function SplashScreen() {
  return (
    <div className="relative grid min-h-screen place-items-center overflow-hidden bg-sea px-6 text-center text-white">
      <img alt="" className="absolute inset-0 h-full w-full object-cover opacity-15" src="/sao-pedro.jpg" />
      <div className="absolute inset-0 bg-sea/75" />
      <div className="relative animate-fade-in-up">
        <img alt="Santo Circuito" className="mx-auto h-32 w-32 rounded-[34px] object-contain shadow-premium sm:h-40 sm:w-40" src="/logo-santo-circuito.png" />
        <p className="mt-8 text-sm font-semibold uppercase tracking-[0.24em] text-sand">Noronha 2026</p>
        <h1 className="mt-3 text-4xl font-bold leading-tight sm:text-5xl">Rali de Pesca Solidária</h1>
        <p className="mx-auto mt-4 max-w-sm text-base font-medium leading-7 text-white/88">Uma Jornada de Fé, Estratégia e Partilha</p>
      </div>
    </div>
  );
}
