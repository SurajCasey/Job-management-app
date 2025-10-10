import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { LoginUser } from "../../utils/helpers";

const LoginForm = () => {
    const [loginEmail, setLoginEmail] = useState("");
    const [loginPassword, setLoginPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const result = await LoginUser({
                email: loginEmail,
                password: loginPassword,
            })
            if(!result.success){
                toast.error(result.error || "Login failed");
                return;
            }

            toast.success("Login successful!");
            navigate("/app");
        } catch (error) {
            console.error("Login error", error);
            toast.error("An unexpected error occured.")
        }finally {
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