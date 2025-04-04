import { supabase } from "../../supabaseClient";
import { useState, useCallback, useEffect } from 'react';

export const createWorkoutSession = async (sessionData) => {
    const { title, description, exercises, created_by, cover_image, main_focus, pause_timer } = sessionData;
    try {
      
      const { data: sessionDataRes, error: sessionError } = await supabase
        .from('workout_sessions')
        .insert([{ title, description, created_by, cover_image, main_focus, pause_timer }])
        .select(); 
  
      if (sessionError) throw sessionError;
  
      const workoutSessionId = sessionDataRes[0].id;
  
      for (const exercise of exercises) {
        const { id: exerciseId, order, sets, comment } = exercise;
        //console.log("Setter inn øvelse med kommentar:", { workout_session_id: workoutSessionId, exercise_id: exerciseId, order, comment });

  
        const { data: exerciseDataRes, error: exerciseError } = await supabase
          .from('workout_session_exercises')
          .insert([{ 
            workout_session_id: workoutSessionId,
            exercise_id: exerciseId,
            order,
            comment
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

  export const getTrainingSessions = async (coachId) => {
    try {
      const { data, error } = await supabase
        .from('workout_sessions')
        .select(`
          *,
          workout_session_exercises (
            *,
            workout_session_exercise_sets ( * )
          ),
          cover_image: workout_cover_images ( image_url )
        `)
        .eq('created_by', coachId);
  
      if (error) throw error;
      return data.map(session => ({
        ...session,
        cover_image_url: session.cover_image?.image_url || null
      }));
    } catch (error) {
      console.error("Feil ved henting av treningsøkter:", error.message);
      throw error;
    }
  };
  
  export const useFetchSession = (sessionId) => {
    const [session, setSession] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
  
    const fetchSession = useCallback(async () => {
      if (!sessionId) return;
      setLoading(true);
      setError(null);
      try {
        const { data, error } = await supabase
          .from('workout_sessions')
          .select(`
            *,
            workout_session_exercises (
              *,
              exercise: exercises ( id, name, image_url ),
              workout_session_exercise_sets ( * )
            ),
            cover_image: workout_cover_images ( id, image_url )
          `)
          .eq('id', sessionId)
          .single();
  
        if (error) throw error;
  
        setSession({
            ...data,
            cover_image_id: data.cover_image?.id || null,
            cover_image_url: data.cover_image?.image_url || null,
          });
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    }, [sessionId]);

    useEffect(() => {
      fetchSession();
    }, [fetchSession]);
  
    return { session, loading, error, refetch: fetchSession };
  };

  export async function getSpecificSession(sessionId) {
    try {
      const { data, error } = await supabase
      .from('workout_sessions')
      .select(`
        *,
        workout_session_exercises (
          *,
          exercise: exercises ( id, name, image_url ),
          workout_session_exercise_sets ( * )
        ),
        cover_image: workout_cover_images ( id, image_url )
      `)
      .eq('id', sessionId)
      .single();

      if (error) throw error;
      return data;
    } catch (error) {
      alert(error);
    }
  }

  export async function deleteSession(sessionId) {
    try {
      const { data, error } = await supabase
        .from('workout_sessions')
        .delete()
        .eq('id', sessionId);
        
      if (error) {
        throw error;
      }
      
      return data;
    } catch (err) {
      console.error("Feil ved sletting av økt:", err.message);
      throw err;
    }
  }

  export async function updateWorkoutSession(sessionId, data) {
    console.log(data);
    const { error: updateError } = await supabase
      .from('workout_sessions')
      .update({
        title: data.title,
        description: data.description, 
        main_focus: data.main_focus,
        cover_image: data.cover_image,
        pause_timer: data.pause_timer
      })
      .match({ id: sessionId });
    
    if (updateError) {
      throw updateError;
    }
    
    // Slett gamle rader i workout_session_exercises for denne økta
    const { error: deleteError } = await supabase
      .from('workout_session_exercises')
      .delete()
      .match({ workout_session_id: sessionId });
    
    if (deleteError) {
      throw deleteError;
    }
    
    // Legg inn nye øvelser
    for (const ex of data.exercises) {
      const { data: insertedExercise, error: insErr } = await supabase
        .from('workout_session_exercises')
        .insert({
          workout_session_id: sessionId,
          exercise_id: ex.id, 
          order: ex.order,
          comment: ex.comment || null
        })
        .select(); 
      
      if (insErr) throw insErr;
      
      const newExerciseId = insertedExercise[0].id;
      
      // Legg inn settene for øvelsen
      for (const s of ex.sets) {
        const { error: setErr } = await supabase
          .from('workout_session_exercise_sets')
          .insert({
            workout_session_exercise_id: newExerciseId,
            planned_reps: s.planned_reps || null, // bruker planned_reps, som matcher ditt flatten-resultat
            set_number: s.set_number
          });
        
        if (setErr) throw setErr;
      }
    }
    
    return sessionId;
  }

  export async function getProgramActivityId(sessionId, programWeekId, dayNumber) {
    const { data, error } = await supabase
      .from('program_activities')
      .select('id')
      .eq('workout_session_id', sessionId)
      .eq('program_week_id', programWeekId)  // eller en annen kolonne som refererer til uken
      .eq('day_number', dayNumber)
      .single();
  
    if (error) {
      console.error('Feil ved henting av program activity:', error);
      return null;
    }
    return data.id;
  }