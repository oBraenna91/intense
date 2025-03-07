import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

const RequestCountContext = createContext();

export const RequestCountProvider = ({ children }) => {
  const [count, setCount] = useState(0);

  const fetchCount = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { error, count: newCount } = await supabase
      .from('family_requests')
      .select('id', { count: 'exact', head: true })
      .eq('receiver_id', user.id)
      .eq('status', 'pending');
    if (error) {
      console.error('Error fetching request count:', error);
    } else {
      setCount(newCount ?? 0);
    }
  };

  // useEffect(() => {
  //   fetchCount();
  //   // Hvis du ønsker realtime-oppdatering, kan du sette opp et abonnement:
  //   const subscription = supabase
  //     .channel('public:family_requests')
  //     .on(
  //       'postgres_changes',
  //       { event: '*', schema: 'public', table: 'family_requests' },
  //       (payload) => {
  //         // Når en endring skjer, oppdater tellingen
  //         fetchCount();
  //       }
  //     )
  //     .subscribe();

  //   return () => {
  //     supabase.removeChannel(subscription);
  //   };
  // }, []);

  useEffect(() => {
    fetchCount();
  
    const interval = setInterval(() => {
      fetchCount();
    }, 10000);
  
    return () => clearInterval(interval);
  }, []);

  return (
    <RequestCountContext.Provider value={{ count, fetchCount }}>
      {children}
    </RequestCountContext.Provider>
  );
};

export const useRequestCount = () => useContext(RequestCountContext);
