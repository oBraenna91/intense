import React, { useEffect, useState } from 'react';
import { fetchPrograms } from '../../../hooks/programs';
import { useAuth } from '../../../contexts/auth';
import { IonAccordion, IonAccordionGroup, IonButton, IonIcon, IonItem, IonLabel, IonList, IonSelect, IonSelectOption, useIonRouter, useIonViewWillEnter } from '@ionic/react';
import ProgramCards from '../../cards/programs';
import { filterOutline } from 'ionicons/icons';
import styles from './styles.module.scss';
import { useLocation } from 'react-router-dom/cjs/react-router-dom.min';

export default function ProgramsList() {
    const { user } = useAuth();
    const location = useLocation();
    const [programs, setPrograms] = useState([]);
    const router = useIonRouter();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedFocus, setSelectedFocus] = useState('');
    const [sortOrder, setSortOrder] = useState('asc');
    const [sortDateOrder, setSortDateOrder] = useState('newest');

    useEffect(() => {
        async function fetchProgs() {
            try {
                const response = await fetchPrograms(user.id);
                setPrograms(response);
            } catch (error) {
                console.error(error);
            }
        }
        fetchProgs();
    }, [user.id]);

    useIonViewWillEnter(() => {
        async function fetchAgain() {
            try {
                const response = await fetchPrograms(user.id);
                setPrograms(response);
            } catch(error) {
                console.error(error);
            }
        }
        fetchAgain();
    }, [user.id]);

    
    
    useEffect(() => {
        const newProgram = location.state?.newProgram;
        if (newProgram) {
            setPrograms((prevPrograms) => [newProgram, ...prevPrograms]);
            window.history.replaceState({}, document.title); 
        }
    }, [location.state]);

    const filteredPrograms = programs.filter(program => {
        const searchLower = searchTerm.toLowerCase();
        const titleMatches = program.title.toLowerCase().includes(searchLower);
        const focusMatches = selectedFocus
          ? program.main_focus.toLowerCase() === selectedFocus.toLowerCase()
          : true;
        return titleMatches && focusMatches;
      });
      
      const sortedPrograms = filteredPrograms.sort((a, b) => {
        if (sortOrder === 'asc') {
          return a.title.localeCompare(b.title);
        } else {
          return b.title.localeCompare(a.title);
        }
      }).sort((a, b) => {
        if (sortDateOrder === 'newest') {
          return new Date(b.created_at) - new Date(a.created_at);
        } else {
          return new Date(a.created_at) - new Date(b.created_at);
        }
      });

    const redirectToCreateProgram = () => {
        router.push('/app/create-program', 'forward');
    }

    return(
                <div>
                    <h2 className="text-center">Dine program</h2>
                    <IonAccordionGroup>
                        <IonAccordion value="filters">
                        <IonItem slot="header" lines="none" style={{ '--background': 'var(--ion-color-light)', }} >
                            <IonLabel>Filtre</IonLabel>
                            <IonIcon icon={filterOutline} />
                        </IonItem>

                        <div className="ion-padding" slot="content" style={{ background: 'var(--ion-color-light)' }}>
                            <IonItem style={{ '--background': 'var(--ion-color-light)', }}>
                            <IonLabel>Filtrer på hovedfokus</IonLabel>
                            <IonSelect
                                slot="end"
                                value={selectedFocus}
                                onIonChange={e => setSelectedFocus(e.detail.value)}
                            >
                                <IonSelectOption value="">Alle</IonSelectOption>
                                <IonSelectOption value="Styrke">Styrke</IonSelectOption>
                                <IonSelectOption value="Hypertrofi">Hypertrofi</IonSelectOption>
                                <IonSelectOption value="Utholdenhet">Utholdenhet</IonSelectOption>
                                <IonSelectOption value="Konkurranse prep">Konkurranse prep</IonSelectOption>
                                <IonSelectOption value="Vektnedgang">Vektnedgang</IonSelectOption>
                            </IonSelect>
                            </IonItem>

                            <IonItem style={{ '--background': 'var(--ion-color-light)', }}>
                            <IonLabel>Sorter alfabetisk</IonLabel>
                            <IonSelect
                                slot="end"
                                value={sortOrder}
                                onIonChange={e => setSortOrder(e.detail.value)}
                            >
                                <IonSelectOption value="asc">A - Å</IonSelectOption>
                                <IonSelectOption value="desc">Å - A</IonSelectOption>
                            </IonSelect>
                            </IonItem>

                            <IonItem style={{ '--background': 'var(--ion-color-light)', }}>
                            <IonLabel>Sorter etter opprettet dato</IonLabel>
                            <IonSelect
                                slot="end"
                                value={sortDateOrder}
                                onIonChange={e => setSortDateOrder(e.detail.value)}
                            >
                                <IonSelectOption value="newest">Nyeste først</IonSelectOption>
                                <IonSelectOption value="oldest">Eldste først</IonSelectOption>
                            </IonSelect>
                            </IonItem>
                        </div>
                        </IonAccordion>
                    </IonAccordionGroup>

                    <div className="col-12 d-flex justify-content-center my-2">
                        <input
                        className="intense-input col-10 rounded-3"
                        placeholder="Søk etter program..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className=" col-12 d-flex justify-content-center rounded-4">
                        <IonButton className="col-10 reg-shadow rounded-4" onClick={redirectToCreateProgram}>
                            Lag nytt program
                        </IonButton>
                    </div>
                    <div style={{ padding: '16px', backgroundColor: 'var(--ion-color-light)'}}>
                        <IonList className="custom-ion-list">
                            {sortedPrograms.length > 0 ? (
                            sortedPrograms.map((program, index) => (
                                <ProgramCards key={index} program={program} />
                            ))
                        ): (
                            <div className={`${styles.card}`}>
                                    <div className={`${styles.overlay}`}></div>
                                    <div className={styles.textDiv}>
                                        <div className={styles.title}>Du har ingen program foreløpig!</div>
                                        <div className={styles.focus}></div>
                                    </div>
                            </div>
                        )
                        }
                        </IonList>
                    </div>
                </div>
    )
}