import { Toaster } from 'react-hot-toast';
import './index.css'
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom'
import LoginSignup from './pages/LoginSignup';
import NotApproved from './pages/NotApproved';
import ProtectedRoute from './components/shared/ProtectedRoute';
import MainApp from './pages/MainApp';




function App() {

  return (
    <Router>
      <Toaster position='top-center' reverseOrder={false}/>
      <Routes>
        {/* Public route */}
        <Route path='/' element={<LoginSignup/>}/>
        {/* not approved route */}
        <Route path='/not-approved' element={<NotApproved/>}/>

        {/* protected main route */}
        <Route 
          path='/app'
          element={
            <ProtectedRoute requireApproval>
              <MainApp/>
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
                <h1>404</h1>
                <p>Page not found</p>
              </div>
            }
          />
      </Routes>
    </Router>
  );
}

export default App
