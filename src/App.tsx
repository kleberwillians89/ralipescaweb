import { useEffect, useState, type ReactNode } from 'react';
import { Shell } from './components/Shell';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { CalculatorPage } from './pages/CalculatorPage';
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { ProfilePage } from './pages/ProfilePage';
import { RankingPage } from './pages/RankingPage';
import { RulesPage } from './pages/RulesPage';
import { SplashScreen } from './pages/SplashScreen';
import { SpeciesPage } from './pages/SpeciesPage';
import { TeamsPage } from './pages/TeamsPage';
import type { PageKey } from './types';
import { Card } from './components/Card';
import { PageHeader } from './components/PageHeader';
import { canAccessPage } from './services/permissions';

export function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

function AppContent() {
  const [activePage, setActivePage] = useState<PageKey>('home');
  const [showSplash, setShowSplash] = useState(true);
  const { enterDemo, loading, profile, session, signIn, signUp, resetPassword, isDemoMode } = useAuth();

  useEffect(() => {
    const splashTimer = window.setTimeout(() => setShowSplash(false), 2000);
    return () => window.clearTimeout(splashTimer);
  }, []);

  const isAuthenticated = Boolean(session || profile);

  if (showSplash) {
    return <SplashScreen />;
  }

  if (loading) {
    return <SplashScreen />;
  }

  if (!isAuthenticated) {
    return <LoginPage isDemoMode={isDemoMode} onDemoLogin={enterDemo} onLogin={signIn} onResetPassword={resetPassword} onSignUp={signUp} />;
  }

  const pages: Record<PageKey, ReactNode> = {
    home: <HomePage onNavigate={setActivePage} />,
    calculator: <CalculatorPage />,
    species: <SpeciesPage />,
    rules: <RulesPage />,
    ranking: <RankingPage />,
    team: <TeamsPage />,
    settings: <ComingSoonPage title="Configurações" description="Preferências do aplicativo, conta, notificações e futura conexão com Supabase." />,
    profile: <ProfilePage />,
  };

  return (
    <Shell activePage={activePage} onNavigate={setActivePage}>
      {profile && !canAccessPage(profile.role, activePage) ? <PermissionDeniedPage /> : pages[activePage]}
    </Shell>
  );
}

function PermissionDeniedPage() {
  return (
    <div>
      <PageHeader eyebrow="Acesso restrito" title="Sem permissão" description="Você não tem permissão para gerenciar equipes." />
      <Card>
        <p className="text-base leading-7 text-graphite/75">Peça acesso à organização do Rali caso você faça parte da comissão.</p>
      </Card>
    </div>
  );
}

function ComingSoonPage({ title, description }: { title: string; description: string }) {
  return (
    <div>
      <PageHeader eyebrow="Módulo premium" title={title} description={description} />
      <Card>
        <p className="text-base leading-7 text-graphite/75">
          Este módulo já está posicionado na arquitetura do produto e pronto para receber dados reais na próxima etapa.
        </p>
      </Card>
    </div>
  );
}
