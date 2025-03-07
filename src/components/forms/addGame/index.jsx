import React, {useState} from 'react';
import { supabase } from '../../../supabaseClient';

const AddGameForm = ({ onGameAdded }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [type, setType] = useState('single');
    const [isHistorical, setIsHistorical] = useState(false);
    const [combineRounds, setCombineRounds] = useState(false);
    const [scoreType, setScoreType] = useState('lowest');
    const [rulesId, setRulesId] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
  
    const handleSubmit = async (e) => {
      e.preventDefault();
  
      const game = {
        title,
        description,
        type,
        is_historical: isHistorical,
        combine_rounds: combineRounds,
        score_type: scoreType,
        rules_id: rulesId || null,
      };
  
      const { data, error } = await supabase.from('games').insert([game]);
        console.log(data);
      if (error) {
        setError(error.message);
      } else {
        setSuccess(true);
        // onGameAdded(data[0]);
        setTitle('');
        setDescription('');
        setType('vanlig');
        setIsHistorical(false);
        setCombineRounds(false);
        setScoreType('lowest');
        setRulesId('');
      }
    };
  
    return (
      <form className="d-flex mt-3 flex-column align-items-center" onSubmit={handleSubmit}>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        {success && <p style={{ color: 'green' }}>Gren opprettet!</p>}
  
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Tittel på gren"
          required
        />
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Beskrivelse"
        />
        <select value={type} onChange={(e) => setType(e.target.value)}>
          <option value="single">Vanlig</option>
          <option value="team">Mesternes Mester</option>
        </select>
        <label>
          <input
            type="checkbox"
            checked={isHistorical}
            onChange={(e) => setIsHistorical(e.target.checked)}
          />
          Historisk resultat
        </label>
        <label>
          <input
            type="checkbox"
            checked={combineRounds}
            onChange={(e) => setCombineRounds(e.target.checked)}
          />
          Kombiner runder
        </label>
        <select value={scoreType} onChange={(e) => setScoreType(e.target.value)}>
          <option value="lowest">Laveste poengsum</option>
          <option value="highest">Høyeste poengsum</option>
        </select>
        <input
          type="text"
          value={rulesId}
          onChange={(e) => setRulesId(e.target.value)}
          placeholder="Regler ID (valgfritt)"
        />
        <button type="submit">Opprett gren</button>
      </form>
    );
  };
  
  export default AddGameForm;