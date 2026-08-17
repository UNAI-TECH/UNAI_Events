import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured, getUserRole } from '../utils/supabaseClient';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  // Demo admin state when Supabase credentials are not connected
  const [demoAdmin, setDemoAdmin] = useState(() => {
    return localStorage.getItem('unai_demo_admin_auth') === 'true';
  });

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      // Fallback demo mode check
      if (demoAdmin) {
        setUser({
          id: 'demo-admin-uuid',
          email: 'admin@unai-events.com',
          user_metadata: { full_name: 'UNAI Administrator', role: 'admin' },
        });
        setRole('admin');
      } else {
        setUser(null);
        setRole(null);
      }
      setLoading(false);
      return;
    }

    // 1. Get initial session
    async function initSession() {
      try {
        const { data: { session: initialSession }, error } = await supabase.auth.getSession();
        if (error) throw error;

        setSession(initialSession);
        const currentUser = initialSession?.user ?? null;
        setUser(currentUser);

        if (currentUser) {
          const userRole = await getUserRole(currentUser);
          setRole(userRole);
        } else {
          setRole(null);
        }
      } catch (err) {
        console.error('Error fetching Supabase session:', err);
      } finally {
        setLoading(false);
      }
    }

    initSession();

    // 2. Listen to Auth State Changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, currentSession) => {
        setSession(currentSession);
        const currentUser = currentSession?.user ?? null;
        setUser(currentUser);

        if (currentUser) {
          const userRole = await getUserRole(currentUser);
          setRole(userRole);
        } else {
          setRole(null);
        }
        setLoading(false);
      }
    );

    return () => {
      subscription?.unsubscribe();
    };
  }, [demoAdmin]);

  // Sign In with Email & Password
  const signInWithPassword = async (email, password) => {
    setAuthError(null);

    // If Supabase is not configured, support local demo authentication
    if (!isSupabaseConfigured || !supabase) {
      if (email.toLowerCase().includes('admin') || password === 'admin123' || password === 'admin') {
        localStorage.setItem('unai_demo_admin_auth', 'true');
        setDemoAdmin(true);
        setUser({
          id: 'demo-admin-uuid',
          email: email || 'admin@unai-events.com',
          user_metadata: { full_name: 'UNAI Administrator', role: 'admin' },
        });
        setRole('admin');
        return { success: true };
      } else {
        // Log in as non-admin user in demo
        localStorage.setItem('unai_demo_admin_auth', 'false');
        setDemoAdmin(false);
        setUser({
          id: 'demo-user-uuid',
          email: email,
          user_metadata: { full_name: 'Regular Attendee', role: 'user' },
        });
        setRole('user');
        return { success: true };
      }
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      const userRole = await getUserRole(data.user);
      setRole(userRole);
      return { success: true, user: data.user, role: userRole };
    } catch (err) {
      setAuthError(err.message);
      return { success: false, error: err.message };
    }
  };

  // Sign Up with Email & Password
  const signUpWithPassword = async (email, password, fullName, requestAdmin = false) => {
    setAuthError(null);

    if (!isSupabaseConfigured || !supabase) {
      return {
        success: false,
        error: 'Supabase credentials not configured in .env yet. Please configure VITE_SUPABASE_URL.',
      };
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role: requestAdmin ? 'admin' : 'user',
          },
        },
      });

      if (error) throw error;
      return { success: true, data };
    } catch (err) {
      setAuthError(err.message);
      return { success: false, error: err.message };
    }
  };

  // Sign Out
  const signOut = async () => {
    localStorage.removeItem('unai_demo_admin_auth');
    setDemoAdmin(false);

    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    }

    setUser(null);
    setSession(null);
    setRole(null);
  };

  const isAdmin = role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        role,
        isAdmin,
        loading,
        authError,
        isSupabaseConfigured,
        signInWithPassword,
        signUpWithPassword,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
