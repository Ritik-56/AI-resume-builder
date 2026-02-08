import { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
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
            const res = await api.get('/resume');
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
                await api.delete(`/resume/delete/${id}`);
                setResumes(resumes.filter(resume => resume._id !== id));
            } catch (err) {
                console.error(err);
                alert('Failed to delete resume');
            }
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Navbar */}
            <nav className="sticky top-0 z-50 backdrop-blur bg-white/80 border-b border-gray-200 shadow-sm">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center">
                            <img src="/vite.svg" alt="ResuAI Logo" className="h-8 w-8 mr-2" />
                            <h1 className="text-xl font-semibold tracking-tight text-indigo-600">
                                ResuAI
                            </h1>
                        </div>

                        <div className="flex items-center gap-4">
                            <span className="text-sm text-gray-600">
                                Welcome, <span className="font-medium text-gray-800">{user?.name}</span>
                            </span>
                            <button
                                onClick={logout}
                                className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-red-500 hover:bg-red-600 transition"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main */}
            <main className="max-w-7xl mx-auto px-6">
                <div className="py-8">
                    <div className="flex justify-between items-center mb-8">
                        <h2 className="text-2xl font-semibold text-gray-800">
                            Your Resumes
                        </h2>

                        <Link
                            to="/create"
                            className="inline-flex items-center px-5 py-2.5 rounded-lg bg-indigo-600 text-white text-sm font-medium shadow hover:bg-indigo-700 transition"
                            style={{ textDecoration: 'none' }}
                        >
                            <p className="text-white">Create New Resume</p>
                        </Link>
                    </div>

                    {loading ? (
                        <div className="text-center text-gray-500 animate-pulse">
                            Loading...
                        </div>
                    ) : resumes.length === 0 ? (
                        <div className="border-2 border-dashed border-gray-300 rounded-xl h-64 flex flex-col items-center justify-center text-gray-500 p-8 text-center bg-white">
                            <p className="mb-3 text-lg font-medium">
                                You haven't created any resumes yet
                            </p>
                            <Link
                                to="/create"
                                className="text-indigo-600 font-medium hover:underline"
                            >
                                Get started by creating one →
                            </Link>
                        </div>
                    ) : (
                        <div
                            className="grid gap-6"
                            style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                                gap: '1.5rem',
                            }}
                        >
                            {resumes.map(resume => (
                                <ResumeCard
                                    key={resume._id}
                                    resume={resume}
                                    onDelete={handleDelete}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default Dashboard;
