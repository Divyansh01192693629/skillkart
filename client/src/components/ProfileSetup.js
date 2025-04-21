import React, { useState, useEffect } from 'react';
     import { useNavigate, useLocation } from 'react-router-dom';

     const ProfileSetup = () => {
       const [email, setEmail] = useState('');
       const [interests, setInterests] = useState('');
       const [goals, setGoals] = useState('');
       const [weeklyTime, setWeeklyTime] = useState('');
       const navigate = useNavigate();
       const location = useLocation();

       useEffect(() => {
         if (location.state?.email) {
           setEmail(location.state.email);
         }
       }, [location]);

       const handleSubmit = async () => {
         try {
           const response = await fetch('http://localhost:5001/api/profile', {
             method: 'POST',
             headers: { 'Content-Type': 'application/json' },
             body: JSON.stringify({ email, interests: interests.split(',').map(i => i.trim()), goals, weeklyTime: Number(weeklyTime) })
           });
           const data = await response.json();
           if (data) {
             alert('Profile updated!');
             navigate('/roadmap/ui-ux');
           } else {
             alert('Profile update failed');
           }
         } catch (error) {
           alert('Failed to fetch');
         }
       };

       return (
         <div className="container mt-5">
           <h1 className="text-center mb-4">Set Up Your Profile</h1>
           <div className="row justify-content-center">
             <div className="col-md-6">
               <div className="card p-4">
                 <input
                   type="email"
                   className="form-control mb-3"
                   value={email}
                   onChange={(e) => setEmail(e.target.value)}
                   placeholder="Email"
                   disabled={!!location.state?.email}
                 />
                 <input
                   type="text"
                   className="form-control mb-3"
                   value={interests}
                   onChange={(e) => setInterests(e.target.value)}
                   placeholder="Interests (e.g., UI/UX, Web Dev)"
                 />
                 <input
                   type="text"
                   className="form-control mb-3"
                   value={goals}
                   onChange={(e) => setGoals(e.target.value)}
                   placeholder="Goals (e.g., Become a UI Designer)"
                 />
                 <input
                   type="number"
                   className="form-control mb-3"
                   value={weeklyTime}
                   onChange={(e) => setWeeklyTime(e.target.value)}
                   placeholder="Weekly Time (hours)"
                 />
                 <button className="btn btn-primary w-100" onClick={handleSubmit}>
                   Save Profile
                 </button>
               </div>
             </div>
           </div>
         </div>
       );
     };

     export default ProfileSetup;