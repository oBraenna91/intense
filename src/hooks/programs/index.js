import { supabase } from '../../supabaseClient';
import { useState } from 'react';

export const usePrograms = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [programs, setPrograms] = useState([]);
  
    const createProgram = async (programData) => {
      setLoading(true);
      setError(null);
  
      const { weeks, ...mainProgramData } = programData;
  
      try {
        const { data: createdProgram, error: programError } = await supabase
          .from('workout_programs')
          .insert(mainProgramData)
          .select()
          .single();
  
        if (programError) throw programError;
  
        for (const week of weeks) {
          const { data: createdWeek, error: weekError } = await supabase
            .from('program_weeks')
            .insert({
              program_id: createdProgram.id,
              week_number: week.weekNumber,
              description: week.description
            })
            .select()
            .single();
  
          if (weekError) throw weekError;
  
          for (const day of week.days) {
            for (const activity of day.activities) {
              const { error: activityError } = await supabase
                .from('program_activities')
                .insert({
                  program_week_id: createdWeek.id,
                  day_number: day.dayNumber,
                  activity_type: activity.type,
                  workout_session_id: activity.workoutSessionId,
                  task_description: activity.description,
                });
  
              if (activityError) throw activityError;
            }
          }
        }
  
        setLoading(false);
        return createdProgram.id;
  
      } catch (error) {
        console.error('Feil ved oppretting av program:', error.message);
        setError(error.message);
        setLoading(false);
        throw error;
      }
    };
  
    const fetchPrograms = async (userId) => {
      setLoading(true);
      setError(null);
      try {
        const { data, error } = await supabase
          .from('workout_programs')
          .select('*')
          .eq('created_by', userId)
          
        if (error) throw error;
  
        setPrograms(data);
        setLoading(false);
      } catch (error) {
        setError(error.message);
        setLoading(false);
      }
    };
  
    return { createProgram, fetchPrograms, programs, loading, error };
  };

  export const fetchPrograms = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('workout_programs')
        .select(`
            *,
            cover_image: workout_cover_images ( image_url ) 
          `)
        .eq('created_by', userId)
        
      if (error) throw error;

      return data.map(program => ({
        ...program,
        cover_image_url: program.cover_image?.image_url || null,
      }));
    } catch (error) {
      console.error(error);
    }
  };

  export async function getSpecificProgram(programId) {
    try {
      const { data, error } = await supabase
        .from('workout_programs')
        .select(`
          *,
          cover_image: workout_cover_images ( id, image_url ),
          program_weeks (
            *,
            program_activities (
              *,
              workout_session: workout_sessions (
                id,
                title
              )
            )
          )
        `)
        .eq('id', programId)
        .single();
  
      if (error) throw error;
      return data;
    } catch (error) {
      alert(error.message);
    }
  }

  export async function deleteProgram(programId) {
    try {
      const { data, error } = await supabase
        .from('workout_programs')
        .delete()
        .eq('id', programId);
        
      if (error) {
        throw error;
      }
      
      return data;
    } catch (err) {
      console.error("Feil ved sletting av økt:", err.message);
      throw err;
    }
  }
  