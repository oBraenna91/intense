// Plasser gjerne øverst i WorkoutTracker.js
import { LocalNotifications } from '@capacitor/local-notifications';

export async function schedulePauseEndNotification(secondsUntilEnd) {
  const endTime = new Date().getTime() + secondsUntilEnd * 1000;

  try {
    await LocalNotifications.schedule({
      notifications: [
        {
          id: new Date().getTime(),  // Generer unik ID
          title: 'Pausen er ferdig!',
          body: 'Fortsett økten din nå',
          schedule: { at: new Date(endTime) },
          sound: 'default' 
          // 'default' => standardlyd + vibrasjon på iOS (hvis telefonen ikke er i lydløs modus)
        }
      ]
    });
    console.log('Notifikasjon planlagt!');
  } catch (err) {
    console.error('Feil ved planlegging av notifikasjon:', err);
  }
}
