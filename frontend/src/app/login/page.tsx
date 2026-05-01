'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function Login() {
  const [isSignupMode, setIsSignupMode] = useState<boolean>(true);
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<string>('');
  const [error, setError] = useState<string>('');

  const { user, signUp, signIn } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.push('/dashboard');
    }
  }, [user, router]);

  const toggleAuthMode = () => {
    setIsSignupMode(!isSignupMode);
    setMessage('');
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    try {
      if (isSignupMode) {
        const { error } = await signUp(email, password);
        if (error) {
          setError(error.message);
        } else {
          setMessage('Vérifiez votre email pour confirmer votre inscription !');
        }
      } else {
        const { error } = await signIn(email, password);
        if (error) {
          setError(error.message);
        } else {
          router.push('/dashboard');
        }
      }
    } catch (err) {
      setError('Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="main-container">
      <div className="header">
        <Link href="/" className="home-link">
          <i className="fas fa-home"></i>
        </Link>
        <div className="site-title">
          MON RAPPEL ZAKAT
        </div>
        <span className="home-link placeholder-link"></span>
      </div>

      <div className="content-area">
        <div className="date-card">
          <div className="date-section">
            <div className="date-title mb-4">
              {isSignupMode
                ? "Créez votre compte."
                : "Connectez-vous à votre compte"
              }
            </div>
            <form onSubmit={handleSubmit}>
              {error && (
                <div className="alert alert-danger" role="alert">
                  {error}
                </div>
              )}
              {message && (
                <div className="alert alert-success" role="alert">
                  {message}
                </div>
              )}
              <div className="mb-3">
                <input
                  type="email"
                  className="form-control"
                  placeholder="votre@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
              <div className="mb-3">
                <input
                  type="password"
                  className="form-control"
                  placeholder="Mot de passe"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  minLength={6}
                />
              </div>
              <button type="submit" className="remind-btn w-100" disabled={loading}>
                {loading ? (
                  <>
                    <i className="fas fa-spinner fa-spin me-2"></i>
                    {isSignupMode ? "Inscription..." : "Connexion..."}
                  </>
                ) : (
                  <>
                    <i className={`fas ${isSignupMode ? 'fa-user-plus' : 'fa-sign-in-alt'} me-2`}></i>
                    {isSignupMode ? "S'inscrire" : "Se connecter"}
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={toggleAuthMode}
            className="text-decoration-underline"
            style={{
              color: '#2c5530',
              fontWeight: 500,
              background: 'none',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            {isSignupMode ? "J'ai déjà un compte" : "Créer un compte"}
          </button>
        </div>
      </div>
    </div>
  );
}