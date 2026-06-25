import { Eye, Lock, Mail, Phone, UserRound } from 'lucide-react';
import type { FormEvent } from 'react';
import { useState } from 'react';
import './LoginPage.css';

type LoginPageProps = {
  isDemoMode: boolean;
  onDemoLogin: () => void;
  onLogin: (email: string, password: string) => Promise<void>;
  onSignUp: (email: string, password: string, profileData?: { full_name?: string; phone?: string }) => Promise<{ needsEmailConfirmation: boolean }>;
  onResetPassword: (email: string) => Promise<void>;
};

export function LoginPage({ isDemoMode, onDemoLogin, onLogin, onResetPassword, onSignUp }: LoginPageProps) {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
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

      if (mode === 'signup') {
        if (!fullName.trim()) {
          setFeedback('Informe seu nome completo.');
          return;
        }

        if (!email.trim() || !phone.trim() || !password || !confirmPassword) {
          setFeedback('Preencha todos os campos do cadastro.');
          return;
        }

        if (password !== confirmPassword) {
          setFeedback('As senhas não conferem.');
          return;
        }

        const result = await onSignUp(email.trim(), password, { full_name: fullName.trim(), phone: phone.trim() });
        setPassword('');
        setConfirmPassword('');
        setMode('login');
        setFeedback(result.needsEmailConfirmation ? 'Cadastro criado. Confirme seu e-mail antes de entrar.' : 'Cadastro criado com sucesso. Agora você já pode entrar.');
        return;
      }

      await onLogin(email.trim(), password);
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : mode === 'signup' ? 'Não foi possível criar a conta.' : 'Não foi possível entrar.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSignUpMode = () => {
    setFeedback('');
    setMode('signup');
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

          <h2>{mode === 'signup' ? 'Criar conta' : 'Bem-vindo!'}</h2>
          <p className="login-card__subtitle">{mode === 'signup' ? 'Preencha seus dados para participar' : 'Entre para continuar'}</p>

          <form className="login-form" onSubmit={handleSubmit}>
            {mode === 'signup' ? (
              <label className="login-input">
                <UserRound size={20} strokeWidth={1.9} />
                <input autoComplete="name" onChange={(event) => setFullName(event.target.value)} placeholder="Nome completo" type="text" value={fullName} />
              </label>
            ) : null}

            <label className="login-input">
              <Mail size={20} strokeWidth={1.9} />
              <input autoComplete="email" onChange={(event) => setEmail(event.target.value)} placeholder="E-mail" type="email" value={email} />
            </label>

            {mode === 'signup' ? (
              <label className="login-input">
                <Phone size={20} strokeWidth={1.9} />
                <input autoComplete="tel" onChange={(event) => setPhone(event.target.value)} placeholder="Telefone" type="tel" value={phone} />
              </label>
            ) : null}

            <label className="login-input">
              <Lock size={20} strokeWidth={1.9} />
              <input autoComplete={mode === 'signup' ? 'new-password' : 'current-password'} onChange={(event) => setPassword(event.target.value)} placeholder="Senha" type="password" value={password} />
              <Eye className="login-input__eye" size={20} strokeWidth={1.9} />
            </label>

            {mode === 'signup' ? (
              <label className="login-input">
                <Lock size={20} strokeWidth={1.9} />
                <input autoComplete="new-password" onChange={(event) => setConfirmPassword(event.target.value)} placeholder="Confirmar senha" type="password" value={confirmPassword} />
                <Eye className="login-input__eye" size={20} strokeWidth={1.9} />
              </label>
            ) : null}

            <button className="login-button login-button--primary" disabled={submitting} type="submit">
              {submitting ? (mode === 'signup' ? 'Criando...' : 'Entrando...') : mode === 'signup' ? 'Criar conta' : 'Entrar'}
            </button>

            <button
              className="login-button login-button--secondary"
              disabled={submitting}
              onClick={mode === 'signup' ? () => {
                setFeedback('');
                setMode('login');
              } : handleSignUpMode}
              type="button"
            >
              {mode === 'signup' ? 'Já tenho conta' : 'Criar conta'}
            </button>

            {mode === 'login' ? (
              <button className="login-link" onClick={handleResetPassword} type="button">
                Esqueci minha senha
              </button>
            ) : null}
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
