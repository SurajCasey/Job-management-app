import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "../lib/supabaseClient";


interface UserProfile {
    id:string;
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
    const fetchProfile = async (userId: string) =>{
        try {
            const {data, error} = await supabase
                .from('users')
                .select('*')
                .eq('id', userId)
                .single();
            
                if(error) throw error;

                setProfile(data);
        } catch (error) {
            console.error("Error fetching profile", error);
            setProfile(null);
        }
    }

    useEffect(()=>{
        // check if user is already logged in 
        const checkSession = async () =>{
            try {
                const {data: {session}} = await supabase.auth.getSession();
                setUser(session?.user ?? null);

                // if user is logged in, get their profile
                if(session?.user){
                    await fetchProfile(session.user.id);
                }

            } catch (error) {
                console.error('Error checking session', error);
            }finally {
                setLoading(false);
            }
        };
        checkSession();

        // listen for login/logout events
        const {data : {subscription}} = supabase.auth.onAuthStateChange(
            async (_event, session) => {
                setUser(session?.user ?? null);

                if(session?.user){
                    await fetchProfile(session.user.id);
                }else{
                    setProfile(null);
                }

                setLoading(false);
            }
        );

        // cleanup subscription when component unmounts
        return() => {
            subscription.unsubscribe();
        };

    },[]);

        // for signout
        const signOut = async()=> {
            try {
                await supabase.auth.signOut();
                setUser(null);
                setProfile(null);
            } catch (error) {
                console.error('Error signing out.', error);
            }
        };

        // for refresh profile
        const refreshProfile = async () =>{
            if(user?.id){
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


  

