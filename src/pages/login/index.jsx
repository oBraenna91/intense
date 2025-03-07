import React from 'react';
import { IonContent, IonPage, useIonRouter } from '@ionic/react';
import LoginForm from '../../components/forms/loginForm';
import styles from './styles.module.scss';

export default function LoginPage() {
  const router = useIonRouter();

  const redirectToSignUpPage = () => {
    router.push('/sign-up', 'forward'); // Naviger til sign-up siden med forward-animasjon
  };

  const redirectToForgotPassword = () => {
    router.push('/reset-password', 'forward'); // Naviger til reset-password siden med forward-animasjon
  };

  return (
    <IonPage>
        <IonContent>
            <div>
                <h1 className="text-center my-5">LOG IN</h1>
                <LoginForm />
                <div className={`${styles.forgotPasswordContainer}`}>
                    <div>Forgot your password?</div>
                    <div className={styles.redirectWriting} onClick={redirectToForgotPassword}>
                    Click here
                    </div>
                </div>
                <div className={styles.signUpContainer}>
                    <div>Not yet signed up?</div>
                    <div className={styles.redirectWriting} onClick={redirectToSignUpPage}>
                    Click here
                    </div>
                </div>
            </div>
        </IonContent>
    </IonPage>
    
  );
}
