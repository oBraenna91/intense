import React, { useState } from 'react';
import { IonIcon } from '@ionic/react';
import { playCircle } from 'ionicons/icons';

function ExerciseMedia({ exercise }) {
  const [showVideo, setShowVideo] = useState(false);

  if (!exercise.video_url) {
    // Ingen video – bare vis bilde
    return (
      <img
        src={exercise.image_url}
        alt={exercise.name}
        style={{ width: '100%' }}
      />
    );
  }

  // Hvis vi HAR video:
  if (showVideo) {
    // 2) Bruker har trykket play => vis iframe
    return (
      <div className="video-container">
        <iframe
          width="100%"
          height="240"
          src={`https://www.youtube.com/embed/${exercise.video_url}`}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          title="YouTube video player"
        />
      </div>
    );
  } else {
    // 1) Standard: bilde med Play-ikon over
    return (
      <div style={{ position: 'relative', width: '100%' }}>
        <img
          src={exercise.image_url}
          alt={exercise.name}
          style={{ width: '100%', display: 'block' }}
        />
        
        <IonIcon
          icon={playCircle}
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            fontSize: '75px',
            transform: 'translate(-50%, -50%)',
            cursor: 'pointer',
            color: 'white',
          }}
          onClick={() => setShowVideo(true)}
        />
      </div>
    );
  }
}

export default ExerciseMedia;
