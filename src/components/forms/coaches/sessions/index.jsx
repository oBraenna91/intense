import React, { useState, useEffect } from 'react';
import { 
  IonContent, IonItem, IonLabel, IonInput, IonButton, IonModal, IonList,
  IonGrid, IonRow, IonCol, IonIcon,
  IonSearchbar, IonReorderGroup, IonReorder,
  IonItemSliding, IonItemOption, IonItemOptions,
  IonPage,
  IonHeader,
  IonToolbar,
  IonButtons,
  IonBackButton,
  IonCheckbox,
  useIonRouter,
  IonSpinner
} from '@ionic/react';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import { useExercises } from '../../../../hooks/exercises';
import MuscleSelect from '../../../lists/muscles';
import { trashOutline } from 'ionicons/icons';
import { createWorkoutSession } from '../../../../hooks/sessions';
import { supabase } from '../../../../supabaseClient';
import { useAuth } from '../../../../contexts/auth';
import { v4 as uuidv4 } from 'uuid';
import PauseCircularInput from '../../../lists/timePicker/test';

const WorkoutSessionBuilder = () => {
  const { user, coach } = useAuth();
  const userId = user.id;
  const router = useIonRouter();
  const [createLoading, setCreateLoading] = useState();
  const [sessionName, setSessionName] = useState('');
  const [sessionDescription, setSessionDescription] = useState('');
  const [mainFocus, setMainFocus] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [estimatedDuration, setEstimatedDuration] = useState('');
  const [selectedExercises, setSelectedExercises] = useState([]);
  const [isExerciseModalOpen, setIsExerciseModalOpen] = useState(false);
  const [exerciseInEdit, setExerciseInEdit] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [selectedMuscle, setSelectedMuscle] = useState('');
  const [coverImages, setCoverImages] = useState([]);
  const [selectedCoverImage, setSelectedCoverImage] = useState(null);
  const { exercises: exercisesFromHook, fetchExercises, loading, error } = useExercises(userId);
  const [exercises, setExercises] = useState([]);
  const [swiperInstance, setSwiperInstance] = useState(null);
  const [isSupersetModalOpen, setIsSupersetModalOpen] = useState(false);
  const [selectedForSuperset, setSelectedForSuperset] = useState([]);

  const [pause, setPause] = useState(60);

  useEffect(() => {
    fetchExercises();
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
    if (isExerciseModalOpen && swiperInstance && exerciseInEdit) {
      swiperInstance.slideTo(1);
    }
  }, [isExerciseModalOpen, swiperInstance, exerciseInEdit]);

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

    const newOrder = selectedExercises.length + 1;
    
    setExerciseInEdit({
      ...exercise,
      order: newOrder,
      sets: [{ sett_nr: 1, reps: "" }],
      comment: '',
      supersetGroup: null,
    });
    if (swiperInstance) {
      swiperInstance.slideNext();
    }
  };

  const openEditExistingExercise = (exerciseItem) => {
    const clone = {
      ...exerciseItem,
      sets: exerciseItem.sets.map(s => ({ ...s })),
    };
    setExerciseInEdit(clone);
    setIsExerciseModalOpen(true);
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
    updatedSets.forEach((set, i) => (set.sett_nr = i + 1));
    setExerciseInEdit({ ...exerciseInEdit, sets: updatedSets });
  };

  const handleFinishExercise = () => {
    if (!exerciseInEdit) {
      setIsExerciseModalOpen(false);
      return;
    }
    const idx = selectedExercises.findIndex(ex => ex.id === exerciseInEdit.id && ex.id !== null);
    if (idx >= 0) {
      const newArr = [...selectedExercises];
      newArr[idx] = exerciseInEdit;
      setSelectedExercises(newArr);
    } else {
      setSelectedExercises([...selectedExercises, exerciseInEdit]);
    }
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
    setCreateLoading(true);

    const sessionData = {
      title: sessionName,
      description: sessionDescription,
      exercises: selectedExercises,
      cover_image: selectedCoverImage,
      created_by: coach?.id,
      main_focus: mainFocus,
      pause_timer: pause,
      estimated_duration: estimatedDuration,
      difficulty: difficulty,
    };
    try {
      const workoutSessionId = await createWorkoutSession(sessionData);
      console.log("Treningsøkt lagret med ID:", workoutSessionId);
      alert('Treningsøkten er lagret ✅');
      setCreateLoading(false);
      router.push('/app/training', 'back');
    } catch (error) {
      console.error("Kunne ikke lagre treningsøkt:", error.message);
    }
  };

  const handleReorder = (event) => {
    const items = [...selectedExercises];
    const [movedItem] = items.splice(event.detail.from, 1);
    items.splice(event.detail.to, 0, movedItem);

    items.forEach((ex, index) => {
      ex.order = index + 1;
    });
    setSelectedExercises(items);
    event.detail.complete();
  };

  const handleRemoveExercise = (id) => {
    const newSelected = selectedExercises.filter(ex => ex.id !== id);
    newSelected.forEach((ex, index) => (ex.order = index + 1));
    setSelectedExercises(newSelected);
  };

//   const openSupersetModal = () => {
//     if (selectedExercises.length < 2) {
//       alert("Du må ha minst to øvelser i listen for å lage et supersett.");
//       return;
//     }
//     setSelectedForSuperset([]);
//     setIsSupersetModalOpen(true);
//   };

  const toggleSupersetSelection = (exerciseId) => {
    if (selectedForSuperset.includes(exerciseId)) {
      setSelectedForSuperset(selectedForSuperset.filter(id => id !== exerciseId));
    } else {
      setSelectedForSuperset([...selectedForSuperset, exerciseId]);
    }
  };

  const confirmSupersetGroup = () => {
    if (selectedForSuperset.length < 2) {
      alert("Velg minst to øvelser for et supersett.");
      return;
    }
    const supersetId = uuidv4();
    const chosenExercises = selectedExercises.filter(ex => selectedForSuperset.includes(ex.id));
    const minOrder = Math.min(...chosenExercises.map(ex => ex.order));

    const updated = selectedExercises.map(ex => {
      if (selectedForSuperset.includes(ex.id)) {
        return { ...ex, supersetGroup: supersetId, order: minOrder };
      }
      return ex;
    });

    setSelectedExercises(updated);
    setIsSupersetModalOpen(false);
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref='/app/training' text="Tilbake"/>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      
      <IonContent fullscreen>
        {createLoading && (
            <IonSpinner/>
        )}
        <IonItem>
          <IonLabel position="stacked">Navn</IonLabel>
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
            placeholder="Hvilke muskler er i fokus?" 
            onIonChange={e => setMainFocus(e.detail.value)} 
          />
        </IonItem>

        <h2 className="text-center">Valgte Øvelser</h2>
        {selectedExercises.length === 0 ? (
          <p className="text-center">Ingen øvelser valgt enda.</p>
        ) : (
          <IonReorderGroup onIonItemReorder={handleReorder} disabled={false}>
            {selectedExercises.map((exercise, idx) => {
              const isSuperset = exercise.supersetGroup != null;
              const styleOverride = isSuperset 
                ? { backgroundColor: 'rgba(255, 50, 50, 0.1)' } 
                : {};
              
              return (
                <IonItemSliding key={`${exercise.id}`} className="sliding-list-container">
                  <IonItem 
                    className="list-card" 
                    style={styleOverride}
                    onClick={() => openEditExistingExercise(exercise)}
                  >
                    <div className="list-img-container-small me-3">
                      <img className="list-img" src={exercise.image_url} alt="exercise-img"/>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 'bold', fontSize: '1.3em', whiteSpace: 'nowrap', overflow:'hidden', textOverflow: 'ellipsis' }}>
                        {exercise.name}
                      </div>
                      {exercise.sets && (
                        <div style={{ color: 'grey', fontSize: '0.9em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {exercise.sets.map(set => `${set.reps} reps`).join(', ')}
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
                    <IonItemOption color="danger" onClick={() => handleRemoveExercise(exercise.id)}>
                      <IonIcon slot="icon-only" icon={trashOutline} />
                    </IonItemOption>
                  </IonItemOptions>
                </IonItemSliding>
              );
            })}
          </IonReorderGroup>
        )}
        <div className="col-12 d-flex justify-content-center" style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
          <IonButton className="col-10" onClick={() => setIsExerciseModalOpen(true)}>
            Legg til ny øvelse
          </IonButton>
        </div>
        <div className="d-flex flex-column align-items-center" style={{ marginTop: '24px' }}>
          <div><h2>Forsidebilde</h2></div>
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
                <img 
                  src={image.image_url} 
                  alt={image.name} 
                  style={{ height: '150px', borderRadius: '6px' }}
                />
              </div>
            ))}
          </div>
        </div>

        <IonItem>
            <div className="d-flex flex-column col-12 mt-3 mb-5">
                <div className={`text-center mb-3`}>
                    <h2>Pause-timer</h2>
                </div>
                <PauseCircularInput seconds={pause} onChange={setPause} />
            </div>
        </IonItem>

        <IonItem>
          <IonLabel position="stacked">Estimert varighet</IonLabel>
          <IonInput 
            value={estimatedDuration} 
            placeholder="Hvor lang ish er økta?" 
            onIonChange={e => setEstimatedDuration(e.detail.value)} 
          />
        </IonItem>

        <IonItem>
          <IonLabel position="stacked">Vanskelighetsgrad</IonLabel>
          <IonInput 
            value={difficulty} 
            placeholder="Hvilken vanskelighetsgrad er denne økta?" 
            onIonChange={e => setDifficulty(e.detail.value)} 
          />
        </IonItem>
        <div className="col-12 d-flex flex-column align-items-center justify-content-center mb-5">
          <IonButton 
            className="col-10" 
            onClick={handleCreateSession} 
            disabled={selectedExercises.length === 0}
          >
            Lagre Treningsøkt
          </IonButton>
        </div>
        <IonModal 
          isOpen={isExerciseModalOpen}
          onDidDismiss={() => { 
            setIsExerciseModalOpen(false); 
            setExerciseInEdit(null); 
          }}
          breakpoints={[0, 1]} 
          initialBreakpoint={1}
        >
          <IonContent style={{ height: '100%', overflowY: 'auto' }}>
            <Swiper onSwiper={setSwiperInstance} allowSlidePrev allowSlideNext autoHeight={true}>
              <SwiperSlide>
                <div style={{ padding: '16px' }}>
                  <IonSearchbar
                    value={searchText}
                    onIonInput={e => setSearchText(e.detail.value)}
                    placeholder="Søk øvelse..."
                  />
                  <IonItem> 
                    <IonLabel>Muskelgruppe</IonLabel>
                    <MuscleSelect 
                      selectedMuscle={selectedMuscle} 
                      setSelectedMuscle={setSelectedMuscle}
                    />
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
                            <img className="list-img"
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
                      <h2>{exerciseInEdit.name}</h2>
                      <IonGrid style={{ width: '100%' }}>
                        <IonRow style={{ display:'flex', alignItems: 'center' }}>
                          <IonCol style={{ flex: 1 }}>
                            <strong>Sett</strong>
                          </IonCol>
                          <IonCol style={{ flex: 1 }}>
                            <strong>Reps</strong>
                          </IonCol>
                          <IonCol style={{ flex: 0.5 }} />
                        </IonRow>
                        {exerciseInEdit.sets.map((set, index) => (
                          <IonRow 
                            key={index} 
                            style={{ display:'flex', alignItems: 'center', borderBottom: '1px solid lightgray' }}
                          >
                            <IonCol style={{ flex: 1 }}>{set.sett_nr}</IonCol>
                            <IonCol style={{ flex: 1 }}>
                              <IonInput 
                                type="text"
                                value={set.reps}
                                onIonInput={e => handleSetRepsChange(index, e.detail.value)}
                                placeholder="Reps"
                              />
                            </IonCol>
                            <IonCol 
                              style={{ flex: 0.5, display: 'flex', justifyContent: 'center' }}
                            >
                              <IonIcon 
                                icon={trashOutline} 
                                onClick={() => removeSet(index)}  
                              />
                            </IonCol>
                          </IonRow>
                        ))}
                      </IonGrid>
                      <div className="d-flex col-12 justify-content-center">
                        <IonButton className="col-10" onClick={addSet}>Legg til sett</IonButton>
                      </div>
                      

                      <IonItem>
                        <IonLabel position="stacked">Kommentar til øvelsen</IonLabel>
                        <IonInput 
                          value={exerciseInEdit.comment}
                          placeholder="Skriv kommentar..."
                          onIonChange={e => setExerciseInEdit({ 
                            ...exerciseInEdit, 
                            comment: e.detail.value 
                          })}
                        />
                      </IonItem>
                      
                      <IonButton 
                        expand="full" 
                        onClick={handleFinishExercise} 
                        disabled={!exerciseInEdit?.sets?.[exerciseInEdit.sets.length - 1]?.reps} 
                        style={{ marginTop: '16px' }}
                      >
                        Ferdig
                      </IonButton>
                      <IonButton style={{ '--background': 'lightgray' }} expand="full" onClick={handleBackToList}>
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
      </IonContent>
    </IonPage>
  );
};

export default WorkoutSessionBuilder;
