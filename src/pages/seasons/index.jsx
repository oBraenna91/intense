import React, { useState, useEffect } from 'react';
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem, IonLabel } from '@ionic/react';
import { useHistory } from 'react-router-dom';
import { fetchSeasons } from '../../fetch/seasons_and_results';

export default function SeasonListPage() {
  const [seasons, setSeasons] = useState([]);
  const [loading, setLoading] = useState(true);
  const history = useHistory();

  useEffect(() => {
    const getSeasons = async () => {
      const data = await fetchSeasons();
      setSeasons(data);
      setLoading(false);
    };

    getSeasons();
  }, []);

  const goToSeasonDetails = (seasonId) => {
    history.push(`/season/${seasonId}`);
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Årlige Kragerø Games</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        {loading ? (
          <p>Laster sesonger...</p>
        ) : (
          <IonList>
            {seasons.map((season) => (
              <IonItem key={season.id} button onClick={() => goToSeasonDetails(season.id)}>
                <IonLabel>
                  <h2>{season.name}</h2>
                  <p>År: {season.year}</p>
                </IonLabel>
              </IonItem>
            ))}
          </IonList>
        )}
      </IonContent>
    </IonPage>
  );
}
