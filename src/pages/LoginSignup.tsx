import { Tabs, TabsContent, TabsList, TabsTrigger } from "@radix-ui/react-tabs";
import { FaBriefcase } from "react-icons/fa";
import { FiLogIn } from "react-icons/fi";
import { IoLogOutOutline } from "react-icons/io5";
import LoginForm from "../components/forms/LoginForm";
import SignupForm from "../components/forms/SignupForm";

const LoginSignup = () => {
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
                        <FiLogIn />
                        Log In
                    </TabsTrigger>

                    <TabsTrigger
                        className="w-full rounded-md cursor-pointer flex justify-center items-center gap-2 py-1
                            data-[state=active]:bg-white"
                        value="sign-up"
                    >
                        <IoLogOutOutline size={20} />
                        Sign Up
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="login">
                    <LoginForm />
                </TabsContent>

                <TabsContent value="sign-up">
                    <SignupForm />
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default LoginSignup;