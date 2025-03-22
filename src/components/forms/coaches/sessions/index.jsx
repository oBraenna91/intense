// import React, { useState, useEffect } from 'react';
// import { 
//   IonContent, IonItem, IonLabel, IonInput, IonButton, IonModal, IonList,
//   IonGrid, IonRow, IonCol, IonIcon,
//   IonSearchbar, IonReorderGroup, IonReorder,
//   IonItemSliding, IonItemOption, IonItemOptions,
//   IonPage,
//   IonHeader,
//   IonToolbar,
//   IonButtons,
//   IonBackButton,
//   IonCheckbox,
//   useIonRouter
// } from '@ionic/react';
// import { Swiper, SwiperSlide } from 'swiper/react';
// import 'swiper/css';
// import { useExercises } from '../../../../hooks/exercises';
// import MuscleSelect from '../../../lists/muscles';
// import { trashOutline } from 'ionicons/icons';
// import { createWorkoutSession } from '../../../../hooks/sessions';
// import { supabase } from '../../../../supabaseClient';
// import { useAuth } from '../../../../contexts/auth';
// import { v4 as uuidv4 } from 'uuid';

// const WorkoutSessionBuilder = ({ initialSession }) => {
//   const { user, coach } = useAuth();
//   const userId = user.id;
//   const router = useIonRouter();
//   const [sessionName, setSessionName] = useState('');
//   const [sessionDescription, setSessionDescription] = useState('');
//   const [selectedExercises, setSelectedExercises] = useState([]);
//   const [isExerciseModalOpen, setIsExerciseModalOpen] = useState(false);
//   const [exerciseInEdit, setExerciseInEdit] = useState(null);
//   const [searchText, setSearchText] = useState('');
//   const [selectedMuscle, setSelectedMuscle] = useState('');
//   const [coverImages, setCoverImages] = useState([]);
//   const [selectedCoverImage, setSelectedCoverImage] = useState(null);
//   const [mainFocus, setMainFocus] = useState('');
  
//   // NY: Modal for superset-gruppering
//   const [isSupersetModalOpen, setIsSupersetModalOpen] = useState(false);
//   const [selectedForSuperset, setSelectedForSuperset] = useState([]);
  
//   const { exercises: exercisesFromHook, fetchExercises, loading, error } = useExercises(userId);
//   const [exercises, setExercises] = useState([]);
//   const [swiperInstance, setSwiperInstance] = useState(null);

//   const [isSupersetMode, setIsSupersetMode] = useState(false);

//   useEffect(() => {
//     fetchExercises();
//     // eslint-disable-next-line
//   }, [userId]);

//   useEffect(() => {
//     setExercises(exercisesFromHook);
//   }, [exercisesFromHook]);

//   useEffect(() => {
//     const fetchCoverImages = async () => {
//       const { data, error } = await supabase
//         .from('workout_cover_images')
//         .select('*');
//       if (error) {
//         console.error('Feil ved henting av cover-bilder:', error.message);
//       } else {
//         setCoverImages(data);
//       }
//     };
//     fetchCoverImages();
//   }, []);

//   useEffect(() => {
//     if (isExerciseModalOpen && swiperInstance && exerciseInEdit) {
//       swiperInstance.slideTo(1);
//     }
//     // If you also want to make sure it goes back to slide 0 when no exercise is in edit,
//     // you could do something like:
//     // else if (isExerciseModalOpen && swiperInstance && !exerciseInEdit) {
//     //   swiperInstance.slideTo(0);
//     // }
//   }, [isExerciseModalOpen, swiperInstance, exerciseInEdit]);

//   const filteredExercises = exercises.filter(ex => {
//     const matchesSearch = ex.name.toLowerCase().includes(searchText.toLowerCase());
//     const matchesMuscle = selectedMuscle 
//       ? ex.exercise_muscles && ex.exercise_muscles.some(em => 
//           em.muscles && em.muscles.name.toLowerCase() === selectedMuscle.toLowerCase()
//         )
//       : true;
//     return matchesSearch && matchesMuscle;
//   });

//   const handleSelectExercise = (exercise) => {
//     // Forenklet
//     let newOrder = selectedExercises.length + 1;
//     if (isSupersetMode && selectedExercises.length > 0) {
//       // Finn order til siste øvelse
//       newOrder = selectedExercises[selectedExercises.length - 1].order;
//     }
  
//     setExerciseInEdit({
//       ...exercise,
//       order: newOrder,
//       sets: [{ sett_nr: 1, reps: "" }],
//       comment: '',
//       supersetGroup: null,
//     });
  
//     // Bytt slide i Swiper
//     if (swiperInstance) {
//       swiperInstance.slideNext();
//     }
//   };

//   const openEditExistingExercise = (exerciseItem) => {
//     // Clone to avoid mutating the original object
//     const clone = {
//       ...exerciseItem,
//       sets: exerciseItem.sets.map(s => ({ ...s })),
//     };
//     setExerciseInEdit(clone);
//     setIsExerciseModalOpen(true);
//     // Don’t call swiperInstance.slideTo(1) here directly.
//     // Instead let the useEffect above do it once the modal + swiper are ready.
//   };

//   const handleSetRepsChange = (index, newReps) => {
//     setExerciseInEdit(prevExercise => {
//       const updatedSets = [...prevExercise.sets];
//       updatedSets[index] = { ...updatedSets[index], reps: newReps };
//       return { ...prevExercise, sets: updatedSets };
//     });
//   };
  
//   const addSet = () => {
//     setExerciseInEdit(prevExercise => {
//       const newSet = { sett_nr: prevExercise.sets.length + 1, reps: '' };
//       return { ...prevExercise, sets: [...prevExercise.sets, newSet] };
//     });
//   };

//   const removeSet = (index) => {
//     const updatedSets = exerciseInEdit.sets.filter((_, i) => i !== index);
//     updatedSets.forEach((set, i) => set.sett_nr = i + 1);
//     setExerciseInEdit({ ...exerciseInEdit, sets: updatedSets });
//   };

// //   const handleFinishExercise = () => {
// //     // Legger øvelsen til den midlertidige lista
// //     setSelectedExercises([...selectedExercises, exerciseInEdit]);
// //     setExerciseInEdit(null);
// //     setIsExerciseModalOpen(false);
// //   };

//   const handleBackToList = () => {
//     setExerciseInEdit(null);
//     if (swiperInstance) {
//       swiperInstance.slidePrev();
//     }
//   };

// const handleFinishExercise = () => {
//     if (!exerciseInEdit) {
//       setIsExerciseModalOpen(false);
//       return;
//     }

//     // Sjekk om dette er en eksisterende øvelse i selectedExercises
//     const idx = selectedExercises.findIndex(ex => ex.id === exerciseInEdit.id && ex.id !== null);
//     if (idx >= 0) {
//       // Oppdater den eksisterende
//       const newArr = [...selectedExercises];
//       newArr[idx] = exerciseInEdit;
//       setSelectedExercises(newArr);
//     } else {
//       // Legg til som ny
//       setSelectedExercises([...selectedExercises, exerciseInEdit]);
//     }

//     setExerciseInEdit(null);
//     setIsExerciseModalOpen(false);
//   };

//   const handleCreateSession = async () => {
//     const sessionData = {
//       title: sessionName,
//       description: sessionDescription,
//       exercises: selectedExercises,
//       cover_image: selectedCoverImage,
//       created_by: coach?.id,
//       main_focus: mainFocus,
//     };
//     try {
//       const workoutSessionId = await createWorkoutSession(sessionData);
//       console.log("Treningsøkt lagret med ID:", workoutSessionId);
//       alert('Treningsøkten er lagret ✅');
//       router.push('/app/training', 'back');
//     } catch (error) {
//       console.error("Kunne ikke lagre treningsøkt:", error.message);
//     }
//   };

//   const handleReorder = (event) => {
//     let items = [...selectedExercises];
//     const draggedItem = items[event.detail.from];
//     if (draggedItem.supersetGroup) {
//       const group = items.filter(item => item.supersetGroup === draggedItem.supersetGroup);
//       items = items.filter(item => item.supersetGroup !== draggedItem.supersetGroup);
//       items.splice(event.detail.to, 0, ...group);
//     } else {
//       const [removed] = items.splice(event.detail.from, 1);
//       items.splice(event.detail.to, 0, removed);
//     }
//     let newOrder = 1;
//     items.forEach((item, index) => {
//       if (index > 0 && item.supersetGroup && items[index-1].supersetGroup === item.supersetGroup) {
//         item.order = items[index-1].order;
//       } else {
//         item.order = newOrder;
//         newOrder++;
//       }
//     });
//     setSelectedExercises(items);
//     event.detail.complete();
//   };
  

//   // Fjerner en øvelse og re-kalkulerer order
//   const handleRemoveExercise = (id) => {
//     const newSelected = selectedExercises.filter(ex => ex.id !== id);
//     newSelected.forEach((ex, index) => ex.order = index + 1);
//     // Dersom en superset-gruppe nå bare har én øvelse, fjern gruppetilknytningen
//     newSelected.forEach(ex => {
//       const groupItems = newSelected.filter(item => item.supersetGroup === ex.supersetGroup);
//       if (ex.supersetGroup && groupItems.length < 2) {
//         ex.supersetGroup = null;
//       }
//     });
//     setSelectedExercises(newSelected);
//   };

//   // --- NY: Supersett-gruppering ---
//   // Åpner en modal hvor coachen kan velge hvilke øvelser (fra selectedExercises) som skal inngå i et supersett
// //   const openSupersetModal = () => {
// //     if (selectedExercises.length < 2) {
// //       alert("Legg til minst to øvelser for å lage et supersett");
// //       return;
// //     }
// //     setSelectedForSuperset([]); // tøm eventuell tidligere seleksjon
// //     setIsSupersetModalOpen(true);
// //   };

//   // Bekreft superset-valg: Generer en gruppe-ID og oppdater alle valgte øvelser
//   const confirmSupersetGroup = () => {
//     if (selectedForSuperset.length < 2) {
//       alert("Velg minst to øvelser for et supersett");
//       return;
//     }
//     const exercisesForSuperset = selectedExercises.filter(ex => selectedForSuperset.includes(ex.id));
//     const minOrder = Math.min(...exercisesForSuperset.map(ex => ex.order));
//     const groupId = uuidv4();
//     const updatedExercises = selectedExercises.map(ex => {
//       if (selectedForSuperset.includes(ex.id)) {
//         // Sett både supersetGroup og gjør order lik den laveste verdien
//         return { ...ex, supersetGroup: groupId, order: minOrder };
//       }
//       return ex;
//     });
//     setSelectedExercises(updatedExercises);
//     setIsSupersetModalOpen(false);
//   };

//   // Toggle seleksjon for superset i modal
//   const toggleSupersetSelection = (exerciseId) => {
//     if (selectedForSuperset.includes(exerciseId)) {
//       setSelectedForSuperset(selectedForSuperset.filter(id => id !== exerciseId));
//     } else {
//       setSelectedForSuperset([...selectedForSuperset, exerciseId]);
//     }
//   };

//   return (
//     <IonPage>
//       <IonHeader>
//         <IonToolbar>
//           <IonButtons slot="start">
//             <IonBackButton defaultHref='/app/training' />
//           </IonButtons>
//         </IonToolbar>
//       </IonHeader>
//       <IonContent fullscreen>
//         <IonItem>
//           <IonLabel position="stacked">Økt Navn</IonLabel>
//           <IonInput 
//             value={sessionName} 
//             placeholder="Navn på økten" 
//             onIonChange={e => setSessionName(e.detail.value)} 
//           />
//         </IonItem>
//         <IonItem>
//           <IonLabel position="stacked">Beskrivelse</IonLabel>
//           <IonInput 
//             value={sessionDescription} 
//             placeholder="Beskrivelse av økten" 
//             onIonChange={e => setSessionDescription(e.detail.value)} 
//           />
//         </IonItem>
//         <IonItem>
//           <IonLabel position="stacked">Hovedfokus</IonLabel>
//           <IonInput 
//             value={mainFocus} 
//             placeholder="Hovedfokus i økten" 
//             onIonChange={e => setMainFocus(e.detail.value)} 
//           />
//         </IonItem>
      
//         <h2>Valgte Øvelser</h2>
//         {selectedExercises.length === 0 ? (
//           <p>Ingen øvelser valgt enda.</p>
//         ) : (
//           <IonReorderGroup onIonItemReorder={handleReorder} disabled={false}>
//             {selectedExercises.map((exercise, idx) => {
//                 const countForThisOrder = selectedExercises.filter(e => e.order === exercise.order).length;
//                 const isSuperset = countForThisOrder > 1;
//               // Sjekk om øvelsen tilhører et superset og gi en annen bakgrunn
//               const styleOverride = exercise.supersetGroup 
//                 ? { backgroundColor: 'rgba(0, 123, 255, 0.2)' }
//                 : {};
//               return (
//                 <IonItemSliding key={`${exercise.id}+${idx}` || idx} className="sliding-list-container">
//                   <IonItem className="list-card" style={styleOverride} onClick={() => openEditExistingExercise(exercise)}>
//                     <div className="list-img-container-small me-3">
//                       <img className="list-img" src={exercise.image_url} alt="exercise-img"/>
//                     </div>
//                     <div style={{ flex: 1 }}>
//                       <div style={{ fontWeight: 'bold', fontSize: '1.3em', whiteSpace: 'nowrap', overflow:'hidden', textOverflow: 'ellipsis' }}>
//                         {exercise.name}
//                       </div>
//                       {exercise.sets && (
//                         <div style={{ color: 'grey', fontSize: '0.9em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
//                           {exercise.sets.map(set => `${set.reps} reps`).join(', ')}
//                         </div>
//                       )}
//                       {isSuperset && (
//                         <div style={{ fontSize: '0.8em', color: 'red' }}>
//                           Supersett
//                         </div>
//                       )}
//                     </div>
//                     <IonReorder slot="end" />
//                   </IonItem>
//                   <IonItemOptions side="end">
//                     <IonItemOption color="danger" onClick={() => handleRemoveExercise(exercise.id)}>
//                       <IonIcon slot="icon-only" icon={trashOutline} />
//                     </IonItemOption>
//                   </IonItemOptions>
//                 </IonItemSliding>
//               );
//             })}
//           </IonReorderGroup>
//         )}

//         {/* <div className="col-12 d-flex justify-content-center">
//           <IonButton className="col-5" onClick={() => setIsExerciseModalOpen(true)}>
//             Legg til Øvelse
//           </IonButton>
//           <IonButton className="col-5" onClick={openSupersetModal}>
//             Lag Supersett
//           </IonButton>
//         </div> */}
//         {selectedExercises.length === 0 ? (
//   <IonButton onClick={() => {
//     setIsSupersetMode(false);
//     setIsExerciseModalOpen(true);
//   }}>
//     Legg til ny øvelse
//   </IonButton>
// ) : (
//   <div style={{ display: 'flex', gap: '8px' }}>
//     <IonButton onClick={() => {
//       setIsSupersetMode(false);
//       setIsExerciseModalOpen(true);
//     }}>
//       Legg til ny øvelse
//     </IonButton>
//     <IonButton onClick={() => {
//       setIsSupersetMode(true);
//       setIsExerciseModalOpen(true);
//     }}>
//       Legg til supersett
//     </IonButton>
//   </div>
// )}


//         <div className="d-flex flex-column align-items-center">
//           <div>Forsidebilde</div>
//           <div style={{ display: 'flex', overflowX: 'scroll', padding: '16px' }}>
//             {coverImages.map(image => (
//               <div 
//                 key={image.id} 
//                 onClick={() => setSelectedCoverImage(image.id)}
//                 style={{
//                   flex: '0 0 auto',
//                   marginRight: '8px',
//                   border: selectedCoverImage === image.id ? '4px solid var(--ion-color-primary)' : '4px solid transparent',
//                   borderRadius: '8px',
//                   cursor: 'pointer'
//                 }}
//               >
//                 <img src={image.image_url} alt={image.name} style={{ height: '150px', borderRadius: '6px' }}/>
//               </div>
//             ))}
//           </div>
//         </div>

//         <div className="col-12 d-flex flex-column align-items-center justify-content-center">
//           <IonButton className="col-10" onClick={handleCreateSession} disabled={selectedExercises.length === 0}>
//             Lagre Treningsøkt
//           </IonButton>
//         </div>
        
//         {/* Modal for å legge til en øvelse */}
//         <IonModal 
//           isOpen={isExerciseModalOpen}
//           onDidDismiss={() => { setIsExerciseModalOpen(false); setExerciseInEdit(null); }}
//           breakpoints={[0, 0.5, 0.9]} 
//           initialBreakpoint={0.9}
//         >
//           <IonContent style={{ height: '100%', overflowY: 'auto' }}>
//             <Swiper onSwiper={setSwiperInstance} allowSlidePrev={true} allowSlideNext={true}>
//               <SwiperSlide>
//                 <div style={{ padding: '16px' }}>
//                   <IonSearchbar
//                     value={searchText}
//                     onIonInput={e => setSearchText(e.detail.value)}
//                     placeholder="Søk øvelse..."
//                   />
//                   <IonItem>
//                     <IonLabel>Muskelgruppe</IonLabel>
//                     <MuscleSelect selectedMuscle={selectedMuscle} setSelectedMuscle={setSelectedMuscle}/>
//                   </IonItem>
//                   {loading && <p>Laster øvelser...</p>}
//                   {error && <p>Feil: {error}</p>}
//                   {!loading && !error && (
//                     <IonList>
//                       {filteredExercises.map(exercise => (
//                         <IonItem className="list-card border-bottom" key={exercise.id} button onClick={() => handleSelectExercise(exercise)}>
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
//                       {exerciseInEdit.image_path && (
//                         <img 
//                           src={exerciseInEdit.image_url} 
//                           alt={exerciseInEdit.name} 
//                           style={{ width: '100%', marginBottom: '16px', borderRadius: '5px' }} 
//                         />
//                       )}
//                       <h2>{exerciseInEdit.name}</h2>
//                       <IonGrid style={{ width: '100%' }}>
//                         <IonRow style={{ display:'flex', alignItems: 'center' }}>
//                           <IonCol style={{ flex: 1 }}>
//                             <strong>Sett</strong>
//                           </IonCol>
//                           <IonCol style={{ flex: 1 }}>
//                             <strong>Reps</strong>
//                           </IonCol>
//                           <IonCol style={{ flex: 0.5, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
//                             <strong></strong>
//                           </IonCol>
//                         </IonRow>
//                         {exerciseInEdit.sets.map((set, index) => (
//                           <IonRow key={index} style={{ display:'flex', alignItems: 'center', borderBottom: '1px solid lightgray' }}>
//                             <IonCol style={{ flex: 1 }}>{set.sett_nr}</IonCol>
//                             <IonCol style={{ flex: 1 }}>
//                               <IonInput 
//                                 type="text"
//                                 value={set.reps}
//                                 onIonInput={e => handleSetRepsChange(index, e.detail.value)}
//                                 placeholder="Reps"
//                               />
//                             </IonCol>
//                             <IonCol style={{ flex: 0.5, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
//                               <IonIcon icon={trashOutline} onClick={() => removeSet(index)}  />
//                             </IonCol>
//                           </IonRow>
//                         ))}
//                       </IonGrid>
//                       <IonButton onClick={addSet}>Legg til sett</IonButton>
//                       <IonItem>
//                         <IonLabel position="stacked">Kommentar</IonLabel>
//                         <IonInput 
//                           value={exerciseInEdit.comment}
//                           placeholder="Skriv kommentar..."
//                           onIonChange={e => setExerciseInEdit({ ...exerciseInEdit, comment: e.detail.value })}
//                         />
//                       </IonItem>
//                       <IonButton expand="full" onClick={handleFinishExercise} disabled={!exerciseInEdit?.sets[exerciseInEdit.sets.length - 1]?.reps} style={{ marginTop: '16px' }}>
//                         Ferdig
//                       </IonButton>
//                       <IonButton expand="full" onClick={handleBackToList}>
//                         Tilbake
//                       </IonButton>
//                     </>
//                   )}
//                 </div>
//               </SwiperSlide>
//             </Swiper>
//           </IonContent>
//         </IonModal>
        
//         {/* NY: Modal for å velge hvilke øvelser som skal inngå i et supersett */}
//         <IonModal
//           isOpen={isSupersetModalOpen}
//           onDidDismiss={() => setIsSupersetModalOpen(false)}
//           breakpoints={[0, 0.5, 0.8]}
//           initialBreakpoint={0.5}
//         >
//           <IonContent style={{ padding: '16px' }}>
//             <h2>Velg øvelser for supersett</h2>
//             <IonList>
//               {selectedExercises.map(ex => (
//                 <IonItem key={ex.id}>
//                   <IonLabel>{ex.name}</IonLabel>
//                   <IonCheckbox 
//                     slot="end" 
//                     checked={selectedForSuperset.includes(ex.id)}
//                     onIonChange={() => toggleSupersetSelection(ex.id)}
//                   />
//                 </IonItem>
//               ))}
//             </IonList>
//             <IonButton expand="full" onClick={confirmSupersetGroup}>
//               Bekreft Supersett
//             </IonButton>
//             <IonButton expand="full" onClick={() => setIsSupersetModalOpen(false)}>
//               Avbryt
//             </IonButton>
//           </IonContent>
//         </IonModal>
        
//       </IonContent>
//     </IonPage>
//   );
// };

// export default WorkoutSessionBuilder;


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
  
  // Info om økta
  const [sessionName, setSessionName] = useState('');
  const [sessionDescription, setSessionDescription] = useState('');
  const [mainFocus, setMainFocus] = useState('');

  // Valgte øvelser i selve økta
  const [selectedExercises, setSelectedExercises] = useState([]);

  // Modal for å legge til eller redigere én enkelt øvelse
  const [isExerciseModalOpen, setIsExerciseModalOpen] = useState(false);
  const [exerciseInEdit, setExerciseInEdit] = useState(null);

  // Søke og filtrere i liste over alle øvelser
  const [searchText, setSearchText] = useState('');
  const [selectedMuscle, setSelectedMuscle] = useState('');

  // Cover-bilder for økta
  const [coverImages, setCoverImages] = useState([]);
  const [selectedCoverImage, setSelectedCoverImage] = useState(null);

  // Henter øvelser
  const { exercises: exercisesFromHook, fetchExercises, loading, error } = useExercises(userId);
  const [exercises, setExercises] = useState([]);
  
  // For swiper
  const [swiperInstance, setSwiperInstance] = useState(null);

  // Modal for å opprette supersett
  const [isSupersetModalOpen, setIsSupersetModalOpen] = useState(false);
  const [selectedForSuperset, setSelectedForSuperset] = useState([]);

  const [pause, setPause] = useState(60);

  // Kjør fetch av øvelser ved mount
  useEffect(() => {
    fetchExercises();
    // eslint-disable-next-line
  }, [userId]);

  // Oppdater local state hver gang hook-data forandres
  useEffect(() => {
    setExercises(exercisesFromHook);
  }, [exercisesFromHook]);

  // Hent cover-bilder
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

  // Hvis en øvelse er satt i edit, gå til riktig slide i swiperen
  useEffect(() => {
    if (isExerciseModalOpen && swiperInstance && exerciseInEdit) {
      swiperInstance.slideTo(1);
    }
  }, [isExerciseModalOpen, swiperInstance, exerciseInEdit]);

  // Filtrer øvelser basert på søk + muskel
  const filteredExercises = exercises.filter(ex => {
    const matchesSearch = ex.name.toLowerCase().includes(searchText.toLowerCase());
    const matchesMuscle = selectedMuscle 
      ? ex.exercise_muscles && ex.exercise_muscles.some(em => 
          em.muscles && em.muscles.name.toLowerCase() === selectedMuscle.toLowerCase()
        )
      : true;
    return matchesSearch && matchesMuscle;
  });

  // --- Legge til/redigere én øvelse ---

  const handleSelectExercise = (exercise) => {
    // Ny øvelse får order = (antall som finnes) + 1
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
    // Klone for å unngå mutasjoner
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
    // Sjekk om øvelsen allerede finnes i selectedExercises
    const idx = selectedExercises.findIndex(ex => ex.id === exerciseInEdit.id && ex.id !== null);
    if (idx >= 0) {
      // Oppdater
      const newArr = [...selectedExercises];
      newArr[idx] = exerciseInEdit;
      setSelectedExercises(newArr);
    } else {
      // Legg til
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

  // --- Reorder: enkel variant uten superset-spesialhåndtering ---
  const handleReorder = (event) => {
    const items = [...selectedExercises];
    const [movedItem] = items.splice(event.detail.from, 1);
    items.splice(event.detail.to, 0, movedItem);

    // Juster ordrene
    items.forEach((ex, index) => {
      ex.order = index + 1;
    });
    setSelectedExercises(items);
    event.detail.complete();
  };

  const handleRemoveExercise = (id) => {
    const newSelected = selectedExercises.filter(ex => ex.id !== id);
    // Re-assign order
    newSelected.forEach((ex, index) => (ex.order = index + 1));
    setSelectedExercises(newSelected);
  };

  // --- Opprette supersett via egen modal ---

//   const openSupersetModal = () => {
//     if (selectedExercises.length < 2) {
//       alert("Du må ha minst to øvelser i listen for å lage et supersett.");
//       return;
//     }
//     // Tøm ev. tidligere seleksjon
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
    // Finn laveste "order" blant de valgte
    const chosenExercises = selectedExercises.filter(ex => selectedForSuperset.includes(ex.id));
    const minOrder = Math.min(...chosenExercises.map(ex => ex.order));

    // Oppdater alle valgte øvelser med felles supersetGroup og samme order
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
            <IonBackButton defaultHref='/app/training' />
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
              // Bare for å vise at den tilhører et supersett
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

        {/* Knappene for å legge til ny øvelse og opprette supersett */}
        <div className="col-12 d-flex justify-content-center" style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
          <IonButton className="col-10" onClick={() => setIsExerciseModalOpen(true)}>
            Legg til ny øvelse
          </IonButton>
          {/* <IonButton onClick={openSupersetModal} disabled={selectedExercises.length < 2}>
            Opprett Supersett
          </IonButton> */}
        </div>

        {/* Velg cover-bilde */}
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

        {/* Lagre økta */}
        <div className="col-12 d-flex flex-column align-items-center justify-content-center mb-5">
          <IonButton 
            className="col-10" 
            onClick={handleCreateSession} 
            disabled={selectedExercises.length === 0}
          >
            Lagre Treningsøkt
          </IonButton>
        </div>
        
        {/* Modal: Liste over øvelser + valg av sett/reps */}
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
                      {/* {exerciseInEdit.image_url && (
                        <img 
                          src={exerciseInEdit.image_url} 
                          alt={exerciseInEdit.name} 
                          style={{ width: '100%', marginBottom: '16px', borderRadius: '5px' }} 
                        />
                      )} */}
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
        
        {/* Modal for å velge øvelser til supersett */}
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
