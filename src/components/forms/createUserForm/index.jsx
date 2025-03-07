import React, { useState } from 'react';
import { useTransition, animated } from 'react-spring';
import { IonCard, IonCardContent, IonInput, IonButton } from '@ionic/react';

const questions = [
  { id: 1, label: `What's your first name?` },
  { id: 2, label: `What's your last name?` },
];

const MultiStepForm = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState({});
  
  const transitions = useTransition(currentStep, {
    from: { opacity: 0, transform: 'translate3d(100%,0,0)' },
    enter: { opacity: 1, transform: 'translate3d(0%,0,0)' },
    leave: { opacity: 0, transform: 'translate3d(-50%,0,0)' },
    config: { tension: 220, friction: 20 },
  });

  const handleNext = () => {
    if (currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete(answers);
    }
  };

  const handleInputChange = (e) => {
    const value = e.detail.value;
    setAnswers((prev) => ({
      ...prev,
      [questions[currentStep].id]: value,
    }));
  };

  const currentAnswer = answers[questions[currentStep]?.id] || '';
  const isInputValid = currentAnswer.trim().length > 0;

  return (
    <div style={{ position: 'relative', height: '200px' }}>
      {transitions((style, i) =>
        i === currentStep ? (
          <animated.div 
            style={{ 
              ...style, 
              position: 'absolute', 
              width: '100%',
              top:'150px'
            }}
          >
            <IonCard>
              <IonCardContent>
                <h3>{questions[currentStep].label}</h3>
                <IonInput
                  value={currentAnswer}
                  onIonInput={handleInputChange}
                  placeholder="Write your answer here"
                />
                <IonButton
                  onClick={handleNext}
                  expand="block"
                  style={{ marginTop: '1rem' }}
                  disabled={!isInputValid}
                >
                  {currentStep === questions.length - 1 ? 'Submit' : 'Next'}
                </IonButton>
              </IonCardContent>
            </IonCard>
          </animated.div>
        ) : null
      )}
    </div>
  );
};

export default MultiStepForm;