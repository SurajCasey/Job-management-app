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
    const fetchProfile = async (userId: string) => {
        try {
            const { data, error } = await supabase
                .from('users')
                .select('*')
                .eq('id', userId)
                .single();
            
            if (error) {
                console.error("Error fetching profile:", error);
                throw error;
            }

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

        // Failsafe: force stop loading after 5 seconds
        const loadingTimeout = setTimeout(() => {
            if (mounted && loading) {
                console.warn('Loading timeout - forcing stop');
                setLoading(false);
            }
        }, 5000);

        // check if user is already logged in 
        const checkSession = async () => {
            try {
                const { data: { session }, error } = await supabase.auth.getSession();
                
                if (error) {
                    console.error('Session error:', error);
                    throw error;
                }

                if (!mounted) return;

                setUser(session?.user ?? null);

                // if user is logged in, get their profile
                if (session?.user) {
                    await fetchProfile(session.user.id);
                }
            } catch (error) {
                console.error('Error checking session', error);
                if (mounted) {
                    setUser(null);
                    setProfile(null);
                }
            } finally {
                if (mounted) {
                    setLoading(false);
                    clearTimeout(loadingTimeout);
                }
            }
        };

        checkSession();

        // listen for login/logout events
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                console.log('Auth state changed:', event);
                
                if (!mounted) return;

                setUser(session?.user ?? null);

                if (session?.user) {
                    await fetchProfile(session.user.id);
                } else {
                    setProfile(null);
                }

                setLoading(false);
            }
        );

        // cleanup subscription when component unmounts
        return () => {
            mounted = false;
            clearTimeout(loadingTimeout);
            subscription.unsubscribe();
        };

    }, []);

    // for signout
    const signOut = async () => {
        try {
            await supabase.auth.signOut();
            setUser(null);
            setProfile(null);
        } catch (error) {
            console.error('Error signing out.', error);
        }
    };

    // for refresh profile
    const refreshProfile = async () => {
        if (user?.id) {
            await fetchProfile(user.id)
        }
    };

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