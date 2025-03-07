import { useEffect } from 'react';

let scrollLockCount = 0;

const useScrollLock = (lock) => {
    useEffect(() => {
        if (lock) {
            scrollLockCount += 1;
            if (scrollLockCount === 1) {
                document.body.style.overflow = 'hidden';
                console.log('Scroll locked: overflow set to hidden');
            }
        } else {
            scrollLockCount = Math.max(scrollLockCount - 1, 0);
            if (scrollLockCount === 0) {
                document.body.style.overflow = '';
                console.log('Scroll unlocked: overflow reset');
            }
        }

        return () => {
            if (lock) {
                scrollLockCount = Math.max(scrollLockCount - 1, 0);
                if (scrollLockCount === 0) {
                    document.body.style.overflow = '';
                    console.log('Cleanup: Scroll unlocked');
                }
            }
        };
    }, [lock]);
};

export default useScrollLock;