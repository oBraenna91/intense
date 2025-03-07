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
      setMessage('We sent you an email with instructions on how to reset your password.');
    }

    setLoading(false);
  };

  return (
    <div className="reset-password-container">
      <h1 className="text-center my-5">Reset password</h1>
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
          {loading ? 'Sending...' : 'Send reset link'}
        </button>
      </form>
    </div>
  );
}
