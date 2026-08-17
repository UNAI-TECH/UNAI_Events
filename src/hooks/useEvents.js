import { useState, useEffect, useCallback } from 'react';
import initialEventsData from '../data/events.json';
import { supabase, isSupabaseConfigured } from '../utils/supabaseClient';

const LOCAL_STORAGE_EVENTS_KEY = 'unai_events_custom_data';

export function useEvents() {
  const [events, setEvents] = useState(() => {
    // If Supabase is configured, start with empty list so only real database data is shown
    if (isSupabaseConfigured) {
      return [];
    }
    const local = localStorage.getItem(LOCAL_STORAGE_EVENTS_KEY);
    if (local) {
      try {
        const parsed = JSON.parse(local);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {
        console.warn('Failed to parse local storage events:', e);
      }
    }
    return initialEventsData;
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [realtimeStatus, setRealtimeStatus] = useState('connecting');

  // Helper to persist events locally
  const saveToLocal = (newEvents) => {
    setEvents(newEvents);
    localStorage.setItem(LOCAL_STORAGE_EVENTS_KEY, JSON.stringify(newEvents));
  };

  // 1. Initial Fetch & Real-time Subscription from Supabase
  const fetchEvents = useCallback(async () => {
    if (!isSupabaseConfigured || !supabase) {
      setRealtimeStatus('local_fallback');
      return;
    }

    try {
      setLoading(true);
      const { data, error: sbError } = await supabase
        .from('events')
        .select('*')
        .order('date', { ascending: true });

      if (sbError) {
        console.warn('Supabase fetch error, using local data fallback:', sbError);
        setError(sbError.message);
        setRealtimeStatus('error');
      } else if (data !== null) {
        // Strictly set events to what is in the Supabase database
        setEvents(data);
        setError(null);
        setRealtimeStatus('connected');
      }
    } catch (err) {
      console.warn('Failed to fetch events from Supabase:', err);
      setError(err.message);
      setRealtimeStatus('error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents();

    if (!isSupabaseConfigured || !supabase) return;

    // Supabase Real-time Subscription Channel
    const channel = supabase
      .channel('public:events_realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'events',
        },
        (payload) => {
          console.log('⚡ Realtime Event Update Received:', payload);

          if (payload.eventType === 'INSERT') {
            setEvents((prev) => {
              const exists = prev.some((e) => e.id === payload.new.id);
              if (exists) return prev;
              const updated = [payload.new, ...prev].sort(
                (a, b) => new Date(a.date) - new Date(b.date)
              );
              localStorage.setItem(LOCAL_STORAGE_EVENTS_KEY, JSON.stringify(updated));
              return updated;
            });
          } else if (payload.eventType === 'UPDATE') {
            setEvents((prev) => {
              const updated = prev.map((e) => (e.id === payload.new.id ? payload.new : e));
              localStorage.setItem(LOCAL_STORAGE_EVENTS_KEY, JSON.stringify(updated));
              return updated;
            });
          } else if (payload.eventType === 'DELETE') {
            setEvents((prev) => {
              const updated = prev.filter((e) => e.id !== payload.old.id);
              localStorage.setItem(LOCAL_STORAGE_EVENTS_KEY, JSON.stringify(updated));
              return updated;
            });
          }
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          setRealtimeStatus('connected');
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchEvents]);

  // 2. Admin Action: Create New Event
  const createEvent = async (eventData) => {
    const newId = eventData.id || `unai-${Date.now().toString(36)}`;
    const fullEvent = {
      ...eventData,
      id: newId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('events').insert([fullEvent]).select().single();
      if (error) {
        throw new Error(`Failed to create event in Supabase: ${error.message}`);
      }
      return data;
    } else {
      // Local fallback
      const updated = [fullEvent, ...events].sort(
        (a, b) => new Date(a.date) - new Date(b.date)
      );
      saveToLocal(updated);
      return fullEvent;
    }
  };

  // 3. Admin Action: Update Event
  const updateEvent = async (id, updatedFields) => {
    const payload = {
      ...updatedFields,
      updated_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('events')
        .update(payload)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to update event in Supabase: ${error.message}`);
      }
      return data;
    } else {
      // Local fallback
      const updated = events.map((e) => (e.id === id ? { ...e, ...payload } : e));
      saveToLocal(updated);
      return updated.find((e) => e.id === id);
    }
  };

  // 4. Admin Action: Delete Event
  const deleteEvent = async (id) => {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from('events').delete().eq('id', id);
      if (error) {
        throw new Error(`Failed to delete event in Supabase: ${error.message}`);
      }
    } else {
      // Local fallback
      const updated = events.filter((e) => e.id !== id);
      saveToLocal(updated);
    }
  };

  // 5. Admin Action: Quick Toggle Hero Spotlight
  const toggleHeroSpotlight = async (id) => {
    const target = events.find((e) => e.id === id);
    if (!target) return;
    const nextVal = !target.hero_spotlight;
    await updateEvent(id, { hero_spotlight: nextVal });
  };

  // 6. Admin Action: Quick Toggle Featured
  const toggleFeatured = async (id) => {
    const target = events.find((e) => e.id === id);
    if (!target) return;
    const nextVal = !target.featured;
    await updateEvent(id, { featured: nextVal });
  };

  // 7. Seed Initial Sample Events into Supabase
  const seedInitialEvents = async () => {
    if (!isSupabaseConfigured || !supabase) {
      saveToLocal(initialEventsData);
      return { count: initialEventsData.length };
    }

    // Insert initial events into Supabase
    const { data, error } = await supabase
      .from('events')
      .upsert(initialEventsData, { onConflict: 'id' })
      .select();

    if (error) {
      throw new Error(`Seed failed: ${error.message}`);
    }
    if (data) {
      setEvents(data);
    }
    return { count: data?.length || initialEventsData.length };
  };

  // Filtered lists
  const categories = ['All', 'Comedy', 'Concert', 'Theatre'];

  const filteredEvents = events.filter((evt) => {
    const matchesCategory =
      selectedCategory === 'All' ||
      evt.category.toLowerCase() === selectedCategory.toLowerCase();

    const matchesSearch =
      evt.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      evt.subtitle?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      evt.venue?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      evt.city?.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  const featuredEvents = events.filter((e) => e.featured);
  // Ensure heroSpotlightEvents has items; if none are explicitly tagged, fallback to first 3 events
  const heroSpotlightEvents =
    events.filter((e) => e.hero_spotlight).length > 0
      ? events.filter((e) => e.hero_spotlight)
      : events.slice(0, 3);

  return {
    events,
    filteredEvents,
    featuredEvents,
    heroSpotlightEvents,
    categories,
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSearchQuery,
    loading,
    error,
    realtimeStatus,
    isLiveFromSupabase: isSupabaseConfigured && !error && realtimeStatus === 'connected',
    refreshEvents: fetchEvents,
    createEvent,
    updateEvent,
    deleteEvent,
    toggleHeroSpotlight,
    toggleFeatured,
    seedInitialEvents,
  };
}
