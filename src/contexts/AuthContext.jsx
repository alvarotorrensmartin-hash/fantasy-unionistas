import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient.js";

const AuthContext = createContext(null);

function buildProfileFromUser(user) {
  if (!user) return null;

  return {
    id: user.id,
    display_name:
      user.user_metadata?.display_name ||
      user.email?.split("@")[0] ||
      "Usuario",
  };
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function initAuth() {
      const { data, error } = await supabase.auth.getSession();

      if (error) {
        console.error("Error getSession:", error);
      }

      const currentSession = data?.session || null;
      const currentUser = currentSession?.user || null;

      setSession(currentSession);
      setUser(currentUser);
      setProfile(buildProfileFromUser(currentUser));
      setLoading(false);
    }

    initAuth();

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, newSession) => {
        const currentUser = newSession?.user || null;

        setSession(newSession);
        setUser(currentUser);
        setProfile(buildProfileFromUser(currentUser));
        setLoading(false);
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  async function signOut() {
    await supabase.auth.signOut();
    setSession(null);
    setUser(null);
    setProfile(null);
    setLoading(false);
  }

  return (
    <AuthContext.Provider
      value={{ session, user, profile, loading, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);

  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return ctx;
}