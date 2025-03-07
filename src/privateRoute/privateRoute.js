import React, { useState, useEffect } from 'react';
import { Route, Redirect } from 'react-router-dom';
import { useAuth } from '../contexts/auth';
import { supabase } from '../supabaseClient';

const ProtectedRoute = ({ component: Component, path, ...rest }) => {
    const { user, loading: authLoading } = useAuth();
    const [profile, setProfile] = useState(null);
    const [profileLoading, setProfileLoading] = useState(true);
  
    useEffect(() => {
      const fetchProfile = async () => {
        if (user) {
          const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', user.id)
            .maybeSingle();
          setProfile(error || !data ? null : data);
        }
        setProfileLoading(false);
      };
  
      if (!authLoading) {
        fetchProfile();
      }
    }, [user, authLoading]);
  
    // Vis en loader mens vi venter på både auth- og profilsjekk
    if (authLoading || profileLoading) {
      return <div>Laster...</div>;
    }
  
    // Sjekk om ruten er /setup-user
    if (path === '/setup-user') {
      // Hvis brukeren allerede har en profil, trenger de ikke å se setup-siden – redirect til app
      if (profile) {
        return <Redirect to="/app" />;
      }
      // Hvis ikke, la SetupUserPage rendres
      return <Route {...rest} render={(props) => <Component {...props} />} />;
    }
  
    // For andre ruter:
    if (!user) {
      return <Redirect to="/login" />;
    } else if (!profile) {
      return <Redirect to="/setup-user" />;
    } else {
      return <Route {...rest} render={(props) => <Component {...props} />} />;
    }
  };
  
  export default ProtectedRoute;

