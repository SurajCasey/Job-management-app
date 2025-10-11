import { useEffect, useState } from "react";
import { FaBriefcase} from "react-icons/fa"
import { useAuth } from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { MdLogout } from "react-icons/md";

const Header = () => {
  const {profile, signOut} = useAuth();
  const navigate = useNavigate();
  const [currTime, setCurrTime] = useState(
    new Date().toLocaleTimeString("en-US", {hour12: true})
  );
  
  // constant update of time
  useEffect(()=>{
    const interval = setInterval(()=>{
      setCurrTime(new Date().toLocaleTimeString("en-US", {hour12: true}));
    }, 1000);
    return () => clearInterval(interval);
  })
  
  // for logout
  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <header 
      className="flex flex-col md:flex-row items-center justify-between px-5 py-2 gap-2"
    >
        <div className="flex items-center gap-3">
            <FaBriefcase size={30}/>
            <h1 className="text-2xl font-medium">Job Management</h1>
        </div>
        <div className="w-full md:w-auto flex justify-between gap-5">
          <p>{currTime}</p>
          <p>Welcome, {profile?.name || 'User'}</p>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-1 hover:text-red-700 cursor-pointer"
        >
          <MdLogout size={18}/>
          Logout
        </button>
    </header>
  )
}

export default Header