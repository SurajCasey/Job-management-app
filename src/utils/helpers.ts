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

export interface AddClientData{
  name: string;
  email: string;
  phone: string;
  company: string;
  address?: string;
  notes?: string;
}

export interface DeleteClientData{
  id: string;
}


// For login function
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
            console.error("Profile fetch error:", profileError);
            await supabase.auth.signOut();
            return {success:false, error: "Could not load user profile. Contact Admin."};
        }

        if(!profile?.approved_by_admin){
            await supabase.auth.signOut();
            return {success: false, error: "not-approved"};
        }

        return { success: true, role: profile.role};

    } catch (error) {
        console.error("Login unexpected error", error);
        return {success: false, error: "An unexpected error occured. "}
    }
}


// For signup function
export const signupUser = async (formData: SignupData): Promise<{success: boolean; error?:string}>=>{
    try {
        // First, sign up the user with Supabase Auth
        const {data: authResponse, error: signupError} = await supabase.auth.signUp({
            email: formData.email,
            password: formData.password,
            options:{
                data:{
                    name: formData.fullName,
                },
                emailRedirectTo: window.location.origin,
            },
        });

        if(signupError){
            console.error("Signup error:", signupError);
            return {success:false, error: signupError.message};
        }

        const userId = authResponse.user?.id;

        if(!userId){
            console.error("No user ID returned from signup");
            return {
                success:false, 
                error:"User ID not returned. Please try again or contact support.",
            }
        }

        // Wait a moment for the auth user to be fully created
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Insert user data into users table
        const { error: insertError} = await supabase
            .from('users')
            .insert({
                id: userId,
                name: formData.fullName,
                email: formData.email,
                employer_email: formData.employerEmail,
                role: 'employee',
                approved_by_admin: false,
                created_at: new Date().toISOString(),
            });

        if(insertError){
            console.error("Failed to create user profile:", insertError);
            // Try to clean up the auth user if profile creation failed
            try {
                await supabase.auth.admin.deleteUser(userId);
            } catch (cleanupError) {
                console.error("Failed to cleanup auth user:", cleanupError);
            }
            return {success: false, error: `Failed to create user profile: ${insertError.message}`}
        }

        // Sign out the user immediately after signup
        await supabase.auth.signOut();
        
        return {success: true};

    } catch (error) {
        console.error("Error signing up:", error);
        return{success: false, error: "An unexpected error occured during signup."};
    }
};


// for adding client data
export const addClient = async (clientData: AddClientData): Promise<{success: boolean; error?: string;}> =>{
  try {
    //  get current users
    const {data : {user}} = await supabase.auth.getUser();

    if(!user){
      return{success: false, error:"You must be logged in to add a client"}
    }

    // Insert client into database
    const { error: insertError} = await supabase
      .from('clients')
      .insert({
        name: clientData.name,
        email: clientData.email,
        phone: clientData.phone,
        company: clientData.company,
        address: clientData.address,
        notes: clientData.notes,
        created_by: user.id,
        created_at: new Date().toISOString()
      });
    
      if(insertError){
        console.error("Failed to add client", insertError);
      }

      return {success: true}

  } catch (error) {
    console.error("Error adding client data", error);
    return {success:false, error:"An unexpected error occured while adding the client"};
  }
}

// delete client data
export const deleteClient = async (clientId: string): Promise<{success: boolean, error?:string}> => {
  try {
    const { data: {user}} = await supabase.auth.getUser();

    if(!user){
      return{success: false, error: "You must be logged in to delete a client."}
    }

    // delete client from database
    const{ error: deleteError} = await supabase
    .from('clients')
    .delete()
    .eq('id', clientId);

    if(deleteError){
      console.error("Failed to delete client", deleteError);
      return {success:false, error: deleteError.message};
    }

    return {success: true}
  } catch (error) {
    console.error("Error deleting client's data", error)
    return{ success:false, error: " An unexpected error occured while deleting the client."}
  }
}