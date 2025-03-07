import React from 'react';
import { IonApp, IonRouterOutlet } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { Route } from 'react-router-dom';
import LoginPage from './pages/login';
import ResetPasswordPage from './pages/resetPassword';
import SignUpPage from './pages/signUp';
import Tabs from './pages/tabsNavigation';
import { AuthProvider } from './contexts/auth';
//import { RequestCountProvider } from './contexts/RequestCount';
import IndexRedirect from './pages/indexRedirect';
import SetupUserPage from './pages/setupUser';
import ProtectedRoute from './privateRoute/privateRoute';

function App() {

  return (
    <IonApp>
      <AuthProvider>
        {/* <RequestCountProvider> */}
          <IonReactRouter>
            <IonRouterOutlet>
              <Route exact path="/" component={IndexRedirect}/>
              <Route path="/login" component={LoginPage}/>
              <Route path="/reset-password" component={ResetPasswordPage}/>
              <Route path="/sign-up" component={SignUpPage} />
              <ProtectedRoute path="/setup-user" component={SetupUserPage}/>
              <ProtectedRoute path="/app" component={Tabs}/>
            </IonRouterOutlet>
          </IonReactRouter>
        {/* </RequestCountProvider> */}
      </AuthProvider>
    </IonApp>
  );
}

export default App;





  // {/* Offentlige ruter */}
  // <Route path="/login" component={LoginPage} exact />
  // <Route path="/sign-up" component={SignUpPage} exact />
  // <Route path="/reset-password" component={ResetPasswordPage} exact />
  // <Route path="/update-password" component={UpdatePasswordPage} exact />

  // {/* Beskyttede ruter */}
  // <ProtectedRoute path="/home" component={HomePage} exact />
  // <ProtectedRoute path="/profile" component={ProfilePage} exact />
  // <ProtectedRoute path="/messages" component={MessagesPage} exact />
  // <ProtectedRoute path="/discover" component={DiscoverPage} exact />
  // <ProtectedRoute path="/settings" component={SettingsPage} exact />
  