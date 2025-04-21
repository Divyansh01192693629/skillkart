import React from 'react';
     import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
     import Login from './components/Login';
     import Register from './components/Register';
     import Roadmap from './components/Roadmap';
     import ProfileSetup from './components/ProfileSetup';
     import CuratorDashboard from './components/CuratorDashboard';
     import Discussion from './components/Discussion';

     function App() {
       return (
         <Router>
           <Routes>
             <Route path="/" element={<Login />} />
             <Route path="/register" element={<Register />} />
             <Route path="/profile" element={<ProfileSetup />} />
             <Route path="/curator" element={<CuratorDashboard />} />
             <Route path="/roadmap/:skill" element={<Roadmap />} />
             <Route path="/discussion/:roadmap" element={<Discussion />} />
           </Routes>
         </Router>
       );
     }

     export default App;