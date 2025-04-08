import React, { useState } from 'react';
import { supabase } from '../../../supabaseClient';

export default function ResetPasswordForm() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/update-password`,
    });

    if (error) {
      setError(error.message);
    } else {
      setMessage('Vi har sendt deg en e-post med instruksjoner om hvordan du endrer ditt passord!');
    }

    setLoading(false);
  };

  return (
    <div className="reset-password-container">
      <h1 className="text-center my-5">Tilbakestill passord</h1>
      <form className="qute-form col-10 m-auto" onSubmit={handlePasswordReset}>
        <div className="label-input-container">
          <label className="label">E-mail:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="form-input"
            placeholder='Email'
          />
        </div>
        {error && <p className="error-message">{error}</p>}
        {message && <p className="success-message">{message}</p>}
        <button className="submit-button" type="submit" disabled={loading}>
          {loading ? 'Sender...' : 'Send tilbakestillings-link'}
        </button>
      </form>
    </div>
  );
}
