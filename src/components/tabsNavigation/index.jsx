import { IonTabs, IonRouterOutlet, IonTabBar, IonTabButton, IonIcon } from '@ionic/react';
import React from 'react';
import HomePage from '../../pages/home';
import { Redirect, Route } from 'react-router-dom/cjs/react-router-dom.min';
import HomeIcon from '../../visuals/icons/home.svg'
import Contestants from '../../visuals/icons/group (1).svg';
import Games from '../../visuals/icons/dice.svg';
import Results from '../../visuals/icons/podium.svg';
import History from '../../visuals/icons/assessment.svg';
import GamesPage from '../../pages/games';
import ResultsPage from '../../pages/results';
import ContestantsPage from '../../pages/contestants';
import SeasonListPage from '../../pages/seasons';

export default function Tabs() {
    
    return(
        <IonTabs>
            <IonRouterOutlet>
                <Route exact path="/app/home" component={HomePage}/>
                <Route exact path="/app/games" component={GamesPage}/>
                <Route exact path="/app/seasons" component={SeasonListPage} />
                <Route exact path="/app/results" component={ResultsPage} />
                <Route exact path="/app/contestants" component={ContestantsPage} />
                <Route exact path="/app">
                    <Redirect to="/app/home"/>
                </Route> 
            </IonRouterOutlet>
            <IonTabBar slot="bottom">
                <IonTabButton tab="home" href="/app/home">
                    <IonIcon src={HomeIcon} />
                </IonTabButton>
                <IonTabButton tab="contestants" href="/app/contestants">
                    <IonIcon src={Contestants} />
                </IonTabButton>
                <IonTabButton tab="games" href="/app/games">
                    <IonIcon src={Games} />
                </IonTabButton>
                <IonTabButton tab="results" href="/app/results">
                    <IonIcon src={Results} />
                </IonTabButton>
                <IonTabButton tab="history" href="/app/seasons">
                    <IonIcon src={History} />
                </IonTabButton>
            </IonTabBar>
        </IonTabs>
    )
}