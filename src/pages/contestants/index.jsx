import { IonTitle, IonToolbar, IonPage, IonHeader, IonContent } from '@ionic/react';
import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';

export default function ContestantsPage() {

    const [contestants, setContestants] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchContestants = async () => {
          const { data, error } = await supabase
            .from('users')
            .select('*')
            .order('created_at', { ascending: false });
          if (error) {
            console.error('Error fetching games:', error.message);
          } else {
            setContestants(data);
          }
          setLoading(false);
        };
    
        fetchContestants();
      }, []);

    if(loading) {
        return(
            <div>Laster inn deltakere...</div>
        )
    }
    
    return(
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonTitle>Deltakere</IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent className="ion-padding">
                {contestants.length > 0 ? (
                    <ul>
                    {contestants.map((contestant) => (
                        <li key={contestant.id} style={{ marginBottom: '1rem', listStyle: 'none' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            {/* Profilbilde */}
                            {contestant.profile_picture_url ? (
                            <img
                                src={contestant.profile_picture_url}
                                alt={`${contestant.name}'s profile`}
                                style={{
                                width: '50px',
                                height: '50px',
                                borderRadius: '50%',
                                objectFit: 'cover',
                                }}
                            />
                            ) : (
                            <div
                                style={{
                                width: '50px',
                                height: '50px',
                                borderRadius: '50%',
                                background: '#ccc',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: 'bold',
                                }}
                            >
                                {contestant.name ? contestant.name.charAt(0).toUpperCase() : '?'}
                            </div>
                            )}

                            {/* Info */}
                            <div>
                            <p style={{ margin: 0, fontWeight: 'bold' }}>{contestant.name || 'Ukjent navn'}</p>
                            <p style={{ margin: 0, fontSize: '0.9rem', color: '#555' }}>
                                {contestant.isAdmin ? 'Admin' : 'Deltaker'}
                            </p>
                            <p style={{ margin: 0, fontSize: '0.8rem', color: '#888' }}>
                                Registrert: {new Date(contestant.created_at).toLocaleDateString()}
                            </p>
                            </div>
                        </div>
                        </li>
                    ))}
                    </ul>
                ) : (
                    <p>Ingen deltakere funnet.</p>
                )}
                </IonContent>
        </IonPage>
    )
}