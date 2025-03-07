import { supabase } from '../supabaseClient';

export const fetchSeasons = async () => {
  const { data, error } = await supabase
    .from('seasons')
    .select('*')
    .order('year', { ascending: false });

  if (error) {
    console.error('Error fetching seasons:', error.message);
    return [];
  }
  return data;
};

export const fetchGamesBySeason = async (seasonId) => {
  const { data, error } = await supabase
    .from('games')
    .select('*')
    .eq('season_id', seasonId);

  if (error) {
    console.error('Error fetching games:', error.message);
    return [];
  }
  return data;
};

export const fetchResultsBySeason = async (seasonId) => {
  const { data, error } = await supabase
    .from('results')
    .select('user_id, total_score, game_id, users(name)')
    .eq('season_id', seasonId)
    .order('total_score', { ascending: true });

  if (error) {
    console.error('Error fetching results:', error.message);
    return [];
  }
  return data;
};
