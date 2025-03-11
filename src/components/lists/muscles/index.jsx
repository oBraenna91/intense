import React, { useState, useEffect } from 'react';
import { IonSelect, IonSelectOption } from '@ionic/react';
import { supabase } from '../../../supabaseClient';

const MuscleSelect = ({ selectedMuscle, setSelectedMuscle }) => {
  const [muscles, setMuscles] = useState([]);

  useEffect(() => {
    const fetchMuscles = async () => {
      const { data, error } = await supabase
        .from('muscles')
        .select('*');
      if (error) {
        console.error('Feil ved henting av muskler:', error.message);
      } else {
        setMuscles(data);
      }
    };
    fetchMuscles();
  }, []);

  return (
    <IonSelect
      slot="end"
      value={selectedMuscle}
      placeholder="Alle"
      onIonChange={(e) => setSelectedMuscle(e.detail.value)}
      interface="alert"
      interfaceOptions={{ cssClass: 'custom-alert', cancelText: 'Avbryt', okText: 'OK' }}
    >
      <IonSelectOption value="">Alle</IonSelectOption>
      {muscles.map((muscle) => (
        <IonSelectOption key={muscle.id} value={muscle.name.toLowerCase()}>
          {muscle.name}
        </IonSelectOption>
      ))}
    </IonSelect>
  );
};

export default MuscleSelect;