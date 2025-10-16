import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "../lib/supabaseClient";

interface UserProfile {
    id: string;
    name: string;
    email: string;
    employer_email: string | null;
    role: string;
    approved_by_admin: boolean;
    created_at: string;
}

export const useAuth = () => {
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    // fetching user data from database
    const fetchProfile = async (userId: string): Promise<UserProfile | null> => {
        try {
            console.log("Fetching profile for user:", userId);
            const { data, error } = await supabase
                .from('users')
                .select('*')
                .eq('id', userId)
                .single();
            
            if (error) {
                console.error("Error fetching profile:", error);
                return null;
            }

            console.log("Profile fetched successfully:", data);
            setProfile(data);
            return data;
        } catch (error) {
            console.error("Error fetching profile", error);
            setProfile(null);
            return null;
        }
    }

    useEffect(() => {
        let mounted = true;

        const initialize = async () => {
            try {
                console.log("=== Initializing auth ===");
                
                // Get current session
                const { data: { session }, error } = await supabase.auth.getSession();
                
                if (error) {
                    console.error('Session error:', error);
                }

                if (!mounted) return;

                if (session?.user) {
                    console.log("User found, fetching profile");
                    setUser(session.user);
                    await fetchProfile(session.user.id);
                } else {
                    console.log("No session");
                    setUser(null);
                    setProfile(null);
                }
            } catch (error) {
                console.error('Error in initialize:', error);
                if (mounted) {
                    setUser(null);
                    setProfile(null);
                }
            } finally {
                if (mounted) {
                    console.log("=== Auth initialization complete ===");
                    setLoading(false);
                }
            }
        };

        initialize();

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                console.log('Auth state changed:', event);
                
                if (!mounted) return;

                if (session?.user) {
                    setUser(session.user);
                    await fetchProfile(session.user.id);
                } else {
                    setUser(null);
                    setProfile(null);
                }
            }
        );

        return () => {
            mounted = false;
            subscription.unsubscribe();
        };
    }, []);

    const signOut = async () => {
        try {
            await supabase.auth.signOut();
            setUser(null);
            setProfile(null);
        } catch (error) {
            console.error('Error signing out:', error);
        }
    };

    const refreshProfile = async () => {
        if (user?.id) {
            await fetchProfile(user.id)
        }
    };

    // Log current state
    console.log("useAuth state:", { 
        loading, 
        hasUser: !!user, 
        hasProfile: !!profile,
        isApproved: profile?.approved_by_admin,
        role: profile?.role 
    });

    return {
        user,
        profile,
        loading,
        signOut,
        refreshProfile,
        isAuthenticated: !!user,
        isApproved: profile?.approved_by_admin ?? false,
        isAdmin: profile?.role === 'admin',
    };
}