import { IonButton, IonContent, IonIcon, IonSpinner, IonCheckbox, IonInput, useIonToast, IonTextarea } from '@ionic/react';
import {  timeOutline, starOutline, star, addCircleOutline, trashOutline, chevronDownOutline } from 'ionicons/icons';
import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../supabaseClient';
import styles from './styles.module.scss';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import { useAuth } from '../../contexts/auth';
import PauseModal from '../pauseModal';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { getProgramActivityId } from '../../hooks/sessions';


export default function WorkoutTracker({ session, onClose, programInfo }) {


    const { user, client } = useAuth();
  // Initial state med lokal lagring
  const [workoutData, setWorkoutData] = useState(() => {
    const savedData = localStorage.getItem('current-workout');
    return savedData ? JSON.parse(savedData) : {
      sessionId: session.id,
      exercises: session.workout_session_exercises.map(exercise => ({
        ...exercise,
        sets: exercise.workout_session_exercise_sets.map(set => ({
          ...set,
          actualKg: '',
          actualReps: set.planned_reps,
          completed: false
        }))
      })),
      startTime: new Date().toISOString(),
      currentExerciseIndex: 0,
      rating: 3,
      comment: ''
    };
  });


  const [sessionDuration, setSessionDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [presentToast] = useIonToast();
  const swiperRef = useRef(null);
  const [pauseCountdown, setPauseCountdown] = useState(null);

  // Lagre underveis
  useEffect(() => {
    localStorage.setItem('current-workout', JSON.stringify(workoutData));
  }, [workoutData]);

  // Timer for øktens varighet
  useEffect(() => {
    const interval = setInterval(() => {
      setSessionDuration(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (pauseCountdown === null) return;
    if (pauseCountdown <= 0) {
        Haptics.impact({ style: ImpactStyle.Heavy });
      setPauseCountdown(null);
      return;
    }
    const interval = setInterval(() => {
      setPauseCountdown(prev => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [pauseCountdown]);

  const handleClosePauseModal = () => {
    setPauseCountdown(null);
  };

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
        // Behold eventuelt actualReps eller sett opp nye defaults
        completed: false
      });
      
      return { ...prev, exercises: newExercises };
    });
  };

  const removeLastSet = (exerciseIndex) => {
    setWorkoutData(prev => {
      const newExercises = prev.exercises.map((exercise, idx) => {
        if (idx !== exerciseIndex) return exercise;
        // Hvis det er mer enn ett sett, fjern det siste
        if (exercise.sets.length > 1) {
          return { ...exercise, sets: exercise.sets.slice(0, -1) };
        }
        // Eller eventuelt vis en melding, hvis du ikke vil fjerne det siste settet
        return exercise;
      });
      return { ...prev, exercises: newExercises };
    });
  };
  

  const finishWorkout = async () => {
    setIsLoading(true);
    try {
      // 1) Opprett ny log i workout_session_logs
      //    Bruk "select()" for å få tilbake den nye raden med ID
      const { data: insertedLogs, error: logError } = await supabase
        .from('workout_session_logs')
        .insert({
          // Navn på kolonner i workout_session_logs:
          workout_session_id: session.id,
          client_id: client.id,
          client_comment: workoutData.comment,       // eller "comment"
          rating: workoutData.rating,
          duration: sessionDuration,
          start_time: workoutData.startTime,        // hvis du ønsker
          end_time: new Date().toISOString(),       // f.eks. "nå"
          name: session.title || 'Økt uten navn'      // eller hva du vil kalle det
        })
        .select()
        .single();  // .single() hvis du kun forventer én rad
  
      if (logError) throw logError;
  
      const newLog = insertedLogs; // resultatet fra insert
      
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
  
      // insertedExercises vil matche rekkefølgen til .map() over.
      // Dvs. insertedExercises[i] hører til workoutData.exercises[i].
  
      // 3) Opprett sets i workout_log_sets for hver exercise
      for (let i = 0; i < insertedExercises.length; i++) {
        const insertedExercise = insertedExercises[i];      // den nye DB-raden
        const originalExercise = workoutData.exercises[i];  // data i state
  
        const setsToInsert = originalExercise.sets
        // Filtrer ut sett som ikke er fylt inn
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
      <IonContent fullscreen style={{ '--padding-top': 'env(safe-area-inset-top)'  }}>
        {/* Header */}
        <div className={`${styles.topHeader} mt-3`}>
          <IonButton fill="clear" onClick={onClose}>
            <IonIcon icon={chevronDownOutline} />
          </IonButton>
          {isLoading && <IonSpinner />}
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
          </div>
        </div>

        {/* Main content */}
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
                   {exercise.exercise?.video_url ? (
                     <video src={exercise.exercise.video_url} controls />
                   ) : (
                     <img 
                       src={exercise.exercise?.image_url} 
                       alt={exercise.exercise?.name}
                       className={styles.exerciseImage}
                    />
                   )}
                 </div>
                <h2>{exercise.exercise?.name}</h2>
                
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
                                        <IonInput
                        type="number"
                        inputmode="decimal"
                        placeholder="-"
                        value={workoutData.exercises[exerciseIndex].sets[setIndex].actualReps || ''}
                        onIonInput={e =>
                        handleInputChange(exerciseIndex, setIndex, 'actualReps', e.detail.value)
                        }
                    />
                        </div>
                                        <div>
                                        {/* <IonCheckbox
                        checked={workoutData.exercises[exerciseIndex].sets[setIndex].completed || false}
                        onIonChange={e =>
                        handleInputChange(exerciseIndex, setIndex, 'completed', e.detail.checked)
                        }
                    /> */}
                    <IonCheckbox
                        checked={workoutData.exercises[exerciseIndex].sets[setIndex].completed || false}
                        onIonChange={e => {
                            const isChecked = e.detail.checked;
                            // Oppdater settet som fullført
                            handleInputChange(exerciseIndex, setIndex, 'completed', isChecked);
                            // Start nedtelling når settet markeres fullført, basert på session.pause_timer
                            if (isChecked) {
                            setPauseCountdown(session.pause_timer);
                            } else {
                            // Hvis brukeren fjerner merket, kan du nullstille nedtellingen (eller la den fortsette)
                            setPauseCountdown(null);
                            }
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
          
          {/* Review slide */}
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
      </IonContent>
  );
}