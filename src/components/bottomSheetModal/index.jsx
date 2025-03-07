import React, { useLayoutEffect, useEffect, useState, useRef } from 'react';
import ReactDOM from 'react-dom';
import { useSpring, animated } from 'react-spring';
import { useDrag } from 'react-use-gesture';
import styles from './styles.module.scss';
import useScrollLock from '../../hooks/useBodyScrollLock';

const BottomSheetModal = ({ title, isOpen, onClose, onBackdropClick, children, breakpoints = [0.5, 0.95], initialBreakpointIndex = 0 }) => {
  const [visible, setVisible] = useState(false);
  //const [windowHeight, setWindowHeight] = useState(window.innerHeight || 0);
  const contentRef = useRef(null);

  const getWindowHeight = () => {
    return (
      window.visualViewport?.height ||
      window.innerHeight ||
      document.documentElement.clientHeight ||
      document.body.clientHeight
    );
  };

  const [windowHeight, setWindowHeight] = useState(getWindowHeight());

  // Definer breakpoints som prosentandeler av vindushøyden
  //const breakpoints = [0.5, 0.95]; // 50% og 80%
  const sortedBreakpoints = [...breakpoints].sort((a, b) => a - b);

  useLayoutEffect(() => {
    const updateHeight = () => setWindowHeight(window.innerHeight);
    updateHeight();
    window.addEventListener('resize', updateHeight);
    return () => window.removeEventListener('resize', updateHeight);
  }, []);

  //const initialY = windowHeight * (1 - breakpoints[0]); // Start ved 50% høyde
  const initialBreakpoint =
    sortedBreakpoints[initialBreakpointIndex] || sortedBreakpoints[0];
  const initialY = windowHeight * (1 - initialBreakpoint);

  const [{ y }, api] = useSpring(() => ({ y: windowHeight, config: { tension: 300 } }));

useScrollLock(isOpen);

useEffect(() => {
    if (isOpen && windowHeight > 0) {
        setVisible(true);
        console.log('Modal åpnet: Overflow satt til hidden');
        api.start({ y: initialY });
    } else if (!isOpen) {
        console.log('Modal lukket: Overflow reset');
        api.start({
            y: windowHeight,
            onResolve: () => setVisible(false),
        });
    }
}, [isOpen, windowHeight, api, initialY]);

  const bind = useDrag(
    ({ last, movement: [, my], velocity, direction: [, dy], cancel, memo = y.get(), event }) => {
      const content = contentRef.current;

      if (content) {
        const { scrollTop } = content;

        // Hvis brukeren drar nedover og innholdet kan scrolle oppover, ikke dra modalen
        if (my > 0 && scrollTop > 0) {
          return;
        }
      }

      let newY = memo + my;

      // Begrens y-verdi mellom topp og bunn
      //newY = Math.max(windowHeight * (1 - Math.max(...breakpoints)), Math.min(newY, windowHeight));

      newY = Math.max(
        windowHeight * (1 - Math.max(...sortedBreakpoints)),
        Math.min(newY, windowHeight)
      );

      api.start({ y: newY, immediate: true });

      if (last) {
        const totalHeight = windowHeight;
        const currentHeight = totalHeight - newY;
        const currentPercent = currentHeight / totalHeight;

        // Finn nærmeste breakpoint
        // const closestBreakpoint = breakpoints.reduce((prev, curr) =>
        //   Math.abs(curr - currentPercent) < Math.abs(prev - currentPercent) ? curr : prev
        // );

        const closestBreakpoint = sortedBreakpoints.reduce((prev, curr) =>
            Math.abs(curr - currentPercent) < Math.abs(prev - currentPercent)
              ? curr
              : prev
          );

        if ((velocity > 0.5 && dy > 0) || currentPercent < breakpoints[0] * 0.8) {
          // Hvis brukeren drar raskt nedover eller drar under 40% av skjermen, lukk modalen
          api.start({
            y: windowHeight,
            onResolve: () => {
              setVisible(false);
              onClose();
            },
          });
        } else {
          // Snap til nærmeste breakpoint
          const finalY = totalHeight * (1 - closestBreakpoint);
          api.start({ y: finalY });
        }
      }

      return memo;
    },
    { from: () => [0, y.get()], filterTaps: true }
  );

  if (!visible) return null;

  return ReactDOM.createPortal(
    <>
      <div className={styles.backdrop} onClick={onBackdropClick}></div>
      <animated.div
        className={styles.bottomSheet}
        style={{ transform: y.to((value) => `translateY(${value}px)`) }}
      >
        <div className={styles.handleHeader}{...bind()}>
            <div className={styles.handle}></div>
            <div className={`${styles.header} text-center`}>{title}</div>
        </div>
        <div className={styles.content} ref={contentRef}>
          {children}
        </div>
      </animated.div>
    </>,
    document.body
  );
};

export default BottomSheetModal;
