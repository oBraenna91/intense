// import { IonBackButton,  IonButton,  IonButtons, IonContent, IonHeader, IonIcon, IonInput, IonItem, IonItemOption, IonItemOptions, IonItemSliding, IonLabel, IonList, IonModal, IonPage, IonReorder, IonReorderGroup, IonSearchbar, IonToolbar, useIonViewWillEnter } from '@ionic/react';
// import React, { useEffect, useState } from 'react';
// import { useParams } from 'react-router';
// import { getSpecificProgram } from '../../hooks/programs';
// import { supabase } from '../../supabaseClient';
// import { getTrainingSessions } from '../../hooks/sessions';
// import { trashOutline } from 'ionicons/icons';

// export default function EditProgramPage() {
//     const { programId } = useParams();
//     const [program, setProgram] = useState(null);
//     const [loading, setLoading] = useState(false);
//     const [coverImages, setCoverImages] = useState([]);
//     const [selectedCoverImage, setSelectedCoverImage] = useState(null);
//     const [isSaving, setIsSaving] = useState(false);
//     const [searchText, setSearchText] = useState('');
//     const [programName, setProgramName] = useState('');
//     const [description, setDescription] = useState('');
//     const [duration, setDuration] = useState('');
//     const [focus, setFocus] = useState('');
//     const [weeks, setWeeks] = useState([]);

//     // getTrainingSessions(coachId);

//     // For modal: redigering av aktivitet
//     const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);
//     const [activityInEdit, setActivityInEdit] = useState(null);
//     // Oppbevarer index for hvilken “week” du redigerer
//     const [activeWeekIndex, setActiveWeekIndex] = useState(null);
//     const [selectedMuscle, setSelectedMuscle] = useState('');

//     useIonViewWillEnter(() => {
//         async function getProgram() {
//             if(!programId) return;
//             setLoading(true);
//             try {
//                 const data = await getSpecificProgram(programId);
//                 setProgram(data);
//                 setProgramName(data.title);
//                 setDescription(data.description);
//                 setDuration(data.duration);
//                 setFocus(data.main_focus);
//                 console.log(data);

//                 setSelectedCoverImage(data.cover_image?.id || null);

//                 const sortedWeeks = (data.program_weeks || []).sort((a, b) => a.week_number - b.week_number);

//                 sortedWeeks.forEach((week) => {
//                     week.program_activities = (week.program_activities || []).sort(
//                         (a, b) => a.day_number - b.day_number
//                     );
//                 });

//                 setWeeks(sortedWeeks);
//             } catch(error) {
//                 console.error(error);
//             } finally {
//                 setLoading(false);
//             }
//         }
//         getProgram();
//     },[programId]);

//     useEffect(() => {
//         async function fetchCoverImages() {
//             try {
//             const { data, error } = await supabase
//                 .from('workout_cover_images')
//                 .select('*');
//             if (error) throw error;
//             setCoverImages(data);
//             } catch (err) {
//             console.error('Feil ved henting av cover-bilder:', err.message);
//             }
//         }
//     fetchCoverImages();
// }, []);

//     const handleWeekReorder = (event) => {
//         const newWeeks = [...weeks];
//         // Flytt element
//         const [movedWeek] = newWeeks.splice(event.detail.from, 1);
//         newWeeks.splice(event.detail.to, 0, movedWeek);
//         event.detail.complete();

//         // Oppdater rekkefølge. Bruker “week_number” i eksempelet:
//         newWeeks.forEach((w, i) => {
//         w.week_number = i + 1;
//         });

//         setWeeks(newWeeks);
//     };

//     const handleActivitiesReorder = (weekIndex, event) => {
//         const newWeeks = [...weeks];
//         const targetWeek = { ...newWeeks[weekIndex] };
//         const newActivities = [...targetWeek.program_activities];
    
//         const [movedItem] = newActivities.splice(event.detail.from, 1);
//         newActivities.splice(event.detail.to, 0, movedItem);
//         event.detail.complete();
    
//         // Oppdater day_number
//         newActivities.forEach((act, i) => {
//           act.day_number = i + 1; // 1-basert
//         });
    
//         targetWeek.program_activities = newActivities;
//         newWeeks[weekIndex] = targetWeek;
//         setWeeks(newWeeks);
//       };

//       const handleRemoveWeek = (weekId) => {
//         const filtered = weeks.filter((w) => w.id !== weekId);
//         // Re-assign week_number
//         filtered.forEach((w, i) => {
//           w.week_number = i + 1;
//         });
//         setWeeks(filtered);
//       };

//       const handleAddWeek = () => {
//         // Opprett en ny “tom” uke. Du kan velge å gi den en midlertidig ID, 
//         // f.eks. “temp-<timestamp>”, og så i updateProgram håndtere at “ID” = null => ny rad i DB.
//         const newWeek = {
//           id: `temp-week-${Date.now()}`,
//           description: '',
//           week_number: weeks.length + 1,
//           program_activities: []
//         };
//         setWeeks((prev) => [...prev, newWeek]);
//       };

//       const handleRemoveActivity = (weekIndex, activityId) => {
//         const newWeeks = [...weeks];
//         const targetWeek = { ...newWeeks[weekIndex] };
//         const filtered = targetWeek.program_activities.filter((act) => act.id !== activityId);
    
//         // re-assign day_number
//         filtered.forEach((act, i) => {
//           act.day_number = i + 1;
//         });
    
//         targetWeek.program_activities = filtered;
//         newWeeks[weekIndex] = targetWeek;
//         setWeeks(newWeeks);
//       };

//       const openActivityModal = (weekIndex) => {
//         setActiveWeekIndex(weekIndex);
//         setActivityInEdit(null);
//         setIsActivityModalOpen(true);
//       };

//       const handleSaveActivityToWeek = (newActivityData) => {
//         if (activeWeekIndex == null) return;
//         const newWeeks = [...weeks];
//         const targetWeek = { ...newWeeks[activeWeekIndex] };
    
//         // Hvis det er helt ny activity (mangler id), lag en “temp” ID
//         if (!newActivityData.id) {
//           newActivityData.id = `temp-activity-${Date.now()}`;
//         }
    
//         // day_number = siste+1
//         const nextDayNumber = (targetWeek.program_activities?.length || 0) + 1;
//         newActivityData.day_number = nextDayNumber;
    
//         // Putt den inn i program_activities
//         targetWeek.program_activities = [...(targetWeek.program_activities || []), newActivityData];
    
//         newWeeks[activeWeekIndex] = targetWeek;
//         setWeeks(newWeeks);
    
//         // Lukk modal
//         setIsActivityModalOpen(false);
//         setActivityInEdit(null);
//         setActiveWeekIndex(null);
//       };

    
//     return(
//         <IonPage>
//             <IonHeader>
//                 <IonToolbar>
//                     <IonButtons>
//                         <IonBackButton defaultHref={`/app/program/${programId}`}/>
//                     </IonButtons>
//                 </IonToolbar>
//             </IonHeader>
//             <IonContent>
//                 <IonItem>
//                     <IonLabel position="stacked">Navn</IonLabel>
//                     <IonInput
//                         placeholder="Navn på program"
//                         value={programName}
//                         onIonInput={e => setProgramName(e.detail.value)}
//                         />
//                 </IonItem>
//                 <IonItem>
//                     <IonLabel position="stacked">Beskrivelse</IonLabel>
//                     <IonInput
//                         placeholder="Beskrivelse av programmet"
//                         value={description}
//                         onIonInput={e => setDescription(e.detail.value)}
//                     />
//                 </IonItem>

//                 <IonItem>
//                     <IonLabel position="stacked">Varighet</IonLabel>
//                     <IonInput
//                         placeholder="Programmets varighet ( i uker )"
//                         value={duration}
//                         onIonInput={e => setDuration(e.detail.value)}
//                     />
//                 </IonItem>

//                 <IonItem>
//                     <IonLabel position="stacked">Hovedfokus</IonLabel>
//                     <IonInput
//                       placeholder="Programmets hovedfokus"
//                       value={focus}
//                       onIonInput={e => setFocus(e.detail.value)}
//                     />
//                 </IonItem>

//                 <div style={{ marginTop: '20px' }}>
//                     <h3>Forsidebilde</h3>
//                     <div style={{ display: 'flex', overflowX: 'scroll' }}>
//                         {coverImages.map((img) => (
//                         <div
//                             key={img.id}
//                             onClick={() => setSelectedCoverImage(img.id)}
//                             style={{
//                             marginRight: '8px',
//                             border:
//                                 selectedCoverImage === img.id
//                                 ? '4px solid var(--ion-color-primary)'
//                                 : '4px solid transparent',
//                             borderRadius: '8px',
//                             cursor: 'pointer'
//                             }}
//                         >
//                             <img
//                             src={img.image_url}
//                             alt={img.name}
//                             style={{ height: '120px', borderRadius: '6px' }}
//                             />
//                         </div>
//                         ))}
//                     </div>
//                     </div>

//                     <div style={{ marginTop: '30px' }}>
//           <h2>Uker</h2>
//           <IonButton onClick={handleAddWeek} style={{ marginBottom: '8px' }}>
//             Legg til ny uke
//           </IonButton>

//           <IonReorderGroup disabled={false} onIonItemReorder={handleWeekReorder}>
//             {weeks.map((week, weekIndex) => (
//               <IonItemSliding key={week.id}>
//                 <IonItem>
//                   <IonLabel>
//                     <strong>Uke {week.week_number}</strong> ({week.description || 'Ingen beskrivelse'})
//                   </IonLabel>
//                   <IonReorder slot="end" />
//                 </IonItem>

//                 <IonItemOptions side="end">
//                   <IonItemOption color="danger" onClick={() => handleRemoveWeek(week.id)}>
//                     <IonIcon slot="icon-only" icon={trashOutline} />
//                   </IonItemOption>
//                 </IonItemOptions>

//                 {/* Aktiviteter i denne uka */}
//                 <div style={{ paddingLeft: '16px', marginTop: '8px' }}>
//                   <IonReorderGroup
//                     disabled={false}
//                     onIonItemReorder={(e) => handleActivitiesReorder(weekIndex, e)}
//                   >
//                     {week.program_activities?.map((act) => (
//                       <IonItemSliding key={act.id} style={{ marginBottom: '4px' }}>
//                         <IonItem>
//                           <IonLabel>
//                             <div>
//                               {act.activity_type === 'task'
//                                 ? `Oppgave: ${act.task_description}`
//                                 : `Workout: ${act.workout_session?.title || '(Uten tittel)'}`
//                               }
//                             </div>
//                             <div style={{ fontSize: '0.8rem', color: 'gray' }}>
//                               Dag {act.day_number}
//                             </div>
//                           </IonLabel>
//                           <IonReorder slot="end" />
//                         </IonItem>

//                         <IonItemOptions side="end">
//                           <IonItemOption
//                             color="danger"
//                             onClick={() => handleRemoveActivity(weekIndex, act.id)}
//                           >
//                             <IonIcon slot="icon-only" icon={trashOutline} />
//                           </IonItemOption>
//                         </IonItemOptions>
//                       </IonItemSliding>
//                     ))}
//                   </IonReorderGroup>

//                   <IonButton onClick={() => openActivityModal(weekIndex)} style={{ marginTop: '8px' }}>
//                     Legg til aktivitet i uke {week.week_number}
//                   </IonButton>
//                 </div>
//               </IonItemSliding>
//             ))}
//           </IonReorderGroup>
//         </div>

//         <IonButton
//           expand="full"
//           style={{ marginTop: '30px' }}
//           //onClick={handleSaveProgram}
//         >
//           Oppdater program
//         </IonButton>

//         {/* Modal for å legge til / redigere en aktivitet */}
//         <IonModal
//           isOpen={isActivityModalOpen}
//           onDidDismiss={() => {
//             setIsActivityModalOpen(false);
//             setActivityInEdit(null);
//             setActiveWeekIndex(null);
//           }}
//         >
//           <IonContent>
//             <h3 style={{ padding: '16px' }}>Legg til aktivitet</h3>
//             {/* Her kan du la brukeren velge “task” vs. “workout” */}
//             {/* En superenkel variant: to knapper */}
//             <IonButton
//               onClick={() =>
//                 handleSaveActivityToWeek({
//                   activity_type: 'task',
//                   task_description: 'Ny oppgavebeskrivelse'
//                 })
//               }
//             >
//               Legg til test-oppgave
//             </IonButton>

//             <IonButton
//               onClick={() =>
//                 handleSaveActivityToWeek({
//                   activity_type: 'workout',
//                   workout_session_id: 38 // eksempelkode...
//                 })
//               }
//             >
//               Legg til test-workout
//             </IonButton>

//             <hr />

//             {/* Evt. søk i sessions (hvis du vil liste dem) */}
//             <IonSearchbar
//               value={searchText}
//               onIonInput={(e) => setSearchText(e.detail.value)}
//               placeholder="Søk workouts..."
//             />

//             {/* <IonList>
//               {allSessions
//                 ?.filter((sess) =>
//                   sess.title.toLowerCase().includes(searchText.toLowerCase())
//                 )
//                 ?.map((sess) => (
//                   <IonItem
//                     key={sess.id}
//                     button
//                     onClick={() =>
//                       handleSaveActivityToWeek({
//                         activity_type: 'workout',
//                         workout_session_id: sess.id,
//                         workout_session: sess
//                       })
//                     }
//                   >
//                     <IonLabel>{sess.title}</IonLabel>
//                   </IonItem>
//                 ))}
//             </IonList> */}

//             <IonButton
//               expand="full"
//               color="medium"
//               onClick={() => {
//                 setIsActivityModalOpen(false);
//                 setActivityInEdit(null);
//                 setActiveWeekIndex(null);
//               }}
//               style={{ marginBottom: '16px' }}
//             >
//               Lukk
//             </IonButton>
//           </IonContent>
//         </IonModal>
//             </IonContent>
//         </IonPage>
//     )
// }

import React, { useEffect, useState } from 'react';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonButtons,
  IonBackButton,
  IonContent,
  IonButton,
  IonItem,
  IonLabel,
  IonInput,
  IonTextarea,
  IonReorderGroup,
  IonReorder,
  IonItemSliding,
  IonItemOptions,
  IonItemOption,
  IonIcon,
  IonAccordionGroup,
  IonAccordion,
  IonSpinner,
  IonModal
} from '@ionic/react';
import { trashOutline } from 'ionicons/icons';

// For framer-motion
import { AnimatePresence, motion } from 'framer-motion';

// Hooks / utils
import { useParams } from 'react-router';
import { getSpecificProgram } from '../../hooks/programs';  // du lager selv
//import { useSessions } from '../../hooks/sessions';                       // hvis du vil hente treningsøkter
import { supabase } from '../../supabaseClient';
import { getTrainingSessions } from '../../hooks/sessions';
import { useAuth } from '../../contexts/auth';
import { usePrograms } from '../../hooks/programs';

export default function EditProgramPage() {
  const { programId } = useParams();
  const { coach } = useAuth();
  const { updateProgram } = usePrograms();

  // Program-data
  const [program, setProgram] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Felter for program
  const [programName, setProgramName] = useState('');
  const [programDescription, setProgramDescription] = useState('');
  const [duration, setDuration] = useState('');
  const [mainFocus, setMainFocus] = useState('');

  const [sessions, setSessions] = useState([]);

  // Cover images
  const [coverImages, setCoverImages] = useState([]);
  const [selectedCoverImage, setSelectedCoverImage] = useState(null);

  // Ukene – hver uke har { id, week_number, description, program_activities }
  // men du kan også ha en struktur der du oversetter
  // program_activities til "days" -> "activities" (slik du viste i create-koden).
  const [weeks, setWeeks] = useState([]);

  // Håndtering av å “slå opp” en uke og vise dagene
  const [openWeekId, setOpenWeekId] = useState(null);

  // Sessions, hvis du lar brukeren velge blant eksisterende treningsøkter:
  //const { sessions, fetchSessions } = useSessions();

  // Modal for å legge til en treningsøkt i en gitt uke/dag
  const [sessionModalOpen, setSessionModalOpen] = useState(false);
  const [targetWeekId, setTargetWeekId] = useState(null);
  const [targetDayNumber, setTargetDayNumber] = useState(null);

  // --------------------------------
  //  HENTING AV PROGRAM-DATA
  // --------------------------------
//   useEffect(() => {
//     fetchSessions(); // Henter alle treningsøkter
//   }, [fetchSessions]);

useEffect(() => {
    async function getSessions() {
    try {
        const sessionData = await getTrainingSessions(coach.id);
        setSessions(sessionData);
    } catch(error) {
        console.error(error);
    }
    }
    getSessions();
},[coach.id])

  useEffect(() => {
    async function loadProgram() {
      if (!programId) return;
      setLoading(true);
      setError(null);

      try {
        const data = await getSpecificProgram(programId);
        setProgram(data);

        // Putt over i feltene
        setProgramName(data.title);
        setProgramDescription(data.description);
        setDuration(data.duration);
        setMainFocus(data.main_focus);

        setSelectedCoverImage(data.cover_image?.id || null);

        // Sorter og transformer weeks
        const sortedWeeks = (data.program_weeks || []).sort((a, b) => a.week_number - b.week_number);

        // I eksemplet du viste, bruker du “days: []” inni hver uke.
        // Du må altså transformere program_activities (som er dag_number + activity_type)
        // til en “days” array => [ { dayNumber: 1, activities: [...] }, ... ]
        // Under viser jeg en liten funksjon som gjør nettopp det:

        const weeksWithDays = sortedWeeks.map((week) => {
          // group activities by day_number
          const daysMap = {};
          (week.program_activities || []).forEach((act) => {
            const d = act.day_number;
            if (!daysMap[d]) {
              daysMap[d] = [];
            }
            daysMap[d].push(act);
          });

          // lag en array over dagene 1..7 (evt. bare 1..maxDayNumber)
          // her gjetter vi at max 7 dager i en uke:
          const daysArray = [];
          for (let dayNum = 1; dayNum <= 7; dayNum++) {
            daysArray.push({
              dayNumber: dayNum,
              // enten en tom array eller de activities vi fant
              activities: daysMap[dayNum] || []
            });
          }

          return {
            id: week.id,
            description: week.description,
            weekNumber: week.week_number,
            days: daysArray
          };
        });

        setWeeks(weeksWithDays);
      } catch (err) {
        setError(err);
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadProgram();
  }, [programId]);

  // Hent cover-bilder (som i session)
  useEffect(() => {
    async function fetchCoverImages() {
      try {
        const { data, error } = await supabase
          .from('workout_cover_images')
          .select('*');
        if (error) throw error;
        setCoverImages(data);
      } catch (err) {
        console.error('Feil ved henting av cover-bilder:', err);
      }
    }
    fetchCoverImages();
  }, []);

  // --------------------------------
  //  REORDER WEEKS
  // --------------------------------
  const handleReorderWeeks = (event) => {
    const items = [...weeks];
    const [movedItem] = items.splice(event.detail.from, 1);
    items.splice(event.detail.to, 0, movedItem);
    event.detail.complete();

    // Oppdater weekNumber basert på ny rekkefølge
    items.forEach((w, index) => {
      w.weekNumber = index + 1;
    });

    setWeeks(items);
  };

  // --------------------------------
  //  UTVID / LUKK UKE
  // --------------------------------
  function toggleAccordion(weekId) {
    setOpenWeekId((prev) => (prev === weekId ? null : weekId));
  }

  // --------------------------------
  //  KOPIER EN UKE
  // --------------------------------
  function copyWeek(weekId) {
    const theWeek = weeks.find((w) => w.id === weekId);
    if (!theWeek) return;

    const newWeek = {
      id: `temp-week-${Date.now()}`,
      description: theWeek.description,
      weekNumber: weeks.length + 1,
      days: theWeek.days.map((d) => ({
        ...d,
        // Kopier aktiviteter
        activities: d.activities.map((act) => ({
          ...act,
          id: `temp-act-${Date.now()}-${Math.random()}`, // generer nye “temp IDer” for ny rad
        }))
      }))
    };

    setWeeks((prev) => [...prev, newWeek]);
    setOpenWeekId(newWeek.id);
  }

  // --------------------------------
  //  LEGG TIL / FJERN UKE
  // --------------------------------
  function addWeek() {
    const newWeek = {
      id: `temp-week-${Date.now()}`,
      description: '',
      weekNumber: weeks.length + 1,
      days: Array.from({ length: 7 }).map((_, i) => ({
        dayNumber: i + 1,
        activities: []
      }))
    };
    setWeeks((prev) => [...prev, newWeek]);
    setOpenWeekId(newWeek.id);
  }

  function removeWeek(weekId) {
    const filtered = weeks.filter((w) => w.id !== weekId);
    // Re-assign weekNumber
    filtered.forEach((w, i) => {
      w.weekNumber = i + 1;
    });
    setWeeks(filtered);
  }

  // --------------------------------
  //  OPPDATER BESKRIVELSE AV UKE
  // --------------------------------
  function updateWeekDescription(weekId, newDesc) {
    const updated = weeks.map((w) => {
      if (w.id === weekId) {
        return { ...w, description: newDesc };
      }
      return w;
    });
    setWeeks(updated);
  }

  // --------------------------------
  //  LEGG TIL AKTIVITET I DAG
  // --------------------------------
  //  “task” = gjøremål, “workout” = treningsøkt
  function addActivityToDay(weekId, dayNumber, type) {
    const newActivityId = `temp-activity-${Date.now()}-${Math.random()}`;
    const updatedWeeks = weeks.map((w) => {
      if (w.id === weekId) {
        const newDays = w.days.map((d) => {
          if (d.dayNumber === dayNumber) {
            const newActivities = [
              ...d.activities,
              {
                id: newActivityId,
                activity_type: type === 'task' ? 'task' : 'workout',
                task_description: type === 'task' ? 'Nytt gjøremål' : '',
                workout_session_id: null,
                workout_session: null
              }
            ];
            return { ...d, activities: newActivities };
          }
          return d;
        });
        return { ...w, days: newDays };
      }
      return w;
    });
    setWeeks(updatedWeeks);
  }

  // --------------------------------
  //  FJERN AKTIVITET
  // --------------------------------
  function removeActivity(weekId, dayNumber, activityId) {
    const newWeeks = weeks.map((w) => {
      if (w.id === weekId) {
        const newDays = w.days.map((d) => {
          if (d.dayNumber === dayNumber) {
            const filtered = d.activities.filter((act) => act.id !== activityId);
            return { ...d, activities: filtered };
          }
          return d;
        });
        return { ...w, days: newDays };
      }
      return w;
    });
    setWeeks(newWeeks);
  }

  // --------------------------------
  //  OPPDATER TEKST (FOR TASK)
  // --------------------------------
  function updateActivityDescription(weekId, dayNumber, activityId, newDesc) {
    const updatedWeeks = weeks.map((w) => {
      if (w.id === weekId) {
        const newDays = w.days.map((d) => {
          if (d.dayNumber === dayNumber) {
            const newActs = d.activities.map((act) => {
              if (act.id === activityId) {
                return { ...act, task_description: newDesc };
              }
              return act;
            });
            return { ...d, activities: newActs };
          }
          return d;
        });
        return { ...w, days: newDays };
      }
      return w;
    });
    setWeeks(updatedWeeks);
  }

  // --------------------------------
  //  ÅPNE MODAL FOR TRENINGSØKT
  // --------------------------------
  function openSessionModal(weekId, dayNumber) {
    setTargetWeekId(weekId);
    setTargetDayNumber(dayNumber);
    setSessionModalOpen(true);
  }

  // Bruker klikker på en “eksisterende session”
  function selectSessionForDay(sessionId, sessionObj) {
    // Oppdater state i weeks -> day -> activity
    // Vi legger til en ny “workout” activity med workout_session_id = sessionId
    if (!targetWeekId || !targetDayNumber) return;

    const newActivityId = `temp-activity-${Date.now()}-${Math.random()}`;
    const updatedWeeks = weeks.map((w) => {
      if (w.id === targetWeekId) {
        const newDays = w.days.map((d) => {
          if (d.dayNumber === targetDayNumber) {
            const newActivities = [
              ...d.activities,
              {
                id: newActivityId,
                activity_type: 'workout',
                workout_session_id: sessionId,
                workout_session: sessionObj,
                task_description: ''
              }
            ];
            return { ...d, activities: newActivities };
          }
          return d;
        });
        return { ...w, days: newDays };
      }
      return w;
    });

    setWeeks(updatedWeeks);
    setSessionModalOpen(false);
  }

  // --------------------------------
  //  LAGRING TIL SUPABASE
  // --------------------------------
  async function handleSaveProgram() {
    setLoading(true);
    setError(null);

    try {
      // “oversett” weeks + days -> program_weeks + program_activities
      // (slik at du kan sende inn i updateProgram)
      const program_weeks = weeks.map((w) => {
        const allActivities = [];
        w.days.forEach((d) => {
          d.activities.forEach((act) => {
            allActivities.push({
              id: act.id,
              activity_type: act.activity_type,
              day_number: d.dayNumber,
              task_description: act.task_description || '',
              workout_session_id: act.workout_session_id
            });
          });
        });
        return {
          id: w.id,
          week_number: w.weekNumber,
          description: w.description,
          program_activities: allActivities
        };
      });

      const dataToSave = {
        title: programName,
        description: programDescription,
        duration,
        main_focus: mainFocus,
        cover_image: selectedCoverImage, // evt. bare en ID
        program_weeks
      };

      await updateProgram(programId, dataToSave);

      alert('Programmet er oppdatert!');
    } catch (err) {
      console.error(err);
      setError(err);
      alert('Noe gikk galt ved oppdatering av programmet');
    } finally {
      setLoading(false);
    }
  }

  // --------------------------------
  //  RENDER
  // --------------------------------
  if (error) {
    return (
      <IonPage>
        <IonContent>
          <p>Feil: {error.message}</p>
        </IonContent>
      </IonPage>
    );
  }

  if (loading && !program) {
    return (
      <IonPage>
        <IonContent>
          <IonSpinner />
        </IonContent>
      </IonPage>
    );
  }

  if (!program) {
    return (
      <IonPage>
        <IonContent>
          <IonSpinner />
          <p>Laster...</p>
        </IonContent>
      </IonPage>
    );
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref={`/app/program/${programId}`} />
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        {/* Toppfelter */}
        <IonItem>
          <IonLabel position="stacked">Navn</IonLabel>
          <IonInput
            placeholder="Navn på programmet"
            value={programName}
            onIonChange={(e) => setProgramName(e.detail.value)}
          />
        </IonItem>
        <IonItem>
          <IonLabel position="stacked">Beskrivelse</IonLabel>
          <IonTextarea
            placeholder="Beskrivelse av programmet"
            value={programDescription}
            onIonChange={(e) => setProgramDescription(e.detail.value)}
          />
        </IonItem>
        <IonItem>
          <IonLabel position="stacked">Varighet (uker)</IonLabel>
          <IonInput
            value={duration}
            onIonChange={(e) => setDuration(e.detail.value)}
          />
        </IonItem>
        <IonItem>
          <IonLabel position="stacked">Hovedfokus</IonLabel>
          <IonInput
            value={mainFocus}
            onIonChange={(e) => setMainFocus(e.detail.value)}
          />
        </IonItem>

        <h3 className="text-center" style={{ marginTop: '24px' }}>Cover-bilde</h3>
        <div style={{ display: 'flex', overflowX: 'scroll', padding: '16px' }}>
          {coverImages.map((img) => (
            <div
              key={img.id}
              onClick={() => setSelectedCoverImage(img.id)}
              style={{
                flex: '0 0 auto',
                marginRight: '8px',
                border:
                  selectedCoverImage === img.id
                    ? '4px solid var(--ion-color-primary)'
                    : '4px solid transparent',
                borderRadius: '8px',
                cursor: 'pointer'
              }}
            >
              <img
                src={img.image_url}
                alt={img.name}
                style={{ height: '150px', borderRadius: '6px' }}
              />
            </div>
          ))}
        </div>

        <h3 className="text-center mt-5">Treningsplan</h3>
        <div className="col-12 d-flex justify-content-center">
          <IonButton className="col-10" onClick={addWeek}>
            + Legg til uke
          </IonButton>
        </div>

        <IonReorderGroup disabled={false} onIonItemReorder={handleReorderWeeks}>
          {weeks.map((week) => (
            <div key={week.id}>
              <IonItemSliding className="border-bottom">
                <IonItem lines="none">
                  <IonReorder slot="end" />
                  <IonLabel onClick={() => toggleAccordion(week.id)}>
                    <div
                      style={{
                        fontWeight: 'bold',
                        fontSize: '1.3em',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}
                    >
                      Uke {week.weekNumber}
                    </div>
                  </IonLabel>
                </IonItem>

                {/* Kopier / Slett uke */}
                <IonItemOptions side="start">
                  <IonItemOption color="success" onClick={() => copyWeek(week.id)}>
                    Kopier
                  </IonItemOption>
                </IonItemOptions>

                <IonItemOptions side="end">
                  <IonItemOption
                    style={{ width: '70px' }}
                    color="danger"
                    onClick={() => removeWeek(week.id)}
                  >
                    <IonIcon style={{ fontSize: '1.7em' }} icon={trashOutline} />
                  </IonItemOption>
                </IonItemOptions>
              </IonItemSliding>

              {/* Her kommer “accordion”-delen for innhold i uka */}
              <AnimatePresence>
                {openWeekId === week.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    style={{
                      overflow: 'hidden',
                      padding: '0',
                      backgroundColor: 'var(--ion-color-light)'
                    }}
                  >
                    <div
                      style={{
                        padding: '16px',
                        boxShadow: '0 3px 8px rgba(0,0,0,0.1)',
                        backgroundColor: 'white',
                        borderRadius: '8px',
                        marginTop: '10px',
                        marginBottom: '10px',
                        marginLeft: '15px',
                        marginRight: '15px'
                      }}
                    >
                      <IonItem>
                        <IonLabel position="stacked">Beskrivelse av uken</IonLabel>
                        <IonTextarea
                          placeholder="Kort beskrivelse"
                          value={week.description || ''}
                          onIonChange={(e) => updateWeekDescription(week.id, e.detail.value)}
                        />
                      </IonItem>

                      <IonAccordionGroup>
                        {week.days.map((day) => (
                          <IonAccordion
                            key={`day-${week.id}-${day.dayNumber}`}
                            value={`day-${week.id}-${day.dayNumber}`}
                          >
                            <IonItem slot="header">
                              <IonLabel style={{ fontSize: '1.3em' }}>
                                <strong>Dag {day.dayNumber}</strong>
                              </IonLabel>
                            </IonItem>

                            <AnimatePresence>
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                style={{ overflow: 'hidden', padding: '0 16px 16px 16px' }}
                                slot="content"
                              >
                                <div className="d-flex justify-content-between">
                                  <IonButton
                                    className="col-6"
                                    onClick={() =>
                                      addActivityToDay(week.id, day.dayNumber, 'task')
                                    }
                                  >
                                    + Gjøremål
                                  </IonButton>
                                  <IonButton
                                    className="col-6"
                                    onClick={() => openSessionModal(week.id, day.dayNumber)}
                                  >
                                    + Treningsøkt
                                  </IonButton>
                                </div>

                                {day.activities.map((activity) => {
                                  // Finn session-navnet (hvis type=workout)
                                  let sessionName = null;
                                  if (activity.activity_type === 'workout') {
                                    // Bruk enten activity.workout_session?.title
                                    // eller finn i sessions-liste.  
                                    sessionName =
                                      activity.workout_session?.title ||
                                      sessions.find(
                                        (s) => s.id === activity.workout_session_id
                                      )?.title ||
                                      'Ukjent økt';
                                  }

                                  return (
                                    <IonItemSliding key={activity.id} style={{ marginTop: '6px' }}>
                                      <IonItem>
                                        <IonLabel style={{ width: '100%' }}>
                                          <div
                                            style={{
                                              fontSize: '0.8em',
                                              color: 'gray'
                                            }}
                                          >
                                            {activity.activity_type === 'task'
                                              ? 'Gjøremål'
                                              : 'Treningsøkt'}
                                          </div>
                                          {activity.activity_type === 'task' ? (
                                            <IonInput
                                              placeholder="Skriv kommentar..."
                                              value={activity.task_description}
                                              style={{ fontWeight: 'bold', fontSize: '1.3em' }}
                                              onIonChange={(e) =>
                                                updateActivityDescription(
                                                  week.id,
                                                  day.dayNumber,
                                                  activity.id,
                                                  e.detail.value
                                                )
                                              }
                                            />
                                          ) : (
                                            <div
                                              style={{
                                                fontWeight: 'bold',
                                                fontSize: '1.3em'
                                              }}
                                            >
                                              {sessionName}
                                            </div>
                                          )}
                                        </IonLabel>
                                      </IonItem>

                                      <IonItemOptions side="end">
                                        <IonItemOption
                                          style={{ width: '70px' }}
                                          color="danger"
                                          onClick={() =>
                                            removeActivity(
                                              week.id,
                                              day.dayNumber,
                                              activity.id
                                            )
                                          }
                                        >
                                          <IonIcon icon={trashOutline} />
                                        </IonItemOption>
                                      </IonItemOptions>
                                    </IonItemSliding>
                                  );
                                })}
                              </motion.div>
                            </AnimatePresence>
                          </IonAccordion>
                        ))}
                      </IonAccordionGroup>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </IonReorderGroup>

        <div style={{ marginTop: '24px', textAlign: 'center' }}>
          <IonButton className="col-10" onClick={handleSaveProgram}>
            Oppdater program
          </IonButton>
        </div>

        {/* Modal for å velge treningsøkt */}
        <IonModal
          isOpen={sessionModalOpen}
          onDidDismiss={() => setSessionModalOpen(false)}
        >
          <IonContent>
            <h2 style={{ textAlign: 'center', margin: '16px 0' }}>
              Velg en treningsøkt
            </h2>
            {sessions.map((sess) => (
              <IonItem
                key={sess.id}
                button
                onClick={() => {
                  selectSessionForDay(sess.id, sess);
                }}
              >
                <IonLabel>{sess.title}</IonLabel>
              </IonItem>
            ))}
            <IonButton
              expand="full"
              color="medium"
              onClick={() => setSessionModalOpen(false)}
            >
              Lukk
            </IonButton>
          </IonContent>
        </IonModal>
      </IonContent>
    </IonPage>
  );
}
