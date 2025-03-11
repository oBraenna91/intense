import { IonTabs, IonRouterOutlet, IonTabBar, IonTabButton, IonIcon} from '@ionic/react';
import { useLocation } from 'react-router-dom/cjs/react-router-dom.min';
import React from 'react';
import HomePage from '../../pages/home';
import { Redirect, Route } from 'react-router-dom/cjs/react-router-dom.min';
import { home, heart, barbell } from 'ionicons/icons';
import SpecificExercisePage from '../specificExercise';
import LogoutPage from '../logout';
import TrainingTabs from '../training';


export default function Tabs() {

    const location = useLocation();

    const hideTabBarPrefixes = [
        '/app/exercise/',
        
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
                <Route exact path="/app">
                    <Redirect to="/app/home"/>
                </Route> 
            </IonRouterOutlet>
            <IonTabBar translucent={true} slot="bottom" style={{ display: shouldHideTabBar ? 'none' : 'flex' }}>
                <IonTabButton tab="home" href="/app/home">
                    <IonIcon src={home} />
                </IonTabButton>
                <IonTabButton tab="training" href="/app/training">
                    <IonIcon src={barbell} />
                </IonTabButton>
                <IonTabButton tab="logout" href="/app/logout">
                    <IonIcon src={heart} />
                </IonTabButton>
            </IonTabBar>
        </IonTabs>
    )
}