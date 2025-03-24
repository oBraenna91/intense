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
  
      // Destrukturer ut 'program_weeks' (eller 'weeks') – alt etter hvordan dataen ser ut hos deg
      // Her antar jeg du sender inn:
      // {
      //   title, description, duration, main_focus, cover_image, 
      //   program_weeks: [{ week_number, description, program_activities: [...] }, ...]
      // }
      const { program_weeks, ...mainProgramFields } = updatedData;
  
      try {
        // 1) Oppdater selve programmet i 'workout_programs'
        //    Her er et eksempel – du må tilpasse feltnavn hvis de avviker hos deg
        const { error: updateErr } = await supabase
          .from('workout_programs')
          .update({
            title: mainProgramFields.title,
            description: mainProgramFields.description,
            duration: mainProgramFields.duration,
            main_focus: mainProgramFields.main_focus,
            cover_image: mainProgramFields.cover_image, // enten en ID eller hele obj
            // ... eventuelt andre felter
          })
          .eq('id', programId);
  
        if (updateErr) throw updateErr;
  
        // 2) Slett alle eksisterende weeks for dette programmet
        const { error: deleteWeeksErr } = await supabase
          .from('program_weeks')
          .delete()
          .eq('program_id', programId);
  
        if (deleteWeeksErr) throw deleteWeeksErr;
  
        // 3) Sett inn uker på nytt
        //    For hver uke i updatedData.program_weeks, inserter i 'program_weeks'
        //    for så å inserte program_activities til den nye uke-raden
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
  
          // 4) For hver activity i denne uka, sett inn i 'program_activities'
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
        return true; // eller returnere en suksess-verdi
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
  