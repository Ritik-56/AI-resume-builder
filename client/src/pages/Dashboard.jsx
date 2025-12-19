import { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import ResumeCard from '../components/ResumeCard';

const Dashboard = () => {
    const { user, logout } = useContext(AuthContext);
    const [resumes, setResumes] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchResumes();
    }, []);

    const fetchResumes = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/resume');
            setResumes(res.data);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this resume?')) {
            try {
                await axios.delete(`http://localhost:5000/api/resume/delete/${id}`);
                setResumes(resumes.filter(resume => resume._id !== id));
            } catch (err) {
                console.error(err);
                alert('Failed to delete resume');
            }
        }
    };

    return (
        <div className="min-h-screen">
            <nav className="navbar">
                <div className="nav-content">
                    <div className="flex">
                        <div className="flex-shrink-0 flex items-center">
                            <h1 className="text-xl font-bold text-indigo-600">AI Resume Builder</h1>
                        </div>
                    </div>
                    <div className="flex items-center">
                        <span className="mr-4">Welcome, {user?.name}</span>
                        <button
                            onClick={logout}
                            className="btn-danger ml-4"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </nav>

            <main className="container">
                <div className="py-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold">Your Resumes</h2>
                        <Link
                            to="/create"
                            className="btn-primary"
                            style={{ display: 'inline-block', textDecoration: 'none' }}
                        >
                            + Create New Resume
                        </Link>
                    </div>

                    {loading ? (
                        <div className="text-center">Loading...</div>
                    ) : resumes.length === 0 ? (
                        <div className="border-4 border-dashed border-gray-200 rounded-lg h-64 flex flex-col items-center justify-center text-gray-500 p-8 text-center" style={{ borderStyle: 'dashed', borderWidth: '4px' }}>
                            <p className="mb-4 text-lg">You haven't created any resumes yet.</p>
                            <Link to="/create" className="text-indigo-600 hover:underline">Get started by creating one!</Link>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-6" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                            {resumes.map(resume => (
                                <ResumeCard key={resume._id} resume={resume} onDelete={handleDelete} />
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default Dashboard;
