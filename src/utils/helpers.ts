import { supabase } from "../lib/supabaseClient";



export interface LoginCredentials {
    email: string;
    password: string;
}

export interface SignupData {
    fullName: string;
    email: string;
    employerEmail: string;
    password: string;
}

export interface LoginResult{
    success: boolean;
    role? : string;
    error? : string;
}


export const LoginUser = async (credentials : LoginCredentials): Promise <LoginResult> =>{
    try {
        const { data: authData, error: authError} = await supabase.auth.signInWithPassword({
            email: credentials.email,
            password: credentials.password
        });
        if(authError){
            return {success: false, error: authError.message};
        }

        const userId = authData?.user?.id;
        if(!userId){
            return{ success:false, error: "User id not found after login."};
        }

        // Fetch user profile from users table
        const { data: profile, error: profileError} = await supabase
            .from('users')
            .select("role, approved_by_admin")
            .eq("id", userId)
            .single();
        
        if(profileError){
            await supabase.auth.signOut();
            return {success:false, error: "Could not load user profile. Contact Admin."};
        }

        if(!profile?.approved_by_admin){
            await supabase.auth.signOut();
            return {success: false, error: "Your account is not approved by admin yet."}
        }

        return { success: true, role: profile.role};

    } catch (error) {
        console.error("Login unexpected error", error);
        return {success: false, error: "An unexpected error occured. "}
    }
}

export const signupUser = async (formData: SignupData): Promise<{success: boolean; error?:string}>=>{
    try {
        const {data: authResponse, error: signupError} = await supabase.auth.signUp({
            email: formData.email,
            password: formData.password,
            options:{
                data:{
                    name: formData.fullName,
                },
            },
        });

        if(signupError){
            return {success:false, error: signupError.message};
        }

       const userId = authResponse.user?.id;

       if(!userId){
        return {
            success:false, 
            error:"User Id not returned. Please verify your email if confirmation is required",
        }
       }

        // Insert user data into users table
        const { error: insertError} = await supabase
            .from('users')
            .insert([{
                id: userId,
                name: formData.fullName,
                email: formData.email,
                employer_email: formData.employerEmail,
                role: 'employee',
                approved_by_admin: false,
                created_at: new Date().toISOString(),
            }]);
        if(insertError){
            console.error("Failed to create user profile", insertError);
            return {success: false, error: "Failed to create user profile."}
        }
        
       return {success: true};

    } catch (error) {
        console.error("Error signing up", error);
        return{success: false, error: "An unexpected error occured during signup."};
    }
};