import React, { useState, useEffect } from 'react';
import { useExercises } from '../../../../hooks/exercises';
import { IonButton, IonSelect, IonSelectOption } from '@ionic/react';
import { supabase } from '../../../../supabaseClient';

const ExerciseForm = ({ userId, onClose, onExerciseAdded }) => {
  const { addExercise, fetchNewExercise } = useExercises(userId);
  const [exercise, setExercise] = useState({
    name: '',
    description: '',
    image_url: '',
    video_url: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [muscles, setMuscles] = useState([]);
  const [selectedMuscles, setSelectedMuscles] = useState([]);

  useEffect(() => {
    const fetchMuscles = async () => {
      const { data, error } = await supabase
        .from('muscles')
        .select('*');
      if (error) {
        console.error('Feil ved henting av muskler:', error.message);
      } else {
        setMuscles(data);
      }
    };
    fetchMuscles();
  }, []);

  const handleChange = (e) => {
    setExercise({ ...exercise, [e.target.name]: e.target.value });
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    setLoading(true);
    setError(null);
  
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${fileName}`;

    //eslint-disable-next-line
    const { data, error } = await supabase.storage
      .from('exercise-images')
      .upload(filePath, file, {
        upsert: true,
        contentType: file.type,
        metadata: { user_id: userId },
      });
      console.log(data);
    if (error) {
      console.error('Feil ved opplasting av bilde:', error.message);
      setError(`Opplasting feilet: ${error.message}`);
      setLoading(false);
      return;
    }
    
    const { data: publicUrlData } = supabase.storage.from('exercise-images').getPublicUrl(filePath);
    if (!publicUrlData) {
      setError('Kunne ikke hente URL for bildet');
      setLoading(false);
      return;
    }
  
    setExercise({ ...exercise, image_url: publicUrlData.publicUrl, image_path: filePath });
    setLoading(false);
  };  

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if(selectedMuscles.length < 1) {
        alert('Ops! Vennligst velg muskelgruppe!')
        return;
      }
      const newExercise = await addExercise(exercise);
      if (!newExercise) {
        throw new Error('Kunne ikke opprette øvelse');
      }
      if (selectedMuscles.length > 0) {
        const { error: insertError } = await supabase
          .from('exercise_muscles')
          .insert(
            selectedMuscles.map((muscleId) => ({
              exercise_id: newExercise.id,
              muscles_id: muscleId,
            }))
          );
        if (insertError) throw insertError;
      }
      const completeExercise = await fetchNewExercise(newExercise.id);
      if (onExerciseAdded) {
        onExerciseAdded(completeExercise);
      }
      alert('Øvelse lagt til ✅')
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="d-flex flex-column">
      <h2 className="text-center">Legg til ny øvelse</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form className="intense-form" onSubmit={handleSubmit}>
        <div className="d-flex  flex-column align-items-center">
            <label>
            Navn:
            </label>
            <input className="rounded-3 intense-input " type="text" name="name" value={exercise.name} onChange={handleChange} required />
        </div>
        <div className="d-flex flex-column align-items-center">
            <label>
            Beskrivelse:
            </label>
            <textarea rows={8} className="rounded-3 intense-input" name="description" value={exercise.description} onChange={handleChange} required />
        </div>
        <div className="col-12 d-flex justify-content-center">
            <IonSelect
            style={{ width: '50%' }}
            multiple
            value={selectedMuscles}
            placeholder="Velg muskler"
            onIonChange={(e) => setSelectedMuscles(e.detail.value)}
            interface="alert"
            interfaceOptions={{ cssClass: 'custom-alert', cancelText: 'Avbryt', okText: 'OK' }}
            >
            {muscles.map((muscle) => (
                <IonSelectOption key={muscle.id} value={muscle.id}>
                {muscle.name}
                </IonSelectOption>
            ))}
            </IonSelect>
        </div>
        <div className="d-flex flex-column align-items-center">
            <label>
            Bilde:
            </label>
            <input type="file" accept="image/*" onChange={handleFileUpload} />
        </div>
        <div className="d-flex flex-column align-items-center">
            <label>
            Video-URL:
            </label>
            <input className="rounded-3 intense-input" type="text" name="video_url" value={exercise.video_url} onChange={handleChange} />
        </div>
        <IonButton className="col-12" type="submit" disabled={loading}>
          {loading ? 'Lagrer...' : 'Legg til øvelse'}
        </IonButton>
      </form>
    </div>
  );
};

export default ExerciseForm;