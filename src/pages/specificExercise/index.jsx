import { 
    IonBackButton, 
    IonButtons, 
    IonContent, 
    IonHeader, 
    IonPage, 
    IonToolbar, 
    IonButton, 
    IonModal, 
    IonSpinner 
  } from '@ionic/react';
  import ExerciseEditForm from '../../components/forms/coaches/exercises/editExerciseForm';
  import React, { useEffect, useState } from 'react';
  import { useParams } from 'react-router-dom';
  import { supabase } from '../../supabaseClient';
import { useAuth } from '../../contexts/auth';
  //import ExerciseEditForm from '../components/ExerciseEditForm'; // Opprett denne komponenten for redigering
  
  export default function SpecificExercisePage() {
    const { user, profile } = useAuth();
    const currentUserId = user.id;
    const { exerciseId } = useParams();
    const [exercise, setExercise] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
  
    useEffect(() => {
      const fetchExercise = async () => {
        setLoading(true);
        const { data, error } = await supabase
          .from('exercises')
          .select(`
            *,
            exercise_muscles (
              muscles_id,
              muscles (
                name
              )
            )
          `)
          .eq('id', exerciseId)
          .single();
        if (error) {
          setError(error.message);
        } else {
          setExercise(data);
        }
        setLoading(false);
      };
      if (exerciseId) {
        fetchExercise();
      }
    }, [exerciseId]);
  
    const handleExerciseUpdated = (updatedExercise) => {
        setExercise(updatedExercise);
        setShowEditModal(false);
      };

      const backHref = profile?.role === 'coach' ? '/app/training' : '/app/client/training';
  
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonButtons slot="start">
              <IonBackButton defaultHref={backHref} />
            </IonButtons>
          </IonToolbar>
        </IonHeader>
        <IonContent fullscreen>
          {loading ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
              <IonSpinner />
            </div>
          ) : error ? (
            <p style={{ padding: '1rem' }}>{error}</p>
          ) : (
            <>
              {/* Øvelsesbilde øverst */}
              {/* {exercise.image_url && (
                <img 
                  src={exercise.image_url} 
                  alt={exercise.name} 
                  style={{ width: '100%', height: 'auto' }}
                />
              )} */}
              {/* {exercise.video_url && (
                    <div 
                    // style={{ marginTop: '1rem' }} 
                    className="video-container">
                        <iframe
                        width="100%"
                        height="315"
                        src={`https://www.youtube.com/embed/${exercise.video_url}`}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        title="YouTube video player"
                        ></iframe>
                    </div>
                    )} */}
                    {exercise.video_url && (
                      <div className="video-container">
                        <iframe
                          width="100%"
                          src={`https://www.youtube.com/embed/${exercise.video_url}`}
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          title="YouTube video player"
                        ></iframe>
                      </div>
                    )}
              <div style={{ padding: '1rem' }}>
                <h2>{exercise.name}</h2>
                <p style={{ whiteSpace: 'pre-line' }}>{exercise.description}</p>
                {exercise.exercise_muscles && exercise.exercise_muscles.length > 0 && (
                  <div>
                    <strong>Muskelgrupper:</strong>
                    <div>
                      {exercise.exercise_muscles.map((em, index) => (
                        <div key={index}>{em.muscles.name}</div>
                      ))}
                    </div>
                  </div>
                )}
                {exercise.created_by === currentUserId && (
                    <div className="col-12 mt-3 d-flex justify-content-center">
                        <IonButton className="col-10" onClick={() => setShowEditModal(true)}>
                        Oppdater øvelse
                        </IonButton>
                    </div>
                    )}
              </div>
            </>
          )}
        </IonContent>
        <IonModal 
          isOpen={showEditModal}
          onDidDismiss={() => setShowEditModal(false)}
          breakpoints={[0, 0.5, 0.9]} 
          initialBreakpoint={0.55}
        >
          <ExerciseEditForm 
          exercise={exercise}
          userId={currentUserId}
          onClose={() => setShowEditModal(false)}
          onExerciseUpdated={handleExerciseUpdated}
        />
        </IonModal>
      </IonPage>
    );
  }  