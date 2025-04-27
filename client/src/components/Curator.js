import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const Curator = () => {
  const [name, setName] = useState('');
  const [type, setType] = useState('');
  const [topic, setTopic] = useState('t1');
  const [url, setUrl] = useState('');
  const [uploadedBy, setUploadedBy] = useState('');
  const location = useLocation();
  const email = location.state?.email || 'test@example.com';
  console.log('Email used in Curator:', email);
  const API_URL = 'https://skillkart-fvqb.onrender.com'; // Hardcoded for debugging

  useEffect(() => {
    const fetchResources = async () => {
      try {
        console.log('Fetching resources from:', `${API_URL}/api/resources/t1`);
        const response = await fetch(`${API_URL}/api/resources/t1`);
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        console.log('Resources:', data);
      } catch (error) {
        console.error('Error fetching resources:', error);
      }
    };
    fetchResources();
  }, []);

  const handleUpload = async (e) => {
    e.preventDefault();
    const payload = {
      topicId: topic,
      type: type || 'Quiz',
      title: name || 'Untitled Resource',
      url: url || 'https://default.url',
      uploadedBy: uploadedBy || email,
    };
    try {
      console.log('Uploading resource to:', `${API_URL}/api/resources`);
      console.log('Payload:', payload);
      const response = await fetch(`${API_URL}/api/resources`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      console.log('Upload success:', data);
      alert('Resource uploaded successfully!');
      setName('');
      setType('');
      setTopic('t1');
      setUrl('');
      setUploadedBy('');
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload resource: ' + error.message);
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
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Name (optional)"
            />
            <input
              type="text"
              className="form-control mb-3"
              value={type}
              onChange={(e) => setType(e.target.value)}
              placeholder="Type (e.g., Quiz)"
            />
            <input
              type="text"
              className="form-control mb-3"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Topic ID (e.g., t1)"
            />
            <input
              type="url"
              className="form-control mb-3"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="URL"
            />
            <input
              type="email"
              className="form-control mb-3"
              value={uploadedBy}
              onChange={(e) => setUploadedBy(e.target.value)}
              placeholder="Uploaded By (optional, defaults to your email)"
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

export default Curator;