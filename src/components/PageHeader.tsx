type PageHeaderProps = {
  eyebrow: string;
  title: string;
  description: string;
};

export function PageHeader({ eyebrow, title, description }: PageHeaderProps) {
  return (
    <div className="mb-6 max-w-3xl">
      <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-gold sm:text-xs sm:tracking-[0.22em]">{eyebrow}</p>
      <h1 className="text-3xl font-bold tracking-normal text-sea sm:text-5xl">{title}</h1>
      <p className="mt-3 text-sm leading-6 text-graphite/75 sm:text-base sm:leading-7">{description}</p>
    </div>
  );
}
