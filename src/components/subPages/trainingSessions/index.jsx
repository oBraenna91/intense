import React from 'react';
import WorkoutSessionBuilder from '../../forms/coaches/sessions';

export default function TrainingSessions({ userId }) {

    return(
        <>
            <WorkoutSessionBuilder userId={userId} />
        </>
    )
}