import { useState } from "react";
import toast from "react-hot-toast";
import { supabase } from "../lib/supabaseClient";

const SignupForm = () => {
    const [fullName, setFullName] = useState("");
    const [signupEmail, setSignupEmail] = useState("");
    const [employerEmail, setEmployerEmail] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        if (!fullName.trim()) {
            toast.error("Please enter your full name");
            return;
        }

        if (!signupEmail.trim() || !employerEmail.trim()) {
            toast.error("Please fill in all email fields");
            return;
        }

        if (newPassword.length < 6) {
            toast.error("Password must be at least 6 characters");
            return;
        }

        if (newPassword !== confirmPassword) {
            toast.error("Passwords do not match!");
            return;
        }

        setIsLoading(true);

        try {
            console.log('🔐 Step 1: Creating auth user...');

            const { data: signupData, error: signupError } = await supabase.auth.signUp({
                email: signupEmail,
                password: newPassword,
                options: {
                    data: {
                        name: fullName,
                    },
                },
            });

            console.log('✅ Auth signup result:', { signupData, signupError });

            if (signupError) {
                toast.error(signupError.message);
                return;
            }

            if (!signupData.user?.id) {
                toast.error("Failed to create user account");
                return;
            }

            console.log('✅ Auth user created with ID:', signupData.user.id);
            console.log('🔐 Step 2: Creating user profile in database...');

            // Wait a moment for auth user to be fully created
            await new Promise(resolve => setTimeout(resolve, 500));

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

            console.log("📋 Insert result:", { insertData, insertError });

            if (insertError) {
                console.error("❌ Failed to create user profile:", insertError);
                toast.error(`Failed to create user profile: ${insertError.message}`);
                return;
            }

            console.log("✅ User profile created successfully!");

            // Reset Form
            setFullName("");
            setSignupEmail("");
            setEmployerEmail("");
            setNewPassword("");
            setConfirmPassword("");

            toast.success(
                "Account created successfully! Please wait for admin approval before logging in.",
                { duration: 4000 }
            );

        } catch (err) {
            console.error("💥 Signup error:", err);
            toast.error("An unexpected error occurred during signup.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSignup} className="flex flex-col gap-2">
            <fieldset className="fieldset">
                <label className="label" htmlFor="signup-name">
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
                <label className="label" htmlFor="signup-email">
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
                <label className="label" htmlFor="employer-email">
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
                <label className="label" htmlFor="new-password">
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
                <label className="label" htmlFor="confirm-password">
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
    );
};

export default SignupForm;