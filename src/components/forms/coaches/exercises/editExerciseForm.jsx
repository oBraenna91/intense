import React, { useState, useEffect } from 'react';
import { IonButton, IonInput, IonTextarea, IonSelect, IonSelectOption, IonItem, IonLabel } from '@ionic/react';
import { supabase } from '../../../../supabaseClient';
import { useExercises } from '../../../../hooks/exercises';

const ExerciseEditForm = ({ exercise, onClose, onExerciseUpdated, userId }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    video_url: '',
    image_url: '',
    image_path: '',
  });
  const [selectedMuscles, setSelectedMuscles] = useState([]);
  const [muscles, setMuscles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { fetchUpdatedExercise } = useExercises(userId);

  useEffect(() => {
    if (exercise) {
      setFormData({
        name: exercise.name,
        description: exercise.description,
        video_url: exercise.video_url,
        image_url: exercise.image_url,
        image_path: exercise.image_path,
      });
      if (exercise.exercise_muscles && exercise.exercise_muscles.length > 0) {
        const muscleIds = exercise.exercise_muscles.map(em => em.muscles_id);
        setSelectedMuscles(muscleIds);
      } else {
        setSelectedMuscles([]);
      }
    }
  }, [exercise]);

  useEffect(() => {
    const fetchMuscles = async () => {
      const { data, error } = await supabase
        .from('muscles')
        .select('*');
      if (error) {
        setError(error.message);
      } else {
        setMuscles(data);
      }
    };
    fetchMuscles();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setLoading(true);
    setError(null);
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = fileName;
    //eslint-disable-next-line
    const { data, error } = await supabase.storage
      .from('exercise-images')
      .upload(filePath, file, {
        upsert: true,
        contentType: file.type,
        metadata: { user_id: userId },
      });
    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }
    const { data: publicUrlData } = supabase.storage
      .from('exercise-images')
      .getPublicUrl(filePath);
    if (!publicUrlData) {
      setError("Kunne ikke hente URL for bildet");
      setLoading(false);
      return;
    }
    setFormData({ ...formData, image_url: publicUrlData.publicUrl, image_path: filePath });
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('exercises')
        .update({
          name: formData.name,
          description: formData.description,
          video_url: formData.video_url,
          image_url: formData.image_url,
          image_path: formData.image_path,
        })
        .eq('id', exercise.id)
        .eq('created_by', userId)
        .select();
      if (error) throw error;
      const updatedExercise = data[0];
      
      const { error: deleteError } = await supabase
        .from('exercise_muscles')
        .delete()
        .eq('exercise_id', exercise.id);
      if (deleteError) throw deleteError;
      
      if (selectedMuscles.length > 0) {
        const { error: insertError } = await supabase
          .from('exercise_muscles')
          .insert(
            selectedMuscles.map((muscleId) => ({
              exercise_id: exercise.id,
              muscles_id: muscleId,
            }))
          );
        if (insertError) throw insertError;
      }
      const reFetchedExercise = await fetchUpdatedExercise(updatedExercise.id);
      onExerciseUpdated(reFetchedExercise);
      alert('Øvelse oppdatert ✅')
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ padding: '1rem' }}>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <IonItem>
        <IonLabel position="stacked">Navn</IonLabel>
        <IonInput name="name" value={formData.name} onIonChange={handleChange} required />
      </IonItem>
      <IonItem>
        <IonLabel position="stacked">Beskrivelse</IonLabel>
        <IonTextarea name="description" value={formData.description} onIonChange={handleChange} required />
      </IonItem>
      <IonItem>
        <IonLabel position="stacked">Video URL</IonLabel>
        <IonInput name="video_url" value={formData.video_url} onIonChange={handleChange} />
      </IonItem>
      <IonItem>
        <IonLabel position="stacked">Bilde</IonLabel>
        <input type="file" accept="image/*" onChange={handleFileUpload} />
      </IonItem>
      <IonItem>
        <IonLabel position="stacked">Velg muskler</IonLabel>
        <IonSelect
          multiple
          value={selectedMuscles}
          placeholder="Velg muskler"
          onIonChange={(e) => setSelectedMuscles(e.detail.value)}
          interface="alert"
          interfaceOptions={{ cssClass: 'custom-alert', cancelText: 'Avbryt', okText: 'OK'  }}
        >
          {muscles.map((muscle) => (
            <IonSelectOption key={muscle.id} value={muscle.id}>
              {muscle.name}
            </IonSelectOption>
          ))}
        </IonSelect>
      </IonItem>
      <div className="col-12 mt-2 d-flex justify-content-center">
        <IonButton className="col-10" type="submit" disabled={loading}>
            {loading ? "Lagrer..." : "Oppdater øvelse"}
        </IonButton>
      </div>
    </form>
  );
};

export default ExerciseEditForm;