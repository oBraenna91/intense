import React, { useEffect, useState } from 'react';
import { fetchExerciseHistory } from '../../../hooks/exercises';
import { IonButton, IonButtons, IonContent, IonHeader, IonItem, IonLabel, IonList, IonModal, IonTitle, IonToolbar } from '@ionic/react';
import { Line } from 'react-chartjs-2';
//eslint-disable-next-line
import Chart from 'chart.js/auto';

export default function ExerciseHistoryModal({ isOpen, onClose, exerciseId, exerciseName }) {
    const [historyData, setHistoryData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!exerciseId) {
            setLoading(false);
            return;
          }
        async function GetHistory() {
            try {
                const response = await fetchExerciseHistory(exerciseId);
                if (response.error) {
                    throw new Error(response.error);
                }
                setHistoryData(response);
            } catch (error) {
                console.error('Error fetching exercise history:', error);
            } finally {
                setLoading(false);
            }
        }
        GetHistory();
    },[exerciseId]);

    const chartData = {
        labels: [],
        datasets: [
          {
            label: 'Vekt (kg)',
            data: [],
            borderColor: 'rgba(75,192,192,1)',
            fill: false
          },
          {
            label: 'Reps',
            data: [],
            borderColor: 'rgba(153,102,255,1)',
            fill: false
          }
        ]
      };
    
    //   if (historyData && historyData.length > 0) {
    //     // Vi bruker dato for hver log (kan være flere sett per log)
    //     chartData.labels = historyData.map(log => new Date(log.created_at).toLocaleDateString());
        
    //     chartData.datasets[0].data = historyData.map(log => {
    //       const sets = log.workout_log_sets;
    //       if (sets && sets.length > 0) {
    //         const total = sets.reduce((sum, s) => sum + parseFloat(s.weight), 0);
    //         return (total / sets.length).toFixed(1);
    //       }
    //       return 0;
    //     });
    //     chartData.datasets[1].data = historyData.map(log => {
    //       const sets = log.workout_log_sets;
    //       if (sets && sets.length > 0) {
    //         const total = sets.reduce((sum, s) => sum + parseFloat(s.reps), 0);
    //         return (total / sets.length).toFixed(0);
    //       }
    //       return 0;
    //     });
    //   }

    if (historyData && historyData.length > 0) {
        // Lag en kopi av historyData i riktig rekkefølge (eldste først)
        const sortedData = historyData.slice().reverse();
      
        // Bruk dato for hver logg (eldste først) som labels
        chartData.labels = sortedData.map(log => new Date(log.created_at).toLocaleDateString());
        
        // Her tar vi gjennomsnittet av vekt og reps for hvert loggobjekt
        chartData.datasets[0].data = sortedData.map(log => {
          const sets = log.workout_log_sets;
          if (sets && sets.length > 0) {
            const total = sets.reduce((sum, s) => sum + parseFloat(s.weight), 0);
            return (total / sets.length).toFixed(1);
          }
          return 0;
        });
        chartData.datasets[1].data = sortedData.map(log => {
          const sets = log.workout_log_sets;
          if (sets && sets.length > 0) {
            const total = sets.reduce((sum, s) => sum + parseFloat(s.reps), 0);
            return (total / sets.length).toFixed(0);
          }
          return 0;
        });
      }

      return (
        <IonModal isOpen={isOpen} onDidDismiss={onClose}>
          <IonHeader>
            <IonToolbar>
              <IonTitle>{exerciseName} Historikk</IonTitle>
              <IonButtons slot="end">
                <IonButton onClick={onClose}>Lukk</IonButton>
              </IonButtons>
            </IonToolbar>
          </IonHeader>
          <IonContent className="ion-padding">
            {loading && <p>Laster historikk...</p>}
            {!loading && historyData.length === 0 && (
              <p>Ingen historikk funnet for de siste to månedene.</p>
            )}
    
            {historyData.length > 0 && (
              <>
                {/* Grafisk visning – linjegraf */}
                <div style={{ marginBottom: '2rem' }}>
                  <Line data={chartData} />
                </div>
    
                {/* Listevisning – detaljert info */}
                <IonList>
                  {historyData.map((log) => (
                    <IonItem key={log.id}>
                      <IonLabel>
                        <h2>{new Date(log.created_at).toLocaleDateString()}</h2>
                        {log.workout_log_sets.map((set, idx) => (
                          <p key={idx}>
                            Set {set.set_number}: {set.reps} reps, {set.weight} kg
                          </p>
                        ))}
                      </IonLabel>
                    </IonItem>
                  ))}
                </IonList>
              </>
            )}
          </IonContent>
        </IonModal>
      );
}