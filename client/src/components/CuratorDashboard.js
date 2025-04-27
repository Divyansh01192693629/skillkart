import React, { useState, useEffect, useRef } from 'react';
    import { useLocation, Link } from 'react-router-dom';
    import * as THREE from 'three';

    const CuratorDashboard = () => {
      const [topicId, setTopicId] = useState('');
      const [type, setType] = useState('video');
      const [title, setTitle] = useState('');
      const [url, setUrl] = useState('');
      const [uploadedBy, setUploadedBy] = useState('');
      const [preview, setPreview] = useState(null);
      const location = useLocation();
      const mountRef = useRef(null);

      const handleUpload = async () => {
        try {
          const response = await fetch(`${process.env.REACT_APP_API_URL}/api/resources`, {
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
            setPreview(`Uploaded: ${title} (${type}) to ${topicId}`);
            setTimeout(() => setPreview(null), 3000);
          } else {
            alert('Upload failed');
          }
        } catch (error) {
          alert('Failed to fetch');
        }
      };

      useEffect(() => {
        const mount = mountRef.current;
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({ alpha: true });
        renderer.setSize(50, 50); // Reduced size to avoid extra button look
        mount.appendChild(renderer.domElement);

        const geometry = new THREE.SphereGeometry(0.5, 16, 16); // Smaller sphere
        const material = new THREE.MeshBasicMaterial({ color: 0x00ff00, wireframe: true });
        const sphere = new THREE.Mesh(geometry, material);
        scene.add(sphere);

        camera.position.z = 2;

        const animate = () => {
          requestAnimationFrame(animate);
          sphere.rotation.x += 0.01;
          sphere.rotation.y += 0.01;
          renderer.render(scene, camera);
        };
        animate();

        return () => {
          mount.removeChild(renderer.domElement);
        };
      }, []);

      return (
        <div className="min-h-screen bg-gradient-to-r from-purple-500 to-blue-600 flex items-center justify-center p-4">
          <div className="container max-w-md mx-auto">
            <h1 className="text-center mb-6 text-4xl font-bold text-white drop-shadow-lg animate-pulse">Curator Dashboard</h1>
            <div className="card p-6 bg-white bg-opacity-90 rounded-xl shadow-2xl transform transition-all duration-300 hover:scale-105">
              <input
                type="text"
                className="form-control mb-4 p-3 border rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-200 hover:bg-gray-50"
                value={topicId}
                onChange={(e) => setTopicId(e.target.value)}
                placeholder="Topic ID (e.g., t1)"
              />
              <select
                className="form-control mb-4 p-3 border rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-200 hover:bg-gray-50"
                value={type}
                onChange={(e) => setType(e.target.value)}
              >
                <option value="video">Video</option>
                <option value="blog">Blog</option>
                <option value="quiz">Quiz</option>
              </select>
              <input
                type="text"
                className="form-control mb-4 p-3 border rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-200 hover:bg-gray-50"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Resource Title"
              />
              <input
                type="text"
                className="form-control mb-4 p-3 border rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-200 hover:bg-gray-50"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Resource URL"
              />
              <input
                type="text"
                className="form-control mb-4 p-3 border rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-200 hover:bg-gray-50"
                value={uploadedBy}
                onChange={(e) => setUploadedBy(e.target.value)}
                placeholder="Your Email"
              />
              <button
                className="relative w-full p-3 bg-gradient-to-r from-green-400 to-green-600 text-white rounded-lg font-semibold hover:from-green-500 hover:to-green-700 transition-all duration-300 animate-pulse-slow flex items-center justify-center"
                onClick={handleUpload}
              >
                <span className="mr-2">Upload Resource</span>
                <div ref={mountRef} className="w-8 h-8"></div>
              </button>
              {preview && (
                <p className="mt-3 text-center text-green-600 animate-fade-in">{preview}</p>
              )}
              <p className="mt-4 text-center text-gray-600">
                <Link
                  to="/roadmap/ui-ux"
                  state={{ email: location.state?.email || uploadedBy || 'test@example.com' }}
                  className="text-purple-600 hover:text-purple-800 transition-colors duration-200"
                >
                  View Roadmap
                </Link>
              </p>
            </div>
          </div>
        </div>
      );
    };

    const styles = `
      @keyframes pulse-slow {
        0% { transform: scale(1); }
        50% { transform: scale(1.05); }
        100% { transform: scale(1); }
      }
      @keyframes fade-in {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      .animate-pulse-slow {
        animation: pulse-slow 3s infinite;
      }
      .animate-fade-in {
        animation: fade-in 0.5s ease-in;
      }
    `;

    const styleSheet = document.createElement('style');
    styleSheet.textContent = styles;
    document.head.appendChild(styleSheet);

    export default CuratorDashboard;