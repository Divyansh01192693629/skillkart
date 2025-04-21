import React, { useState } from 'react';

     const CuratorDashboard = () => {
       const [topicId, setTopicId] = useState('');
       const [type, setType] = useState('video');
       const [title, setTitle] = useState('');
       const [url, setUrl] = useState('');
       const [uploadedBy, setUploadedBy] = useState('');

       const handleUpload = async () => {
         try {
           const response = await fetch('http://localhost:5001/api/resources', {
             method: 'POST',
             headers: { 'Content-Type': 'application/json' },
             body: JSON.stringify({ topicId, type, title, url, uploadedBy })
           });
           const data = await response.json();
           if (data.success) {
             alert('Resource uploaded!');
             setTopicId('');
             setTitle('');
             setUrl('');
           } else {
             alert('Upload failed');
           }
         } catch (error) {
           alert('Failed to fetch');
         }
       };

       return (
         <div className="container mt-5">
           <h1 className="text-center mb-4">Curator Dashboard</h1>
           <div className="row justify-content-center">
             <div className="col-md-6">
               <div className="card p-4">
                 <input
                   type="text"
                   className="form-control mb-3"
                   value={topicId}
                   onChange={(e) => setTopicId(e.target.value)}
                   placeholder="Topic ID (e.g., t1)"
                 />
                 <select className="form-control mb-3" value={type} onChange={(e) => setType(e.target.value)}>
                   <option value="video">Video</option>
                   <option value="blog">Blog</option>
                   <option value="quiz">Quiz</option>
                 </select>
                 <input
                   type="text"
                   className="form-control mb-3"
                   value={title}
                   onChange={(e) => setTitle(e.target.value)}
                   placeholder="Resource Title"
                 />
                 <input
                   type="text"
                   className="form-control mb-3"
                   value={url}
                   onChange={(e) => setUrl(e.target.value)}
                   placeholder="Resource URL"
                 />
                 <input
                   type="text"
                   className="form-control mb-3"
                   value={uploadedBy}
                   onChange={(e) => setUploadedBy(e.target.value)}
                   placeholder="Your Email"
                 />
                 <button className="btn btn-primary w-100" onClick={handleUpload}>
                   Upload Resource
                 </button>
               </div>
             </div>
           </div>
         </div>
       );
     };

     export default CuratorDashboard;