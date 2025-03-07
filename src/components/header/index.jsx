import React from 'react';
import styles from './styles.module.scss';
import { FaHome, FaUser, FaEnvelope, FaSearch, FaCog } from 'react-icons/fa';
import { useIonRouter } from '@ionic/react';
import { routesOrder } from '../../routesOrder';
import { useLocation } from 'react-router-dom/cjs/react-router-dom.min';

export default function Header() {
  const router = useIonRouter();
  const location = useLocation();

  const navigate = (path) => {
    const currentOrder = routesOrder[location.pathname] ?? 0;
    const targetOrder = routesOrder[path] ?? 0;

    const direction = targetOrder > currentOrder ? 'forward' : 'back';
    console.log(`Navigating ${direction}: ${location.pathname} -> ${path}`);

    router.push(path, direction);
  };


  return (
    <div className={`${styles.navbar} col-12 d-flex align-items-center justify-content-center px-3`}>
      <div className={`${styles.innerBar} d-flex align-items-center justify-content-between rounded-4 px-4 py-3 col-12 bg-primary`}>
        <div className={styles.iconContainer} onClick={() => navigate('/app')}>
          <FaHome className={`${styles.icon}`} />
        </div>
        <div className={styles.iconContainer} onClick={() => navigate('/app/profile')}>
          <FaUser className={`${styles.icon}`} />
        </div>
        <div className={styles.iconContainer} onClick={() => navigate('/app/messages')}>
          <FaEnvelope className={`${styles.icon}`} />
        </div>
        <div className={styles.iconContainer} onClick={() => navigate('/app/discover')}>
          <FaSearch className={`${styles.icon}`} />
        </div>
        <div className={styles.iconContainer} onClick={() => navigate('/app/settings')}>
          <FaCog className={`${styles.icon}`} />
        </div>
      </div>
    </div>
  );
}