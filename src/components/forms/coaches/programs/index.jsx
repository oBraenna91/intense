import React, { useEffect, useMemo, useState } from 'react';
import { 
    IonContent, 
    IonItem, 
    IonInput, 
    IonLabel, 
    IonButton, 
    IonSelect, 
    IonSelectOption, 
    IonTextarea, 
    IonModal, 
    IonList, 
    IonItemSliding, 
    IonItemOptions, 
    IonItemOption, 
    IonIcon, 
    IonPage, 
    IonHeader, 
    IonToolbar, 
    IonButtons, 
    IonBackButton, 
    IonReorderGroup, 
    IonReorder, 
    IonAccordionGroup,
    IonAccordion,
    useIonRouter,
    IonSearchbar,
    IonToggle} from '@ionic/react';
import { useAuth } from '../../../../contexts/auth';
import { v4 as uuidv4 } from 'uuid';
import { usePrograms } from '../../../../hooks/programs';
import { supabase } from '../../../../supabaseClient';
import { getTrainingSessions } from '../../../../hooks/sessions';
import { trashOutline } from 'ionicons/icons';
import { motion, AnimatePresence } from 'framer-motion';


const ProgramBuilder = () => {

  const { createProgram } = usePrograms()
  const { user, coach } = useAuth();
  const [programName, setProgramName] = useState('');
  const [description, setDescription] = useState('');
  const [focus, setFocus] = useState('');
  const [duration, setDuration] = useState(4);
  const [selectedCoverImage, setSelectedCoverImage] = useState('');
  const [coverImages, setCoverImages] = useState([]);
  const [currentWeekId, setCurrentWeekId] = useState(null);
  const [currentDayNumber, setCurrentDayNumber] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [isRecurring, setIsRecurring] = useState(false);

  const [searchText, setSearchText] = useState('');

  const router = useIonRouter();

  const [customFocus, setCustomFocus] = useState(false);

  const [openWeekId, setOpenWeekId] = useState(null);

  const [weeks, setWeeks] = useState([]);

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
    const fetchSessions = async () => {
        const sessionsData = await getTrainingSessions(coach.id);
        setSessions(sessionsData);
    }
    fetchSessions();
  },[coach.id]);

  const addWeek = () => {
    const newWeek = {
      id: uuidv4(),
      weekNumber: weeks.length + 1,
      days: Array.from({ length: 7 }, (_, idx) => ({
        dayNumber: idx + 1,
        activities: [],
      })),
    };
    setWeeks([...weeks, newWeek]);
  };

  const filteredSessions = useMemo(() => {
    if (!searchText) return sessions;
    return sessions.filter(session =>
      session.title.toLowerCase().includes(searchText.toLowerCase())
    );
  }, [searchText, sessions]);

  const toggleAccordion = (weekId) => {
    setOpenWeekId(prev => (prev === weekId ? null : weekId));
  };

  const removeWeek = (weekId) => {
    setWeeks(prevWeeks => {
      const filteredWeeks = prevWeeks.filter(week => week.id !== weekId);
      return filteredWeeks.map((week, index) => ({
        ...week,
        weekNumber: index + 1
      }));
    });
  };
  

  const removeActivity = (weekId, dayNumber, activityId) => {
    setWeeks(prevWeeks =>
      prevWeeks.map(week =>
        week.id === weekId
          ? {
              ...week,
              days: week.days.map(day =>
                day.dayNumber === dayNumber
                  ? {
                      ...day,
                      activities: day.activities.filter(activity => activity.id !== activityId),
                    }
                  : day
              ),
            }
          : week
      )
    );
  };

  const updateWeekDescription = (weekId, description) => {
    setWeeks(prevWeeks =>
      prevWeeks.map(week =>
        week.id === weekId ? { ...week, description } : week
      )
    );
  };
  

  const selectSession = (sessionId) => {
    const updatedWeeks = weeks.map(week => {
      if (week.id === currentWeekId) {
        const updatedDays = week.days.map(day => {
          if (day.dayNumber === currentDayNumber) {
            return {
              ...day,
              activities: [
                ...day.activities,
                {
                  id: uuidv4(),
                  type: 'workout',
                  workoutSessionId: sessionId,
                  description: '', 
                },
              ],
            };
          }
          return day;
        });
        return { ...week, days: updatedDays };
      }
      return week;
    });
    setWeeks(updatedWeeks);
    setCurrentWeekId(null);
    setCurrentDayNumber(null);
  };

  const handleReorderWeeks = (event) => {
    const reorderedWeeks = [...weeks];
    const [movedWeek] = reorderedWeeks.splice(event.detail.from, 1);
    reorderedWeeks.splice(event.detail.to, 0, movedWeek);
    reorderedWeeks.forEach((week, index) => week.weekNumber = index + 1);
    setWeeks(reorderedWeeks);
    event.detail.complete();
  };

  const copyWeek = (weekId) => {
    const weekToCopy = weeks.find(week => week.id === weekId);
    if (!weekToCopy) return;
  
    const copiedWeek = {
      ...weekToCopy,
      id: uuidv4(),
      weekNumber: weeks.length + 1,
      days: weekToCopy.days.map(day => ({
        ...day,
        activities: day.activities.map(activity => ({ ...activity, id: uuidv4() }))
      }))
    };
  
    setWeeks([...weeks, copiedWeek]);
  };  
  

  const addActivityToDay = (weekId, dayNumber, activityType) => {
    const updatedWeeks = weeks.map(week => {
      if (week.id === weekId) {
        const updatedDays = week.days.map(day => {
          if (day.dayNumber === dayNumber) {
            return {
              ...day,
              activities: [
                ...day.activities,
                {
                  id: uuidv4(),
                  type: activityType,
                  description: '',
                  workoutSessionId: null, 
                },
              ],
            };
          }
          return day;
        });
        return { ...week, days: updatedDays };
      }
      return week;
    });
    setWeeks(updatedWeeks);
  };

  const updateActivityDescription = (weekId, dayNumber, activityId, description) => {
    setWeeks(prevWeeks =>
      prevWeeks.map(week =>
        week.id === weekId
          ? {
              ...week,
              days: week.days.map(day =>
                day.dayNumber === dayNumber
                  ? {
                      ...day,
                      activities: day.activities.map(activity =>
                        activity.id === activityId
                          ? { ...activity, description }
                          : activity
                      ),
                    }
                  : day
              ),
            }
          : week
      )
    );
  };

  

  const openSessionModal = (weekId, dayNumber) => {
    setCurrentWeekId(weekId);
    setCurrentDayNumber(dayNumber);
  };
  

  const handleCreateProgram = async () => {
    const programData = {
      title: programName,
      description,
      main_focus: focus,
      duration: isRecurring ? null : duration,
      is_recurring: isRecurring,
      cover_image: selectedCoverImage,
      created_by: user.id,
      weeks, 
    };

    try {
      const newProgramId = await createProgram(programData);
      const newProgram = {
        id: newProgramId,
        created_at: new Date().toISOString(),
        ...programData
      };
      console.log('Program opprettet:', newProgramId);
      alert('Program opprettet ✅')
      router.push('/app/training', 'back', { newProgram });
    } catch (error) {
      console.error('Feil:', error.message);
    }
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
            <IonItem>
          <IonLabel position="stacked">Navn på programmet</IonLabel>
          <IonInput value={programName} onIonChange={e => setProgramName(e.detail.value)} />
        </IonItem>

        <IonItem>
          <IonLabel position="stacked">Beskrivelse</IonLabel>
          <IonTextarea value={description} onIonChange={e => setDescription(e.detail.value)} />
        </IonItem>
        {customFocus ? (
            <IonItem>
                <IonLabel position="stacked">Hovedfokus (tilpasset)</IonLabel>
                    <IonInput 
                    value={focus} 
                    placeholder="Skriv eget fokus"
                    onIonChange={e => setFocus(e.detail.value)} 
                    />
            </IonItem>
            ) : (
            <IonItem>
                <IonLabel position="stacked">Hovedfokus</IonLabel>
                    <IonSelect slot="end" value={focus} onIonChange={e => setFocus(e.detail.value)}>
                        <IonSelectOption value="Styrke">Styrke</IonSelectOption>
                        <IonSelectOption value="Konkurranse prep">Konkurranse prep</IonSelectOption>
                        <IonSelectOption value="Hypertrofi">Hypertrofi</IonSelectOption>
                        <IonSelectOption value="Utholdenhet">Utholdenhet</IonSelectOption>
                        <IonSelectOption value="Vektnedgang">Vektnedgang</IonSelectOption>
                    </IonSelect>
            </IonItem>
            )}
            <IonItem lines="none">
            <IonLabel>Tilpass hovedfokus?</IonLabel>
            <IonButton 
                fill="outline" 
                size="small" 
                onClick={() => setCustomFocus(prev => !prev)}
            >
                {customFocus ? 'Velg fra liste' : 'Tilpass selv'}
            </IonButton>
        </IonItem>

        <AnimatePresence initial={false}>
            {!isRecurring && (
                <motion.div
                key="duration-field"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                style={{ overflow: 'hidden' }}
                >
                <IonItem>
                    <IonLabel position="stacked">Varighet (uker)</IonLabel>
                    <IonInput 
                    type="number" 
                    value={duration} 
                    onIonChange={e => setDuration(parseInt(e.detail.value))} 
                    />
                </IonItem>
                </motion.div>
            )}
        </AnimatePresence>
        <IonItem style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <IonLabel>Gjentakende program?</IonLabel>
        <IonToggle
            slot="end"
            checked={isRecurring}
            onIonChange={e => setIsRecurring(e.detail.checked)}
        />
        </IonItem>
        
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
            <div style={{ fontWeight: 'bold', fontSize: '1.3em', whiteSpace: 'nowrap', overflow:'hidden', textOverflow: 'ellipsis' }}>
                Uke {week.weekNumber}
            </div>
          </IonLabel>
        </IonItem>
        <IonItemOptions side="start">
          <IonItemOption color="success" onClick={() => copyWeek(week.id)}>
            Kopier
          </IonItemOption>
        </IonItemOptions>

        <IonItemOptions side="end">
          <IonItemOption style={{ width: '70px', minWidth: '70px', maxWidth: '70px' }} color="danger" onClick={() => removeWeek(week.id)}>
            <IonIcon style={{ fontSize: '1.7em' }} icon={trashOutline} />
          </IonItemOption>
        </IonItemOptions>
      </IonItemSliding>

    <AnimatePresence>
    {openWeekId === week.id && (
        <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            style={{ overflow: 'hidden', padding: '0', backgroundColor: 'var(--ion-color-light)'}}
        >
        <div className={``} style={{ 
            padding: '16px', 
            boxShadow: '0 3px 8px rgba(0,0,0,0.1)',
            backgroundColor: 'white',
            borderRadius: '8px',
            marginTop: '10px',
            marginBottom: '10px',
            marginLeft: '15px',
            marginRight: '15px'
            }}>
          <IonItem>
            <IonLabel position="stacked">Beskrivelse av uken</IonLabel>
            <IonTextarea
              placeholder="Kort beskrivelse"
              value={week.description || ''}
              onIonChange={e => updateWeekDescription(week.id, e.detail.value)}
            />
          </IonItem>
          <IonAccordionGroup>
            {week.days.map(day => (
                <IonAccordion key={day.dayNumber} value={`day-${week.id}-${day.dayNumber}`}>
                <IonItem slot="header">
                    <IonLabel style={{ fontSize: '1.3em' }}><strong>Dag {day.dayNumber}</strong></IonLabel>
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
                    <IonButton className="col-6" onClick={() => addActivityToDay(week.id, day.dayNumber, 'task')}>
                        + Gjøremål
                    </IonButton>
                    <IonButton className="col-6" onClick={() => openSessionModal(week.id, day.dayNumber)}>
                        + Treningsøkt
                    </IonButton>
                    </div>
                    

                    {day.activities.map(activity => {
                        const sessionName = activity.type === 'workout'
                        ? sessions.find(session => session.id === activity.workoutSessionId)?.title
                        : null;

                        return (
                        <IonItemSliding key={activity.id}>
                            <IonItem>
                            <IonLabel style={{ width: '100%' }}>
                                <div style={{ fontSize: '0.8em', color: 'gray' }}>
                                    {activity.type === 'task' ? 'Gjøremål' : 'Treningsøkt'}
                                </div>
                                {activity.type === 'task' ? (
                                <IonInput
                                    placeholder="Skriv kommentar..."
                                    value={activity.description}
                                    style={{ fontWeight: 'bold', fontSize: '1.3em' }}
                                    onIonChange={(e) =>
                                    updateActivityDescription(week.id, day.dayNumber, activity.id, e.detail.value)
                                    }
                                />
                                ) : (
                                <div style={{ fontWeight: 'bold', fontSize: '1.3em' }}>
                                    {sessionName || 'Ukjent økt'}
                                </div>
                                )}
                            </IonLabel>
                            </IonItem>

                            <IonItemOptions side="end">
                            <IonItemOption style={{ width: '70px', minWidth: '70px', maxWidth: '70px' }} color="danger" onClick={() => removeActivity(week.id, day.dayNumber, activity.id)}>
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
            <div className="col-12 d-flex justify-content-center my-5">
                <IonButton className="col-10" onClick={handleCreateProgram}>
                    Lagre Treningsprogram
                </IonButton>
            </div>
        <IonModal breakpoints={[0,1]} initialBreakpoint={1} isOpen={currentWeekId !== null}>
            <IonContent  style={{ height: '100%', overflowY: 'auto'}}>
                <IonSearchbar
                    placeholder="Søk etter økter..."
                    value={searchText}
                    onIonInput={(e) => setSearchText(e.detail.value)}
                    style={{ marginTop: '25px' }}
                />
                <IonList>
                {filteredSessions.map(session => (
                    <IonItem button key={session.id} onClick={() => selectSession(session.id)}>
                    <IonLabel>{session.title}</IonLabel>
                    </IonItem>
                ))}
                </IonList>
                <IonButton expand="block" color="light" onClick={() => setCurrentWeekId(null)}>Avbryt</IonButton>
            </IonContent>
        </IonModal>
            </IonContent>
        </IonPage>
  );
};

export default ProgramBuilder;