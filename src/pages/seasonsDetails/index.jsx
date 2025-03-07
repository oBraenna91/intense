import React, { useState, useEffect } from 'react';
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem, IonLabel } from '@ionic/react';
import { useParams, useHistory } from 'react-router-dom';
import { fetchGamesBySeason } from '../../fetch/seasons_and_results';

export default function SeasonDetailsPage() {
  const { seasonId } = useParams(); // Hent ID fra URL
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const history = useHistory();

  useEffect(() => {
    const getGames = async () => {
      const data = await fetchGamesBySeason(seasonId);
      setGames(data);
      setLoading(false);
    };

    getGames();
  }, [seasonId]);

  const goToGameDetails = (gameId) => {
    history.push(`/game/${gameId}`);
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Detaljer for Sesongen</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        {loading ? (
          <p>Laster spill...</p>
        ) : (
          <IonList>
            {games.map((game) => (
              <IonItem key={game.id} button onClick={() => goToGameDetails(game.id)}>
                <IonLabel>
                  <h2>{game.title}</h2>
                  <p>{game.description}</p>
                </IonLabel>
              </IonItem>
            ))}
          </IonList>
        )}
      </IonContent>
    </IonPage>
  );
}
