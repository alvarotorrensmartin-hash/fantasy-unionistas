import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  async function loadProfile(userId, userEmail) {
    console.log("LOADING PROFILE:", userId);

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle();

    console.log("PROFILE DATA:", data);
    console.log("PROFILE ERROR:", error);

    if (data) {
      setProfile(data);
      return data;
    }

    if (error) {
      console.error("Error cargando perfil:", error);
    }

    const fallbackProfile = {
      id: userId,
      display_name: userEmail?.split("@")[0] || "Usuario",
    };

    setProfile(fallbackProfile);
    return fallbackProfile;
  }

  useEffect(() => {
    let mounted = true;

    async function initAuth() {
      try {
        const { data, error } = await supabase.auth.getSession();

        console.log("SESSION DATA:", data);
        console.log("SESSION ERROR:", error);

        if (error) {
          console.error("Error getSession:", error);
        }

        if (!mounted) return;

        const currentSession = data?.session || null;
        const currentUser = currentSession?.user || null;

        setSession(currentSession);
        setUser(currentUser);

        if (currentUser) {
          await loadProfile(currentUser.id, currentUser.email);
        } else {
          setProfile(null);
        }
      } catch (err) {
        console.error("Error inicializando auth:", err);
        setSession(null);
        setUser(null);
        setProfile(null);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    initAuth();

    const { data: listener } = supabase.auth.onAuthStateChange(
      async (_event, newSession) => {
        const currentUser = newSession?.user || null;

        setSession(newSession);
        setUser(currentUser);

        if (currentUser) {
          await loadProfile(currentUser.id, currentUser.email);
        } else {
          setProfile(null);
        }

        setLoading(false);
      }
    );

    return () => {
      mounted = false;
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
      value={{
        session,
        user,
        profile,
        loading,
        signOut,
      }}
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