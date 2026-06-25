import { LogOut, Mail, Shield, UserRound } from 'lucide-react';
import { Card } from '../components/Card';
import { PageHeader } from '../components/PageHeader';
import { useAuth } from '../contexts/AuthContext';

export function ProfilePage() {
  const { profile, signOut, user } = useAuth();
  const displayName = profile?.full_name || 'Participante';
  const initials = displayName
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div>
      <PageHeader eyebrow="Conta" title="Perfil" description="Dados do participante, função no evento e acesso da conta." />

      <div className="grid gap-4 lg:grid-cols-[340px_minmax(0,1fr)]">
        <Card className="text-center">
          <div className="mx-auto grid h-24 w-24 place-items-center rounded-full bg-sea text-3xl font-bold text-white shadow-soft">
            {initials}
          </div>
          <h2 className="mt-4 truncate text-2xl font-bold text-sea">{displayName}</h2>
          <p className="mt-1 text-sm capitalize text-graphite/65">{profile?.role ?? 'participant'}</p>
        </Card>

        <div className="grid gap-4">
          <Card>
            <div className="flex min-w-0 items-center gap-3">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-sand/60 text-sea">
                <Mail size={20} strokeWidth={1.8} />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-graphite/60">E-mail</p>
                <p className="truncate text-base font-bold text-graphite">{profile?.email ?? user?.email ?? 'demo@rali.local'}</p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex min-w-0 items-center gap-3">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-sand/60 text-sea">
                <Shield size={20} strokeWidth={1.8} />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-graphite/60">Permissão</p>
                <p className="truncate text-base font-bold capitalize text-graphite">{profile?.role ?? 'participant'}</p>
              </div>
            </div>
          </Card>

          <div className="grid gap-3 sm:grid-cols-2">
            <button className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-sand bg-white px-5 py-3 text-sm font-bold text-sea transition hover:border-gold" type="button">
              <UserRound size={18} strokeWidth={1.8} />
              Editar perfil
            </button>
            <button className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-sea px-5 py-3 text-sm font-bold text-white shadow-soft transition hover:bg-turquoise" onClick={() => void signOut()} type="button">
              <LogOut size={18} strokeWidth={1.8} />
              Sair
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
