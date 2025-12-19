import { Link } from 'react-router-dom';

const ResumeCard = ({ resume, onDelete }) => {
    // Format date
    const date = new Date(resume.updatedAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });

    return (
        <div className="card">
            <div className="">
                <div className="flex justify-between items-start">
                    <div>
                        <h3 className="text-lg font-medium truncate" style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>
                            {resume.title}
                        </h3>
                        <p className="text-sm text-gray-500">
                            {resume.resumeType}
                        </p>
                    </div>
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800" style={{ backgroundColor: '#e0e7ff', color: '#3730a3', borderRadius: '9999px', padding: '0.125rem 0.625rem', fontSize: '0.75rem' }}>
                        {resume.aiGenerated ? 'AI Enhanced' : 'Draft'}
                    </span>
                </div>
                <div className="mt-4 flex items-center justify-between" style={{ marginTop: '1rem', display: 'flex', justifyContent: 'space-between' }}>
                    <div className="text-sm text-gray-500">
                        Last updated: {date}
                    </div>
                </div>
                <div className="mt-5 flex space-x-3" style={{ marginTop: '1.25rem', display: 'flex', gap: '0.75rem' }}>
                    <Link
                        to={`/resume/${resume._id}`}
                        className="btn-primary flex-1 flex justify-center"
                        style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1, textDecoration: 'none' }}
                    >
                        Edit
                    </Link>
                    <button
                        onClick={() => onDelete(resume._id)}
                        className="btn-secondary"
                    >
                        Delete
                    </button>
                    {/* View/Print button could go here or inside Edit */}
                </div>
            </div>
        </div>
    );
};

export default ResumeCard;
