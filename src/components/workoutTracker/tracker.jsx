import { IonButton, IonContent, IonIcon, IonSpinner, IonCheckbox, IonInput, useIonToast, IonTextarea, IonHeader, IonToolbar } from '@ionic/react';
import {  timeOutline, starOutline, star, addCircleOutline, trashOutline, chevronDownOutline, calendarOutline } from 'ionicons/icons';
import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../supabaseClient';
import styles from './styles.module.scss';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import { useAuth } from '../../contexts/auth';
import PauseModal from '../pauseModal';
import { Haptics, 
  //ImpactStyle
   } from '@capacitor/haptics';
import { getProgramActivityId } from '../../hooks/sessions';
import { schedulePauseEndNotification } from '../pauseNotif';
import ExerciseMedia from '../exerciseMedia';
import ExerciseHistoryModal from '../modals/exerciseHistory';


export default function WorkoutTracker({ session, onClose, programInfo }) {

    const { user, client } = useAuth();
  const [workoutData, setWorkoutData] = useState(() => {
    const savedData = localStorage.getItem('current-workout');
    return savedData ? JSON.parse(savedData) : {
      sessionId: session.id,
      exercises: session.workout_session_exercises.map(exercise => ({
        ...exercise,
        // sets: exercise.workout_session_exercise_sets.map(set => ({
        //   ...set,
        //   actualKg: '',
        //   actualReps: set.planned_reps,
        //   completed: false
        // }))
        sets: exercise.workout_session_exercise_sets.map(set => {
          const initialReps = isNumeric(set.planned_reps) ? set.planned_reps : '';
          return {
            ...set,
            actualKg: '',
            actualReps: initialReps, // kun tall, ellers tom streng
            completed: false
          };
        })
      })),
      startTime: new Date().toISOString(),
      currentExerciseIndex: 0,
      rating: 3,
      comment: ''
    };
  });

  function isNumeric(value) {
    return value !== '' && !isNaN(value) && !isNaN(parseFloat(value));
  }
  

  const calculateDuration = (startTimeString) => {
    const startTime = new Date(startTimeString).getTime();
    const now = Date.now();
    const seconds = Math.floor((now - startTime) / 1000);
    return seconds < 0 ? 0 : seconds;
  };


  const [sessionDuration, setSessionDuration] = useState(() => {
    return calculateDuration(workoutData.startTime);
  });
  const [isLoading, setIsLoading] = useState(false);
  const [presentToast] = useIonToast();
  const swiperRef = useRef(null);
  const [pauseCountdown, setPauseCountdown] = useState(null);
  const [pauseEndTime, setPauseEndTime] = useState(null);
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [selectedExerciseId, setSelectedExerciseId] = useState(null);
  const [selectedExerciseName, setSelectedExerciseName] = useState('');


  useEffect(() => {
    const interval = setInterval(() => {
      setSessionDuration(calculateDuration(workoutData.startTime));
    }, 1000);
    return () => clearInterval(interval);
  }, [workoutData.startTime]);

  useEffect(() => {
    localStorage.setItem('current-workout', JSON.stringify(workoutData));
  }, [workoutData]);

  useEffect(() => {
    const interval = setInterval(() => {
      setSessionDuration(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const savedEndTime = localStorage.getItem('pauseEndTime');
    if (savedEndTime) {
      setPauseEndTime(parseInt(savedEndTime, 10));
    }
  }, []);
  
  useEffect(() => {
    if (pauseEndTime) {
      localStorage.setItem('pauseEndTime', pauseEndTime.toString());
    } else {
      localStorage.removeItem('pauseEndTime');
    }
  }, [pauseEndTime]);

  // useEffect(() => {
  //   if (pauseCountdown === null) return;
  //   if(pauseCountdown === 3) {
  //     Haptics.vibrate();
  //   }
  //   if(pauseCountdown === 2) {
  //     Haptics.vibrate();
  //   }
  //   if(pauseCountdown === 1) {
  //     Haptics.vibrate();
  //   }
  //   if (pauseCountdown <= 0) {
  //     Haptics.vibrate();
  //     setPauseCountdown(null);
  //     return;
  //   }
  //   const interval = setInterval(() => {
  //     setPauseCountdown(prev => prev - 1);
  //   }, 1000);
  //   return () => clearInterval(interval);
  // }, [pauseCountdown]);

  useEffect(() => {
    if (!pauseEndTime) {
      setPauseCountdown(null);
      return;
    }
  
    function updateRemaining() {
      const diff = pauseEndTime - Date.now();
      return Math.ceil(diff / 1000);
    }
  
    const initial = updateRemaining();
    setPauseCountdown(initial);
  
    if (initial <= 0) {
      // allerede ferdig
      setPauseEndTime(null);
      return;
    }
  
    const interval = setInterval(() => {
      const remaining = updateRemaining();
      if (remaining <= 0) {
        clearInterval(interval);
        // ferdig
        setPauseCountdown(0);
        setPauseEndTime(null);
        // vibrasjon om ønskelig
        Haptics.vibrate();
      } else {
        setPauseCountdown(remaining);
      }
    }, 1000);
  
    return () => clearInterval(interval);
  }, [pauseEndTime]);

  const handleClosePauseModal = () => {
    //setPauseCountdown(null);
    setPauseEndTime(null);
  };

  function handleShowExerciseHistory(exerciseId, exerciseName) {
    console.log('Viser historikk for øvelse:', exerciseId, exerciseName);
    setSelectedExerciseId(exerciseId);
    setSelectedExerciseName(exerciseName);
    setHistoryModalOpen(true);
  }

  const handleInputChange = (exerciseIndex, setIndex, field, value) => {
    setWorkoutData(prev => {
      const newExercises = prev.exercises.map((exercise, exIdx) => {
        if (exIdx !== exerciseIndex) return exercise;
        return {
          ...exercise,
          sets: exercise.sets.map((set, sIdx) =>
            sIdx === setIndex ? { ...set, [field]: value } : set
          )
        };
      });
      return { ...prev, exercises: newExercises };
    });
  };  

  const addSet = (exerciseIndex) => {
    setWorkoutData(prev => {
      const newExercises = [...prev.exercises];
      const lastSet = newExercises[exerciseIndex].sets.slice(-1)[0];
      
      newExercises[exerciseIndex].sets.push({
        ...lastSet,
        id: `temp-${Date.now()}`,
        actualKg: '',
        completed: false
      });
      
      return { ...prev, exercises: newExercises };
    });
  };

  const removeLastSet = (exerciseIndex) => {
    setWorkoutData(prev => {
      const newExercises = prev.exercises.map((exercise, idx) => {
        if (idx !== exerciseIndex) return exercise;
        if (exercise.sets.length > 1) {
          return { ...exercise, sets: exercise.sets.slice(0, -1) };
        }
        return exercise;
      });
      return { ...prev, exercises: newExercises };
    });
  };
  

  const finishWorkout = async () => {
    setIsLoading(true);
    try {
      const finalDuration = calculateDuration(workoutData.startTime);

      const { data: insertedLogs, error: logError } = await supabase
        .from('workout_session_logs')
        .insert({
          workout_session_id: session.id,
          client_id: client.id,
          client_comment: workoutData.comment,       
          rating: workoutData.rating,
          duration: finalDuration,
          start_time: workoutData.startTime,        
          end_time: new Date().toISOString(),       
          name: session.title || 'Økt uten navn'      
        })
        .select()
        .single();  
  
      if (logError) throw logError;
  
      const newLog = insertedLogs;
      
      const exercisesUsed = workoutData.exercises.filter((exercise) =>
        exercise.sets.some(
          (s) => s.actualReps !== '' && s.actualKg !== ''
        )
      );
  
      const { data: insertedExercises, error: exercisesError } = await supabase
        .from('workout_log_exercises')
        .insert(
          exercisesUsed.map((exercise, index) => ({
            workout_session_log_id: newLog.id,
            exercise_id: exercise.exercise_id || exercise.exercise?.id,
            order: index + 1
          }))
        )
        .select();
  
      if (exercisesError) throw exercisesError;
  
      for (let i = 0; i < insertedExercises.length; i++) {
        const insertedExercise = insertedExercises[i];      
        const originalExercise = workoutData.exercises[i];  
  
        const setsToInsert = originalExercise.sets
        .filter(set => set.actualReps !== '' && set.actualKg !== '')
        .map((set, setIndex) => ({
            workout_log_exercise_id: insertedExercise.id,
            set_number: setIndex + 1,
            reps: parseInt(set.actualReps),
            weight: parseFloat(set.actualKg)
        }));
  
        //eslint-disable-next-line
        const { data: insertedSets, error: setsError } = await supabase
          .from('workout_log_sets')
          .insert(setsToInsert);
  
        if (setsError) throw setsError;
      }

      const programActivityId = await getProgramActivityId(session.id, programInfo.weekId, programInfo.dayOfWeek);
    if (programActivityId) {
      const { error: progressError } = await supabase
        .from('activity_progress')
        .insert({
          user_id: user.id,
          program_activity_id: programActivityId,
          isDone: true
        });
      if (progressError) throw progressError;
    } else {
      console.warn('program_activity_id mangler – aktiviteten ble ikke logget i progress');
    }
  
      localStorage.removeItem('current-workout');
      presentToast({
        message: 'Økt fullført!',
        duration: 3000,
        color: 'success'
      });
      onClose();
    } catch (error) {
      console.error('Feil ved lagring:', error);
      presentToast({
        message: 'Bruker lokal lagring - prøv igjen senere',
        duration: 3000,
        color: 'warning'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <>
     <IonHeader style={{ backgroundColor: 'white' }}>
     <IonToolbar
    style={{
      width: '100%'
    }}
  >
    <div className="d-flex col-12 align-items-center justify-content-between">
      <IonIcon icon={chevronDownOutline} onClick={onClose} style={{fontSize: '24px'}}/>
    <div
      className={styles.paginationContainer}
      style={{
        display: 'flex',
        flexGrow: 1,
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      {[...workoutData.exercises, { id: 'review' }].map((_, index) => (
        <div
          key={index}
          className={`${styles.paginationBullet} ${
            index === workoutData.currentExerciseIndex ? styles.paginationBulletActive : ''
          }`}
          onClick={() => swiperRef.current?.slideTo(index)}
        />
      ))}
    </div>
    <div
      className={styles.sessionTimer}
      style={{
        display: 'flex',
        alignItems: 'center'
      }}
    >
      <IonIcon icon={timeOutline} />
      <span>{formatTime(sessionDuration)}</span>
    </div>
    </div>

    
  </IonToolbar>
        {/* <IonButtons slot="start">
          <IonButton fill="clear" onClick={onClose}>
            <IonIcon icon={chevronDownOutline} />
          </IonButton>
        </IonButtons>
      </IonToolbar>
          <div className={styles.paginationContainer}>
            {[...workoutData.exercises, {id: 'review'}].map((_, index) => (
              <div 
                key={index}
                className={`${styles.paginationBullet} ${
                  index === workoutData.currentExerciseIndex ? styles.paginationBulletActive : ''
                }`}
                onClick={() => swiperRef.current?.slideTo(index)}
              />
            ))}
          </div>
          <div className={styles.sessionTimer}>
            <IonIcon icon={timeOutline} />
            <span>{formatTime(sessionDuration)}</span>
          </div> */}
    </IonHeader>
  <IonContent fullscreen style={{ 
    //'--padding-top': 'env(safe-area-inset-top)', 
    backgroundColor: 'white' }}>
      {isLoading && <IonSpinner />}
        
        <Swiper
          ref={swiperRef}
          onSlideChange={(swiper) => {
            setWorkoutData(prev => ({
              ...prev,
              currentExerciseIndex: swiper.activeIndex
            }));
          }}
          className={styles.exerciseSwiper}
        >
          {workoutData.exercises.map((exercise, exerciseIndex) => (
            <SwiperSlide key={exercise.id}>
              <div className={styles.exerciseSlide}>
              <div className={styles.exerciseMedia}>
                   {/* {exercise.exercise?.video_url ? (
                     <video src={exercise.exercise.video_url} controls />
                   ) : (
                     <img 
                       src={exercise.exercise?.image_url} 
                       alt={exercise.exercise?.name}
                       className={styles.exerciseImage}
                    />
                   )} */}
                   {exercise?.exercise && (
                    <ExerciseMedia exercise={exercise.exercise} />
                   )}
                 </div>
                 <div className="d-flex align-items-center justify-content-between px-2 mb-3">
                  <h2>{exercise.exercise?.name}</h2>
                  <IonIcon
                    icon={calendarOutline}
                    onClick={() =>
                      handleShowExerciseHistory(exercise.exercise?.id, exercise.exercise?.name)
                    }
                    style={{
                      fontSize: '24px',
                      cursor: 'pointer'
                    }}
                  />
                 </div>
                
                <div className={styles.setsTable}>
                  <div className={styles.setsHeader}>
                    <div>SET</div>
                    <div>KG</div>
                    <div>REPS</div>
                    <div></div>
                  </div>
                  
                  {exercise.sets.map((set, setIndex) => (
                    <div key={set.id} className={styles.setRow}>
                      <div>{setIndex + 1}</div>
                      <div>
                      <IonInput
                        type="number"
                        inputmode="decimal"
                        placeholder="-"
                        value={workoutData.exercises[exerciseIndex].sets[setIndex].actualKg || ''}
                        onIonInput={e =>
                        handleInputChange(exerciseIndex, setIndex, 'actualKg', e.detail.value)
                        }
                      />
                                        </div>
                                        <div>
                                        {/* <IonInput
                        type="number"
                        inputmode="decimal"
                        placeholder="-"
                        value={workoutData.exercises[exerciseIndex].sets[setIndex].actualReps || ''}
                        onIonInput={e =>
                        handleInputChange(exerciseIndex, setIndex, 'actualReps', e.detail.value)
                        }
                    /> */}
                    <IonInput
                      type="number"
                      inputmode="decimal"
                      placeholder={set.planned_reps || '-'}
                      value={workoutData.exercises[exerciseIndex].sets[setIndex].actualReps ?? ''}
                      onIonInput={e =>
                        handleInputChange(exerciseIndex, setIndex, 'actualReps', e.detail.value)
                      }
                    />
                        </div>
                                        <div>
                    <IonCheckbox
                        checked={workoutData.exercises[exerciseIndex].sets[setIndex].completed || false}
                        // onIonChange={e => {
                        //     const isChecked = e.detail.checked;
                        //     handleInputChange(exerciseIndex, setIndex, 'completed', isChecked);
                        //     if (isChecked) {
                        //     //setPauseCountdown(session.pause_timer);
                        //     const now = Date.now();
                        //     const endTime = now + session.pause_timer * 1000; // om X sek
                        //     setPauseEndTime(endTime);
                        //     schedulePauseEndNotification(session.pause_timer);
                        //     } else {
                        //     setPauseCountdown(null);
                        //     }
                        // }}
                        onIonChange={(e) => {
                          const isChecked = e.detail.checked;
                          
                          // 1) Hent reell "actualReps" og "actualKg"
                          const actualReps = workoutData.exercises[exerciseIndex].sets[setIndex].actualReps;
                          const actualKg = workoutData.exercises[exerciseIndex].sets[setIndex].actualKg;
                        
                          // 2) Sjekk om de er gyldige tall
                          const isRepsValid = actualReps && !isNaN(actualReps) && actualReps > 0;
                          const isKgValid = actualKg && !isNaN(actualKg) && actualKg > 0;
                        
                          if (isChecked) {
                            // 3) Hvis noe ikke er fylt inn, ikke la brukeren huke av
                            if (!isRepsValid || !isKgValid) {
                              // du kan sette en feilmelding, rød ramme eller lignende
                              // og avbryte check
                              // Eksempel:
                              presentToast({ 
                                message: 'Fyll inn gyldig reps og kg før du fullfører settet!', 
                                duration: 2000,
                                color: 'warning'
                              });
                              // Skru av sjekkboksen igjen:
                              e.target.checked = false;
                              return;
                            }
                            
                            // 4) Hvis valid => start pause
                            const now = Date.now();
                            const endTime = now + session.pause_timer * 1000;
                            setPauseEndTime(endTime);
                            schedulePauseEndNotification(session.pause_timer);
                          } else {
                            // Avbryt pause
                            setPauseCountdown(null);
                          }
                        
                          // 5) Uansett, oppdater state for "completed" for å matche 
                          handleInputChange(exerciseIndex, setIndex, 'completed', isChecked);
                        }}
                        />
                      </div>
                    </div>
                  ))}
                  <PauseModal 
    isOpen={pauseCountdown !== null} 
    pauseCountdown={pauseCountdown || 0} 
    sessionPauseTimer={session.pause_timer} 
    onClose={handleClosePauseModal} 
  />
                  
                  <IonButton expand="block" fill="outline" onClick={() => addSet(exerciseIndex)}>
                    <IonIcon icon={addCircleOutline} slot="start" /> Legg til sett
                  </IonButton>
                  <IonButton expand="block" fill="outline" onClick={() => removeLastSet(exerciseIndex)}>
                    <IonIcon icon={trashOutline} slot="start" />    Fjern siste sett
                    </IonButton>
                </div>
              </div>
              <div className="py-3" />
            </SwiperSlide>
          ))}
          <SwiperSlide key="review">
            <div className={styles.reviewSlide}>
              <h2>Vurder økten</h2>
              
              <div className={styles.ratingContainer}>
                {[1, 2, 3, 4, 5].map((starValue) => (
                  <IonIcon 
                    key={starValue}
                    icon={workoutData.rating >= starValue ? star : starOutline}
                    className={styles.starIcon}
                    onClick={() => setWorkoutData(prev => ({
                      ...prev,
                      rating: starValue
                    }))}
                  />
                ))}
              </div>
              
              <IonTextarea
                value={workoutData.comment}
                onIonInput={e => setWorkoutData(prev => ({
                  ...prev,
                  comment: e.detail.value
                }))}
                placeholder="Kommentar (valgfritt)"
              />
              
              <IonButton 
                expand="block" 
                onClick={finishWorkout}
              >
                Fullfør økt
              </IonButton>
            </div>
          </SwiperSlide>
        </Swiper>
        <ExerciseHistoryModal
          isOpen={historyModalOpen}
          onClose={() => setHistoryModalOpen(false)}
          exerciseId={selectedExerciseId}
          exerciseName={selectedExerciseName}
        />
      </IonContent>
    </>
  );
}