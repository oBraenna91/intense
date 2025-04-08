import React, { useState, useEffect } from 'react';
import {
  IonContent, IonItem, IonLabel, IonInput, IonButton, IonModal, IonList,
  IonGrid, IonRow, IonCol, IonIcon,
  IonSearchbar, IonReorderGroup, IonReorder,
  IonItemSliding, IonItemOption, IonItemOptions,
  IonHeader,
  IonToolbar,
  IonButtons,
  IonCheckbox,
  useIonRouter
} from '@ionic/react';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import MuscleSelect from '../../../lists/muscles';
import { arrowBackOutline, trashOutline } from 'ionicons/icons';
import { supabase } from '../../../../supabaseClient';
import { useAuth } from '../../../../contexts/auth';
import { useExercises } from '../../../../hooks/exercises';
import { createWorkoutSession, updateWorkoutSession } from '../../../../hooks/sessions';
import { v4 as uuidv4 } from 'uuid';

function flattenExercises(workoutSessionExercises) {
  return workoutSessionExercises.map(ex => {
    return {
      id: ex.id,                  
      order: ex.order,
      comment: ex.comment,
      exercise_id: ex.exercise_id,
      name: ex.exercise.name,
      image_url: ex.exercise.image_url,
      sets: ex.workout_session_exercise_sets.map(s => ({
        id: s.id,
        planned_reps: s.planned_reps,
        set_number: s.set_number
      })),
      supersetGroup: null
    };
  });
}


function buildWorkoutSessionExercises(selectedExercises) {
  return selectedExercises.map(ex => ({
    id: ex.id, 
    exercise_id: ex.exercise_id,
    order: ex.order,
    comment: ex.comment || '',
    workout_session_exercise_sets: ex.sets.map(s => ({
      id: s.id, 
      planned_reps: s.planned_reps,
      set_number: s.set_number
    }))
  }));
}

const WorkoutSessionEditer = ({ initialSession, onBack }) => {
  const { user, coach } = useAuth();
  const userId = user?.id;
  const router = useIonRouter();
  const [sessionName, setSessionName] = useState('');
  const [sessionDescription, setSessionDescription] = useState('');
  const [selectedExercises, setSelectedExercises] = useState([]);
  const [selectedCoverImage, setSelectedCoverImage] = useState(null);
  const [mainFocus, setMainFocus] = useState('');
  const [estimatedDuration, setEstimatedDuration] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [isExerciseModalOpen, setIsExerciseModalOpen] = useState(false);
  const [exerciseInEdit, setExerciseInEdit] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [selectedMuscle, setSelectedMuscle] = useState('');
  const [coverImages, setCoverImages] = useState([]);
  const [isSupersetModalOpen, setIsSupersetModalOpen] = useState(false);
  const [selectedForSuperset, setSelectedForSuperset] = useState([]);
  const { exercises: exercisesFromHook, fetchExercises, loading, error } = useExercises(userId);
  const [exercises, setExercises] = useState([]);
  const [swiperInstance, setSwiperInstance] = useState(null);

  useEffect(() => {
    if (userId) {
      fetchExercises();
    }
    // eslint-disable-next-line
  }, [userId]);

  useEffect(() => {
    setExercises(exercisesFromHook);
  }, [exercisesFromHook]);

  useEffect(() => {
    const fetchCoverImages = async () => {
      const { data, error } = await supabase
        .from('workout_cover_images')
        .select('*');
      if (error) {
        console.error('Feil ved henting av cover-bilder:', error.message);
      } else {
        setCoverImages(data);
      }
    };
    fetchCoverImages();
  }, []);

  useEffect(() => {
    if (initialSession) {
      setSessionName(initialSession.title || '');
      setSessionDescription(initialSession.description || '');
      setMainFocus(initialSession.main_focus || '');
      setDifficulty(initialSession.difficulty || '');
      setEstimatedDuration(initialSession.estimated_duration || '');
      
      if (initialSession.workout_session_exercises) {
        const flattened = flattenExercises(initialSession.workout_session_exercises);
        setSelectedExercises(flattened);
      }
      if (initialSession.cover_image && coverImages.length > 0) {
        const found = coverImages.find(image => image.id === initialSession.cover_image);
        if (found) {
          setSelectedCoverImage(found.id);
        }
      }
    }
  }, [initialSession, coverImages]);

  const filteredExercises = exercises.filter(ex => {
    const matchesSearch = ex.name.toLowerCase().includes(searchText.toLowerCase());
    const matchesMuscle = selectedMuscle 
      ? ex.exercise_muscles && ex.exercise_muscles.some(em => 
          em.muscles && em.muscles.name.toLowerCase() === selectedMuscle.toLowerCase()
        )
      : true;
    return matchesSearch && matchesMuscle;
  });

  const handleSelectExercise = (exercise) => {
    setExerciseInEdit({
      id: null,
      exercise_id: exercise.id,
      name: exercise.name,
      image_url: exercise.image_url,
      order: selectedExercises.length + 1,
      comment: '',
      sets: [{ id: null, planned_reps: '', set_number: 1 }],
      supersetGroup: null
    });
    if (swiperInstance) {
      swiperInstance.slideNext();
    }
  };

  const handleSetRepsChange = (index, newReps) => {
    setExerciseInEdit(prev => {
      const updatedSets = [...prev.sets];
      updatedSets[index] = { ...updatedSets[index], planned_reps: newReps };
      return { ...prev, sets: updatedSets };
    });
  };

  const addSet = () => {
    setExerciseInEdit(prev => {
      const newSet = {
        id: null,
        planned_reps: '',
        set_number: prev.sets.length + 1
      };
      return { ...prev, sets: [...prev.sets, newSet] };
    });
  };

  const removeSet = (index) => {
    setExerciseInEdit(prev => {
      const updatedSets = prev.sets.filter((_, i) => i !== index);
      updatedSets.forEach((set, i) => {
        set.set_number = i + 1;
      });
      return { ...prev, sets: updatedSets };
    });
  };

  const handleFinishExercise = () => {
    setSelectedExercises([...selectedExercises, exerciseInEdit]);
    setExerciseInEdit(null);
    setIsExerciseModalOpen(false);
  };

  const handleBackToList = () => {
    setExerciseInEdit(null);
    if (swiperInstance) {
      swiperInstance.slidePrev();
    }
  };

  const handleUpdateSession = async () => {
    if (!initialSession) return;
    const workoutSessionExercises = buildWorkoutSessionExercises(selectedExercises);

    const sessionData = {
      title: sessionName,
      description: sessionDescription,
      exercises: workoutSessionExercises,
      cover_image: selectedCoverImage,
      main_focus: mainFocus,
      difficulty,
      estimated_duration: estimatedDuration
    };
    try {
      await updateWorkoutSession(initialSession.id, sessionData);
      alert('Økten er oppdatert!');
      router.push('/app/training', 'back');
    } catch (error) {
      console.error("Kunne ikke oppdatere økten:", error.message);
    }
  };

  const handleSaveAsNewSession = async () => {
    const workoutSessionExercises = buildWorkoutSessionExercises(selectedExercises);

    const sessionData = {
      title: sessionName,
      description: sessionDescription,
      exercises: workoutSessionExercises,
      cover_image: selectedCoverImage,
      created_by: coach?.id,
      main_focus: mainFocus,
      difficulty,
      estimated_duration: estimatedDuration
    };
    try {
      const newSessionId = await createWorkoutSession(sessionData);
      console.log(newSessionId);
      alert('Ny økt er lagret!');
      router.push('/app/training', 'back');
    } catch (error) {
      console.error("Kunne ikke lagre ny økt:", error.message);
    }
  };

  const handleReorder = (event) => {
    let items = [...selectedExercises];
    const draggedItem = items[event.detail.from];
    if (draggedItem.supersetGroup) {
      const group = items.filter(item => item.supersetGroup === draggedItem.supersetGroup);
      items = items.filter(item => item.supersetGroup !== draggedItem.supersetGroup);
      items.splice(event.detail.to, 0, ...group);
    } else {
      const [removed] = items.splice(event.detail.from, 1);
      items.splice(event.detail.to, 0, removed);
    }
    let newOrder = 1;
    items.forEach((item, index) => {
      if (index > 0 && item.supersetGroup && items[index - 1].supersetGroup === item.supersetGroup) {
        item.order = items[index - 1].order;
      } else {
        item.order = newOrder;
        newOrder++;
      }
    });
    setSelectedExercises(items);
    event.detail.complete();
  };

  const handleRemoveExercise = (exerciseId) => {
    const newSelected = selectedExercises.filter(ex => ex.id !== exerciseId);
    newSelected.forEach((ex, idx) => {
      ex.order = idx + 1;
    });
    newSelected.forEach(ex => {
      const groupItems = newSelected.filter(item => item.supersetGroup === ex.supersetGroup);
      if (ex.supersetGroup && groupItems.length < 2) {
        ex.supersetGroup = null;
      }
    });
    setSelectedExercises(newSelected);
  };

  // Supersett
//   const openSupersetModal = () => {
//     if (selectedExercises.length < 2) {
//       alert("Legg til minst to øvelser for å lage et supersett");
//       return;
//     }
//     setSelectedForSuperset([]);
//     setIsSupersetModalOpen(true);
//   };

  const confirmSupersetGroup = () => {
    if (selectedForSuperset.length < 2) {
      alert("Velg minst to øvelser for et supersett");
      return;
    }
    const exercisesForSuperset = selectedExercises.filter(ex => selectedForSuperset.includes(ex.id));
    const minOrder = Math.min(...exercisesForSuperset.map(ex => ex.order));
    const groupId = uuidv4();
    const updated = selectedExercises.map(ex => {
      if (selectedForSuperset.includes(ex.id)) {
        return { ...ex, supersetGroup: groupId, order: minOrder };
      }
      return ex;
    });
    setSelectedExercises(updated);
    setIsSupersetModalOpen(false);
  };

  const toggleSupersetSelection = (exerciseId) => {
    if (selectedForSuperset.includes(exerciseId)) {
      setSelectedForSuperset(selectedForSuperset.filter(id => id !== exerciseId));
    } else {
      setSelectedForSuperset([...selectedForSuperset, exerciseId]);
    }
  };

  return (
    <>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonButton fill="clear" onClick={onBack} style={{ color: 'white' }}>
              <IonIcon icon={arrowBackOutline} style={{ color: 'black' }}/>
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen>
        <IonItem>
          <IonLabel position="stacked">Økt Navn</IonLabel>
          <IonInput 
            value={sessionName} 
            placeholder="Navn på økten" 
            onIonChange={e => setSessionName(e.detail.value)} 
          />
        </IonItem>
        <IonItem>
          <IonLabel position="stacked">Beskrivelse</IonLabel>
          <IonInput 
            value={sessionDescription} 
            placeholder="Beskrivelse av økten" 
            onIonChange={e => setSessionDescription(e.detail.value)} 
          />
        </IonItem>
        <IonItem>
          <IonLabel position="stacked">Hovedfokus</IonLabel>
          <IonInput 
            value={mainFocus} 
            placeholder="Hovedfokus i økten" 
            onIonChange={e => setMainFocus(e.detail.value)} 
          />
        </IonItem>

        <h2>Valgte Øvelser</h2>
        {selectedExercises.length === 0 ? (
          <p>Ingen øvelser valgt enda.</p>
        ) : (
          <IonReorderGroup onIonItemReorder={handleReorder} disabled={false}>
            {selectedExercises.map((exerciseItem, idx) => {
              const {
                id,
                order,
                name,
                image_url,
                sets,
                //eslint-disable-next-line
                supersetGroup
              } = exerciseItem;

              const countForThisOrder = selectedExercises.filter(e => e.order === order).length;
              const isSuperset = countForThisOrder > 1;
              const repsString = sets.map(s => `${s.planned_reps} reps`).join(', ');
              const styleOverride = isSuperset ? { backgroundColor: 'rgba(0, 123, 255, 0.2)' } : {};

              return (
                <IonItemSliding key={id || idx} className="sliding-list-container">
                  <IonItem className="list-card" style={styleOverride}>
                    <div className="list-img-container-small me-3">
                      <img className="list-img" src={image_url} alt={name} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          fontWeight: 'bold',
                          fontSize: '1.3em',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}
                      >
                        {name}
                      </div>
                      {!!sets.length && (
                        <div
                          style={{
                            color: 'grey',
                            fontSize: '0.9em',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }}
                        >
                          {repsString}
                        </div>
                      )}
                      {isSuperset && (
                        <div style={{ fontSize: '0.8em', color: 'red' }}>
                          Supersett
                        </div>
                      )}
                    </div>
                    <IonReorder slot="end" />
                  </IonItem>
                  <IonItemOptions side="end">
                    <IonItemOption color="danger" onClick={() => handleRemoveExercise(id)}>
                      <IonIcon slot="icon-only" icon={trashOutline} />
                    </IonItemOption>
                  </IonItemOptions>
                </IonItemSliding>
              );
            })}
          </IonReorderGroup>
        )}

        <div className="col-12 d-flex justify-content-center">
          <IonButton className="col-5" onClick={() => setIsExerciseModalOpen(true)}>
            Legg til Øvelse
          </IonButton>
        </div>

        <div className="d-flex flex-column align-items-center">
          <div>Forsidebilde</div>
          <div style={{ display: 'flex', overflowX: 'scroll', padding: '16px' }}>
            {coverImages.map(image => (
              <div
                key={image.id}
                onClick={() => setSelectedCoverImage(image.id)}
                style={{
                  flex: '0 0 auto',
                  marginRight: '8px',
                  border: selectedCoverImage === image.id ? '4px solid var(--ion-color-primary)' : '4px solid transparent',
                  borderRadius: '8px',
                  cursor: 'pointer'
                }}
              >
                <img src={image.image_url} alt={image.name} style={{ height: '150px', borderRadius: '6px' }}/>
              </div>
            ))}
          </div>
        </div>

        <IonModal
          isOpen={isExerciseModalOpen}
          onDidDismiss={() => { setIsExerciseModalOpen(false); setExerciseInEdit(null); }}
          breakpoints={[0, 0.5, 0.9]}
          initialBreakpoint={0.9}
        >
          <IonContent style={{ height: '100%', overflowY: 'auto' }}>
            <Swiper onSwiper={setSwiperInstance} allowSlidePrev={true} allowSlideNext={true} autoHeight={true}>
              <SwiperSlide>
                <div style={{ padding: '16px' }}>
                  <IonSearchbar
                    value={searchText}
                    onIonInput={e => setSearchText(e.detail.value)}
                    placeholder="Søk øvelse..."
                  />
                  <IonItem>
                    <IonLabel>Muskelgruppe</IonLabel>
                    <MuscleSelect selectedMuscle={selectedMuscle} setSelectedMuscle={setSelectedMuscle}/>
                  </IonItem>
                  {loading && <p>Laster øvelser...</p>}
                  {error && <p>Feil: {error}</p>}
                  {!loading && !error && (
                    <IonList>
                      {filteredExercises.map(exercise => (
                        <IonItem
                          className="list-card border-bottom"
                          key={exercise.id}
                          button
                          onClick={() => handleSelectExercise(exercise)}
                        >
                          <div className="list-img-container-small me-3">
                            <img className="list-img" src={exercise.image_url} alt={exercise.name} />
                          </div>
                          <IonLabel>{exercise.name}</IonLabel>
                        </IonItem>
                      ))}
                    </IonList>
                  )}
                </div>
              </SwiperSlide>
              <SwiperSlide>
                <div style={{ padding: '16px' }}>
                  {exerciseInEdit && (
                    <>
                      {exerciseInEdit.image_url && (
                        <img
                          src={exerciseInEdit.image_url}
                          alt={exerciseInEdit.name}
                          style={{ width: '100%', marginBottom: '16px', borderRadius: '5px' }}
                        />
                      )}
                      <h2>{exerciseInEdit.name}</h2>
                      <IonGrid style={{ width: '100%' }}>
                        <IonRow style={{ display: 'flex', alignItems: 'center' }}>
                          <IonCol style={{ flex: 1 }}>
                            <strong>Sett</strong>
                          </IonCol>
                          <IonCol style={{ flex: 1 }}>
                            <strong>Reps</strong>
                          </IonCol>
                          <IonCol style={{ flex: 0.5, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <strong></strong>
                          </IonCol>
                        </IonRow>
                        {exerciseInEdit.sets.map((set, index) => (
                          <IonRow key={index} style={{ display: 'flex', alignItems: 'center', borderBottom: '1px solid lightgray' }}>
                            <IonCol style={{ flex: 1 }}>{set.set_number}</IonCol>
                            <IonCol style={{ flex: 1 }}>
                              <IonInput
                                type="text"
                                value={set.planned_reps}
                                onIonInput={e => handleSetRepsChange(index, e.detail.value)}
                                placeholder="Reps"
                              />
                            </IonCol>
                            <IonCol style={{ flex: 0.5, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <IonIcon icon={trashOutline} onClick={() => removeSet(index)} />
                            </IonCol>
                          </IonRow>
                        ))}
                      </IonGrid>
                      <IonButton onClick={addSet}>Legg til sett</IonButton>
                      <IonItem>
                        <IonLabel position="stacked">Kommentar</IonLabel>
                      </IonItem>
                      <IonButton
                        expand="full"
                        onClick={handleFinishExercise}
                        disabled={!exerciseInEdit.sets[exerciseInEdit.sets.length - 1]?.planned_reps}
                        style={{ marginTop: '16px' }}
                      >
                        Ferdig
                      </IonButton>
                      <IonButton expand="full" onClick={handleBackToList}>
                        Tilbake
                      </IonButton>
                    </>
                  )}
                </div>
              </SwiperSlide>
            </Swiper>
          </IonContent>
        </IonModal>

        <IonModal
          isOpen={isSupersetModalOpen}
          onDidDismiss={() => setIsSupersetModalOpen(false)}
          breakpoints={[0, 0.5, 0.8]}
          initialBreakpoint={0.5}
        >
          <IonContent style={{ padding: '16px' }}>
            <h2>Velg øvelser for supersett</h2>
            <IonList>
              {selectedExercises.map(ex => (
                <IonItem key={ex.id}>
                  <IonLabel>{ex.name}</IonLabel>
                  <IonCheckbox
                    slot="end"
                    checked={selectedForSuperset.includes(ex.id)}
                    onIonChange={() => toggleSupersetSelection(ex.id)}
                  />
                </IonItem>
              ))}
            </IonList>
            <IonButton expand="full" onClick={confirmSupersetGroup}>
              Bekreft Supersett
            </IonButton>
            <IonButton expand="full" onClick={() => setIsSupersetModalOpen(false)}>
              Avbryt
            </IonButton>
          </IonContent>
        </IonModal>

        <div className="col-12 d-flex justify-content-center">
          <IonButton className="col-5" onClick={handleUpdateSession} disabled={!initialSession}>
            Oppdater Økt
          </IonButton>
          <IonButton className="col-5" onClick={handleSaveAsNewSession}>
            Lagre som Ny Økt
          </IonButton>
        </div>
      </IonContent>
    </>
  );
};

export default WorkoutSessionEditer;
