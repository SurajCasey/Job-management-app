import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { supabase } from "../lib/supabaseClient";

const LoginForm = () => {
    const [loginEmail, setLoginEmail] = useState("");
    const [loginPassword, setLoginPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
                email: loginEmail,
                password: loginPassword
            });

            if (authError) {
                toast.error(authError.message || "Login failed");
                return;
            }

            const userId = authData?.user?.id;

            if (!userId) {
                toast.error("User ID not found after login.");
                return;
            }

            const { data: profile, error: profileError } = await supabase
                .from("users")
                .select("role, approved_by_admin")
                .eq("id", userId)
                .single();

            if (profileError) {
                toast.error("Could not load user profile. Contact admin.");
                await supabase.auth.signOut();
                return;
            }

            if (!profile?.approved_by_admin) {
                toast.error("Your account is not approved by admin yet.");
                await supabase.auth.signOut();
                return;
            }

            if (profile.role === "admin") {
                toast.success("Welcome, Admin!");
                navigate("/admin/dashboard");
            } else {
                toast.success("Welcome, User!");
                navigate("/employee/dashboard");
            }

        } catch (err) {
            console.error("handleLogin unexpected error:", err);
            toast.error("An unexpected error occurred.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleLogin} className="flex flex-col gap-2">
            <fieldset className="fieldset">
                <label className="label" htmlFor="login-email">
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
                <label className="label" htmlFor="login-password">
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
    );
};

export default LoginForm;