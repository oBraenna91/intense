import React, {
    createContext,
    useContext,
    useState,
    useCallback
  } from 'react';
  
  // 1) We rename each import to something obviously referencing Supabase
  import {
    createWorkoutSession as supabaseCreateSession,
    getTrainingSessions as supabaseGetSessions,
    getSpecificSession as supabaseGetSession,
    updateWorkoutSession as supabaseUpdateSession,
    deleteSession as supabaseDeleteSession
  } from '../../hooks/sessions';
  
  // Create the actual Context object
  const SessionContext = createContext();
  
  // Provider component
  export function SessionProvider({ children }) {
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
  
    
    const fetchSessions = useCallback(async (coachId) => {
      setLoading(true);
      setError(null);
      try {
        const data = await supabaseGetSessions(coachId);
        setSessions(data);
      } catch (err) {
        console.error('Error fetching sessions:', err);
        setError(err);
      } finally {
        setLoading(false);
      }
    }, []);
  
    const fetchSession = useCallback(async (sessionId) => {
      try {
        const data = await supabaseGetSession(sessionId);
        return data;
      } catch (err) {
        console.error('Error fetching single session:', err);
        throw err;
      }
    }, []);
  
    const createSession = useCallback(async (sessionData) => {
      try {
        // Calls createWorkoutSession
        const newId = await supabaseCreateSession(sessionData);
        // If you want to keep local state in sync:
        if (sessionData.created_by) {
          // e.g. re-fetch all sessions for that user
          await fetchSessions(sessionData.created_by);
        }
        return newId;
      } catch (err) {
        console.error('Error creating session:', err);
        throw err;
      }
    }, [fetchSessions]);
  
    /**
     * Update an existing session in Supabase, then optionally re-fetch
     */
    const updateSession = useCallback(async (sessionId, data) => {
      try {
        await supabaseUpdateSession(sessionId, data);
      } catch (err) {
        console.error('Error updating session:', err);
        throw err;
      }
    }, []);
  
    /**
     * Delete a session, then either remove from local state or re-fetch
     */
    const deleteSession = useCallback(async (sessionId, userId) => {
      try {
        await supabaseDeleteSession(sessionId);
        // Remove from local array
        setSessions(prev => prev.filter(s => s.id !== sessionId));
  
        // Or re-fetch if you'd rather do that:
        // if (userId) {
        //   await fetchSessions(userId);
        // }
      } catch (err) {
        console.error('Error deleting session:', err);
        throw err;
      }
      //eslint-disable-next-line
    }, [fetchSessions]);
  
    // The value we expose
    const value = {
      sessions,      // array of all sessions we fetched
      loading,       // loading state
      error,         // error state
  
      // CRUD methods
      fetchSessions,
      fetchSession,
      createSession,
      updateSession,
      deleteSession
    };
  
    return (
      <SessionContext.Provider value={value}>
        {children}
      </SessionContext.Provider>
    );
  }
  
  // Hook for easy usage in components
  export function useSessionContext() {
    const ctx = useContext(SessionContext);
    if (!ctx) {
      throw new Error('useSessionContext must be used within a <SessionProvider>');
    }
    return ctx;
  }
  