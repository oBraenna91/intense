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
import { AnimatePresence, motion } from 'framer-motion';
import { useParams } from 'react-router';
import { getSpecificProgram } from '../../../hooks/programs'; 
import { supabase } from '../../../supabaseClient';
import { getTrainingSessions } from '../../../hooks/sessions';
import { useAuth } from '../../../contexts/auth';
import { usePrograms } from '../../../hooks/programs';

export default function EditProgramPage() {
  const { programId } = useParams();
  const { coach } = useAuth();
  const { updateProgram } = usePrograms();
  const [program, setProgram] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [programName, setProgramName] = useState('');
  const [programDescription, setProgramDescription] = useState('');
  const [duration, setDuration] = useState('');
  const [mainFocus, setMainFocus] = useState('');
  const [sessions, setSessions] = useState([]);
  const [coverImages, setCoverImages] = useState([]);
  const [selectedCoverImage, setSelectedCoverImage] = useState(null);
  const [weeks, setWeeks] = useState([]);
  const [openWeekId, setOpenWeekId] = useState(null);
  const [sessionModalOpen, setSessionModalOpen] = useState(false);
  const [targetWeekId, setTargetWeekId] = useState(null);
  const [targetDayNumber, setTargetDayNumber] = useState(null);

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
        setProgramName(data.title);
        setProgramDescription(data.description);
        setDuration(data.duration);
        setMainFocus(data.main_focus);
        setSelectedCoverImage(data.cover_image?.id || null);

        const sortedWeeks = (data.program_weeks || []).sort((a, b) => a.week_number - b.week_number);

        const weeksWithDays = sortedWeeks.map((week) => {
          const daysMap = {};
          (week.program_activities || []).forEach((act) => {
            const d = act.day_number;
            if (!daysMap[d]) {
              daysMap[d] = [];
            }
            daysMap[d].push(act);
          });
          const daysArray = [];
          for (let dayNum = 1; dayNum <= 7; dayNum++) {
            daysArray.push({
              dayNumber: dayNum,
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

  const handleReorderWeeks = (event) => {
    const items = [...weeks];
    const [movedItem] = items.splice(event.detail.from, 1);
    items.splice(event.detail.to, 0, movedItem);
    event.detail.complete();
    items.forEach((w, index) => {
      w.weekNumber = index + 1;
    });

    setWeeks(items);
  };

  function toggleAccordion(weekId) {
    setOpenWeekId((prev) => (prev === weekId ? null : weekId));
  }

  function copyWeek(weekId) {
    const theWeek = weeks.find((w) => w.id === weekId);
    if (!theWeek) return;

    const newWeek = {
      id: `temp-week-${Date.now()}`,
      description: theWeek.description,
      weekNumber: weeks.length + 1,
      days: theWeek.days.map((d) => ({
        ...d,
        activities: d.activities.map((act) => ({
          ...act,
          id: `temp-act-${Date.now()}-${Math.random()}`,
        }))
      }))
    };

    setWeeks((prev) => [...prev, newWeek]);
    setOpenWeekId(newWeek.id);
  }

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
    filtered.forEach((w, i) => {
      w.weekNumber = i + 1;
    });
    setWeeks(filtered);
  }

  function updateWeekDescription(weekId, newDesc) {
    const updated = weeks.map((w) => {
      if (w.id === weekId) {
        return { ...w, description: newDesc };
      }
      return w;
    });
    setWeeks(updated);
  }

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

  function openSessionModal(weekId, dayNumber) {
    setTargetWeekId(weekId);
    setTargetDayNumber(dayNumber);
    setSessionModalOpen(true);
  }

  function selectSessionForDay(sessionId, sessionObj) {

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

  async function handleSaveProgram() {
    setLoading(true);
    setError(null);

    try {
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
        cover_image: selectedCoverImage, 
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

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref={`/app/program/${programId}`} text="Tilbake" />
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        {!program && (
          <div><IonSpinner/> Laster...</div>
        )}
        {loading && (
          <div><IonSpinner/> Laster...</div>
        )}
        {error && (
          <div>Oida, her har det skjedd noe!</div>
        )}
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
                                  let sessionName = null;
                                  if (activity.activity_type === 'workout') {
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
