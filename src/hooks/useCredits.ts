import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export function useCredits(userId?: string) {
  const [credits, setCredits] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    async function fetchCredits() {
      try {
        const { data, error } = await supabase
          .rpc('get_user_credits', { p_user_id: userId });

        if (error) throw error;
        setCredits(data || 0);
      } catch (error) {
        console.error('Error fetching credits:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchCredits();

    // Subscribe to credits changes
    const channel = supabase
      .channel(`user_credits:${userId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'user_credits',
        filter: `user_id=eq.${userId}`,
      }, () => {
        fetchCredits();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  return { credits, loading };
}