import React, { useState } from 'react';
import { FetchAllExercises, useExercises } from '../../../hooks/exercises';
import { IonAccordionGroup, IonAccordion, IonModal, IonButton, IonItem, IonToggle, IonLabel, IonSelect, IonSelectOption, useIonViewWillEnter } from '@ionic/react';
import ExerciseForm from '../../forms/coaches/exercises/createExerciseForm';
import ExerciseCard from '../../cards/exercises';
import { useIonRouter } from '@ionic/react';
import MuscleSelect from '../muscles';
import { filterOutline } from 'ionicons/icons';
import { IonIcon } from '@ionic/react';
import { useAuth } from '../../../contexts/auth';

const ExerciseLegend = () => (
    <div className="d-flex col-12 justify-content-center mb-3">
      <div style={{ display: 'flex', alignItems: 'center', marginRight: '20px' }}>
        <div style={{ width: '20px', height: '20px', borderRadius: '50%', backgroundColor: '#ffffff', border: '1px solid #ccc', marginRight: '5px' }} />
        <span>Universell øvelse</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <div style={{ width: '20px', height: '20px', borderRadius: '50%', backgroundColor: 'var(--ion-color-primary)', marginRight: '5px' }} />
        <span>Dine øvelser</span>
      </div>
    </div>
  );

const ExerciseList = ({ userId, userRole }) => {
  const router = useIonRouter();
  const {profile} = useAuth();
  const { deleteExercise } = useExercises(userId);
  const [exercises, setExercises] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [showMineOnly, setShowMineOnly] = useState(false);
  const [selectedMuscle, setSelectedMuscle] = useState('');
  const [sortOrder, setSortOrder] = useState('asc');
  const [isLoading, setIsLoading] = useState(false);

  useIonViewWillEnter(() => {
    async function fetchEx() {
      setIsLoading(true);
      try {
        const response = await FetchAllExercises(userId);
        setExercises(response);
      } catch(error) {
        console.error(error);
      }finally {
        setIsLoading(false);
      }
    }
    fetchEx();
  }, [userId]);

  // useEffect(() => {
  //   setExercises(initialExercises);
  // }, [initialExercises]);

  const handleExerciseAdded = (newExercise) => {
    setExercises(prev => [newExercise, ...prev]);
  };

  const handleCardClick = (exercise) => {
    if (profile?.role === 'coach') {
      router.push(`/app/exercise/${exercise.id}`, 'forward');
    } else {
      router.push(`/app/client/exercise/${exercise.id}`, 'forward');
    }
  };

  const handleDeleteExercise = async (exercise) => {
    if (window.confirm("Er du sikker på at du vil slette denne øvelsen?")) {
      await deleteExercise(exercise);
    }
  }

  let filteredExercises = exercises.filter(exercise => {
    const matchesName = exercise.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesMine = showMineOnly ? (exercise.created_by === userId) : true;
    const matchesMuscle = selectedMuscle 
      ? exercise.exercise_muscles && exercise.exercise_muscles.some(em =>
           em.muscles && em.muscles.name.toLowerCase() === selectedMuscle.toLowerCase()
        )
      : true;
    return matchesName && matchesMine && matchesMuscle;
  });  


filteredExercises = filteredExercises.sort((a, b) => {
    if (sortOrder === 'asc') {
      return a.name.localeCompare(b.name);
    } else {
      return b.name.localeCompare(a.name);
    }
  });

  if (isLoading) return <p>Laster inn øvelser...</p>;

  return (
    <div>
      <h2 className="text-center">Øvelsesbank</h2>
      <IonAccordionGroup>
        <IonAccordion value="filters">
            <IonItem slot="header" lines="none" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', '--background': 'var(--ion-color-light)', }}>
              <IonLabel>Filtre</IonLabel>
              <IonIcon icon={filterOutline} />
            </IonItem>
            <div className="ion-padding" slot="content" style={{ background: 'var(--ion-color-light)' }}>
            {userRole === 'coach' && (
                <IonItem style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', '--background': 'var(--ion-color-light)', }}>
                <IonLabel>Vis kun mine øvelser</IonLabel>
                <IonToggle slot="end" checked={showMineOnly} onIonChange={e => setShowMineOnly(e.detail.checked)} />
                </IonItem>
            )}
            <IonItem style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', '--background': 'var(--ion-color-light)', }}>
                <IonLabel>Filtrer på muskelgruppe</IonLabel>
                <MuscleSelect selectedMuscle={selectedMuscle} setSelectedMuscle={setSelectedMuscle} />
            </IonItem>
            <IonItem style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', '--background': 'var(--ion-color-light)', }}>
                <IonLabel>Sorter alfabetisk</IonLabel>
                <IonSelect
                    slot="end"
                    value={sortOrder} 
                    onIonChange={e => setSortOrder(e.detail.value)}
                    interface="alert"
                    interfaceOptions={{ cssClass: 'custom-alert', cancelText: 'Avbryt', okText: 'OK' }}
                >
                <IonSelectOption value="asc">A - Å</IonSelectOption>
                <IonSelectOption value="desc">Å - A</IonSelectOption>
                </IonSelect>
            </IonItem>
            </div>
        </IonAccordion>
      </IonAccordionGroup>

      <div className="col-12 d-flex justify-content-center my-2">
        <input className="intense-input col-10 rounded-3" placeholder="Søk etter øvelse..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}>
        </input>
      </div>
      {userRole === 'coach' && (
        <div className="col-12 d-flex justify-content-center rounded-4">
            <IonButton className="col-10 reg-shadow rounded-4" onClick={() => setIsModalOpen(true)}>Legg til øvelse</IonButton>
        </div>
      )}
      {userRole === 'coach' && (<ExerciseLegend />)}
      {exercises.length === 0 ? (
        <p>Ingen øvelser funnet. {userRole === 'coach' && 'Legg til en øvelse for å komme i gang!'}</p>
      ) : (
        <div className="d-flex flex-column align-items-center col-11 m-auto list-container">
          {filteredExercises.map((exercise) => {
                const isOwner = exercise.created_by === userId;
                return (
                <ExerciseCard 
                    key={exercise.id}
                    exercise={exercise}
                    onClick={() => handleCardClick(exercise)}
                    isOwner={isOwner}
                    onDelete={() => handleDeleteExercise(exercise)}
                />
                );
            })}
        </div>
      )}

      <IonModal 
        isOpen={isModalOpen} 
        onDidDismiss={() => setIsModalOpen(false)}
        breakpoints={[0, 1]} 
        initialBreakpoint={1} 
        cssClass="bottom-sheet-modal"
      >
        <div className="modal-content">
          <ExerciseForm 
            userId={userId} 
            onClose={() => setIsModalOpen(false)} 
            onExerciseAdded={handleExerciseAdded} 
          />
        </div>
      </IonModal>
    </div>
  );
};

export default ExerciseList;