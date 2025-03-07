import { useState, useEffect } from 'react';
import { supabase } from '../../../supabaseClient';

export default function AddServiceForm() {
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [tags, setTags] = useState('');
  const [providerId, setProviderId] = useState(null);
  const [loading, setLoading] = useState(false);

  // Lagre innlogget bruker
  const [user, setUser] = useState(null);

  useEffect(() => {
    async function fetchUserAndProvider() {
      // 1) Hent innlogget bruker
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        console.error('User is not authenticated or there was an error:', userError?.message);
        return;
      }
      setUser(user);

      // 2) Finn provider(e) for denne brukeren
      const { data: providers, error: providerError } = await supabase
        .from('providers')
        .select('id')
        .eq('user_id', user.id); // Vi bruker user_id her

      if (providerError) {
        console.error('Error fetching provider:', providerError.message);
      } else if (!providers || providers.length === 0) {
        console.warn('Ingen provider funnet for denne brukeren.');
      } else {
        // Hvis du forventer kun én provider per bruker, ta den første
        setProviderId(providers[0].id);
      }
    }

    fetchUserAndProvider();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!providerId) {
      alert('Ingen providerId er tilgjengelig. Opprett en provider først!');
      setLoading(false);
      return;
    }

    const tagsArray = tags.split(',').map((tag) => tag.trim());

    //eslint-disable-next-line
    const { data, error } = await supabase
      .from('services')
      .insert([
        {
          title,
          price: parseInt(price, 10),
          tags: tagsArray,
          provider_id: providerId,
        },
      ]);

    setLoading(false);

    if (error) {
      console.error('Error adding service:', error.message);
      alert('Kunne ikke legge til service: ' + error.message);
    } else {
      alert('Service lagt til!');
      // Tilbakestill skjemaet
      setTitle('');
      setPrice('');
      setTags('');
    }
  };

  if (!user) {
    return <p>Du må være logget inn for å opprette en service</p>;
  }

  if (!providerId) {
    // Brukeren er innlogget, men har kanskje ikke laget noen provider ennå
    return <p>Vennligst opprett en provider først...</p>;
  }

  return (
    <div className="col-10 m-auto">
        <form className="qute-form" onSubmit={handleSubmit}>
            <h2>Add new service</h2>
            <div className="label-input-container">
                <label className="label">
                    Title:
                </label>
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    className="form-input"
                    />
            </div>
            <div className="label-input-container">
                <label className="label">
                    Price:
                </label>
                <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    required
                    className="form-input"
                    />
            </div>
            <div className="label-input-container">
                <label className="label">
                    Tags (comma separated):
                </label>
                <input
                    className="form-input"
                    type="text"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    />
            </div>
            <button className="submit-button" type="submit" disabled={loading}>
                {loading ? 'Saving...' : 'Add service'}
            </button>
        </form>
    </div>
  );
}