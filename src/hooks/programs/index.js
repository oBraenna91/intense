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

    const updateProgram = async (programId, updatedData) => {
      setLoading(true);
      setError(null);
  
      const { program_weeks, ...mainProgramFields } = updatedData;
  
      try {
        const { error: updateErr } = await supabase
          .from('workout_programs')
          .update({
            title: mainProgramFields.title,
            description: mainProgramFields.description,
            duration: mainProgramFields.duration,
            main_focus: mainProgramFields.main_focus,
            cover_image: mainProgramFields.cover_image, 
          })
          .eq('id', programId);
  
        if (updateErr) throw updateErr;
  
        const { error: deleteWeeksErr } = await supabase
          .from('program_weeks')
          .delete()
          .eq('program_id', programId);
  
        if (deleteWeeksErr) throw deleteWeeksErr;
  
        for (const week of program_weeks) {
          const { data: newWeek, error: weekErr } = await supabase
            .from('program_weeks')
            .insert({
              program_id: programId,
              week_number: week.week_number,
              description: week.description,
            })
            .select()
            .single();
  
          if (weekErr) throw weekErr;
  
          for (const activity of week.program_activities || []) {
            const { error: actErr } = await supabase
              .from('program_activities')
              .insert({
                program_week_id: newWeek.id,
                day_number: activity.day_number,
                activity_type: activity.activity_type,
                task_description: activity.task_description,
                workout_session_id: activity.workout_session_id,
              });
  
            if (actErr) throw actErr;
          }
        }
  
        setLoading(false);
        return true; 
      } catch (err) {
        console.error('Feil ved oppdatering av program:', err);
        setError(err.message);
        setLoading(false);
        throw err;
      }
    };
  
    return { createProgram, fetchPrograms, updateProgram, programs, loading, error };
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
  
  export async function fetchProgramClients(programId) {
    try {
      const { data, error } = await supabase
        .from('program_assignments')
        .select(`*, clients(id, user_id, users(first_name, last_name))`)
        .eq('program_id', programId);

        if(error) throw error;
        return data;
    } catch(error) {
      console.error(error);
    }
  }

  export async function addClientToProgram(programId, clientId) {
    try {
      const { data, error } = await supabase
        .from('program_assignments')
        .insert([{ program_id: programId, client_id: clientId }])

        if(error) throw error;
        return data;
    } catch(error) {
      console.error(error);
    }
  }

  export async function removeClientFromProgram(programId, clientId) {
    try {
      const { data, error } = await supabase
        .from('program_assignments')
        .delete()
        .eq('program_id', programId)
        .eq('client_id', clientId);

        if(error) throw error;
        return data;
    } catch(error) {
      console.error(error);
    }
  }

  export async function fetchProgramAndAssignments(userId) {
    try {
      const { data, error } = await supabase
        .from('program_assignments')
        .select(`
            *, 
            program:program_id (
              id, 
              title, 
              duration, 
              main_focus,
              description,
              cover_image,
              program_weeks (id, week_number, description),
              workout_cover_images ( image_url )
          )
        `)
        .eq('client_id', userId)
        .maybeSingle();
        if(error) throw error;
        return data;
    } catch(error) {
      console.error(error);
    }
  }