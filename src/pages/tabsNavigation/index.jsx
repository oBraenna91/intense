import { IonTabs, IonRouterOutlet, IonTabBar, IonTabButton, IonIcon} from '@ionic/react';
import { useLocation } from 'react-router-dom/cjs/react-router-dom.min';
import React from 'react';
import HomePage from '../../pages/home';
import { Redirect, Route } from 'react-router-dom/cjs/react-router-dom.min';
import { home, heart } from 'ionicons/icons';


export default function Tabs() {

    const location = useLocation();

    const hideTabBarPrefixes = [
        '/app/myfamily/child-info/',
        '/app/myfamily/family/'
      ];

      const shouldHideTabBar = hideTabBarPrefixes.some(prefix =>
        location.pathname.startsWith(prefix)
      );
    
    return(
        <IonTabs>
            <IonRouterOutlet>
                <Route exact path="/app/home" component={HomePage}/>
                <Route exact path="/app">
                    <Redirect to="/app/home"/>
                </Route> 
            </IonRouterOutlet>
            <IonTabBar translucent={true} slot="bottom" style={{ display: shouldHideTabBar ? 'none' : 'flex' }}>
                <IonTabButton tab="home" href="/app/home">
                    <IonIcon src={home} />
                </IonTabButton> 
                <IonTabButton tab="myfamily" href="/app/home">
                    <IonIcon src={heart} />
                </IonTabButton>
            </IonTabBar>
        </IonTabs>
    )
}