// ProgramContext.jsx
import React, { createContext, useContext } from 'react';

const ProgramContext = createContext(null);

export const ProgramProvider = ({ program, children }) => {
  let currentDay = 0;
  let currentWeek = 0;
  let dayOfWeek = 0;
  let currentWeekRecord = null;

  if (program) {
    const programWeeks = program?.program_weeks || program?.program?.program_weeks || [];
    
    if (program.start_date) {
      const today = new Date();
      const startDate = new Date(program.start_date);
      const msPerDay = 1000 * 60 * 60 * 24;
      const daysPassed = Math.floor((today - startDate) / msPerDay);
      currentDay = daysPassed + 1;
      currentWeek = Math.ceil(currentDay / 7);
      dayOfWeek = ((currentDay - 1) % 7) + 1;
      currentWeekRecord = programWeeks.find(week => week.week_number === currentWeek);
    } else {
      currentDay = 1;
      currentWeek = 1;
      dayOfWeek = 1;
      currentWeekRecord = programWeeks.find(week => week.week_number === 1);
    }
  }

  const contextValue = {
    currentDay,
    currentWeek,
    dayOfWeek,
    currentWeekRecord,
  };

  return (
    <ProgramContext.Provider value={contextValue}>
      {children}
    </ProgramContext.Provider>
  );
};

export const useProgramContext = () => useContext(ProgramContext);
