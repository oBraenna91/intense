import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../contexts/auth';
import { supabase } from '../../../supabaseClient';
import { IonAlert, IonButton, IonContent, IonHeader, IonIcon, IonModal, IonTitle, IonToolbar } from '@ionic/react';
import ClientSessionCards from '../../cards/sessions/clientSessionCard';
import TaskCard from '../../cards/tasks';
import { checkmark, close } from 'ionicons/icons';

export default function ClientProgramOverView({ program, updateSlideHeight }) {
  
  const { user, client } = useAuth();
  const [activities, setActivities] = useState([]);
  const [workoutDetails, setWorkoutDetails] = useState({});
  const [progress, setProgress] = useState({});
  const [selectedTask, setSelectedTask] = useState(null);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showAlert, setShowAlert] = useState(false);

  const handleStartProgram = async () => {
    const { error } = await supabase
      .from('program_assignments')
      .update({ start_date: new Date().toISOString() })
      .eq('client_id', client.id);
    if (error) {
      console.error('Error starting program:', error);
    }
  };

  let currentDay = 0;
  let currentWeek = 0;
  let dayOfWeek = 0;
  let currentWeekRecord = null;

  if (program) {
    const programWeeks = program?.program_weeks || program?.program?.program_weeks || [];
    
    if (program.start_date) {
      const today = new Date();
      const startDate = new Date(program.start_date);
      const msPerDay = 1000 * 60 * 60 * 24;
      const daysPassed = Math.floor((today - startDate) / msPerDay);
      currentDay = daysPassed + 1;
      currentWeek = Math.ceil(currentDay / 7);
      dayOfWeek = ((currentDay - 1) % 7) + 1;
      currentWeekRecord = programWeeks.find(
        week => week.week_number === currentWeek
      );
    } else {
      currentDay = 1;
      currentWeek = 1;
      dayOfWeek = 1;
      currentWeekRecord = programWeeks.find(
        week => week.week_number === 1
      );
    }
  }

  const handleTaskComplete = async (isCompleted) => {
    if (!selectedTask || !user?.id) return;
    
    if (!program.start_date) {
      await handleStartProgram();
    }
  
    const { error } = await supabase
      .from('activity_progress')
      .upsert({
        program_activity_id: selectedTask.id,
        user_id: user.id,
        isDone: isCompleted
      }, { onConflict: 'program_activity_id,user_id' });
  
    if (error) {
      console.error('Error updating progress:', error);
    } else {
      setProgress(prev => ({
        ...prev,
        [selectedTask.id]: {
          isDone: isCompleted
        }
      }));
    }
  
    setShowTaskModal(false);
    setSelectedTask(null);
  };

  useEffect(() => {
  
    async function fetchActivities() {
      if (!currentWeekRecord || !user?.id) {
        console.log('Missing required data - currentWeekRecord or user.id');
        return;
      }
      
      try {
        const { data: activitiesData, error: activitiesError } = await supabase
          .from('program_activities')
          .select(`
            *,
            activity_progress(
              isDone
            )
          `)
          .eq('program_week_id', currentWeekRecord.id)
          .eq('day_number', dayOfWeek)
          .eq('activity_progress.user_id', user.id);
  
  
        if (activitiesError) throw activitiesError;
  
        // 2. Lag progress-map
        const progressMap = {};
        activitiesData.forEach(activity => {
          if (activity.activity_progress?.[0]) {
            progressMap[activity.id] = {
              isDone: activity.activity_progress[0].isDone
            };
          }
        });
        setProgress(progressMap);
  
        // 3. Hent workout-details
        const workoutDetails = {};
        const workoutActivities = activitiesData.filter(
          a => a.activity_type === 'workout' && a.workout_session_id
        );
  
        for (const activity of workoutActivities) {
          const { data: workoutData, error: workoutError } = await supabase
            .from('workout_sessions')
            .select(`
              title,
              main_focus,
              workout_cover_images ( image_url )
            `)
            .eq('id', activity.workout_session_id)
            .single();
  
          if (!workoutError) {
            workoutDetails[activity.workout_session_id] = {
              session: {
                id: activity.workout_session_id,
                title: workoutData.title,
                main_focus: workoutData.main_focus,
                workout_cover_images: workoutData.workout_cover_images?.image_url
                  ? [workoutData.workout_cover_images.image_url]
                  : [],
                isCompleted: progressMap[activity.id]?.isDone || false
              }
            };
          }
        }
  
        setActivities(activitiesData);
        setWorkoutDetails(workoutDetails);

        if (updateSlideHeight) {
          updateSlideHeight();
        }
  
      } catch (error) {
        console.error('Error fetching activities:', error);
      }
    }
  
    fetchActivities();
  }, [currentWeekRecord, dayOfWeek, user?.id, updateSlideHeight]);

  const sessions = Object.values(workoutDetails).map(detail => detail.session);

  // if (!program.start_date) {
    
  //   return (
  //       <div>
  //           <h2 className="text-center">Uke{currentWeek}, Dag {currentDay}   💪🏽</h2>
  //           <div className="ion-padding">
  //           {sessions.map(session => { 
  //             const extendedSession = session ? {
  //               ...session,
  //               programInfo: {
  //                 currentDay,
  //                 currentWeek,
  //                 currentWeekRecord,
  //                 dayOfWeek
  //               },
  //             }
  //             : null;
  //             return(
  //               <ClientSessionCards key={session.id} session={extendedSession} />
  //           )})}
  //           {activities.map(activity => (
  //               activity.activity_type === 'task' && (
  //                   <TaskCard task={activity} key={activity.id} />
  //               )
  //           ))}
  //           <div className="col-12 d-flex justify-content-center">
  //           <IonButton className="col-10" onClick={handleStartProgram} disabled={starting}>
  //               {starting ? "Starter..." : "Start Program"}
  //           </IonButton>
  //           </div>
            
  //       </div>
  //       </div>
  //   );
  // }

  return (
    <div>
        <h2 className="text-center">Uke{currentWeek}, Dag {currentDay}   💪🏽</h2>
        <div className="ion-padding">
      {sessions.length > 0 && (
        <div>
          {sessions.map(session => {
  const activity = activities.find(a => 
    a.activity_type === 'workout' && a.workout_session_id === session.id
  );
  const isCompleted = activity ? progress[activity.id]?.isDone : false;
  
  return (
    <ClientSessionCards 
      key={session.id}
      session={{
        ...session,
        programInfo: { currentDay, currentWeek, currentWeekRecord, dayOfWeek },
        isCompleted
      }}
    />
  );
})}
        </div>
      )}
      {activities.map(activity => (
  activity.activity_type === 'task' && (
    <TaskCard 
      key={activity.id}
      task={activity}
      isCompleted={progress[activity.id]?.isDone || false}
      onClick={() => {
        setSelectedTask(activity);
        setShowTaskModal(true);
      }}
    />
  )
))}
      {/* <div className="col-12 d-flex justify-content-center">
        <IonButton className="col-10" >
            Gå til dagens økt
        </IonButton>
      </div> */}
    </div>
    <IonModal breakpoints={[0.7, 1]} initialBreakpoint={0.7} isOpen={showTaskModal} onDidDismiss={() => setShowTaskModal(false)}>
          <IonHeader>
            <IonToolbar>
              <IonTitle className="text-center py-3">Oppgave</IonTitle>
            </IonToolbar>
          </IonHeader>
          <IonContent className="ion-padding">
            <h2>{selectedTask?.task_title}</h2>
            <p>{selectedTask?.task_description}</p>
            <div className="ion-text-center ion-margin-top">
              <IonButton 
                color="success" 
                onClick={() => handleTaskComplete(true)}
              >
                <IonIcon slot="start" icon={checkmark} />
                Marker som fullført
              </IonButton>
              {progress[selectedTask?.id]?.isDone && (
                <IonButton 
                  color="danger" 
                  onClick={() => setShowAlert(true)}
                >
                  <IonIcon slot="start" icon={close} />
                  Angre fullføring
                </IonButton>
              )}
            </div>
          </IonContent>
        </IonModal>
        <IonAlert
          isOpen={showAlert}
          onDidDismiss={() => setShowAlert(false)}
          header="Bekreft"
          message="Er du sikker på at du vil angre fullføringen?"
          buttons={[
            {
              text: 'Avbryt',
              role: 'cancel'
            },
            {
              text: 'Angre',
              handler: () => handleTaskComplete(false)
            }
          ]}
        />

    </div>
  );
}
