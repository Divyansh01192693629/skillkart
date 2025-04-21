import React, { useState } from 'react';
  import { useNavigate, Link } from 'react-router-dom';

  const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async () => {
      if (loading) return;
      setLoading(true);
      setError('');
      try {
        const response = await fetch('http://localhost:5001/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });
        const data = await response.json();
        if (data.user) {
          if (data.user.role === 'curator') {
            navigate('/curator', { state: { email: data.user.email } });
          } else if (!data.user.profile || !data.user.profile.interests) {
            navigate('/profile', { state: { email: data.user.email } });
          } else {
            navigate('/roadmap/ui-ux', { state: { email: data.user.email } });
          }
        } else {
          setError(data.error || 'Login failed');
        }
      } catch (error) {
        setError('Failed to fetch: ' + error.message);
      } finally {
        setLoading(false);
      }
    };

    return (
      <div className="container mt-5">
        <h1 className="text-center mb-4">SkillKart Login</h1>
        <div className="row justify-content-center">
          <div className="col-md-6">
            <div className="card p-4">
              <input
                type="email"
                className="form-control mb-3"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                disabled={loading}
              />
              <input
                type="password"
                className="form-control mb-3"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                disabled={loading}
              />
              {error && <p className="text-danger text-center">{error}</p>}
              <button
                className="btn btn-primary w-100"
                onClick={handleLogin}
                disabled={loading}
              >
                {loading ? 'Logging in...' : 'Login'}
              </button>
              <p className="text-center mt-3">
                New user? <Link to="/register">Register</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  export default Login;