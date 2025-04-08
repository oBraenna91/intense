import React from 'react';
import { supabase } from '../../supabaseClient';
import { useIonRouter } from '@ionic/react';
import styles from './styles.module.scss';

export default function LogoutButton() {
    const router = useIonRouter();

  const handleLogout = async () => {
    const confirmed = window.confirm('Er du sikker på at du har lyst til å logge ut?');

    if (confirmed) {
      await supabase.auth.signOut();
      alert('Du er nå logget ut!')
      router.push('/login', 'back');
    }
  };

  return <button className={styles.logOutButton} onClick={handleLogout}>Logg ut</button>;
}