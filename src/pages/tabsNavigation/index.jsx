import { IonTabs, IonRouterOutlet, IonTabBar, IonTabButton, IonIcon} from '@ionic/react';
import React from 'react';
import HomePage from '../../pages/home';
import { home, heart, barbell } from 'ionicons/icons';
import { Redirect, Route, useLocation } from 'react-router-dom';
import SpecificExercisePage from '../specificExercise';
import LogoutPage from '../logout';
import TrainingTabs from '../coach/training';
import SpecificSessionPage from '../specificSession';
import WorkoutSessionBuilder from '../../components/forms/coaches/sessions';
import UpdateSessionPage from '../coach/editSessionPage';
import ProgramBuilder from '../../components/forms/coaches/programs';
import SpecificProgramPage from '../specificProgram';
import EditProgramPage from '../coach/editProgramPage';
import { useAuth } from '../../contexts/auth';
import ClientTrainingTabs from '../client/training';
import ClientSpecificSessionPage from '../client/specificSession';


export default function Tabs() {

    const { profile } = useAuth();

    const location = useLocation();

    const hideTabBarPrefixes = [
        '/app/exercise/',
        '/app/session/',
        '/app/create-session',
        '/app/create-program',
        '/app/program/',
        '/app/client/exercise',
        '/app/client/session/'
      ];

      const shouldHideTabBar = hideTabBarPrefixes.some(prefix =>
        location.pathname.startsWith(prefix)
      );
    
    return(
        <IonTabs>
            <IonRouterOutlet>
                <Route exact path="/app/home" component={HomePage}/>
                <Route exact path="/app/exercise/:exerciseId" component={SpecificExercisePage}/>
                <Route exact path="/app/logout" component={LogoutPage} />
                <Route exact path="/app/training" component={TrainingTabs} />
                <Route exact path="/app/session/:sessionId" component={SpecificSessionPage} />
                <Route exact path="/app/session/:sessionId/edit" component={UpdateSessionPage} />
                <Route exact path="/app/create-session" component={WorkoutSessionBuilder} />
                <Route exact path="/app/create-program" component={ProgramBuilder} />
                <Route exact path="/app/program/:programId" component={SpecificProgramPage} />
                <Route exact path="/app/program/:programId/edit" component={EditProgramPage} />
                <Route exact path="/app/client/session/:sessionId" component={ClientSpecificSessionPage} />
                <Route exact path="/app/client/training" component={ClientTrainingTabs} />
                <Route exact path="/app/client/exercise/:exerciseId" component={SpecificExercisePage}/>
                <Route exact path="/app/client/home" component={HomePage} />
                <Route exact path="/app/client/logout" component={LogoutPage} />
                <Route exact path="/app">
                    <Redirect to={profile?.role === 'coach' ? "/app/home" : "/app/client/home"} />
                </Route>
            </IonRouterOutlet>

            <IonTabBar translucent={true} slot="bottom" style={{ display: shouldHideTabBar ? 'none' : 'flex' }}>
                <IonTabButton tab="home" href={profile?.role === 'coach' ? "/app/home" : "/app/client/home"}>
                    <IonIcon src={home} />
                </IonTabButton>
                <IonTabButton tab="training" href={profile?.role === 'coach' ? "/app/training" : "/app/client/training"}>
                    <IonIcon src={barbell} />
                </IonTabButton>
                <IonTabButton tab="logout" href={profile?.role === 'coach' ? "/app/logout" : "/app/client/logout"}>
                    <IonIcon src={heart} />
                </IonTabButton>
            </IonTabBar>
        </IonTabs>
    )
}