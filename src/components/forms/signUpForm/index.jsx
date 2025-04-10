import React, { useState } from 'react';
import { supabase } from '../../../supabaseClient.js';

export default function SignUpForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [message, setMessage] = useState('');

  const signUpUser = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setMessage('');
  
    //eslint-disable-next-line
    const { data, error } = await supabase.auth.signUp({
      email,
      password
    });
  
    if (error) {
      setErrorMsg(error.message);
    } else {
          setMessage('Sjekk din e-post for å bekrefte din konto!');
        }
    };

  return (
    <form className="qute-form col-10 m-auto" onSubmit={signUpUser}>
      {errorMsg && <p style={{ color: 'red' }}>{errorMsg}</p>}
      {message && <p style={{ color: 'green' }}>{message}</p>}

      <div className="label-input-container">
        <label className="label">E-mail</label>
        <input 
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="form-input"
          placeholder="E-mail"
        />
      </div>
      <div className="label-input-container">
        <label className="label">Passord</label>
        <input 
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="form-input"
          placeholder="Passord"
        />
      </div>
      <button className="submit-button" type="submit">Opprett konto</button>
    </form>
  );
}
