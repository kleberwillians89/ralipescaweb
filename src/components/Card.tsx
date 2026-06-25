type CardProps = {
  children: React.ReactNode;
  className?: string;
};

export function Card({ children, className = '' }: CardProps) {
  return <section className={`w-full rounded-[22px] border border-sand/45 bg-white p-4 shadow-soft sm:rounded-[30px] sm:p-5 ${className}`}>{children}</section>;
}
