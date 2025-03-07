import React, { useState } from 'react';
import { supabase } from '../../../supabaseClient';

const EditGameForm = ({ game, onUpdate, onClose }) => {
  const [title, setTitle] = useState(game.title);
  const [description, setDescription] = useState(game.description);
  const [type, setType] = useState(game.type);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    //eslint-disable-next-line
    const { data, error } = await supabase
      .from('games')
      .update({ title, description, type })
      .eq('id', game.id);

    if (error) {
      setError(error.message);
    } else {
    //   onUpdate(data[0]); // Send oppdatert data tilbake
      alert('Øvelsen er oppdatert!')
      onClose(); // Lukk modal
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <div>
        <label>Tittel</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>
      <div>
        <label>Beskrivelse</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>
      <div>
        <label>Type</label>
        <select value={type} onChange={(e) => setType(e.target.value)}>
          <option value="single">Individuell</option>
          <option value="team">Lag</option>
        </select>
      </div>
      <button type="submit">Lagre endringer</button>
    </form>
  );
};

export default EditGameForm;
