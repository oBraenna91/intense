import React from 'react';
import styles from './styles.module.scss';
import { IonIcon } from '@ionic/react';
import { checkmarkCircleOutline } from 'ionicons/icons';

export default function TaskCard({ task, isCompleted, onClick }) {
    return(
        <div className={`${styles.taskCard} ${isCompleted ? styles.completed : ''}`} onClick={onClick}>
            <div className="background-overlay"></div>
            <div className={styles.content}>
                <h2>{task.task_description}</h2>
            </div>
            {isCompleted && (
                <div className={styles.checkMark}>
                    <IonIcon icon={checkmarkCircleOutline} />
                </div>
                )}
        </div>
    )
}