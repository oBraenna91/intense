import React, { useState, useEffect } from 'react';
import { supabase } from '../../../supabaseClient';

export default function AddProviderForm() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [zip, setZip] = useState('');
  const [country, setCountry] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  // Vi vil også lagre informasjon om innlogget bruker
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Hent den innloggede brukeren
    const getUser = async () => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();
      if (error) {
        console.error('Ingen bruker funnet:', error.message);
        return;
      }
      setUser(user);
    };
    getUser();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!user) {
      alert('Ingen bruker er autentisert. Logg inn først.');
      setLoading(false);
      return;
    }

    const contactInfo = { phone, email };
    const address = { street, city, zip, country };

    //eslint-disable-next-line
    const { data, error } = await supabase
      .from('providers')
      .insert([
        {
          user_id: user.id, // Koble provider til innlogget bruker
          name,
          contact_info: contactInfo,
          address,
          description,
        },
      ]);

    setLoading(false);

    if (error) {
      console.error('Error adding provider:', error.message);
      alert('Kunne ikke legge til provider: ' + error.message);
    } else {
      alert('Provider lagt til!');
      // Tilbakestill skjemaet
      setName('');
      setPhone('');
      setEmail('');
      setStreet('');
      setCity('');
      setZip('');
      setCountry('');
      setDescription('');
    }
  };

  if (!user) {
    return <p>Vennligst logg inn for å opprette en provider...</p>;
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2>Legg til ny provider</h2>
      <label>
        Navn:
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </label>

      <h3>Kontaktinfo</h3>
      <label>
        Telefon:
        <input
          type="text"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
      </label>
      <label>
        E-post:
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </label>

      <h3>Adresse</h3>
      <label>
        Gate:
        <input
          type="text"
          value={street}
          onChange={(e) => setStreet(e.target.value)}
        />
      </label>
      <label>
        By:
        <input
          type="text"
          value={city}
          onChange={(e) => setCity(e.target.value)}
        />
      </label>
      <label>
        Postnummer:
        <input
          type="text"
          value={zip}
          onChange={(e) => setZip(e.target.value)}
        />
      </label>
      <label>
        Land:
        <input
          type="text"
          value={country}
          onChange={(e) => setCountry(e.target.value)}
        />
      </label>

      <label>
        Beskrivelse:
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </label>

      <button type="submit" disabled={loading}>
        {loading ? 'Lagrer...' : 'Legg til provider'}
      </button>
    </form>
  );
}