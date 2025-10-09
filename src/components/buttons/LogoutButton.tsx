import { FaSignOutAlt } from "react-icons/fa"
import { useNavigate } from "react-router-dom";

const LogoutButton = () => {
    const navigate = useNavigate();
    const handleLogout = () =>{
        localStorage.removeItem("user");
        navigate("/LoginSignup");
    }
  return (
    <div>
        <button
            className="flex items-center font-medium"
            onClick={handleLogout}
            >
            <FaSignOutAlt size={20}/>
            Logout
        </button>
    </div>
  )
}

export default LogoutButton
