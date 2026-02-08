import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

const resumeTypes = [
    { name: 'Engineering', description: 'Technical roles, software development, engineering.' },
    { name: 'Management', description: 'Project management, team leadership, executive roles.' },
    { name: 'Banking', description: 'Investment banking, retail banking, financial services.' },
    { name: 'Finance', description: 'Accounting, financial analysis, corporate finance.' },
    { name: 'Analytics', description: 'Data science, business analytics, data engineering.' },
    { name: 'IT', description: 'System admin, network engineering, IT support.' },
    { name: 'Custom', description: 'Tailored for any other specific industry.' },
];

const ResumeTypeSelector = () => {
    const navigate = useNavigate();

    const handleSelect = async (type) => {
        const title = prompt("Enter a title for your resume (e.g., 'My Engineering Resume'):");
        if (!title) return;

        try {
            const res = await api.post('/resume', {
                title,
                resumeType: type
            });
            // Redirect to the builder with the new resume ID
            navigate(`/resume/${res.data._id}`);
        } catch (err) {
            console.error(err);
            alert('Failed to create resume');
        }
    };

    return (
        <div className="container py-12">
            <div className="max-w-3xl mx-auto" style={{ maxWidth: '48rem', margin: '0 auto' }}>
                <h2 className="text-center text-3xl font-extrabold mb-8">
                    Select Your Resume Type - (Future Scope)
                </h2>
                <div className="grid grid-cols-1 gap-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
                    {resumeTypes.map((type) => (
                        <button
                            key={type.name}
                            onClick={() => handleSelect(type.name)}
                            className="card card-hover flex items-center space-x-3"
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem',
                                textAlign: 'left',
                                width: '100%',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                border: '1px solid #e5e7eb'
                            }}
                        >
                            <div className="flex-1 min-w-0 text-left">
                                <p className="text-sm font-medium text-gray-900" style={{ fontWeight: 600 }}>{type.name}</p>
                                <p className="text-sm text-gray-500 truncate">{type.description}</p>
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ResumeTypeSelector;
