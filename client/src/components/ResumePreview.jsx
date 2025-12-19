const ResumePreview = ({ resume, layoutMode = 'standard' }) => {
    // Layout variables based on mode
    const isCompact = layoutMode === 'compact';
    const spacing = isCompact ? '0.5rem' : '1.5rem';
    const headerSpacing = isCompact ? '0.25rem' : '1rem';

    return (
        <div
            className={`resume-preview-page ${isCompact ? 'compact-mode' : ''}`}
            style={{
                backgroundColor: 'white',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                padding: isCompact ? '1.5rem' : '2rem',
                paddingTop: isCompact ? '1rem' : '1.5rem', // Reduced top padding
                width: '210mm',
                minHeight: '297mm',
                color: 'black',
                fontSize: isCompact ? '0.8rem' : '0.875rem',
                lineHeight: isCompact ? '1.4' : '1.625',
                boxSizing: 'border-box',
                fontFamily: 'Times New Roman, serif',
                margin: '0 auto'
            }}
        >
            {/* Header */}
            <div style={{ textAlign: 'center', borderBottom: '2px solid #333', paddingBottom: isCompact ? '0.5rem' : '1rem', marginBottom: isCompact ? '0.5rem' : '1rem' }}>
                <h1 style={{ margin: 0, fontSize: '1.875rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.1rem' }}>{resume.personalDetails?.fullName || "Your Name"}</h1>
                {resume.personalDetails?.role && (
                    <p style={{ margin: 0, fontSize: '1.25rem', color: '#4b5563', marginBottom: '0.25rem', fontWeight: '500' }}>{resume.personalDetails.role}</p>
                )}
                <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', color: '#374151', flexWrap: 'wrap' }}>
                    {resume.personalDetails?.location && <span>{resume.personalDetails.location}</span>}
                    {resume.personalDetails?.phone && (
                        <span>| <a href={`tel:${resume.personalDetails.phone}`} style={{ textDecoration: 'none', color: 'inherit' }}>{resume.personalDetails.phone}</a></span>
                    )}
                    {resume.personalDetails?.email && (
                        <span>| <a href={`mailto:${resume.personalDetails.email}`} style={{ textDecoration: 'none', color: 'inherit' }}>{resume.personalDetails.email}</a></span>
                    )}
                    {resume.personalDetails?.linkedin && (
                        <span>| <a href={resume.personalDetails.linkedin} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', color: 'inherit' }}>LinkedIn</a></span>
                    )}
                </div>
            </div>

            {/* Career Objective */}
            {(resume.aiGenerated?.careerObjective || resume.personalDetails?.objective) && (
                <div style={{ marginBottom: '1.5rem' }}>
                    <h2 style={{ fontSize: '1.125rem', fontWeight: 'bold', textTransform: 'uppercase', borderBottom: '1px solid #9ca3af', marginBottom: '0.5rem' }}>Professional Summary</h2>
                    <p style={{ textAlign: 'justify' }}>{resume.aiGenerated?.careerObjective || resume.personalDetails?.objective}</p>
                </div>
            )}

            {/* Education */}
            {resume.education?.length > 0 && (
                <div style={{ marginBottom: '1.5rem' }}>
                    <h2 style={{ fontSize: '1.125rem', fontWeight: 'bold', textTransform: 'uppercase', borderBottom: '1px solid #9ca3af', marginBottom: '0.5rem' }}>Education</h2>
                    {resume.education.map((edu, index) => (
                        <div key={index} style={{ marginBottom: '0.5rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600 }}>
                                <span>{edu.institution}</span>
                                <span>{edu.year}</span>
                            </div>
                            <div>{edu.degree}</div>
                        </div>
                    ))}
                </div>
            )}

            {/* Experience */}
            {resume.experience?.length > 0 && (
                <div style={{ marginBottom: '1.5rem' }}>
                    <h2 style={{ fontSize: '1.125rem', fontWeight: 'bold', textTransform: 'uppercase', borderBottom: '1px solid #9ca3af', marginBottom: '0.5rem' }}>Experience</h2>
                    {resume.experience.map((exp, index) => (
                        <div key={index} style={{ marginBottom: '1rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600 }}>
                                <span>{exp.company}</span>
                                <span>{exp.duration}</span>
                            </div>
                            <div style={{ fontStyle: 'italic', marginBottom: '0.25rem' }}>{exp.role}</div>
                            <p style={{ textAlign: 'justify', whiteSpace: 'pre-line' }}>{exp.details}</p>
                        </div>
                    ))}
                </div>
            )}

            {/* Projects */}
            {resume.projects?.length > 0 && (
                <div style={{ marginBottom: '1.5rem' }}>
                    <h2 style={{ fontSize: '1.125rem', fontWeight: 'bold', textTransform: 'uppercase', borderBottom: '1px solid #9ca3af', marginBottom: '0.5rem' }}>Projects</h2>
                    {resume.projects.map((proj, index) => (
                        <div key={index} style={{ marginBottom: '1rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontWeight: 600 }}>
                                    {proj.title}
                                    {proj.link && (
                                        <a href={proj.link} target="_blank" rel="noopener noreferrer" style={{ marginLeft: '0.5rem', fontSize: '0.85rem', color: '#2563eb', fontWeight: 'normal' }}>
                                            [Link]
                                        </a>
                                    )}
                                </span>
                            </div>
                            {proj.technologies && (
                                <div style={{ fontStyle: 'italic', fontSize: '0.9rem', color: '#555', marginBottom: '0.1rem' }}>
                                    Stack: {proj.technologies}
                                </div>
                            )}
                            <p style={{ textAlign: 'justify', whiteSpace: 'pre-line' }}>{proj.description}</p>
                        </div>
                    ))}
                </div>
            )}

            {/* Skills */}
            {resume.skills?.length > 0 && (
                <div style={{ marginBottom: spacing }}>
                    <h2 style={{ fontSize: '1.125rem', fontWeight: 'bold', textTransform: 'uppercase', borderBottom: '1px solid #9ca3af', marginBottom: '0.5rem' }}>Skills</h2>
                    <ul style={{
                        listStyleType: 'disc',
                        listStylePosition: 'inside',
                        ...(isCompact ? { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0 1rem' } : {})
                    }}>
                        {resume.skills.map((skill, index) => (
                            <li key={index}>{skill}</li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Certifications */}
            {resume.certifications?.length > 0 && (
                <div style={{ marginBottom: '1.5rem' }}>
                    <h2 style={{ fontSize: '1.125rem', fontWeight: 'bold', textTransform: 'uppercase', borderBottom: '1px solid #9ca3af', marginBottom: '0.5rem' }}>Certifications</h2>
                    <ul style={{ listStyleType: 'disc', listStylePosition: 'inside' }}>
                        {resume.certifications.map((cert, index) => (
                            <li key={index}>
                                {cert.link ? (
                                    <a href={cert.link} target="_blank" rel="noopener noreferrer" style={{ fontWeight: 600, textDecoration: 'none', color: 'inherit' }}>
                                        {cert.name}
                                    </a>
                                ) : (
                                    <span style={{ fontWeight: 600 }}>{cert.name}</span>
                                )}
                                {cert.details && ` - ${cert.details}`}
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Declaration */}
            {(resume.aiGenerated?.declaration || resume.personalDetails?.declaration) && (
                <div style={{ marginBottom: '1.5rem' }}>
                    <h2 style={{ fontSize: '1.125rem', fontWeight: 'bold', textTransform: 'uppercase', borderBottom: '1px solid #9ca3af', marginBottom: '0.5rem' }}>Declaration</h2>
                    <p style={{ textAlign: 'justify' }}>{resume.aiGenerated?.declaration || resume.personalDetails?.declaration}</p>
                </div>
            )}

        </div>
    );
};

export default ResumePreview;
