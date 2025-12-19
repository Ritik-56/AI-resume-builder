import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
// Will implement these components next
import ResumeForm from '../components/ResumeForm';
import ResumePreview from '../components/ResumePreview';

const Builder = () => {
    const { id } = useParams();
    const [resume, setResume] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchResume = async () => {
            try {
                const res = await axios.get(`http://localhost:5000/api/resume/${id}`);
                setResume(res.data);
                setLoading(false);
            } catch (err) {
                console.error(err);
                setLoading(false);
            }
        };
        fetchResume();
    }, [id]);

    const handleUpdate = async (updatedData) => {
        try {
            await axios.put(`http://localhost:5000/api/resume/${id}`, updatedData);
            setResume({ ...resume, ...updatedData });
        } catch (err) {
            console.error("Failed to save", err);
        }
    };

    if (loading) return <div>Loading...</div>;
    if (!resume) return <div>Resume not found</div>;

    return (
        <div className="flex flex-col" style={{ height: '100vh' }}>
            <header className="navbar z-10 p-4 flex justify-between items-center" style={{ zIndex: 10, padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h1 className="text-xl font-bold">{resume.title} <span className="text-sm font-normal text-gray-500">({resume.resumeType})</span></h1>
                <div>
                    <button onClick={() => window.print()} className="btn-primary">
                        Download PDF
                    </button>
                </div>
            </header>
            <div className="builder-container">
                {/* Left Panel: Form */}
                <div className="builder-form">
                    <ResumeForm resume={resume} onUpdate={handleUpdate} />
                </div>
                {/* Right Panel: Preview */}
                <div className="builder-preview">
                    <ResumePreview resume={resume} layoutMode={resume.layout} />
                </div>
            </div>
        </div>
    );
};

export default Builder;
