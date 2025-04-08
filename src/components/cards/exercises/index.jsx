import React from 'react';
import { 
  IonItemSliding, 
  IonItem,  
  IonItemOptions, 
  IonItemOption, 
  IonIcon, 
  IonLabel
} from '@ionic/react';
import { trash } from 'ionicons/icons';

const ExerciseCard = ({ exercise, onClick, isOwner, onDelete }) => {
    const muscleNames = (exercise.exercise_muscles || [])
      .map((muscle) => muscle.muscles.name)
      .join(', ');
    const maxLength = 30;
    const displayMuscles = muscleNames.length > maxLength 
        ? muscleNames.substring(0, maxLength) + '...'
        : muscleNames;

  return (
    <IonItemSliding className="sliding-list-card">
      <IonItem lines="none" button onClick={onClick} className="list-card">
        <IonLabel>
            <div className={`list-text`}>
                <div className={`list-img-container`}>
                    <img src={exercise.image_url} className={`list-img`} alt="exercise" />
                </div>
                <div className={`list-col2`}>
                    <div className={`overrshoot list-name`}>
                        {exercise.name}
                    </div>
                    <div className={` list-muscle`}>
                        {displayMuscles}
                    </div>
                </div>
                <div className={`list-col3`}>
                    {isOwner && (
                        <div className="owner-badge" />
                    )}
                </div>
            </div>
        </IonLabel>
      </IonItem>
      <IonItemOptions side="end">
        {isOwner && (
            <IonItemOption color="danger" onClick={onDelete}>
                <IonIcon slot="icon-only" icon={trash} />
            </IonItemOption>
        )}
      </IonItemOptions>
    </IonItemSliding>
  );
};

export default ExerciseCard;

