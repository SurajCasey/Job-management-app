import { Toaster } from 'react-hot-toast';
import './index.css'
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom'
import LoginSignup from './pages/LoginSignup';
import NotApproved from './pages/NotApproved';
import ProtectedRoute from './components/shared/ProtectedRoute';
import AdminDashboard from './pages/AdminDashboard';
import EmployeeDashboard from './pages/EmployeeDashboard';

function App() {
  return (
    <Router>
      <Toaster position='top-center' reverseOrder={false}/>
      <Routes>
        {/* Public route */}
        <Route path='/' element={<LoginSignup/>}/>
        
        {/* Not approved route */}
        <Route path='/not-approved' element={<NotApproved/>}/>

        {/* Protected main route - for approved employees */}
        <Route 
          path='/app'
          element={
            <ProtectedRoute requireApproval>
              <EmployeeDashboard/>
            </ProtectedRoute>
          }
        />

        {/* Protected admin route - only for admins */}
        <Route 
          path='/admin'
          element={
            <ProtectedRoute requireAdmin requireApproval>
              <AdminDashboard/>
             </ProtectedRoute> 
          }
        />

        {/* 404 Route */}
        <Route 
          path='*'
          element={
            <div className='flex flex-col items-center justify-center min-h-screen
              bg-gradient-to-br from-blue-200 to-purple-200'
            >
              <h1 className="text-4xl font-bold mb-4">404</h1>
              <p className="text-xl">Page not found</p>
            </div>
          }
        />
      </Routes>
    </Router>
  );
}

export default App