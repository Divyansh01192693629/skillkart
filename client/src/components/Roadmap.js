import React, { useEffect, useState } from 'react';
  import { useParams, useNavigate, useLocation } from 'react-router-dom';

  const Roadmap = () => {
    const { skill } = useParams();
    const [roadmap, setRoadmap] = useState(null);
    const [resources, setResources] = useState({});
    const [userEmail, setUserEmail] = useState('');
    const [xp, setXp] = useState(0);
    const [badges, setBadges] = useState([]);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
      // Get email from login redirect
      if (location.state?.email) {
        setUserEmail(location.state.email);
      } else {
        setError('No user email found. Please log in.');
        navigate('/');
      }
    }, [location, navigate]);

    useEffect(() => {
      const fetchRoadmap = async () => {
        try {
          const response = await fetch(`http://localhost:5001/api/roadmaps/${skill}`);
          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }
          const data = await response.json();
          setRoadmap(data);
          for (const week of data.weeks || []) {
            for (const topic of week.topics || []) {
              const res = await fetch(`http://localhost:5001/api/resources/${topic.id}`);
              const resData = await res.json();
              setResources((prev) => ({ ...prev, [topic.id]: resData }));
            }
          }
        } catch (error) {
          console.error('Failed to fetch roadmap:', error);
          setError('Failed to load roadmap. Please try again.');
        }
      };

      const fetchUser = async () => {
        if (!userEmail) return;
        try {
          const response = await fetch(`http://localhost:5001/api/user?email=${userEmail}`);
          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }
          const data = await response.json();
          if (data.user) {
            setXp(data.user.xp);
            setBadges(data.user.badges);
          } else {
            setError('Failed to fetch user data.');
          }
        } catch (error) {
          console.error('Failed to fetch user:', error);
          setError('Failed to load user data.');
        }
      };

      fetchRoadmap();
      if (userEmail) fetchUser();
    }, [skill, userEmail]);

    const markProgress = async (topicId, status) => {
      try {
        const response = await fetch('http://localhost:5001/api/gamification', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: userEmail, topicId, status })
        });
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        setXp(data.xp);
        setBadges(data.badges);
        const updatedRoadmap = { ...roadmap };
        updatedRoadmap.weeks = (updatedRoadmap.weeks || []).map((week) => ({
          ...week,
          topics: (week.topics || []).map((topic) =>
            topic.id === topicId ? { ...topic, status } : topic
          )
        }));
        setRoadmap(updatedRoadmap);
      } catch (error) {
        console.error('Failed to update progress:', error);
        setError('Failed to update progress.');
      }
    };

    if (error) {
      return <div className="container mt-5 text-danger">{error}</div>;
    }

    if (!roadmap) {
      return <div className="container mt-5">Loading roadmap...</div>;
    }

    return (
      <div className="container mt-5">
        <h1>{roadmap.skill} Roadmap</h1>
        <p>XP: {xp} | Badges: {badges.join(', ') || 'None'}</p>
        <button
          className="btn btn-link mb-3"
          onClick={() => navigate(`/discussion/${skill}`)}
        >
          Go to Discussion
        </button>
        {(roadmap.weeks || []).map((week) => (
          <div key={week.weekNum} className="card p-3 mb-3">
            <h3>Week {week.weekNum}</h3>
            <ul>
              {(week.topics || []).map((topic) => (
                <li key={topic.id}>
                  {topic.name}
                  <select
                    className="form-control d-inline w-auto ml-2"
                    value={topic.status}
                    onChange={(e) => markProgress(topic.id, e.target.value)}
                  >
                    <option>Not Started</option>
                    <option>In Progress</option>
                    <option>Completed</option>
                  </select>
                  <ul>
                    {(resources[topic.id] || []).map((res, index) => (
                      <li key={index}>
                        <a href={res.url} target="_blank" rel="noopener noreferrer">
                          {res.title} ({res.type})
                        </a>
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    );
  };

  export default Roadmap;