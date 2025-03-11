import React, { useState, useEffect } from 'react';
import { 
  IonContent, IonItem, IonLabel, IonInput, IonButton, IonModal, IonList,
  IonGrid, IonRow, IonCol, IonIcon,
  IonSearchbar, IonReorderGroup, IonReorder,
  IonItemSliding, IonItemOption, IonItemOptions
} from '@ionic/react';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import { useExercises } from '../../../../hooks/exercises';
import MuscleSelect from '../../../lists/muscles';
import { trashOutline } from 'ionicons/icons';
import { createWorkoutSession } from '../../../../hooks/sessions';

const WorkoutSessionBuilder = ({ userId }) => {
  const [sessionName, setSessionName] = useState('');
  const [sessionDescription, setSessionDescription] = useState('');
  const [selectedExercises, setSelectedExercises] = useState([]);
  const [isExerciseModalOpen, setIsExerciseModalOpen] = useState(false);
  const [exerciseInEdit, setExerciseInEdit] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [selectedMuscle, setSelectedMuscle] = useState('');

  const { exercises: exercisesFromHook, fetchExercises, loading, error } = useExercises(userId);
  const [exercises, setExercises] = useState([]);

  const [swiperInstance, setSwiperInstance] = useState(null);

  useEffect(() => {
    fetchExercises();
    // eslint-disable-next-line
  }, [userId]);

  useEffect(() => {
    setExercises(exercisesFromHook);
  }, [exercisesFromHook]);

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
      ...exercise,
      order: selectedExercises.length + 1,
      sets: [{ sett_nr: 1, reps: "" }], 
      comment: ''
    });
    if (swiperInstance) {
      swiperInstance.slideNext();
    }
  };

  const handleSetRepsChange = (index, newReps) => {
    setExerciseInEdit(prevExercise => {
      const updatedSets = [...prevExercise.sets];
      updatedSets[index] = { ...updatedSets[index], reps: newReps };
      return { ...prevExercise, sets: updatedSets };
    });
  };
  
  const addSet = () => {
    setExerciseInEdit(prevExercise => {
      const newSet = { sett_nr: prevExercise.sets.length + 1, reps: '' };
      return { ...prevExercise, sets: [...prevExercise.sets, newSet] };
    });
  };

  const removeSet = (index) => {
    const updatedSets = exerciseInEdit.sets.filter((_, i) => i !== index);
    updatedSets.forEach((set, i) => set.sett_nr = i + 1);
    setExerciseInEdit({ ...exerciseInEdit, sets: updatedSets });
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

  const handleCreateSession = async () => {
    const sessionData = {
      title: sessionName,
      description: sessionDescription,
      exercises: selectedExercises
    };
    try {
      const workoutSessionId = await createWorkoutSession(sessionData);
      console.log("Treningsøkt lagret med ID:", workoutSessionId);
      alert('Treningsøkten er lagret ✅')
    } catch (error) {
      console.error("Kunne ikke lagre treningsøkt:", error.message);
    }
  };

  const handleReorder = (event) => {
    const items = Array.from(selectedExercises);
    const [removed] = items.splice(event.detail.from, 1);
    items.splice(event.detail.to, 0, removed);
    items.forEach((exercise, index) => {
      exercise.order = index + 1;
    });
    setSelectedExercises(items);
    event.detail.complete();
  }

  return (
    <>
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
    
      <h2>Valgte Øvelser</h2>
      {selectedExercises.length === 0 ? (
        <p>Ingen øvelser valgt enda.</p>
      ) : (
        <IonReorderGroup onIonItemReorder={handleReorder} disabled={false}>
                {selectedExercises.map(exercise => (
                    <IonItemSliding key={exercise.id} className={`sliding-list-container`}>
                        <IonItem className={`list-card`} key={exercise.id}>
                            <div className={`list-img-container-small me-3`}>
                                <img className={`list-img`} src={exercise.image_url} alt="exercise-img"/>
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: 'bold', fontSize: '1.3em', whiteSpace: 'nowrap', 
                                    overflow:'hidden', textOverflow: 'ellipsis' }}>
                                {exercise.name}
                                </div>
                                {exercise.sets && (
                                <div style={{ 
                                    color: 'grey', 
                                    fontSize: '0.9em', 
                                    whiteSpace: 'nowrap', 
                                    overflow: 'hidden', 
                                    textOverflow: 'ellipsis' 
                                }}>
                                    {exercise.sets.map(set => `${set.reps} reps`).join(', ')}
                                </div>
                                )}
                            </div>
                            {/* <IonButton 
                                fill="clear" 
                                color="danger" 
                                onClick={() => setSelectedExercises(selectedExercises.filter(ex => ex.id !== exercise.id))}
                            >
                                <IonIcon icon={trashOutline} />
                            </IonButton> */}
                            <IonReorder slot="end" />
                        </IonItem>
                        <IonItemOptions side="end">
                            <IonItemOption color="danger" onClick={() => setSelectedExercises(selectedExercises.filter(ex => ex.id !== exercise.id))}>
                                <IonIcon slot="icon-only" icon={trashOutline} />
                            </IonItemOption>
                        </IonItemOptions>
                    </IonItemSliding>
                ))}
        </IonReorderGroup>
      )}

      <div className="col-12 d-flex justify-content-center">
        <IonButton className="col-10" onClick={() => setIsExerciseModalOpen(true)}>
            Legg til Øvelse
        </IonButton>
      </div>

      <div className="col-12 d-flex justify-content-center">
        <IonButton className="col-10" onClick={handleCreateSession} disabled={selectedExercises.length === 0}>
            Lagre Treningsøkt
        </IonButton>
      </div>
      
      <IonModal 
        isOpen={isExerciseModalOpen}
        onDidDismiss={() => { setIsExerciseModalOpen(false); setExerciseInEdit(null); }}
        breakpoints={[0, 0.5, 1]} 
        initialBreakpoint={1}
      >
        <IonContent style={{ height: '100%', overflowY: 'auto' }}>
        <Swiper onSwiper={setSwiperInstance} allowSlidePrev={true} allowSlideNext={true}>
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
                      <IonItem className={`list-card border-bottom`} key={exercise.id} button onClick={() => handleSelectExercise(exercise)}>
                        <div className={`list-img-container-small me-3`}>
                            <img className={`list-img`}
                              src={exercise.image_url}
                              alt="Exercise-img"
                            />
                            
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
                    {exerciseInEdit.image_path && (
                      <img 
                        src={exerciseInEdit.image_url} 
                        alt={exerciseInEdit.name} 
                        style={{ width: '100%', marginBottom: '16px', borderRadius: '5px' }} 
                      />
                    )}
                    <h2>{exerciseInEdit.name}</h2>
                    <IonGrid style={{ width: '100%' }}>
                      <IonRow style={{ display:'flex', alignItems: 'center' }}>
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
                        <IonRow key={index} style={{ display:'flex', alignItems: 'center', borderBottom: '1px solid lightgray' }}>
                          <IonCol style={{ flex: 1 }}>{set.sett_nr}</IonCol>
                          <IonCol style={{ flex: 1 }}>
                            <IonInput 
                              type="text"
                              value={set.reps}
                              onIonChange={e => handleSetRepsChange(index, e.detail.value)}
                              placeholder="Reps"
                            />
                          </IonCol>
                          <IonCol style={{ flex: 0.5, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <IonIcon icon={trashOutline} onClick={() => removeSet(index)}  />
                          </IonCol>
                        </IonRow>
                      ))}
                    </IonGrid>
                    <IonButton onClick={addSet}>Legg til sett</IonButton>
                    <IonItem>
                      <IonLabel position="stacked">Kommentar</IonLabel>
                      <IonInput 
                        value={exerciseInEdit.comment}
                        placeholder="Skriv kommentar..."
                        onIonChange={e => setExerciseInEdit({ ...exerciseInEdit, comment: e.detail.value })}
                      />
                    </IonItem>
                    <IonButton expand="full" onClick={handleFinishExercise} style={{ marginTop: '16px' }}>
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
    </>
  );
};

export default WorkoutSessionBuilder;
