import { useEffect, useState } from "react";
import { FaBriefcase} from "react-icons/fa"
import LogoutButton from "./buttons/LogoutButton";


const Header = () => {
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
          <p>Welcome, Admin</p>
          <LogoutButton/>
        </div>
    </header>
  )
}

export default Header
