import { supabase } from "../../supabaseClient";

export const createWorkoutSession = async (sessionData) => {
    const { title, description, exercises } = sessionData;
    try {
      
      const { data: sessionDataRes, error: sessionError } = await supabase
        .from('workout_sessions')
        .insert([{ title, description }])
        .select(); 
  
      if (sessionError) throw sessionError;
  
      const workoutSessionId = sessionDataRes[0].id;
  
      for (const exercise of exercises) {
        const { id: exerciseId, order, sets } = exercise;
  
        const { data: exerciseDataRes, error: exerciseError } = await supabase
          .from('workout_session_exercises')
          .insert([{ 
            workout_session_id: workoutSessionId,
            exercise_id: exerciseId,
            order
          }])
          .select();
  
        if (exerciseError) throw exerciseError;
  
        const sessionExerciseId = exerciseDataRes[0].id;
  
        for (const set of sets) {
          const { sett_nr, reps } = set;
          const { error: setError } = await supabase
            .from('workout_session_exercise_sets')
            .insert([{
              workout_session_exercise_id: sessionExerciseId,
              set_number: sett_nr,
              planned_reps: reps
            }]);
  
          if (setError) throw setError;
        }
      }
  
      return workoutSessionId;
    } catch (error) {
      console.error("Feil under opprettelse av treningsøkt:", error.message);
      throw error;
    }
  };