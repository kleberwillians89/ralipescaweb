import { Calculator, Fish, Home, ListChecks, LogOut, Scale, Settings, Trophy, UserRound, Users } from 'lucide-react';
import { BrandFooter } from './BrandFooter';
import type { NavItem, PageKey } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { getAllowedPages } from '../services/permissions';

const navItems: NavItem[] = [
  { key: 'home', label: 'Início', icon: Home },
  { key: 'calculator', label: 'Calculadora', icon: Calculator },
  { key: 'species', label: 'Espécies', icon: Fish },
  { key: 'ranking', label: 'Ranking', icon: Trophy },
  { key: 'rules', label: 'Regulamento', icon: ListChecks },
  { key: 'profile', label: 'Perfil', icon: UserRound },
  { key: 'team', label: 'Equipes', icon: Users },
  { key: 'weighing', label: 'Pesagem', icon: Scale },
  { key: 'settings', label: 'Ajustes', icon: Settings },
];

const mobileNavKeys: PageKey[] = ['home', 'calculator', 'ranking', 'profile'];

type ShellProps = {
  activePage: PageKey;
  onNavigate: (page: PageKey) => void;
  children: React.ReactNode;
};

export function Shell({ activePage, onNavigate, children }: ShellProps) {
  const { profile, signOut } = useAuth();
  const allowedPages = getAllowedPages(profile?.role);
  const visibleNavItems = navItems.filter((item) => allowedPages.includes(item.key));
  const displayName = profile?.full_name || 'Participante';
  const initials = displayName
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="min-h-screen overflow-x-hidden bg-white text-graphite">
      <header className="app-header">
        <div className="mx-auto flex min-h-[64px] max-w-6xl items-center justify-between gap-3 px-4 py-2 sm:min-h-[72px] sm:px-6 sm:py-3">
          <button className="flex min-h-11 min-w-0 flex-1 items-center gap-3 text-left" onClick={() => onNavigate('home')} type="button">
            <img alt="Santo Circuito" className="h-11 w-11 shrink-0 rounded-2xl object-contain shadow-soft sm:h-12 sm:w-12" src="/logo-santo-circuito.png" />
            <span className="min-w-0">
              <span className="block truncate text-sm font-bold leading-tight text-sea sm:text-base">Rali de Pesca Solidária</span>
              <span className="block text-xs text-graphite/65">Noronha 2026</span>
            </span>
          </button>

          <nav className="hidden items-center gap-1 rounded-full border border-sand/55 bg-white p-1 shadow-soft lg:flex">
            {visibleNavItems.map((item) => {
              const Icon = item.icon;
              const active = activePage === item.key;
              return (
                <button
                  className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${
                    active ? 'bg-sea text-white' : 'text-graphite/70 hover:bg-sand/40 hover:text-sea'
                  }`}
                  key={item.key}
                  onClick={() => onNavigate(item.key)}
                  type="button"
                >
                  <Icon size={17} strokeWidth={1.8} />
                  {item.label}
                </button>
              );
            })}
          </nav>

          <div className="flex min-w-0 items-center gap-2 sm:gap-3">
            <div className="min-w-0 max-w-[96px] text-right sm:block sm:max-w-[170px]">
              <p className="truncate text-xs font-bold text-graphite sm:text-sm">{displayName}</p>
              <p className="text-xs capitalize text-graphite/60">{profile?.role ?? 'participant'}</p>
            </div>
            <button className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-sea text-sm font-bold text-white shadow-soft" onClick={() => onNavigate('profile')} type="button">
              {initials}
            </button>
            <button aria-label="Sair" className="hidden h-10 w-10 place-items-center rounded-full border border-sand text-sea transition hover:border-gold sm:grid" onClick={() => void signOut()} type="button">
              <LogOut size={18} strokeWidth={1.8} />
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 pb-32 pt-5 sm:px-6 lg:pb-8">{children}</main>
      <BrandFooter />

      <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-sand/55 bg-white/94 px-3 pt-2 backdrop-blur-xl lg:hidden" style={{ paddingBottom: 'calc(0.5rem + env(safe-area-inset-bottom))' }}>
        <div className="mx-auto grid max-w-md grid-cols-4 gap-1">
          {visibleNavItems.filter((item) => mobileNavKeys.includes(item.key)).map((item) => {
            const Icon = item.icon;
            const active = activePage === item.key;
            return (
              <button
                className={`flex min-h-14 flex-col items-center justify-center gap-1 rounded-2xl px-1 text-[11px] font-semibold transition ${
                  active ? 'bg-sea text-white' : 'text-graphite/70'
                }`}
                key={item.key}
                onClick={() => onNavigate(item.key)}
                type="button"
              >
                <Icon size={19} strokeWidth={1.8} />
                {item.label}
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
