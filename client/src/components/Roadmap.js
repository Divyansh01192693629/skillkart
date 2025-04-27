import React, { useState, useEffect } from 'react';
    import { useNavigate, useLocation, useParams } from 'react-router-dom';

    const Roadmap = () => {
      const [roadmap, setRoadmap] = useState(null);
      const [userEmail, setUserEmail] = useState('');
      const [error, setError] = useState('');
      const [expandedWeeks, setExpandedWeeks] = useState({});
      const [newWeekName, setNewWeekName] = useState('');
      const [completionPercentage, setCompletionPercentage] = useState(0);
      const navigate = useNavigate();
      const location = useLocation();
      const { skill } = useParams();

      useEffect(() => {
        console.log('Location state:', location.state);
        if (location.state?.email) {
          setUserEmail(location.state.email);
          console.log('User email set to:', location.state.email);
        } else {
          setError('No user email found. Please log in.');
          console.log('No email found, but not redirecting for now');
        }

        const fetchRoadmap = async () => {
          try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/api/roadmaps/${skill}`);
            const data = await response.json();
            if (!data.weeks || data.weeks.length === 0) {
              data.weeks = [{ weekNum: 1, name: 'Week 1', topics: [{ id: 't1', name: 'Introduction', status: 'Not Started' }] }];
            }
            setRoadmap(data);
            calculateCompletion(data);
          } catch (error) {
            setError('Failed to fetch roadmap');
          }
        };
        fetchRoadmap();
      }, [location, navigate, skill]);

      const calculateCompletion = (data) => {
        if (!data.weeks) return;
        const totalTopics = data.weeks.reduce((sum, week) => sum + week.topics.length, 0);
        const completedTopics = data.weeks.reduce((sum, week) => sum + week.topics.filter(t => t.status === 'Completed').length, 0);
        const percentage = totalTopics ? (completedTopics / totalTopics) * 100 : 0;
        setCompletionPercentage(Math.round(percentage));
      };

      const toggleWeek = (weekNum) => {
        setExpandedWeeks((prev) => ({ ...prev, [weekNum]: !prev[weekNum] }));
      };

      const updateStatus = (weekNum, topicId, newStatus) => {
        setRoadmap((prev) => {
          const updatedRoadmap = {
            ...prev,
            weeks: prev.weeks.map((week) =>
              week.weekNum === weekNum
                ? {
                    ...week,
                    topics: week.topics.map((topic) =>
                      topic.id === topicId ? { ...topic, status: newStatus } : topic
                    ),
                  }
                : week
            ),
          };
          calculateCompletion(updatedRoadmap);
          return updatedRoadmap;
        });
      };

      const addWeek = () => {
        if (newWeekName && roadmap) {
          const newWeekNum = roadmap.weeks.length + 1;
          setRoadmap((prev) => ({
            ...prev,
            weeks: [...prev.weeks, { weekNum: newWeekNum, name: newWeekName, topics: [] }],
          }));
          setNewWeekName('');
        }
      };

      const deleteWeek = (weekNum) => {
        setRoadmap((prev) => ({
          ...prev,
          weeks: prev.weeks.filter((week) => week.weekNum !== weekNum).map((week, index) => ({
            ...week,
            weekNum: index + 1,
          })),
        }));
        calculateCompletion(roadmap);
      };

      const isCourseCompleted = completionPercentage === 100;

      if (error) return <p className="text-red-500">{error}</p>;
      if (!roadmap) return <p>Loading...</p>;

      return (
        <div className="container mt-5 p-4 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg shadow-xl">
          <h1 className="text-4xl font-bold mb-4 text-white text-center animate-pulse">Roadmap: {skill}</h1>
          <div className="bg-white p-6 rounded-lg shadow-inner">
            <div className="mb-4">
              <input
                type="text"
                className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-200 hover:bg-gray-50"
                value={newWeekName}
                onChange={(e) => setNewWeekName(e.target.value)}
                placeholder="New Week Name"
              />
              <button
                className="mt-2 w-full p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all duration-200"
                onClick={addWeek}
              >
                Add Week
              </button>
            </div>
            <div className="mb-4">
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div
                  className="bg-green-500 h-4 rounded-full transition-all duration-500"
                  style={{ width: `${completionPercentage}%` }}
                ></div>
              </div>
              <p className="text-center mt-1">Completion: {completionPercentage}%</p>
            </div>
            {roadmap.weeks.map((week) => (
              <div key={week.weekNum} className="mb-4 bg-gray-50 p-4 rounded-lg shadow-md transition-all duration-300 hover:bg-gray-100">
                <div className="flex justify-between items-center">
                  <h2
                    className="text-xl font-semibold cursor-pointer text-blue-600 hover:text-blue-800"
                    onClick={() => toggleWeek(week.weekNum)}
                  >
                    Week {week.weekNum}: {week.name} {expandedWeeks[week.weekNum] ? '▼' : '▶'}
                  </h2>
                  <button
                    className="text-red-500 hover:text-red-700 transition-colors duration-200"
                    onClick={() => deleteWeek(week.weekNum)}
                  >
                    Delete
                  </button>
                </div>
                {expandedWeeks[week.weekNum] && (
                  <ul className="mt-2 space-y-2 animate-fade-in">
                    {week.topics.map((topic) => (
                      <li key={topic.id} className="flex items-center justify-between p-2 bg-white rounded transition-all duration-200 hover:bg-gray-200">
                        <a href={topic.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                          {topic.name}
                        </a>
                        <select
                          value={topic.status}
                          onChange={(e) => updateStatus(week.weekNum, topic.id, e.target.value)}
                          className="p-1 border rounded transition-all duration-200 hover:bg-gray-100"
                        >
                          <option value="Not Started">Not Started</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Completed">Completed</option>
                        </select>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
            {isCourseCompleted && (
              <div className="mt-4 p-4 bg-green-100 rounded-lg text-center animate-bounce">
                <h2 className="text-2xl font-bold text-green-800">Congratulations!</h2>
                <p>You have completed the {skill} course!</p>
              </div>
            )}
            <p className="mt-4 text-center text-gray-700">XP: {completionPercentage * 10} | Badges: {isCourseCompleted ? 'Gold Star' : 'None'}</p>
          </div>
        </div>
      );
    };

    const styles = `
      @keyframes fade-in {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      @keyframes bounce {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-10px); }
      }
      .animate-fade-in {
        animation: fade-in 0.5s ease-in;
      }
      .animate-bounce {
        animation: bounce 1s ease-in-out;
      }
    `;

    const styleSheet = document.createElement('style');
    styleSheet.textContent = styles;
    document.head.appendChild(styleSheet);

    export default Roadmap;