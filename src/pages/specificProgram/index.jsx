import { IonAccordion, IonAccordionGroup, IonButton, IonContent, IonIcon, IonItem, IonLabel, IonPage, useIonRouter, useIonViewWillEnter } from '@ionic/react';
import { chevronBackOutline } from 'ionicons/icons';
import React, { useRef, useState } from 'react';
import { useParams } from 'react-router-dom/cjs/react-router-dom.min';
import { deleteProgram, getSpecificProgram } from '../../hooks/programs';
import styles from './styles.module.scss';
import { motion, AnimatePresence } from 'framer-motion';
import { chevronDown } from 'ionicons/icons';
import { SwipeableButton } from 'react-swipeable-button';

export default function SpecificProgramPage() {
    const { programId } = useParams();
    const router = useIonRouter();
    const [openWeekId, setOpenWeekId] = useState(null);
    const [program, setProgram] = useState(null);
    const swipeButtonRef = useRef();
    
    useIonViewWillEnter(() => {
        async function getProgram() {
            try {
                const response = await getSpecificProgram(programId);
                setProgram(response);
            } catch(error) {
                console.error(error);
            }
        }
        getProgram();
    },[programId]);

    const toggleAccordion = (weekId) => {
        setOpenWeekId(prev => (prev === weekId ? null : weekId))
    };

    const deleteSessionHandler = async (programId) => {
            const confirmed = window.confirm("Er du sikker på at du vil slette økten?");
            if (!confirmed) {
                if (swipeButtonRef.current) {
                    swipeButtonRef.current.buttonReset();
                  }
                  return;
            }
            try {
              await deleteProgram(programId);
              alert('Økten er slettet ❌')
              router.push('/app/training', 'back');
            } catch (error) {
              console.error("Feil ved sletting:", error.message);
            }
          };


    return(
        <IonPage>
            <IonContent fullscreen>
                <IonButton 
                    fill="clear" 
                    style={{ position: 'fixed', top: '50px', left: '0px', zIndex: 1000, color: 'white' }}
                    onClick={() => router.push('/app/training', 'back')}
                >
                    <IonIcon icon={chevronBackOutline} /> Tilbake
                </IonButton>
                <div className={styles.whitebackground}>
                    {program && (
                        <div className={styles.content}>
                            <div className={`${styles.imageContainer}`} style={{ backgroundImage: `url(${program.cover_image.image_url})` }}>
                            <div className={styles.overlay}></div>
                            </div>
                            <div className={`${styles.infoContainer}`}>
                                <div className={`${styles.title}`}>{program.title}</div>
                                <div className={`${styles.focus}`}>{program.main_focus}</div>
                                <div className={styles.duration}>
                                    {program.is_recurring ? 'Gjentakende' : `${program.duration} uker`}
                                </div>
                            </div>
                            {program.program_weeks.map((week) => {
                            
                                const isOpen = openWeekId === week.id;

                                return(
                                
                              <div key={week.id}>
                                <IonLabel style={{display: 'flex', alignItems:'center', justifyContent: 'space-between', padding: '16px', borderBottom: '1px solid lightgray'}} onClick={() => toggleAccordion(week.id)}>
                                    <div style={{ fontWeight: 'bold', fontSize: '1.6em', whiteSpace: 'nowrap', overflow:'hidden', textOverflow: 'ellipsis' }}>
                                        Uke {week.week_number}
                                    </div>
                                    <IonIcon 
                                        icon={chevronDown} 
                                        style={{
                                        fontSize: '1.4em',
                                        transition: 'transform 0.5s',
                                        transform: isOpen ? 'rotate(540deg)' : 'rotate(0deg)'
                                        }}
                                    />
                                    {/* <div style={{ fontSize: '0.85em', color: '#888' }}>{week.description}</div> */}
                                </IonLabel>
                                <AnimatePresence>
                                    {openWeekId === week.id && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        style={{ overflow: 'hidden', padding: '0', backgroundColor: 'var(--ion-color-light)'}}
                                    >
                                        <div className={``} style={{ 
                                            padding: '16px', 
                                            boxShadow: '0 3px 8px rgba(0,0,0,0.1)',
                                            backgroundColor: 'white',
                                            borderRadius: '8px',
                                            marginTop: '10px',
                                            marginBottom: '10px',
                                            marginLeft: '15px',
                                            marginRight: '15px'
                                            }}>
                                                <IonItem>
                                                    <IonLabel position="stacked">Beskrivelse av uken</IonLabel>
                                                    <div className={styles.weekDesc}>{week.description}</div>
                                                </IonItem>
                                              <IonAccordionGroup>
                                                {Array.from({ length: 7 }, (_, idx) => idx + 1).map((dayNum) => {
                                                    const activities = week.program_activities?.filter(a => a.day_number === dayNum) || [];

                                                    if (activities.length === 0) return null;

                                                    return (
                                                    <IonAccordion key={dayNum} value={`day-${week.id}-${dayNum}`}>
                                                        <IonItem slot="header">
                                                        <IonLabel style={{ fontSize: '1.3rem' }}><strong>Dag {dayNum}</strong></IonLabel>
                                                        </IonItem>
                                                        <div slot="content" style={{ padding: '12px 16px' }}>
                                                        {activities.map((activity, index) => (
                                                            <div
                                                            key={activity.id}
                                                            className={[
                                                                styles.exerciseCard,
                                                                activity.type === 'workout' ? styles.workoutCard : styles.taskCard,
                                                            ].join(' ')}
                                                            >
                                                            <div style={{ fontSize: '0.75em', color: 'gray' }}>
                                                                {activity.activity_type === 'task' ? 'Gjøremål' : 'Treningsøkt'}
                                                            </div>
                                                            <div style={{ fontWeight: 'bold', fontSize: '1.2em' }}>
                                                                {activity.activity_type === 'task'
                                                                ? activity.task_description
                                                                : activity.workout_session?.title || 'Ukjent økt'}
                                                            </div>
                                                            </div>
                                                        ))}
                                                        </div>
                                                    </IonAccordion>
                                                    );
                                                })}
                                                </IonAccordionGroup>
                                            </div>
                                    </motion.div>
                                    )}
                                </AnimatePresence>
                                </div>
                            )})}
                        </div>
                    )}
                    <div className="col-12 d-flex flex-column align-items-center my-5">
                        <IonButton className="col-10">Rediger program</IonButton>
                        <div className="col-10 mt-3">
                            <SwipeableButton
                                ref={swipeButtonRef}
                                onSuccess={() => deleteSessionHandler(programId)}
                                text="Sveip for å slette"
                                text_unlocked="Slett økt"
                                sliderColor="lightcoral"
                                autoWidth="true"
                            />
                        </div>
                        
                    </div>
                </div>
            </IonContent>
        </IonPage>
    )
}