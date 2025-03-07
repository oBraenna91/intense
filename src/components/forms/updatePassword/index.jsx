import React, { useState, useEffect } from 'react';
import { supabase } from '../../../supabaseClient';
import { useIonRouter } from '@ionic/react';

export default function UpdatePassword() {
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const router = useIonRouter();

  useEffect(() => {
    
    const initializeSession = async () => {
      const params = new URLSearchParams(window.location.hash.substring(1));
      const accessToken = params.get('access_token');

      if (accessToken) {
        const { error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: params.get('refresh_token')
        });

        if (error) {
          console.error('Failed to set session:', error.message);
          setError('Kunne ikke autentisere brukeren.');
        }
      } else {
        setError('Refresh-token missing. Please try again.');
      }
    };

    initializeSession();
  }, []);

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setError(error.message);
    } else {
      setMessage('Password updated - redirecting to login-page');
      setTimeout(() => router.push('/login', 'forward'), 3000);
    }

    setLoading(false);
  };

  return (
    <div className="update-password-container">
      <h1 className="text-center my-5">Update password</h1>
      <form className="qute-form col-10 m-auto" onSubmit={handleUpdatePassword}>
        <div className="label-input-container">
          <label className="label">New password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="form-input"
            placeholder='New password'
          />
        </div>
        {error && <p className="error-message">{error}</p>}
        {message && <p className="success-message">{message}</p>}
        <button className="submit-button" type="submit" disabled={loading}>
          {loading ? 'Updating...' : 'Update password'}
        </button>
      </form>
    </div>
  );
}