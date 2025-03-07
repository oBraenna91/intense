import React from 'react';
import Lottie from 'lottie-react';
import weatherAnimations from './weatherAnimations';

export default function WeatherAnimation({ weatherType }) {

    const animationData = weatherAnimations[weatherType] || weatherAnimations['Clouds'];

    return(
        <Lottie animationData={animationData}/>
    )
}