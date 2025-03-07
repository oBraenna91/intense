import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

const useUserIsAdmin = () => {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const fetchIsAdmin = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data: profile } = await supabase
          .from('users')
          .select('isAdmin')
          .eq('id', user.id)
          .single();

        setIsAdmin(profile?.isAdmin || false);
      }
    };

    fetchIsAdmin();
  }, []);

  return isAdmin;
};

export default useUserIsAdmin;
