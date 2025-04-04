import { supabase } from "../../supabaseClient";

export async function fetchClients(coachId) {
    try {
        const {data, error} = await supabase
          .from('clients')
          .select(`*, users (first_name, last_name)`)
          .eq('coach_id', coachId);

          if(error) throw error;
          return data;
    } catch(error) {
        console.error(error);
    }
}