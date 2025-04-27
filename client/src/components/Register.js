import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('learner');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const [mounted, setMounted] = useState(true);

  useEffect(() => {
    return () => setMounted(false);
  }, []);

  const handleRegister = async () => {
    if (loading) return;
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role }),
      });
      const data = await response.json(); // This line might fail if response isn't JSON
      if (data.success) {
        navigate('/', { state: { email } });
      } else {
        if (mounted) setError(data.error || 'Registration failed');
      }
    } catch (error) {
      if (mounted) setError('Failed to fetch: ' + error.message);
    } finally {
      if (mounted) setLoading(false);
    }
  };

  return (
    <div className="container mt-5">
      <h1 className="text-center mb-4 text-3xl font-bold animate-fade-in">SkillKart Register</h1>
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card p-4">
            <input
              type="email"
              className="form-control mb-3 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-200 hover:bg-gray-50"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              disabled={loading}
            />
            <input
              type="password"
              className="form-control mb-3 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-200 hover:bg-gray-50"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              disabled={loading}
            />
            <select
              className="form-control mb-3 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-200 hover:bg-gray-50"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              disabled={loading}
            >
              <option value="learner">Learner</option>
              <option value="curator">Curator</option>
            </select>
            {error && (
              <p className="text-red-500 text-center animate-shake">{error}</p>
            )}
            <button
              className="btn w-100 p-3 bg-gradient-to-r from-green-500 to-green-700 text-white rounded-lg hover:from-green-600 hover:to-green-800 transition-all duration-300"
              onClick={handleRegister}
              disabled={loading}
            >
              {loading ? 'Registering...' : 'Register'}
            </button>
            <p className="text-center mt-3">
              Already a user? <Link to="/" className="text-blue-600 hover:text-blue-800 transition-colors duration-200">Login</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = `
  @keyframes fade-in {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  @keyframes shake {
    0% { transform: translateX(0); }
    25% { transform: translateX(-5px); }
    50% { transform: translateX(5px); }
    75% { transform: translateX(-5px); }
    100% { transform: translateX(0); }
  }
  .animate-fade-in {
    animation: fade-in 0.5s ease-in;
  }
  .animate-shake {
    animation: shake 0.5s ease-in-out;
  }
`;

const styleSheet = document.createElement('style');
styleSheet.textContent = styles;
document.head.appendChild(styleSheet);

export default Register;