import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../supabaseClient';

export const useExercises = (userId) => {
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

const fetchExercises = useCallback(async () => {
  setLoading(true);
  try {
    const { data, error } = await supabase
      .from('exercises')
      .select(`
        *,
        exercise_muscles (
          muscles_id,
          muscles (
            name
          )
        )
      `)
      .or(`created_by.is.null, created_by.eq.${userId}`);
    if (error) throw error;
    setExercises(data);
  } catch (err) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
}, [userId]); 

useEffect(() => {
  if (userId) {
    fetchExercises();
  }
  //eslint-disable-next-line
}, [userId]);

  const addExercise = async (exercise) => {
    try {
      const { data, error } = await supabase
        .from('exercises')
        .insert([{ ...exercise, created_by: userId }])
        .select();
      if (error) throw error;
      setExercises((prev) => [...prev, ...data]);
      return data[0];
    } catch (err) {
      setError(err.message);
    }
  };

  const updateExercise = async (exerciseId, updatedExercise) => {
    try {
      const { data, error } = await supabase
        .from('exercises')
        .update(updatedExercise)
        .eq('id', exerciseId)
        .eq('created_by', userId)
        .select();
      if (error) throw error;
      setExercises((prev) => prev.map((ex) => (ex.id === exerciseId ? data[0] : ex)));
      return data[0];
    } catch (err) {
      setError(err.message);
    }
  };

  const fetchUpdatedExercise = async (exerciseId) => {
    const { data, error } = await supabase
      .from('exercises')
      .select(`
        *,
        exercise_muscles (
          muscles_id,
          muscles (
            name
          )
        )
      `)
      .eq('id', exerciseId)
      .single();
    if (error) throw error;
    return data;
  };

  const deleteExercise = async (exercise) => {
    try {
      const { error } = await supabase
        .from('exercises')
        .delete()
        .eq('id', exercise.id)
        .eq('created_by', userId);
      if (error) throw error;
      if (exercise.image_path) {
        const { error: storageError } = await supabase
          .storage
          .from('exercise-images')
          .remove([exercise.image_path]);
        if (storageError) {
          console.error('Kunne ikke slette bilde:', storageError.message);
        }
      }
      alert('Øvelsen er slettet!')
      setExercises((prev) => prev.filter((ex) => ex.id !== exercise.id));
    } catch (err) {
      setError(err.message);
    }
  };

  const fetchNewExercise = async (exerciseId) => {
    const { data, error } = await supabase
      .from('exercises')
      .select(`
        *,
        exercise_muscles (
          muscles_id,
          muscles (
            name
          )
        )
      `)
      .eq('id', exerciseId)
      .single();
    if (error) throw error;
    return data;
  };
  

  useEffect(() => {
    if (userId) fetchExercises();
    //eslint-disable-next-line
  }, [userId]);

  return { exercises, loading, error, fetchExercises, fetchNewExercise, fetchUpdatedExercise, addExercise, updateExercise, deleteExercise };
};


export async function FetchAllExercises(userId) {
    try {
      const { data, error } = await supabase
        .from('exercises')
        .select(`
          *,
          exercise_muscles (
            muscles_id,
            muscles (
              name
            )
          )
        `)
        .or(`created_by.is.null, created_by.eq.${userId}`);
      if (error) throw error;
      return data;
    } catch (err) {
      console.error(err);
    } 
  }

  export async function fetchExerciseHistory(exerciseId) {
    
    const twoMonthsAgo = new Date();
    twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);
    
    const { data, error } = await supabase
      .from('workout_log_exercises')
      .select(`
        id,
        created_at,
        workout_session_log_id,
        workout_log_sets (
          id,
          created_at,
          set_number,
          reps,
          weight
        )
      `)
      .eq('exercise_id', exerciseId)
      .gte('created_at', twoMonthsAgo.toISOString())
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Feil ved henting av historikk:', error);
      return [];
    }
    return data;
  }
  