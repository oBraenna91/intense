import React from 'react';
import { IonContent, IonPage, 
  //useIonRouter 
} from '@ionic/react';
import LoginForm from '../../components/forms/loginForm';
//import styles from './styles.module.scss';

export default function LoginPage() {
  //const router = useIonRouter();

  // const redirectToSignUpPage = () => {
  //   router.push('/sign-up', 'forward');
  // };

  // const redirectToForgotPassword = () => {
  //   router.push('/reset-password', 'forward'); 
  // };

  return (
    <IonPage>
        <IonContent>
            <div>
                <h1 className="text-center my-5">LOGG IN</h1>
                <LoginForm />
                {/* <div className={`${styles.forgotPasswordContainer}`}>
                    <div>Glemt pasord?</div>
                    <div className={styles.redirectWriting} onClick={redirectToForgotPassword}>
                      Klikk her
                    </div>
                </div>
                <div className={styles.signUpContainer}>
                    <div>Ikke konto enda?</div>
                    <div className={styles.redirectWriting} onClick={redirectToSignUpPage}>
                      Klikk her
                    </div>
                </div> */}
            </div>
        </IonContent>
    </IonPage>
    
  );
}
