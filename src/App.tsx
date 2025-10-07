import './index.css'
import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom'
import LoginSignup from './pages/LoginSignup';
import AdminDashboard from './pages/AdminDashboard';
import EmployeeDashboard from './pages/EmployeeDashboard';
import { Toaster } from 'react-hot-toast';


function App() {

  return (
    <Router>
      <Routes>
        <Route path="/" element= {<Navigate to="/LoginSignup"/> }/>
        <Route path="/LoginSignup" element={<LoginSignup/>}/>
        <Route path="/admin/dashboard" element={<AdminDashboard/>}/>
        <Route path="/employee/dashboard" element={<EmployeeDashboard/>}/>
      </Routes>
      <Toaster position="top-center" reverseOrder={false}/>
    </Router>
  );
}

export default App
