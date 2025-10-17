import { supabase } from "../lib/supabaseClient";

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface SignupData {
    fullName: string;
    email: string;
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

export interface AddJobData {
  job_number: string
  title: string
  description?: string
  status: "pending" | "in_progress" | "completed" | "cancelled" | "on_hold"
  priority: "low" | "medium" | "high" | "urgent"
  start_date?: string | null
  due_date?: string | null
  hours?: number | null
  location?: string | null
}

export interface LogTimeData {
  job_id: string
  date: string
  start_time: string
  end_time?: string | null
  description?: string
  is_billable?: boolean
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


// For adding jobs


export const addJob = async (jobData: AddJobData): Promise<{success: boolean, error?: string}> => {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { success: false, error: "You must be logged in to add a job" }
    }

    const { error: insertError } = await supabase
      .from('jobs')
      .insert({
        job_number: jobData.job_number,
        job_type: jobData.title,
        description: jobData.description || null,
        status: jobData.status,
        priority: jobData.priority,
        start_date: jobData.start_date || null,
        due_date: jobData.due_date || null,
        hours: jobData.hours || null,
        location: jobData.location || null,
        created_by: user.id,
        created_at: new Date().toISOString(),
      })

    if (insertError) {
      console.error("Failed to add job:", insertError)
      return { success: false, error: insertError.message }
    }

    return { success: true }
  } catch (error) {
    console.error("Error adding job:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}

export const deleteJob = async (jobId: string): Promise<{success: boolean, error?: string}> => {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { success: false, error: "You must be logged in to delete a job" }
    }

    const { error: deleteError } = await supabase
      .from('jobs')
      .delete()
      .eq('id', jobId)

    if (deleteError) {
      console.error("Failed to delete job:", deleteError)
      return { success: false, error: deleteError.message }
    }

    return { success: true }
  } catch (error) {
    console.error("Error deleting job:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}


// For time entries
export const logTime = async (timeData: LogTimeData): Promise<{success: boolean, error?: string, timeEntryId?: string}> => {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { success: false, error: "You must be logged in to log time" }
    }

    // Calculate duration if both times are provided
    let duration_hours = null
    if (timeData.start_time && timeData.end_time) {
      const start = new Date(`2000-01-01T${timeData.start_time}`)
      const end = new Date(`2000-01-01T${timeData.end_time}`)
      duration_hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60)
    }

    const { data, error: insertError } = await supabase
      .from('time_entries')
      .insert({
        user_id: user.id,
        job_id: timeData.job_id,
        date: timeData.date,
        start_time: timeData.start_time,
        end_time: timeData.end_time || null,
        duration_hours: duration_hours,
        description: timeData.description || null,
        status: 'pending',
        created_at: new Date().toISOString(),
      })
      .select()

    if (insertError) {
      console.error("Failed to log time:", insertError)
      return { success: false, error: insertError.message }
    }

    return { success: true, timeEntryId: data?.[0]?.id }
  } catch (error) {
    console.error("Error logging time:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}

export const updateTimeEntry = async (timeEntryId: string, endTime: string): Promise<{success: boolean, error?: string}> => {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { success: false, error: "You must be logged in to update time" }
    }

    // Get the existing entry to calculate duration
    const { data: existingEntry, error: fetchError } = await supabase
      .from('time_entries')
      .select('start_time')
      .eq('id', timeEntryId)
      .single()

    if (fetchError) {
      return { success: false, error: "Time entry not found" }
    }

    // Calculate duration
    const start = new Date(`2000-01-01T${existingEntry.start_time}`)
    const end = new Date(`2000-01-01T${endTime}`)
    const duration_hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60)

    const { error: updateError } = await supabase
      .from('time_entries')
      .update({
        end_time: endTime,
        duration_hours: duration_hours,
      })
      .eq('id', timeEntryId)

    if (updateError) {
      console.error("Failed to update time:", updateError)
      return { success: false, error: updateError.message }
    }

    return { success: true }
  } catch (error) {
    console.error("Error updating time:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}



// Add this to src/utils/helpers.ts

export const completeJob = async (jobId: string): Promise<{success: boolean, error?: string}> => {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { success: false, error: "You must be logged in" }
    }

    const today = new Date().toISOString().split('T')[0]

    const { error: updateError } = await supabase
      .from('jobs')
      .update({
        status: 'completed',
        completion_date: today,
      })
      .eq('id', jobId)

    if (updateError) {
      console.error("Failed to complete job:", updateError)
      return { success: false, error: updateError.message }
    }

    return { success: true }
  } catch (error) {
    console.error("Error completing job:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}

export const startJob = async (jobId: string): Promise<{success: boolean, error?: string}> => {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { success: false, error: "You must be logged in" }
    }

    const { error: updateError } = await supabase
      .from('jobs')
      .update({
        status: 'in_progress',
        start_date: new Date().toISOString().split('T')[0],
      })
      .eq('id', jobId)

    if (updateError) {
      console.error("Failed to start job:", updateError)
      return { success: false, error: updateError.message }
    }

    return { success: true }
  } catch (error) {
    console.error("Error starting job:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}
