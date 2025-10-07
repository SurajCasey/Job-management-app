import { Tabs, TabsContent, TabsList, TabsTrigger } from "@radix-ui/react-tabs";
import * as React from "react";
import { useState } from "react"
import { useNavigate } from "react-router-dom";
import { FaBriefcase } from "react-icons/fa";
import { FiLogIn } from "react-icons/fi";
import { IoLogOutOutline } from "react-icons/io5";
import toast from "react-hot-toast";
import { supabase } from "../lib/supabaseClient";


const LoginSignup = () => {
    // Login states
    const [loginEmail, setLoginEmail] = useState("");
    const [loginPassword, setLoginPassword] = useState(""); // Fixed: was loginpassword
    
    // Signup states
    const [fullName, setFullName] = useState("");
    const [signupEmail, setSignupEmail] = useState("");
    const [employerEmail, setEmployerEmail] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    
    // UI states
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    
    // Handle login
    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
    
        try {
            // Sign in with Supabase auth
            const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
                email: loginEmail,
                password: loginPassword // Fixed: was loginpassword
            });
            
            if(authError){
                toast.error(authError.message || "Login failed");
                return;
            }

            // Get the user.id
            const userId = authData?.user?.id;

            if(!userId){
                toast.error("User ID not found after login.");
                return;
            }

            // Fetch profile row from custom users table (role + approved)
            const { data: profile, error: profileError} = await supabase
                .from("users")
                .select("role, approved_by_admin")
                .eq("id", userId)
                .single();

            if(profileError){
                toast.error("Could not load user profile. Contact admin.");
                await supabase.auth.signOut();
                return;
            }

            // Check approved flag
            if(!profile?.approved_by_admin){
                toast.error("Your account is not approved by admin yet.");
                await supabase.auth.signOut();
                return;
            }

            // Redirect by role
            if(profile.role === "admin"){
                toast.success("Welcome, Admin!");
                navigate("/admin/dashboard");
            } else {
                toast.success("Welcome, User!");
                navigate("/employee/dashboard");
            }
            
        } catch (err) {
            console.error("handleLogin unexpected error:", err);
            toast.error("An unexpected error occurred."); // Fixed: was "eroor"
        } finally {
            setIsLoading(false);
        }
    };


    // Handle Signup
    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        if(!fullName.trim()) {
            toast.error("Please enter your full name");
            return;
        }

        if(!signupEmail.trim() || !employerEmail.trim()){
            toast.error("Please fill in all email fields");
            return;
        }

        if (newPassword.length < 6){
            toast.error("Password must be at least 6 characters");
            return;
        }

        if(newPassword !== confirmPassword){
            toast.error("Passwords do not match!");
            return;
        }

        setIsLoading(true);

        try {
            // Sign up profile
            const { data: signupData, error: signupError} = await supabase.auth.signUp({
                email: signupEmail,
                password: newPassword,
                options: {
                    data:{
                        name: fullName,
                        role: 'employee',
                    },
                },
            });

            if(signupError){
                toast.error(signupError.message);
                return;
            }

            if(!signupData.user?.id){
                toast.error("Failed to create user account");
                return;
            }

            alert(`User created with ID: ${signupData.user.id}. Now inserting profile...`);
            
            // Insert user profile into custom users table
            console.log("Attempting to insert user profile for ID:", signupData.user.id);
            
            const { data: insertData, error: insertError } = await supabase
                .from("users")
                .insert({
                    id: signupData.user.id,
                    name: fullName,
                    email: signupEmail,
                    employer_email: employerEmail,
                    role: 'employee',
                    approved_by_admin: false,
                    created_at: new Date().toISOString(),
                });

            console.log("Insert result:", { insertData, insertError });

            if(insertError){
                alert(`Insert failed! Error: ${insertError.message}`);
                console.error("Failed to create user profile:", insertError);
                console.error("Insert error details:", JSON.stringify(insertError, null, 2));
                toast.error(`Failed to create user profile: ${insertError.message}`);
                return;
            }
            
            alert("Profile inserted successfully!");
            console.log("User profile created successfully!");

            // Reset Form
            setFullName("");
            setSignupEmail("");
            setEmployerEmail("");
            setNewPassword("");
            setConfirmPassword("");

            toast.success(
                "Account created successfully! Please wait for admin approval before logging in.", 
                { duration: 4000 }
            ); // Fixed: was "singup"

        } catch (err) {
            console.error("Signup error:", err);
            toast.error("An unexpected error occurred during signup."); // Fixed: was "singup"
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div 
            className="w-screen h-screen flex flex-col items-center pt-[100px] md:pt-[150px] lg:pt-[100px]
            bg-gradient-to-br from-blue-200 to-purple-200"
        >
            <header className="flex items-center gap-4 mb-2">
                <FaBriefcase size={40} />
                <h1 className="text-3xl">
                    Job Management App
                </h1>
            </header>
            <p className="mb-8 text-gray-500">
                Professional job management and time tracking
            </p>
            <Tabs
                className="bg-white rounded-2xl w-96 p-8"
                defaultValue="login"
            >
                <h2 className="text-center text-2xl mb-3">Welcome Back</h2>
                <TabsList
                    className="bg-gray-300 rounded-xl flex gap-3 p-2"
                    aria-label="Manage your account"
                >
                    <TabsTrigger
                        className="w-full cursor-pointer flex justify-center items-center gap-2 rounded-md py-1
                            data-[state=active]:bg-white
                            data-[state=active]:text-black
                            data-[state=active]:shadow-md"
                        value="login"
                    >
                        <FiLogIn/>
                        Log In
                    </TabsTrigger>
                    <TabsTrigger
                        className="w-full rounded-md cursor-pointer flex justify-center items-center gap-2 py-1
                            data-[state=active]:bg-white"
                        value="sign-up"
                    >
                        <IoLogOutOutline size={20}/>
                        Sign Up
                    </TabsTrigger>
                </TabsList>
                <TabsContent value="login">
                    <form onSubmit={handleLogin} className="flex flex-col gap-2">
                        <fieldset className="fieldset">
                            <label
                                className="label"
                                htmlFor="login-email"
                            >
                                Email
                            </label>
                            <input
                                className="input"
                                id="login-email"
                                type="email"
                                placeholder="Enter your email"
                                value={loginEmail}
                                onChange={(e) => setLoginEmail(e.target.value)}
                                required
                                disabled={isLoading}
                            />
                        </fieldset>
                        <fieldset className="fieldset">
                            <label
                                className="label"
                                htmlFor="login-password"
                            >
                                Password
                            </label>
                            <input
                                className="input"
                                id="login-password"
                                type="password"
                                value={loginPassword}
                                onChange={(e) => setLoginPassword(e.target.value)}
                                placeholder="Enter your password"
                                required
                                disabled={isLoading}
                            />
                        </fieldset>
                        <div className="mt-5 flex">
                            <button 
                                type="submit" 
                                disabled={isLoading}
                                className="w-full bg-black text-white py-2 rounded-md text-md cursor-pointer
                                hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? "Signing in..." : "Sign In"}
                            </button>
                        </div>
                    </form>          
                </TabsContent>
                <TabsContent value="sign-up">
                    <form onSubmit={handleSignup} className="flex flex-col gap-2">
                        <fieldset className="fieldset">
                            <label
                                className="label"
                                htmlFor="signup-name"
                            >
                                Full Name
                            </label>
                            <input
                                className="input"
                                id="signup-name"
                                type="text"
                                placeholder="Enter your name"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                required
                                disabled={isLoading}
                            />
                        </fieldset>
                        <fieldset className="fieldset">
                            <label
                                className="label" 
                                htmlFor="signup-email"
                            >
                                Email
                            </label>
                            <input 
                                className="input"
                                id="signup-email"
                                type="email" 
                                placeholder="Enter your personal email"
                                value={signupEmail}
                                onChange={(e) => setSignupEmail(e.target.value)}
                                required
                                disabled={isLoading}
                            />
                        </fieldset>
                        <fieldset className="fieldset">
                            <label 
                                className="label"
                                htmlFor="employer-email"
                            >
                                Employer's Email
                            </label>
                            <input 
                                type="email" 
                                className="input"
                                id="employer-email"
                                placeholder="Enter your employer's email" 
                                value={employerEmail}
                                onChange={(e) => setEmployerEmail(e.target.value)}
                                required
                                disabled={isLoading}
                            />
                        </fieldset>
                        <fieldset className="fieldset">
                            <label
                                className="label"
                                htmlFor="new-password"
                            >
                                New password
                            </label>
                            <input
                                className="input"
                                id="new-password"
                                type="password"
                                value={newPassword}
                                placeholder="Create a password (min 6 characters)"
                                onChange={(e) => setNewPassword(e.target.value)}
                                required
                                disabled={isLoading}
                            />
                        </fieldset>
                        <fieldset className="fieldset">
                            <label
                                className="label"
                                htmlFor="confirm-password" 
                            >
                                Confirm password
                            </label>
                            <input
                                className="input"
                                id="confirm-password"
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Retype your password"
                                required
                                disabled={isLoading}
                            />
                        </fieldset>
                        <div className="mt-3">
                            <button 
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-black text-white py-2 rounded-md text-md cursor-pointer
                                hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? "Creating..." : "Create Account"}
                            </button>
                        </div>
                        <p className="rounded bg-blue-200 text-blue-600 p-2 text-sm">
                            <span className="font-bold">Note: </span> 
                            New accounts require admin approval before you can log in.
                        </p>
                    </form>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default LoginSignup;