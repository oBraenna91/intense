import React, { useState } from 'react';
import { supabase } from '../../../supabaseClient.js';
import { useIonRouter } from '@ionic/react';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const router = useIonRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    //eslint-disable-next-line
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
    } else {
        alert('Du er nå logget inn!')
      router.push('/app', 'forward');
    }
    setLoading(false);
  };

  return (
    <div className="login-container col-10 m-auto">
      <form className="qute-form" onSubmit={handleLogin}>
        <div className="label-input-container">
          <label className="label">E-mail:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="form-input"
            placeholder="Email"
          />
        </div>
        <div className="label-input-container">
          <label className="label">Passord:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="form-input"
            placeholder='Passord'
          />
        </div>
        {error && <p className="error-message">{error}</p>}
        <button className="submit-button" type="submit" disabled={loading}>
          {loading ? 'Logger inn...' : 'Logg in'}
        </button>
      </form>
    </div>
  );
}
