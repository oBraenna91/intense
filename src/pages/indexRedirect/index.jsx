import React, { useState, useEffect } from 'react';
import { Redirect } from 'react-router-dom';
import { useAuth } from '../../contexts/auth';
import { useIonRouter } from '@ionic/react';

const IndexRedirect = () => {
  const { user, loading, profile, coach } = useAuth();
  const router = useIonRouter();
  const loading_time = 5000;
  const [forceLogin, setForceLogin] = useState(false);

  useEffect(() => {
    if (loading || !profile || (profile?.role === 'coach' && !coach)) {
      const timer = setTimeout(() => {
        setForceLogin(true);
      }, loading_time);

      return () => clearTimeout(timer);
    }
  }, [loading, profile, coach]);

  if(forceLogin) {
    router.push('/login', 'back');
    return null;
  }

  
  if (loading || !profile || (profile.role === 'coach' && !coach)) {
    return (
      <div className="col-12 d-flex justify-content-center mt-5 pt-5">
        Laster...
      </div>
    );
  }
  return user ? <Redirect to="/app" /> : <Redirect to="/login" />;
}

export default IndexRedirect;
