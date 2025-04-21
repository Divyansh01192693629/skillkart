import React, { useState, useEffect } from 'react';
     import { useParams } from 'react-router-dom';

     const Discussion = () => {
       const { roadmap } = useParams();
       const [message, setMessage] = useState('');
       const [userEmail, setUserEmail] = useState('');
       const [discussions, setDiscussions] = useState([]);

       useEffect(() => {
         const fetchDiscussions = async () => {
           try {
             const response = await fetch(`http://localhost:5001/api/discussions/${roadmap}`);
             const data = await response.json();
             setDiscussions(data);
           } catch (error) {
             console.error('Failed to fetch discussions:', error);
           }
         };
         fetchDiscussions();
       }, [roadmap]);

       const handlePost = async () => {
         try {
           const response = await fetch('http://localhost:5001/api/discussions', {
             method: 'POST',
             headers: { 'Content-Type': 'application/json' },
             body: JSON.stringify({ roadmap, userEmail, message })
           });
           const data = await response.json();
           if (data.success) {
             setDiscussions([{ userEmail, message, createdAt: new Date() }, ...discussions]);
             setMessage('');
           } else {
             alert('Failed to post');
           }
         } catch (error) {
           alert('Failed to fetch');
         }
       };

       return (
         <div className="container mt-5">
           <h1 className="text-center mb-4">{roadmap} Discussion</h1>
           <div className="row justify-content-center">
             <div className="col-md-8">
               <div className="card p-4 mb-3">
                 <input
                   type="text"
                   className="form-control mb-3"
                   value={userEmail}
                   onChange={(e) => setUserEmail(e.target.value)}
                   placeholder="Your Email"
                 />
                 <textarea
                   className="form-control mb-3"
                   value={message}
                   onChange={(e) => setMessage(e.target.value)}
                   placeholder="Your Question or Comment"
                 />
                 <button className="btn btn-primary w-100" onClick={handlePost}>
                   Post
                 </button>
               </div>
               {discussions.map((d, index) => (
                 <div key={index} className="card p-3 mb-2">
                   <p><strong>{d.userEmail}</strong> ({new Date(d.createdAt).toLocaleString()}):</p>
                   <p>{d.message}</p>
                 </div>
               ))}
             </div>
           </div>
         </div>
       );
     };

     export default Discussion;