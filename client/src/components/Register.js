import React, { useState } from 'react';
     import { useNavigate } from 'react-router-dom';

     const Register = () => {
       const [email, setEmail] = useState('');
       const [password, setPassword] = useState('');
       const [role, setRole] = useState('learner');
       const navigate = useNavigate();

       const handleRegister = async () => {
         try {
           const response = await fetch('http://localhost:5001/api/auth/register', {
             method: 'POST',
             headers: { 'Content-Type': 'application/json' },
             body: JSON.stringify({ email, password, role }),
           });
           const data = await response.json();
           if (data.success) {
             alert('Registration successful!');
             navigate('/');
           } else {
             alert(data.error || 'Registration failed');
           }
         } catch (error) {
           alert('Failed to fetch');
         }
       };

       return (
         <div className="container mt-5">
           <h1 className="text-center mb-4">Register for SkillKart</h1>
           <div className="row justify-content-center">
             <div className="col-md-6">
               <div className="card p-4">
                 <input
                   type="email"
                   className="form-control mb-3"
                   value={email}
                   onChange={(e) => setEmail(e.target.value)}
                   placeholder="Email"
                 />
                 <input
                   type="password"
                   className="form-control mb-3"
                   value={password}
                   onChange={(e) => setPassword(e.target.value)}
                   placeholder="Password"
                 />
                 <select
                   className="form-control mb-3"
                   value={role}
                   onChange={(e) => setRole(e.target.value)}
                 >
                   <option value="learner">Learner</option>
                   <option value="curator">Curator</option>
                 </select>
                 <button className="btn btn-primary w-100" onClick={handleRegister}>
                   Register
                 </button>
               </div>
             </div>
           </div>
         </div>
       );
     };

     export default Register;