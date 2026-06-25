import { Eye, Lock, Mail } from 'lucide-react';
import type { FormEvent } from 'react';
import { useState } from 'react';
import type { UserRole } from '../types/database';
import './LoginPage.css';

type LoginPageProps = {
  isDemoMode: boolean;
  onDemoLogin: () => void;
  onLogin: (email: string, password: string) => Promise<void>;
  onSignUp: (email: string, password: string, profileData?: { full_name?: string; role?: UserRole }) => Promise<void>;
  onResetPassword: (email: string) => Promise<void>;
};

export function LoginPage({ isDemoMode, onDemoLogin, onLogin, onResetPassword, onSignUp }: LoginPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [feedback, setFeedback] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setFeedback('');

    try {
      if (isDemoMode && !email && !password) {
        onDemoLogin();
        return;
      }

      await onLogin(email, password);
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : 'Não foi possível entrar.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSignUp = async () => {
    setSubmitting(true);
    setFeedback('');

    try {
      if (isDemoMode && !email && !password) {
        onDemoLogin();
        return;
      }

      await onSignUp(email, password, { full_name: email.split('@')[0], role: 'participant' });
      setFeedback('Cadastro criado. Confirme seu e-mail se o Supabase exigir confirmação.');
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : 'Não foi possível criar a conta.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetPassword = async () => {
    setFeedback('');

    try {
      await onResetPassword(email);
      setFeedback(email ? 'Enviamos as instruções de recuperação.' : 'Informe o e-mail para recuperar a senha.');
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : 'Não foi possível recuperar a senha.');
    }
  };

  return (
    <main className="login-page">
      <section className="login-hero">
        <img
          alt="I Corrida de São Pedro em Fernando de Noronha"
          className="login-hero__image"
          src="/hero-corrida.png"
        />
        <div className="login-hero__overlay" />
        <div className="login-hero__badge">NORONHA 2026</div>
        <img alt="Santo Circuito" className="login-hero__logo" src="/logo-santo-circuito.png" />
      </section>

      <section className="login-card-wrap">
        <div className="login-card">
          <img alt="Santo Circuito" className="login-card__logo" src="/logo-santo-circuito.png" />

          <h2>Bem-vindo!</h2>
          <p className="login-card__subtitle">Entre para continuar</p>

          <form className="login-form" onSubmit={handleSubmit}>
            <label className="login-input">
              <Mail size={20} strokeWidth={1.9} />
              <input autoComplete="email" onChange={(event) => setEmail(event.target.value)} placeholder="E-mail" type="email" value={email} />
            </label>

            <label className="login-input">
              <Lock size={20} strokeWidth={1.9} />
              <input autoComplete="current-password" onChange={(event) => setPassword(event.target.value)} placeholder="Senha" type="password" value={password} />
              <Eye className="login-input__eye" size={20} strokeWidth={1.9} />
            </label>

            <button className="login-button login-button--primary" disabled={submitting} type="submit">
              {submitting ? 'Entrando...' : 'Entrar'}
            </button>

            <button className="login-button login-button--secondary" disabled={submitting} onClick={handleSignUp} type="button">
              Criar conta
            </button>

            <button className="login-link" onClick={handleResetPassword} type="button">
              Esqueci minha senha
            </button>
            {feedback ? <p className="login-feedback">{feedback}</p> : null}
          </form>
        </div>
      </section>

      <footer className="login-footer">
        <div className="login-footer__line" />
        <div className="login-footer__content">
          <div className="login-footer__brand">
            <span>REALIZAÇÃO</span>
            <strong>SANTO CIRCUITO</strong>
          </div>

          <div className="login-footer__divider" />

          <div className="login-footer__powered">
            <span>POWERED BY</span>
            <img alt="Mugô" src="/logo-mugo.png" />
          </div>
        </div>
        <div className="login-footer__wave" />
      </footer>
    </main>
  );
}
