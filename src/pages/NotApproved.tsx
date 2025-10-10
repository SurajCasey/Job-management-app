import { FaBriefcase, FaClock } from "react-icons/fa";
import { MdAdminPanelSettings } from "react-icons/md";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";

const NotApproved = () => {
    const { signOut, profile } = useAuth();
    const navigate = useNavigate();

    const handleSignOut = async () => {
        await signOut();
        navigate("/");
    };

    return (
        <div className="w-screen h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-200 to-purple-200 p-4">
            <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-xl">
                <div className="flex flex-col items-center text-center">
                    <div className="bg-yellow-100 rounded-full p-6 mb-6">
                        <FaClock size={48} className="text-yellow-600" />
                    </div>

                    <h1 className="text-2xl font-bold mb-3 flex items-center gap-2">
                        <FaBriefcase className="text-gray-700" />
                        Account Pending Approval
                    </h1>

                    <p className="text-gray-600 mb-6">
                        Thank you for signing up, <span className="font-semibold">{profile?.name}</span>! 
                        Your account is currently awaiting approval from an administrator.
                    </p>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 w-full">
                        <div className="flex items-start gap-3">
                            <MdAdminPanelSettings size={24} className="text-blue-600 mt-1 flex-shrink-0" />
                            <div className="text-left text-sm">
                                <p className="font-semibold text-blue-900 mb-1">What happens next?</p>
                                <ul className="text-blue-800 space-y-1">
                                    <li>• An admin will review your account</li>
                                    <li>• You'll receive notification once approved</li>
                                    <li>• You can then log in and access the system</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4 mb-6 w-full text-left text-sm">
                        <p className="text-gray-600 mb-1">
                            <span className="font-semibold">Email:</span> {profile?.email}
                        </p>
                        {profile?.employer_email && (
                            <p className="text-gray-600">
                                <span className="font-semibold">Employer:</span> {profile.employer_email}
                            </p>
                        )}
                    </div>

                    <button
                        onClick={handleSignOut}
                        className="w-full bg-black text-white py-3 rounded-md hover:bg-gray-800 
                        transition-colors duration-200 font-medium"
                    >
                        Sign Out
                    </button>
                </div>
            </div>
        </div>
    );
};

export default NotApproved;
