import { Navigate } from "react-router-dom";
import LoadingSpinner from "./LoadingSpinner";
import { useAuth } from "../../hooks/useAuth";

interface ProtectedRouteProps{
    children: React.ReactNode;
    requireAdmin?: boolean;
    requireApproval? : boolean;
}

const ProtectedRoute = ({
    children, requireAdmin=false, requireApproval=false
} : ProtectedRouteProps) => {
    const {user, profile, loading} = useAuth();

    if(loading){
        return <LoadingSpinner fullScreen/>
    }
    
    if(!user){
        return <Navigate  to ="/" replace/>
    }

    if(requireApproval && !profile?.approved_by_admin){
        return <Navigate to = "/not-approved" replace/>
    }

    if (requireAdmin && profile?.role !== "admin"){
        return <Navigate to ="/app" replace/>
    }


  return <>{children}</>
}

export default ProtectedRoute
