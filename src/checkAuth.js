import { supabase } from './supabaseClient';
import { useIonRouter } from '@ionic/react';

export const useAuthCheck = () => {
  const router = useIonRouter();

  const checkAuth = async () => {
    const { data } = await supabase.auth.getSession();
    if (!data?.session) {
      router.push('/', 'forward');
    }
  };

  return { checkAuth };
};
