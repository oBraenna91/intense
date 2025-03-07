import { useEffect } from 'react';
import { useIonRouter } from '@ionic/react';

const NotAuthenticatedRedirect = () => {
  const router = useIonRouter();

  useEffect(() => {
    router.push('/login', 'forward');
  }, [router]);

  return null;
};

export default NotAuthenticatedRedirect;
