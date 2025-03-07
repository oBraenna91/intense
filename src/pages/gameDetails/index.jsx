import { IonBackButton, IonButtons, IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import React, {useState, useEffect} from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../../supabaseClient';

export default function GameDetailsPage() {

    const { id } = useParams(); 
    const [game, setGame] = useState(null); 
    const [loading, setLoading] = useState(true);
    const [historicalResults, setHistoricalResults] = useState([]);

    useEffect(() => {
        const fetchGameDetails = async () => {
            try {
              const { data, error } = await supabase
                .from('games')
                .select('*, rules(rules_list, comments)')
                .eq('id', id)
                .single();
          
              if (error) {
                console.error('Error fetching game details:', error.message);
                setGame(null);
              } else {  
                console.log('DATA',data)
                setGame(data);
              }
            } catch (err) {
              console.error('Unexpected error:', err.message);
            } finally {
              setLoading(false);
            }
          };

        fetchGameDetails();
    }, [id]);

    // 'user_id, score, season_id, users(name), seasons(year)'

    useEffect(() => {
        const fetchHistoricalResults = async () => {
          try {
            const { data, error } = await supabase
                .from('results')
                .select('score, seasons(year), users(name)')
                .eq('game_id', id)
                .order('score', { ascending: true });
            if (error) {
              console.error('Error fetching historical results:', error.message);
            } else {
              setHistoricalResults(data);
              console.log('DATA',data);
            }
          } catch (err) {
            console.error('Unexpected error:', err.message);
          }
        };
    
        fetchHistoricalResults();
      }, [id]);
      
      
      const sortedResults = [...historicalResults].sort((a, b) => {
        if (a.seasons.year !== b.seasons.year) {
          return a.seasons.year - b.seasons.year; 
        }
        return a.score - b.score; 
      });

    return(
        <IonPage>
            <IonHeader>
                <IonToolbar color="primary">
                <IonButtons slot="start">
                    <IonBackButton defaultHref="/app/games" />
                </IonButtons>
                <IonTitle>Game Details</IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent className="ion-padding">
            {loading ? (
                <p>Laster detaljer...</p>
                ) : game ? (
                <div>
                    <h1>{game.title}</h1>
                    <p>{game.description}</p>
                    <p>Type: {game.type}</p>
                    <p>Opprettet: {new Date(game.created_at).toLocaleDateString()}</p>
                    <p>Historisk: {game.is_historical ? 'Ja' : 'Nei'}</p>

                    <div>
                        <h2>Regler:</h2>
                        {game && game.rules && Array.isArray(game.rules.rules_list) ? (
                            <div>
                            <ul>
                                {game.rules.rules_list.map((rule, index) => (
                                <li key={index}>{rule}</li>
                                ))}
                            </ul>
                            <p>Komentarer: {game.rules.comments}</p>
                            </div>
                        ) : (
                            <p>Ingen regler lagt til for dette spillet.</p>
                        )}
                    </div>

                    <div>
                    <h2>Historiske resultater:</h2>
                    {sortedResults.length > 0 ? (
                        sortedResults.map((result) => (
                        <div key={`${result.user_id}-${result.season_id}`}>
                            <p>
                            {result.users?.name || 'Ukjent bruker'} vant med {result.score} poeng i{' '}
                            {result.seasons?.year || 'ukjent år'}
                            </p>
                        </div>
                        ))
                    ) : (
                        <p>Ingen historiske resultater funnet</p>
                    )}
                    </div>
                </div>
                ) : (
                <p>Fant ikke spilldetaljer</p>
                )}
            </IonContent>
        </IonPage>
    )
}