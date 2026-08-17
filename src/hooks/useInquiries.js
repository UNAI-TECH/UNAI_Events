import { useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../utils/supabaseClient';

const LOCAL_STORAGE_INQUIRIES_KEY = 'unai_inquiries_data';

const initialSampleInquiries = [
  {
    id: 'inq-001',
    name: 'Rajesh Malhotra',
    email: 'rajesh.m@corporategroup.in',
    phone: '+91 98200 11223',
    event_type: 'Corporate / Bulk Bookings',
    message: 'We want to book 50 VIP tickets for the Shannon Weigel Acoustic Night with private lounge catering.',
    status: 'New',
    created_at: new Date(Date.now() - 3600000 * 4).toISOString(),
  },
  {
    id: 'inq-002',
    name: 'Priyanka Sen',
    email: 'priyanka.sen@artsfestival.org',
    phone: '+91 99345 67890',
    event_type: 'Auditorium Booking',
    message: 'Inquiring about booking the Grand Symphony Hall for an autumn classical dance festival weekend.',
    status: 'In Review',
    created_at: new Date(Date.now() - 3600000 * 28).toISOString(),
  }
];

export function useInquiries() {
  const [inquiries, setInquiries] = useState(() => {
    if (isSupabaseConfigured) {
      return [];
    }
    const local = localStorage.getItem(LOCAL_STORAGE_INQUIRIES_KEY);
    if (local) {
      try {
        return JSON.parse(local);
      } catch (e) {
        console.warn('Failed to parse local inquiries:', e);
      }
    }
    return initialSampleInquiries;
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const saveToLocal = (data) => {
    setInquiries(data);
    localStorage.setItem(LOCAL_STORAGE_INQUIRIES_KEY, JSON.stringify(data));
  };

  const fetchInquiries = useCallback(async () => {
    if (!isSupabaseConfigured || !supabase) return;

    try {
      setLoading(true);
      const { data, error: sbError } = await supabase
        .from('inquiries')
        .select('*')
        .order('created_at', { ascending: false });

      if (sbError) {
        setError(sbError.message);
      } else if (data !== null) {
        setInquiries(data);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInquiries();

    if (!isSupabaseConfigured || !supabase) return;

    // Real-time listener for inquiries
    const channel = supabase
      .channel('public:inquiries_realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'inquiries' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setInquiries((prev) => [payload.new, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setInquiries((prev) =>
              prev.map((inq) => (inq.id === payload.new.id ? payload.new : inq))
            );
          } else if (payload.eventType === 'DELETE') {
            setInquiries((prev) => prev.filter((inq) => inq.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchInquiries]);

  // Submit Inquiry (Used by ContactForm)
  const submitInquiry = async (formData) => {
    const newInquiry = {
      ...formData,
      status: 'New',
      created_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured && supabase) {
      const { data, error: sbError } = await supabase
        .from('inquiries')
        .insert([newInquiry])
        .select()
        .single();

      if (sbError) throw new Error(sbError.message);
      return data;
    } else {
      // Local fallback
      const created = { ...newInquiry, id: `inq-${Date.now().toString(36)}` };
      const updated = [created, ...inquiries];
      saveToLocal(updated);
      return created;
    }
  };

  // Update Status (Used by Admin)
  const updateInquiryStatus = async (id, status) => {
    if (isSupabaseConfigured && supabase) {
      const { data, error: sbError } = await supabase
        .from('inquiries')
        .update({ status })
        .eq('id', id)
        .select()
        .single();

      if (sbError) throw new Error(sbError.message);
      return data;
    } else {
      const updated = inquiries.map((inq) => (inq.id === id ? { ...inq, status } : inq));
      saveToLocal(updated);
      return updated.find((inq) => inq.id === id);
    }
  };

  // Delete Inquiry (Used by Admin)
  const deleteInquiry = async (id) => {
    if (isSupabaseConfigured && supabase) {
      const { error: sbError } = await supabase.from('inquiries').delete().eq('id', id);
      if (sbError) throw new Error(sbError.message);
    } else {
      const updated = inquiries.filter((inq) => inq.id !== id);
      saveToLocal(updated);
    }
  };

  return {
    inquiries,
    loading,
    error,
    submitInquiry,
    updateInquiryStatus,
    deleteInquiry,
    refreshInquiries: fetchInquiries,
  };
}
