import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [coach, setCoach] = useState(null);
  const [loading, setLoading] = useState(true);
  const [client, setClient] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);

  const fetchProfile = async (currentUser) => {
    if (currentUser) {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', currentUser.id)
        .maybeSingle();
      if (!error && data) {
        setProfile(data);
      }
    }
  };

  const fetchCoachProfile = async (currentUser) => {
    if (currentUser) {
      const { data, error } = await supabase
        .from('coaches')
        .select('*')
        .eq('user_id', currentUser.id)
        .maybeSingle();
      if (!error && data) {
        setCoach(data);
      }
    }
  };

  const fetchClientProfile = async (currentUser) => {
    if (currentUser) {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('user_id', currentUser.id)
        .maybeSingle();
      if (!error && data) {
        setClient(data);
      }
    }
  };

  useEffect(() => {
    const getSessionAndProfile = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const currentUser = session?.user ?? null;
        setUser(currentUser);
        if (currentUser) {
          await Promise.all([
            fetchProfile(currentUser),
            fetchCoachProfile(currentUser),
            fetchClientProfile(currentUser)
          ]);
        }
      } catch(error) {
        console.error(error);
      } finally {
        setIsInitialized(true);
        setLoading(false);
      }
    };

    getSessionAndProfile();

    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      fetchProfile(user);
      fetchCoachProfile(user);
      fetchClientProfile(user);
    }
    //eslint-disable-next-line
  }, [user?.id]);

  return (
    <AuthContext.Provider value={{ user, profile, coach, client, loading: loading || !isInitialized, fetchProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
