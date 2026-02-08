import React, { useState } from 'react';
import api from '../api/axios';

const ResumeForm = ({ resume, onUpdate }) => {
    const [skillsInput, setSkillsInput] = useState(resume.skills?.join(', ') || '');

    // Sync local skills input when resume.skills changes externally (e.g. from DB load)
    // We need to be careful not to overwrite user typing, so only sync if length differs significantly or on mounting
    React.useEffect(() => {
        if (resume.skills && resume.skills.join(', ') !== skillsInput) {
            // Only update if the parsed version is different, avoiding cursor jump on every keystroke
            // actually, better to just rely on initial load or check if focused.
            // Simple fallback: if local is empty and remote has stuff.
            if (!skillsInput && resume.skills.length > 0) {
                setSkillsInput(resume.skills.join(', '));
            }
        }
    }, [resume.skills]);

    const handleChange = (section, field, value) => {
        const updatedResume = { ...resume };
        if (section === 'personalDetails') {
            updatedResume.personalDetails = { ...updatedResume.personalDetails, [field]: value };
        } else {
            // Handle root level or other nesting
            updatedResume[field] = value;
        }
        onUpdate(updatedResume);
    };

    // Simplification for list updates (education/experience) would go here
    // For now, let's just make the Personal Details editable to demonstrate

    const handleEducationChange = (index, field, value) => {
        const newEdu = [...resume.education];
        newEdu[index] = { ...newEdu[index], [field]: value };
        onUpdate({ ...resume, education: newEdu });
    };

    const addEducation = () => {
        onUpdate({ ...resume, education: [...resume.education, { institution: '', degree: '', year: '' }] });
    }

    const [suggestions, setSuggestions] = useState(null);

    const handleAnalyze = async () => {
        try {
            console.log("Starting analysis request...");
            const res = await api.post('/resume/analyze', {
                currentData: resume
            });
            console.log("Analysis response:", res.data);
            setSuggestions(res.data);
            alert('Analysis Complete! See suggestions below.');
        } catch (err) {
            console.error("Analysis Error Details:", err);
            const errorMessage = err.response?.data?.message || err.response?.data || err.message || 'Unknown error';
            console.error("Server Error Message:", errorMessage);
            alert(`Failed to analyze resume. Error: ${errorMessage}`);
        }
    };

    const handleGenerate = async () => {
        try {
            // alert('Generating content with AI... This may take a few seconds.');
            const res = await api.post('/resume/generate', {
                resumeId: resume._id,
                currentData: resume // Sending current state so AI knows context
            });

            const { careerObjective, declaration } = res.data;

            // Update resume with generated content
            const updatedResume = {
                ...resume,
                aiGenerated: {
                    careerObjective,
                    declaration
                }
            };
            onUpdate(updatedResume);
            alert('AI Content Generated! Check the Professional Summary and Declaration sections.');

        } catch (err) {
            console.error("AI Gen Error", err);
            alert('Failed to generate content. Please ensure Server has API Key.');
        }
    };

    return (
        <div className="space-y-4">
            <div className="card">
                <h3 className="text-lg font-medium mb-4">Personal Details</h3>
                <div className="grid grid-cols-1 gap-4" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <input
                        type="text"
                        placeholder="Full Name"
                        value={resume.personalDetails?.fullName || ''}
                        onChange={(e) => handleChange('personalDetails', 'fullName', e.target.value)}
                    />
                    <input
                        type="text"
                        placeholder="Job Title / Role"
                        value={resume.personalDetails?.role || ''} // Assuming role exists or add to schema if needed, schema had title in root, keeping it simple
                        onChange={(e) => handleChange('personalDetails', 'role', e.target.value)}
                    />
                    <input
                        type="email"
                        placeholder="Email"
                        value={resume.personalDetails?.email || ''}
                        onChange={(e) => handleChange('personalDetails', 'email', e.target.value)}
                    />
                    <input
                        type="text"
                        placeholder="Phone"
                        value={resume.personalDetails?.phone || ''}
                        onChange={(e) => handleChange('personalDetails', 'phone', e.target.value)}
                    />
                    <input
                        type="text"
                        placeholder="Location"
                        value={resume.personalDetails?.location || ''}
                        onChange={(e) => handleChange('personalDetails', 'location', e.target.value)}
                    />
                    <input
                        type="text"
                        placeholder="LinkedIn URL"
                        value={resume.personalDetails?.linkedin || ''}
                        onChange={(e) => handleChange('personalDetails', 'linkedin', e.target.value)}
                    />
                </div>
            </div>

            {/* Career Objective Section */}
            <div className="card">
                <h3 className="text-lg font-medium mb-4">Career Objective</h3>
                <div className="form-group">
                    <textarea
                        placeholder="Write a professional summary matching the job description..."
                        rows="4"
                        value={resume.personalDetails?.objective || ''}
                        onChange={(e) => handleChange('personalDetails', 'objective', e.target.value)}
                    />
                </div>
            </div>

            <div className="card">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium">Education</h3>
                    <button onClick={addEducation} className="btn-secondary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.875rem' }}>+ Add</button>
                </div>
                {resume.education?.map((edu, index) => (
                    <div key={index} className="form-group" style={{ borderBottom: '1px solid #eee', paddingBottom: '1rem', marginBottom: '1rem' }}>
                        <input
                            type="text"
                            placeholder="Institution"
                            style={{ marginBottom: '0.5rem' }}
                            value={edu.institution || ''}
                            onChange={(e) => handleEducationChange(index, 'institution', e.target.value)}
                        />
                        <input
                            type="text"
                            placeholder="Degree"
                            style={{ marginBottom: '0.5rem' }}
                            value={edu.degree || ''}
                            onChange={(e) => handleEducationChange(index, 'degree', e.target.value)}
                        />
                        <input
                            type="text"
                            placeholder="Year (e.g., 2020 - 2024)"
                            value={edu.year || ''}
                            onChange={(e) => handleEducationChange(index, 'year', e.target.value)}
                        />
                        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                            <select
                                value={edu.gradeType || 'CGPA'}
                                onChange={(e) => handleEducationChange(index, 'gradeType', e.target.value)}
                                style={{ padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px', flex: '1' }}
                            >
                                <option value="CGPA">CGPA</option>
                                <option value="Percentage">Percentage</option>
                            </select>
                            <input
                                type="text"
                                placeholder={edu.gradeType === 'Percentage' ? 'e.g., 90%' : 'e.g., 9.5'}
                                value={edu.grade || ''}
                                onChange={(e) => handleEducationChange(index, 'grade', e.target.value)}
                                style={{ flex: '2' }}
                            />
                        </div>
                        <input
                            type="text"
                            placeholder="Marksheet Link (Optional)"
                            value={edu.marksheet || ''}
                            onChange={(e) => handleEducationChange(index, 'marksheet', e.target.value)}
                            style={{ marginTop: '0.5rem' }}
                        />
                        <div style={{ marginTop: '0.25rem', fontSize: '0.875rem' }}>
                            <label style={{ cursor: 'pointer', color: '#4f46e5', fontWeight: '500' }}>
                                {edu.marksheet && edu.marksheet.includes('/uploads/') ? 'Change Marksheet' : 'Upload Marksheet'}
                                <input
                                    type="file"
                                    accept="image/*,application/pdf"
                                    style={{ display: 'none' }}
                                    onChange={async (e) => {
                                        if (e.target.files && e.target.files[0]) {
                                            const file = e.target.files[0];
                                            const formData = new FormData();
                                            formData.append('file', file);
                                            try {
                                                const res = await api.post('/upload', formData, {
                                                    headers: { 'Content-Type': 'multipart/form-data' }
                                                });
                                                handleEducationChange(index, 'marksheet', res.data.url);
                                            } catch (err) {
                                                console.error('Upload failed', err);
                                                alert('Failed to upload file');
                                            }
                                        }
                                    }}
                                />
                            </label>
                            {edu.marksheet && edu.marksheet.includes('/uploads/') && (
                                <span style={{ marginLeft: '0.5rem', color: '#059669' }}>✓ File Uploaded</span>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Experience Section */}
            <div className="card">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium">Experience</h3>
                    <button onClick={() => {
                        const newExp = [...(resume.experience || []), { company: '', role: '', duration: '', details: '' }];
                        handleChange(null, 'experience', newExp);
                    }} className="btn-secondary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.875rem' }}>+ Add</button>
                </div>
                {resume.experience?.map((exp, index) => (
                    <div key={index} className="form-group" style={{ borderBottom: '1px solid #eee', paddingBottom: '1rem', marginBottom: '1rem' }}>
                        <input
                            type="text"
                            placeholder="Company"
                            style={{ marginBottom: '0.5rem' }}
                            value={exp.company || ''}
                            onChange={(e) => {
                                const newExp = [...resume.experience];
                                newExp[index].company = e.target.value;
                                handleChange(null, 'experience', newExp);
                            }}
                        />
                        <input
                            type="text"
                            placeholder="Role / Job Title"
                            style={{ marginBottom: '0.5rem' }}
                            value={exp.role || ''}
                            onChange={(e) => {
                                const newExp = [...resume.experience];
                                newExp[index].role = e.target.value;
                                handleChange(null, 'experience', newExp);
                            }}
                        />
                        <input
                            type="text"
                            placeholder="Duration (e.g., Jan 2022 - Present)"
                            style={{ marginBottom: '0.5rem' }}
                            value={exp.duration || ''}
                            onChange={(e) => {
                                const newExp = [...resume.experience];
                                newExp[index].duration = e.target.value;
                                handleChange(null, 'experience', newExp);
                            }}
                        />
                        <textarea
                            placeholder="Description / Details"
                            rows="4"
                            value={exp.details || ''}
                            onChange={(e) => {
                                const newExp = [...resume.experience];
                                newExp[index].details = e.target.value;
                                handleChange(null, 'experience', newExp);
                            }}
                        />
                        <button
                            onClick={() => {
                                const newExp = resume.experience.filter((_, i) => i !== index);
                                handleChange(null, 'experience', newExp);
                            }}
                            style={{ color: 'red', marginTop: '0.5rem', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.8rem' }}
                        >
                            Remove
                        </button>
                    </div>
                ))}
            </div>

            {/* Projects Section */}
            <div className="card">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium">Projects</h3>
                    <button onClick={() => {
                        const newProj = [...(resume.projects || []), { title: '', link: '', description: '', technologies: '' }];
                        handleChange(null, 'projects', newProj);
                    }} className="btn-secondary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.875rem' }}>+ Add</button>
                </div>
                {resume.projects?.map((proj, index) => (
                    <div key={index} className="form-group" style={{ borderBottom: '1px solid #eee', paddingBottom: '1rem', marginBottom: '1rem' }}>
                        <input
                            type="text"
                            placeholder="Project Title"
                            style={{ marginBottom: '0.5rem' }}
                            value={proj.title || ''}
                            onChange={(e) => {
                                const newProj = [...resume.projects];
                                newProj[index].title = e.target.value;
                                handleChange(null, 'projects', newProj);
                            }}
                        />
                        <input
                            type="text"
                            placeholder="Project Link (Optional)"
                            style={{ marginBottom: '0.5rem' }}
                            value={proj.link || ''}
                            onChange={(e) => {
                                const newProj = [...resume.projects];
                                newProj[index].link = e.target.value;
                                handleChange(null, 'projects', newProj);
                            }}
                        />
                        <input
                            type="text"
                            placeholder="Technologies (e.g., React, Node.js)"
                            style={{ marginBottom: '0.5rem' }}
                            value={proj.technologies || ''}
                            onChange={(e) => {
                                const newProj = [...resume.projects];
                                newProj[index].technologies = e.target.value;
                                handleChange(null, 'projects', newProj);
                            }}
                        />
                        <textarea
                            placeholder="Description / Details"
                            rows="3"
                            value={proj.description || ''}
                            onChange={(e) => {
                                const newProj = [...resume.projects];
                                newProj[index].description = e.target.value;
                                handleChange(null, 'projects', newProj);
                            }}
                        />
                        <button
                            onClick={() => {
                                const newProj = resume.projects.filter((_, i) => i !== index);
                                handleChange(null, 'projects', newProj);
                            }}
                            style={{ color: 'red', marginTop: '0.5rem', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.8rem' }}
                        >
                            Remove
                        </button>
                    </div>
                ))}
            </div>

            {/* Skills Section */}
            <div className="card">
                <h3 className="text-lg font-medium mb-4">Skills</h3>
                <div className="form-group">
                    <textarea
                        placeholder="Enter skills separated by commas (e.g., React, Node.js, Leadership)"
                        rows="3"
                        value={skillsInput}
                        onChange={(e) => {
                            const val = e.target.value;
                            setSkillsInput(val);
                            // Update parent state with parsed array
                            const skillsArray = val.split(',').map(s => s.trim()).filter(s => s);
                            handleChange(null, 'skills', skillsArray);
                        }}
                    />
                    <p style={{ fontSize: '0.8rem', color: '#666', marginTop: '0.25rem' }}>Separate skills with commas.</p>
                </div>
            </div>

            {/* Certifications Section */}
            <div className="card">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium">Certifications</h3>
                    <button onClick={() => {
                        const newCert = [...(resume.certifications || []), { name: '', details: '', link: '' }];
                        handleChange(null, 'certifications', newCert);
                    }} className="btn-secondary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.875rem' }}>+ Add</button>
                </div>
                {resume.certifications?.map((cert, index) => (
                    <div key={index} className="form-group" style={{ borderBottom: '1px solid #eee', paddingBottom: '1rem', marginBottom: '1rem' }}>
                        <input
                            type="text"
                            placeholder="Certification Name"
                            style={{ marginBottom: '0.5rem' }}
                            value={cert.name || ''}
                            onChange={(e) => {
                                const newCert = [...resume.certifications];
                                newCert[index].name = e.target.value;
                                handleChange(null, 'certifications', newCert);
                            }}
                        />
                        <input
                            type="text"
                            placeholder="Details / Year"
                            style={{ marginBottom: '0.5rem' }}
                            value={cert.details || ''}
                            onChange={(e) => {
                                const newCert = [...resume.certifications];
                                newCert[index].details = e.target.value;
                                handleChange(null, 'certifications', newCert);
                            }}
                        />
                        <input
                            type="text"
                            placeholder="Certificate Link (Optional)"
                            value={cert.link || ''}
                            onChange={(e) => {
                                const newCert = [...resume.certifications];
                                newCert[index].link = e.target.value;
                                handleChange(null, 'certifications', newCert);
                            }}
                        />
                        <div style={{ marginTop: '0.25rem', fontSize: '0.875rem' }}>
                            <label style={{ cursor: 'pointer', color: '#4f46e5', fontWeight: '500' }}>
                                {cert.link && cert.link.includes('/uploads/') ? 'Change File' : 'Or Upload Certificate Image'}
                                <input
                                    type="file"
                                    accept="image/*,application/pdf"
                                    style={{ display: 'none' }}
                                    onChange={async (e) => {
                                        if (e.target.files && e.target.files[0]) {
                                            const file = e.target.files[0];
                                            const formData = new FormData();
                                            formData.append('file', file);
                                            try {
                                                const res = await api.post('/upload', formData, {
                                                    headers: { 'Content-Type': 'multipart/form-data' }
                                                });
                                                const newCert = [...resume.certifications];
                                                newCert[index].link = res.data.url;
                                                handleChange(null, 'certifications', newCert);
                                            } catch (err) {
                                                console.error('Upload failed', err);
                                                alert('Failed to upload file');
                                            }
                                        }
                                    }}
                                />
                            </label>
                            {cert.link && cert.link.includes('/uploads/') && (
                                <span style={{ marginLeft: '0.5rem', color: '#059669' }}>✓ File Uploaded</span>
                            )}
                        </div>
                        <button
                            onClick={() => {
                                const newCert = resume.certifications.filter((_, i) => i !== index);
                                handleChange(null, 'certifications', newCert);
                            }}
                            style={{ color: 'red', marginTop: '0.5rem', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.8rem' }}
                        >
                            Remove
                        </button>
                    </div>
                ))}
            </div>

            {/* Declaration Section */}
            <div className="card">
                <h3 className="text-lg font-medium mb-4">Declaration</h3>
                <div className="form-group">
                    <textarea
                        placeholder="I hereby declare that..."
                        rows="3"
                        value={resume.personalDetails?.declaration || ''}
                        onChange={(e) => handleChange('personalDetails', 'declaration', e.target.value)}
                    />
                </div>
            </div>

            <div className="card" style={{ backgroundColor: '#f0fdf4', borderColor: '#bbf7d0', borderWidth: '1px', borderStyle: 'solid' }}>
                <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium" style={{ color: '#166534' }}>AI Analysis & Optimization</h3>
                    <div className="flex gap-2">
                        <button
                            onClick={handleAnalyze}
                            style={{ padding: '0.25rem 0.75rem', backgroundColor: '#15803d', color: 'white', borderRadius: '0.25rem', fontSize: '0.875rem', border: 'none', cursor: 'pointer' }}
                        >
                            🔍 Analyze Resume
                        </button>
                    </div>
                </div>
                <p style={{ color: '#15803d', fontSize: '0.875rem', marginTop: '0.5rem' }}>Check for grammar, impact, and layout improvements.</p>

                {suggestions && (
                    <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: 'white', borderRadius: '0.5rem', border: '1px solid #ddd' }}>
                        <h4 style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>AI Suggestions</h4>
                        <p style={{ fontSize: '0.9rem', marginBottom: '1rem', fontStyle: 'italic' }}>{suggestions.overallFeedback}</p>
                        {suggestions.improvements?.map((item, idx) => (
                            <div key={idx} style={{ marginBottom: '0.75rem', paddingBottom: '0.75rem', borderBottom: '1px solid #eee' }}>
                                <div style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#b91c1c' }}>Original: "{item.original}"</div>
                                <div style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#15803d' }}>Suggested: "{item.suggestion}"</div>
                                <div style={{ fontSize: '0.8rem', color: '#666' }}>Reason: {item.reason}</div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="card" style={{ backgroundColor: '#fff7ed', borderColor: '#fed7aa', borderWidth: '1px', borderStyle: 'solid' }}>
                <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium" style={{ color: '#9a3412' }}>Layout Optimization</h3>
                </div>
                <p style={{ fontSize: '0.875rem', color: '#9a3412', marginBottom: '0.5rem' }}>
                    If your resume exceeds 1 page, try Compact Mode to fit more content.
                </p>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', cursor: 'pointer' }}>
                    <input
                        type="checkbox"
                        checked={resume.layout === 'compact'}
                        onChange={(e) => onUpdate({ ...resume, layout: e.target.checked ? 'compact' : 'standard' })}
                    />
                    Enable Compact Mode (3-column skills, tighter spacing)
                </label>
            </div>
        </div>
    );
};

export default ResumeForm;
