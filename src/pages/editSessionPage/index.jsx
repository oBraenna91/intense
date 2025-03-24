// import { IonBackButton, IonButton, IonButtons, IonCol, IonContent, IonGrid, IonHeader, IonIcon, IonInput, IonItem, IonItemOption, IonItemOptions, IonItemSliding, IonLabel, IonList, IonModal, IonPage, IonReorder, IonReorderGroup, IonRow, IonSearchbar, IonSpinner, IonToolbar,  } from '@ionic/react';
// import React, { useState, useEffect } from 'react';
// import { useParams } from 'react-router-dom/cjs/react-router-dom.min';
// import { useFetchSession } from '../../hooks/sessions';
// import { useIonRouter } from '@ionic/react';
// import { trashOutline } from 'ionicons/icons';
// import { useExercises } from '../../hooks/exercises';
// import { useAuth } from '../../contexts/auth';
// import { Swiper, SwiperSlide } from 'swiper/react';
// import 'swiper/css';
// import MuscleSelect from '../../components/lists/muscles';
// import { updateWorkoutSession } from '../../hooks/sessions';
// import { supabase } from '../../supabaseClient';
// import PauseCircularSlider from '../../components/lists/timePicker';

// function flattenExercises(workoutSessionExercises) {
//     return workoutSessionExercises.map(ex => {
//       return {
//         id: ex.exercise.id,
//         order: ex.order,
//         comment: ex.comment,
//         exercise_id: ex.exercise?.id,
//         name: ex.exercise.name,
//         image_url: ex.exercise.image_url,
//         sets: ex.workout_session_exercise_sets.map(s => ({
//           id: s.id,
//           planned_reps: s.planned_reps,
//           set_number: s.set_number
//         }))
//       };
//     });
//   }

// export default function UpdateSessionPage() {
//     const { user } = useAuth()
//     const userId = user.id;
//     const { sessionId } = useParams();
//     const {session, loading, error} = useFetchSession(sessionId);
//     const router = useIonRouter();
//     const [sessionName, setSessionName] = useState('');
//     const [sessionDescription, setSessionDescription] = useState('');
//     const [mainFocus, setMainFocus] = useState('');
//     const [selectedExercises, setSelectedExercises] = useState([]);
//     const [isExerciseModalOpen, setIsExerciseModalOpen] = useState(false);
//     const [exerciseInEdit, setExerciseInEdit] = useState(null);
//     const [coverImages, setCoverImages] = useState([]);
//     const [selectedCoverImage, setSelectedCoverImage] = useState(null);
//     const [pause, setPause] = useState(null);
//     const [isLoading, setIsLoading] = useState(false);
    

//     const [searchText, setSearchText] = useState('');
//     const [selectedMuscle, setSelectedMuscle] = useState('');

//     const { exercises: exercisesFromHook, fetchExercises } = useExercises(userId);
//       const [exercises, setExercises] = useState([]);
      
//       // For swiper
//     const [swiperInstance, setSwiperInstance] = useState(null);

//     useEffect(() => {
//     if (session) {
//         console.log(session);
//       setSessionName(session.title || '');
//       setSessionDescription(session.description || '');
//       setMainFocus(session.main_focus || '');
//       setPause(session.pause_timer || null);

//       setSelectedCoverImage(session.cover_image_id || null);
//       const transformedExercises = flattenExercises(session.workout_session_exercises || []);
//       setSelectedExercises(transformedExercises);
//         }
//     }, [session]);

//       const handleReorder = (event) => {
//         const items = [...selectedExercises];
//         const [movedItem] = items.splice(event.detail.from, 1);
//         items.splice(event.detail.to, 0, movedItem);
    
//         // Oppdater 'order' basert på rekkefølgen i array
//         items.forEach((ex, index) => {
//           ex.order = index + 1;
//         });
//         setSelectedExercises(items);
//         event.detail.complete();
//       };

//       const handleRemoveExercise = (exerciseId) => {
//         const filtered = selectedExercises.filter(ex => ex.id !== exerciseId);
//         // Oppdater order
//         filtered.forEach((ex, i) => { ex.order = i + 1; });
//         setSelectedExercises(filtered);
//       };

//       useEffect(() => {
//         const fetchCoverImages = async () => {
//           const { data, error } = await supabase
//             .from('workout_cover_images')
//             .select('*');
//           if (error) {
//             console.error('Feil ved henting av cover-bilder:', error.message);
//           } else {
//             setCoverImages(data);
//           }
//         };
//         fetchCoverImages();
//       }, []);

//       useEffect(() => {
//           fetchExercises();
//           // eslint-disable-next-line
//         }, [userId]);

//     useEffect(() => {
//         setExercises(exercisesFromHook);
//       }, [exercisesFromHook]);

//         useEffect(() => {
//             if (isExerciseModalOpen && swiperInstance && exerciseInEdit) {
//               swiperInstance.slideTo(1);
//             }
//           }, [isExerciseModalOpen, swiperInstance, exerciseInEdit]);
        
//           // Filtrer øvelser basert på søk + muskel
//           const filteredExercises = exercises.filter(ex => {
//             const matchesSearch = ex.name.toLowerCase().includes(searchText.toLowerCase());
//             const matchesMuscle = selectedMuscle 
//               ? ex.exercise_muscles && ex.exercise_muscles.some(em => 
//                   em.muscles && em.muscles.name.toLowerCase() === selectedMuscle.toLowerCase()
//                 )
//               : true;
//             return matchesSearch && matchesMuscle;
//           });

//           const handleSelectExercise = (exercise) => {
//             // Ny øvelse får order = (antall som finnes) + 1
//             const newOrder = selectedExercises.length + 1;
            
//             setExerciseInEdit({
//               ...exercise,
//               exercise_id: exercise.id,
//               order: newOrder,
//               sets: [{ set_number: 1, planned_reps: "" }],
//               comment: '',
//             });
//             if (swiperInstance) {
//               swiperInstance.slideNext();
//             }
//           };
        
//           const openEditExistingExercise = (exerciseItem) => {
//             // Klone for å unngå mutasjoner
//             const clone = {
//               ...exerciseItem,
//               sets: exerciseItem.sets.map(s => ({ ...s })),
//             };
//             setExerciseInEdit(clone);
//             setIsExerciseModalOpen(true);
//           };
        
//           const handleSetRepsChange = (index, newReps) => {
//             setExerciseInEdit(prevExercise => {
//               const updatedSets = [...prevExercise.sets];
//               updatedSets[index] = { ...updatedSets[index], planned_reps: newReps };
//               return { ...prevExercise, sets: updatedSets };
//             });
//           };
          
//           const addSet = () => {
//             setExerciseInEdit(prevExercise => {
//               const newSet = { set_number: prevExercise.sets.length + 1, planned_reps: '' };
//               return { ...prevExercise, sets: [...prevExercise.sets, newSet] };
//             });
//           };
        
//           const removeSet = (index) => {
//             const updatedSets = exerciseInEdit.sets.filter((_, i) => i !== index);
//             updatedSets.forEach((set, i) => (set.set_number = i + 1));
//             setExerciseInEdit({ ...exerciseInEdit, sets: updatedSets });
//           };

//           const handleFinishExercise = () => {
//             if (!exerciseInEdit) {
//               setIsExerciseModalOpen(false);
//               return;
//             }
//             const idx = selectedExercises.findIndex(ex => ex.id === exerciseInEdit.id && ex.id !== null);
//             if (idx >= 0) {
//               // Oppdater
//               const newArr = [...selectedExercises];
//               newArr[idx] = exerciseInEdit;
//               setSelectedExercises(newArr);
//             } else {
//               // Legg til
//               setSelectedExercises([...selectedExercises, exerciseInEdit]);
//             }
//             setExerciseInEdit(null);
//             setIsExerciseModalOpen(false);
//           };
        
//           const handleBackToList = () => {
//             setExerciseInEdit(null);
//             if (swiperInstance) {
//               swiperInstance.slidePrev();
//             }
//           };

//           const handleSaveChanges = async () => {
//             setIsLoading(true);

//             const updatedData = {
//               title: sessionName,
//               description: sessionDescription,
//               cover_image: selectedCoverImage,
//               main_focus: mainFocus,
//               pause_timer: pause,
//               exercises: selectedExercises,
               
//             };
          
//             try {
//                 console.log(updatedData);
//               await updateWorkoutSession(sessionId, updatedData);
//               alert('Økten er oppdatert!');
//               router.push(`/app/session/${sessionId}`, 'back');
//             } catch (error) {
//               console.error('Feil ved oppdatering:', error.message);
//               alert('Noe gikk galt under oppdatering av økten');
//             } finally {
//                 setIsLoading(false);
//             }
//           };

//     if(loading) {
//         <IonSpinner />
//     }

//     if(error) {
//         alert('Oida, noe gikk galt!')
//         router.push(`/app/session/${sessionId}`, 'back');
//     }

//     if (session) {
//         return(
//             <IonPage>
//                 <IonHeader>
//                     <IonToolbar>
//                         <IonButtons slot="start">
//                             <IonBackButton defaultHref={`/app/session/${sessionId}`} />
//                         </IonButtons>
//                     </IonToolbar>
//                 </IonHeader>
//                 <IonContent>
//                     {isLoading && (
//                         <IonSpinner />
//                     )}
//                     <IonItem>
//                         <IonLabel position="stacked">Navn</IonLabel>
//                         <IonInput 
//                             placeholder='Navn på økten'
//                             value={sessionName}
//                             onIonInput={e => setSessionName(e.detail.value)}
//                         />
//                         </IonItem>

//                         <IonItem>
//                         <IonLabel position="stacked">Beskrivelse</IonLabel>
//                         <IonInput
//                             placeholder='Beskrivelse av økten'
//                             value={sessionDescription}
//                             onIonInput={e => setSessionDescription(e.detail.value)}
//                         />
//                         </IonItem>

//                         <IonItem>
//                         <IonLabel position="stacked">Hovedfokus</IonLabel>
//                         <IonInput 
//                             placeholder='Hvilke muskler er i fokus?'
//                             value={mainFocus}
//                             onIonInput={e => setMainFocus(e.detail.value)}
//                         />
//                         </IonItem>
//                         <h2 className="text-center">Valgte øvelser</h2>
//                         <IonReorderGroup disabled={false} onIonItemReorder={handleReorder}>
//                         {selectedExercises
//                             .sort((a, b) => a.order - b.order)
//                             .map((exercise) => (
//                                 <IonItemSliding key={`${exercise.id}`}>
//                                     <IonItem className="col-12" key={exercise.id} onClick={() => openEditExistingExercise(exercise)}>
//                                         <IonLabel>
//                                         <div style={{ fontWeight: 'bold' }}>{exercise.name}</div>
//                                         <div className="sets-container" style={{ fontSize: '0.9em', color: 'gray' }}>
//                                             {exercise.sets.map(set => `${set.planned_reps} reps`).join(', ')}
//                                         </div>
//                                         </IonLabel>
//                                         <IonReorder slot="end" />
//                                     </IonItem> 
//                                     <IonItemOptions side="end">
//                                         <IonItemOption color="danger" onClick={() => handleRemoveExercise(exercise.id)}>
//                                             <IonIcon slot="icon-only" icon={trashOutline} />
//                                         </IonItemOption>
//                                     </IonItemOptions>     
//                                 </IonItemSliding>
//                             ))}
//                         </IonReorderGroup>
//                         <div className="col-12 d-flex justify-content-center">
//                             <IonButton className="col-10" onClick={() => setIsExerciseModalOpen(true)}>
//                                 Legg til ny øvelse
//                             </IonButton>
//                         </div>
//                         <IonItem>
//                             <div className="d-flex flex-column col-12 mt-3 mb-5">
//                                 <div className={`text-center mb-3`}>
//                                     <h2>Pause-timer</h2>
//                                 </div>
//                                 <PauseCircularSlider value={pause} onChange={setPause} />
//                             </div>
//                         </IonItem>

//                         <div className="d-flex flex-column align-items-center" style={{ marginTop: '24px' }}>
//             <div><h2 className="text-center">Forsidebilde</h2></div>
//             <div style={{ display: 'flex', overflowX: 'scroll', padding: '16px' }}>
//               {coverImages.map(image => (
//                 <div 
//                   key={image.id} 
//                   onClick={() => setSelectedCoverImage(image.id)}
//                   style={{
//                     flex: '0 0 auto',
//                     marginRight: '8px',
//                     border: selectedCoverImage === image.id ? '4px solid var(--ion-color-primary)' : '4px solid transparent',
//                     borderRadius: '8px',
//                     cursor: 'pointer'
//                   }}
//                 >
//                   <img 
//                     src={image.image_url} 
//                     alt={image.name} 
//                     style={{ height: '150px', borderRadius: '6px' }}
//                   />
//                 </div>
//               ))}
//             </div>
//           </div>

//                         <div className="col-12 d-flex flex-column align-items-center justify-content-center my-5">
//                             <IonButton 
//                             className="col-10" 
//                             onClick={handleSaveChanges} disabled={selectedExercises.length === 0}
//                             >
//                             Lagre Treningsøkt
//                             </IonButton>
//                         </div>
//                         <IonModal 
//           isOpen={isExerciseModalOpen}
//           onDidDismiss={() => { 
//             setIsExerciseModalOpen(false); 
//             setExerciseInEdit(null); 
//           }}
//           breakpoints={[0,1]} 
//           initialBreakpoint={1}
//         >
//           <IonContent style={{ height: '100%', overflowY: 'auto' }}>
//             <Swiper onSwiper={setSwiperInstance} allowSlidePrev allowSlideNext>
//               {/* Slide 1: Velg øvelse fra liste */}
//               <SwiperSlide>
//                 <div style={{ padding: '16px' }}>
//                   <IonSearchbar
//                     value={searchText}
//                     onIonInput={e => setSearchText(e.detail.value)}
//                     placeholder="Søk øvelse..."
//                   />
//                   <IonItem>
//                     <IonLabel>Muskelgruppe</IonLabel>
//                     <MuscleSelect 
//                       selectedMuscle={selectedMuscle} 
//                       setSelectedMuscle={setSelectedMuscle}
//                     />
//                   </IonItem>
//                   {loading && <p>Laster øvelser...</p>}
//                   {error && <p>Feil: {error}</p>}
//                   {!loading && !error && (
//                     <IonList>
//                       {filteredExercises.map(exercise => (
//                         <IonItem 
//                           className="list-card border-bottom" 
//                           key={exercise.id} 
//                           button 
//                           onClick={() => handleSelectExercise(exercise)}
//                         >
//                           <div className="list-img-container-small me-3">
//                             <img className="list-img"
//                               src={exercise.image_url}
//                               alt="Exercise-img"
//                             />
//                           </div>
//                           <IonLabel>{exercise.name}</IonLabel>
//                         </IonItem>
//                       ))}
//                     </IonList>
//                   )}
//                 </div>
//               </SwiperSlide>
              
//               <SwiperSlide>
//                 <div style={{ padding: '16px' }}>
//                   {exerciseInEdit && (
//                     <>
//                       {/* {exerciseInEdit.image_url && (
//                         <img 
//                           src={exerciseInEdit.image_url} 
//                           alt={exerciseInEdit.name} 
//                           style={{ width: '100%', marginBottom: '16px', borderRadius: '5px' }} 
//                         />
//                       )} */}
//                       <h2>{exerciseInEdit.name}</h2>
//                       <IonGrid style={{ width: '100%' }}>
//                         <IonRow style={{ display:'flex', alignItems: 'center' }}>
//                           <IonCol style={{ flex: 1 }}>
//                             <strong>Sett</strong>
//                           </IonCol>
//                           <IonCol style={{ flex: 1 }}>
//                             <strong>Reps</strong>
//                           </IonCol>
//                           <IonCol style={{ flex: 0.5 }} />
//                         </IonRow>
//                         {exerciseInEdit.sets.map((set, index) => (
//                           <IonRow 
//                             key={index} 
//                             style={{ display:'flex', alignItems: 'center', borderBottom: '1px solid lightgray' }}
//                           >
//                             <IonCol style={{ flex: 1 }}>{set.set_number}</IonCol>
//                             <IonCol style={{ flex: 1 }}>
//                               <IonInput 
//                                 type="text"
//                                 value={set.planned_reps}
//                                 onIonInput={e => handleSetRepsChange(index, e.detail.value)}
//                                 placeholder="Reps"
//                               />
//                             </IonCol>
//                             <IonCol 
//                               style={{ flex: 0.5, display: 'flex', justifyContent: 'center' }}
//                             >
//                               <IonIcon 
//                                 icon={trashOutline} 
//                                 onClick={() => removeSet(index)}  
//                               />
//                             </IonCol>
//                           </IonRow>
//                         ))}
//                       </IonGrid>
//                       <div className="col-12 d-flex justify-content-center">
//                         <IonButton className="col-10" onClick={addSet}>Legg til sett</IonButton>
//                       </div>
                      
//                       <IonItem>
//                         <IonLabel position="stacked">Kommentar</IonLabel>
//                         <IonInput 
//                           value={exerciseInEdit.comment}
//                           placeholder="Skriv kommentar..."
//                           onIonChange={e => setExerciseInEdit({ 
//                             ...exerciseInEdit, 
//                             comment: e.detail.value 
//                           })}
//                         />
//                       </IonItem>
                      
//                       <IonButton 
//                         expand="full" 
//                         onClick={handleFinishExercise} 
//                         disabled={!exerciseInEdit?.sets?.[exerciseInEdit.sets.length - 1]?.planned_reps} 
//                         style={{ marginTop: '16px' }}
//                       >
//                         Ferdig
//                       </IonButton>
//                       <IonButton style={{ '--background': 'lightgray' }} expand="full" onClick={handleBackToList}>
//                         Tilbake
//                       </IonButton>
//                     </>
//                   )}
//                 </div>
//               </SwiperSlide>
//             </Swiper>
//           </IonContent>
//         </IonModal>
//                 </IonContent>
//             </IonPage>
//         )
//     }
// }


import { IonBackButton, IonButton, IonButtons, IonCol, IonContent, IonGrid, IonHeader, IonIcon, IonInput, IonItem, IonItemOption, IonItemOptions, IonItemSliding, IonLabel, IonList, IonModal, IonPage, IonReorder, IonReorderGroup, IonRow, IonSearchbar, IonSpinner, IonToolbar } from '@ionic/react';
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom/cjs/react-router-dom.min';
import { useIonRouter } from '@ionic/react';
import { trashOutline } from 'ionicons/icons';
import { useExercises } from '../../hooks/exercises';
import { useAuth } from '../../contexts/auth';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import MuscleSelect from '../../components/lists/muscles';
import { supabase } from '../../supabaseClient';
import { getSpecificSession, updateWorkoutSession } from '../../hooks/sessions';
import PauseCircularInput from '../../components/lists/timePicker/test';


function flattenExercises(workoutSessionExercises) {
  return workoutSessionExercises.map(ex => ({
    id: ex.exercise.id,
    order: ex.order,
    comment: ex.comment,
    exercise_id: ex.exercise?.id,
    name: ex.exercise.name,
    image_url: ex.exercise.image_url,
    sets: ex.workout_session_exercise_sets.map(s => ({
      id: s.id,
      planned_reps: s.planned_reps,
      set_number: s.set_number
    }))
  }));
}

export default function UpdateSessionPage() {
  const { user } = useAuth();
  const userId = user?.id;
  const { sessionId } = useParams();
  const router = useIonRouter();

  // We'll store the fetched session in local state
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(false);   // local loading state
  const [error, setError] = useState(null);

  // Local states for form fields
  const [sessionName, setSessionName] = useState('');
  const [sessionDescription, setSessionDescription] = useState('');
  const [mainFocus, setMainFocus] = useState('');
  const [selectedExercises, setSelectedExercises] = useState([]);
  const [isExerciseModalOpen, setIsExerciseModalOpen] = useState(false);
  const [exerciseInEdit, setExerciseInEdit] = useState(null);
  const [coverImages, setCoverImages] = useState([]);
  const [selectedCoverImage, setSelectedCoverImage] = useState(null);
  const [pause, setPause] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const selectedImage = coverImages.find(image => image.id === selectedCoverImage);

  // For searching exercises
  const [searchText, setSearchText] = useState('');
  const [selectedMuscle, setSelectedMuscle] = useState('');

  // Exercises from your exercises hook
  const { exercises: exercisesFromHook, fetchExercises } = useExercises(userId);
  const [exercises, setExercises] = useState([]);

  // For swiper
  const [swiperInstance, setSwiperInstance] = useState(null);

  useEffect(() => {
    async function loadSession() {
      if (!sessionId) return;
      setLoading(true);
      setError(null);
      try {
        const data = await getSpecificSession(sessionId);
        setSession(data);
        console.log(data.pause_timer);

        setSessionName(data?.title || '');
        setSessionDescription(data?.description || '');
        setMainFocus(data?.main_focus || '');
        setPause(data.pause_timer);

        setSelectedCoverImage(data?.cover_image?.id || null);

        const transformedExercises = flattenExercises(data?.workout_session_exercises || []);
        setSelectedExercises(transformedExercises);
      } catch (err) {
        console.error('Error fetching session:', err);
        setError(err);
      } finally {
        setLoading(false);
      }
    }

    loadSession();
  }, [sessionId]);

  // 4) Fetch cover images (same logic as before)
  useEffect(() => {
    async function fetchCoverImages() {
      try {
        const { data, error } = await supabase
          .from('workout_cover_images')
          .select('*');
        if (error) throw error;
        setCoverImages(data);
      } catch (err) {
        console.error('Feil ved henting av cover-bilder:', err.message);
      }
    }
    fetchCoverImages();
  }, []);

  // 5) Fetch all exercises for the user (same logic as before)
  useEffect(() => {
    fetchExercises();
  }, [userId, fetchExercises]);

  useEffect(() => {
    setExercises(exercisesFromHook);
  }, [exercisesFromHook]);

  const handleReorder = (event) => {
    const items = [...selectedExercises];
    const [movedItem] = items.splice(event.detail.from, 1);
    items.splice(event.detail.to, 0, movedItem);
    items.forEach((ex, i) => (ex.order = i + 1));
    setSelectedExercises(items);
    event.detail.complete();
  };

  const handleRemoveExercise = (exerciseId) => {
    const filtered = selectedExercises.filter(ex => ex.id !== exerciseId);
    filtered.forEach((ex, i) => (ex.order = i + 1));
    setSelectedExercises(filtered);
  };

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
      exercise_id: exercise.id,
      order: newOrder,
      sets: [{ set_number: 1, planned_reps: '' }],
      comment: ''
    });
    if (swiperInstance) {
      swiperInstance.slideNext();
    }
  };

  const openEditExistingExercise = (exerciseItem) => {
    const clone = {
      ...exerciseItem,
      sets: exerciseItem.sets.map(s => ({ ...s }))
    };
    setExerciseInEdit(clone);
    setIsExerciseModalOpen(true);
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
      const newSet = { set_number: prev.sets.length + 1, planned_reps: '' };
      return { ...prev, sets: [...prev.sets, newSet] };
    });
  };

  const removeSet = (index) => {
    const updatedSets = exerciseInEdit.sets.filter((_, i) => i !== index);
    updatedSets.forEach((set, i) => (set.set_number = i + 1));
    setExerciseInEdit({ ...exerciseInEdit, sets: updatedSets });
  };

  const handleFinishExercise = () => {
    if (!exerciseInEdit) {
      setIsExerciseModalOpen(false);
      return;
    }
    const idx = selectedExercises.findIndex(ex => ex.id === exerciseInEdit.id && ex.id != null);
    if (idx >= 0) {
      // Update existing
      const newArr = [...selectedExercises];
      newArr[idx] = exerciseInEdit;
      setSelectedExercises(newArr);
    } else {
      // Add new
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

  // 6) Instead of calling updateWorkoutSession(...) directly, call updateSession(...) from context
  const handleSaveChanges = async () => {
    setIsSaving(true);

    const updatedData = {
      title: sessionName,
      description: sessionDescription,
      cover_image: selectedCoverImage,
      main_focus: mainFocus,
      pause_timer: pause,
      exercises: selectedExercises
    };

    const updatedDataWithImage = {
      ...updatedData,
      cover_image: {
        id: selectedCoverImage,
        image_url: selectedImage ? selectedImage.image_url : null
      }
    };

    try {
      await updateWorkoutSession(sessionId, updatedData);

      alert('Økten er oppdatert!');
      // Go back to the session detail page
      //router.push(`/app/session/${sessionId}`, 'back');
      //console.log(updatedData);
      router.push({
        pathname: `/app/session/${sessionId}`,
        state: { updatedSession: updatedDataWithImage }
      }, 'back');
    } catch (err) {
      console.error('Feil ved oppdatering:', err.message);
      alert('Noe gikk galt under oppdatering av økten');
    } finally {
      setIsSaving(false);
    }
  };

  // If still "loading" from the first fetch, show a spinner or whatever
  // if (loading) {
  //   return <IonPage><IonContent><IonSpinner /></IonContent></IonPage>;
  // }

  // If error, handle it
  if (error) {
    return (
      <IonPage>
        <IonContent>
          <p>Noe gikk galt: {error.message}</p>
          <IonButton onClick={() => router.push(`/app/session/${sessionId}`, 'back')}>
            Tilbake
          </IonButton>
        </IonContent>
      </IonPage>
    );
  }

  // If session is not loaded (for any reason), you could handle it similarly
  if (!session) {
    return (
      <IonPage>
        <IonContent>
          <p>Finner ikke økt...</p>
        </IonContent>
      </IonPage>
    );
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref={`/app/session/${sessionId}`} />
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        {isSaving && <IonSpinner />}
        {loading && <IonSpinner />}

        <IonItem>
          <IonLabel position="stacked">Navn</IonLabel>
          <IonInput
            placeholder="Navn på økten"
            value={sessionName}
            onIonInput={e => setSessionName(e.detail.value)}
          />
        </IonItem>

        <IonItem>
          <IonLabel position="stacked">Beskrivelse</IonLabel>
          <IonInput
            placeholder="Beskrivelse av økten"
            value={sessionDescription}
            onIonInput={e => setSessionDescription(e.detail.value)}
          />
        </IonItem>

        <IonItem>
          <IonLabel position="stacked">Hovedfokus</IonLabel>
          <IonInput
            placeholder="Hvilke muskler er i fokus?"
            value={mainFocus}
            onIonInput={e => setMainFocus(e.detail.value)}
          />
        </IonItem>

        <h2 className="text-center">Valgte øvelser</h2>
        <IonReorderGroup disabled={false} onIonItemReorder={handleReorder}>
          {selectedExercises
            .sort((a, b) => a.order - b.order)
            .map(exercise => (
              <IonItemSliding key={exercise.id}>
                <IonItem
                  className="col-12"
                  onClick={() => openEditExistingExercise(exercise)}
                >
                  <IonLabel>
                    <div style={{ fontWeight: 'bold' }}>{exercise.name}</div>
                    <div className="sets-container" style={{ fontSize: '0.9em', color: 'gray' }}>
                      {exercise.sets.map(set => `${set.planned_reps} reps`).join(', ')}
                    </div>
                  </IonLabel>
                  <IonReorder slot="end" />
                </IonItem>
                <IonItemOptions side="end">
                  <IonItemOption
                    color="danger"
                    onClick={() => handleRemoveExercise(exercise.id)}
                  >
                    <IonIcon slot="icon-only" icon={trashOutline} />
                  </IonItemOption>
                </IonItemOptions>
              </IonItemSliding>
            ))}
        </IonReorderGroup>

        <div className="col-12 d-flex justify-content-center">
          <IonButton className="col-10" onClick={() => setIsExerciseModalOpen(true)}>
            Legg til ny øvelse
          </IonButton>
        </div>

        <IonItem>
          <div className="d-flex flex-column col-12 mt-3 mb-5">
            <div className="text-center mb-3">
              <h2>Pause-timer</h2>
            </div>
            <PauseCircularInput seconds={pause} onChange={setPause} />
            {/* <PauseCircularSlider value={pause} onChange={setPause} /> */}
          </div>
        </IonItem>

        <div style={{ marginTop: '24px' }}>
            <h2 className="text-center">Forsidebilde</h2>
        </div>
          <div style={{ display: 'flex', overflowX: 'auto', padding: '0 16px 16px 16px' }}>
            {coverImages.map(image => (
              <div
                key={image.id}
                onClick={() => setSelectedCoverImage(image.id)}
                style={{
                  marginRight: '8px',
                  border: selectedCoverImage === image.id
                    ? '4px solid var(--ion-color-primary)'
                    : '4px solid transparent',
                  borderRadius: '8px',
                  cursor: 'pointer'
                }}
              >
                <img
                  src={image.image_url}
                  alt={image.name}
                  style={{ height: '100px', borderRadius: '6px' }}
                />
              </div>
            ))}
          </div>

        <div className="col-12 d-flex flex-column align-items-center justify-content-center my-5">
          <IonButton
            className="col-10"
            onClick={handleSaveChanges}
            disabled={selectedExercises.length === 0}
          >
            Oppdater Treningsøkt
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
            <Swiper onSwiper={setSwiperInstance} allowSlidePrev allowSlideNext>
              {/* Slide 1: Velg øvelse fra liste */}
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
                  {error && <p>Feil: {error.message}</p>}
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
                            <img
                              className="list-img"
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
                        <IonRow style={{ display: 'flex', alignItems: 'center' }}>
                          <IonCol style={{ flex: 1 }}>
                            <strong>Sett</strong>
                          </IonCol>
                          <IonCol style={{ flex: 1 }}>
                            <strong>Reps</strong>
                          </IonCol>
                          <IonCol style={{ flex: 0.5 }} />
                        </IonRow>
                        {exerciseInEdit.sets.map((set, idx) => (
                          <IonRow
                            key={idx}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              borderBottom: '1px solid lightgray'
                            }}
                          >
                            <IonCol style={{ flex: 1 }}>{set.set_number}</IonCol>
                            <IonCol style={{ flex: 1 }}>
                              <IonInput
                                type="text"
                                value={set.planned_reps}
                                onIonInput={e => handleSetRepsChange(idx, e.detail.value)}
                                placeholder="Reps"
                              />
                            </IonCol>
                            <IonCol
                              style={{ flex: 0.5, display: 'flex', justifyContent: 'center' }}
                            >
                              <IonIcon
                                icon={trashOutline}
                                onClick={() => removeSet(idx)}
                              />
                            </IonCol>
                          </IonRow>
                        ))}
                      </IonGrid>

                      <div className="col-12 d-flex justify-content-center">
                        <IonButton className="col-10" onClick={addSet}>Legg til sett</IonButton>
                      </div>

                      <IonItem>
                        <IonLabel position="stacked">Kommentar</IonLabel>
                        <IonInput
                          value={exerciseInEdit.comment}
                          placeholder="Skriv kommentar..."
                          onIonChange={e =>
                            setExerciseInEdit(prev => ({ 
                              ...prev,
                              comment: e.detail.value
                            }))
                          }
                        />
                      </IonItem>

                      <IonButton
                        expand="full"
                        onClick={handleFinishExercise}
                        disabled={!exerciseInEdit.sets[exerciseInEdit.sets.length - 1]?.planned_reps}
                        style={{ marginTop: '16px' }}
                      >
                        Ferdig
                      </IonButton>
                      <IonButton
                        style={{ '--background': 'lightgray' }}
                        expand="full"
                        onClick={handleBackToList}
                      >
                        Tilbake
                      </IonButton>
                    </>
                  )}
                </div>
              </SwiperSlide>
            </Swiper>
          </IonContent>
        </IonModal>
      </IonContent>
    </IonPage>
  );
}
