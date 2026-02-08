import { useState, useRef, useLayoutEffect, useMemo, forwardRef, useImperativeHandle, useEffect } from 'react';
import html2pdf from 'html2pdf.js';

// --- Constants & Helpers ---
const A4_HEIGHT_MM = 297;
// const PAGE_MARGIN_MM = 0; // Handled by padding inside .resume-page
// const PIXELS_PER_MM = 3.78; 
// const A4_HEIGHT_PX = 1123; 


// --- Sub-Components (Renderers) ---

const HeaderSection = ({ data, isCompact }) => (
    <div className="resume-section-item" style={{ textAlign: 'center', borderBottom: '2px solid #333', paddingBottom: isCompact ? '0.5rem' : '1rem', marginBottom: isCompact ? '0.5rem' : '1rem' }}>
        <h1 style={{ margin: 0, fontSize: '1.875rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.1rem' }}>{data.fullName || "Your Name"}</h1>
        {data.role && (
            <p style={{ margin: 0, fontSize: '1.25rem', color: '#4b5563', marginBottom: '0.25rem', fontWeight: '500' }}>{data.role}</p>
        )}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', color: '#374151', flexWrap: 'wrap' }}>
            {data.location && <span>{data.location}</span>}
            {data.phone && (
                <span>| <a href={`tel:${data.phone}`} style={{ textDecoration: 'none', color: 'inherit' }}>{data.phone}</a></span>
            )}
            {data.email && (
                <span>| <a href={`mailto:${data.email}`} style={{ textDecoration: 'none', color: 'inherit' }}>{data.email}</a></span>
            )}
            {data.linkedin && (
                <span>| <a href={data.linkedin} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', color: 'inherit' }}>LinkedIn</a></span>
            )}
        </div>
    </div>
);

const SectionTitle = ({ title }) => (
    <div className="resume-section-header" style={{ marginBottom: '0.5rem', marginTop: '1rem' }}>
        <h2 style={{ fontSize: '1.125rem', fontWeight: 'bold', textTransform: 'uppercase', borderBottom: '1px solid #9ca3af', marginBottom: '0.5rem' }}>{title}</h2>
    </div>
);

const TextItem = ({ text }) => (
    <div className="resume-section-item" style={{ marginBottom: '1.5rem', textAlign: 'justify' }}>
        <p>{text}</p>
    </div>
);

const EducationItem = ({ edu }) => (
    <div className="resume-section-item" style={{ marginBottom: '0.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600 }}>
            <span>{edu.institution}</span>
            <span>{edu.year}</span>
        </div>
        <div>{edu.degree}</div>
        {edu.grade && (
            <div style={{ fontSize: '0.9rem', color: '#555' }}>
                {edu.gradeType}: {edu.grade}
            </div>
        )}
        {edu.marksheet && (
            <div style={{ fontSize: '0.9rem', marginTop: '0.1rem' }}>
                <a href={edu.marksheet} target="_blank" rel="noopener noreferrer" style={{ color: '#2563eb', textDecoration: 'none' }}>
                    View Marksheet ↗
                </a>
            </div>
        )}
    </div>
);

const ExperienceItem = ({ exp }) => (
    <div className="resume-section-item" style={{ marginBottom: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600 }}>
            <span>{exp.company}</span>
            <span>{exp.duration}</span>
        </div>
        <div style={{ fontStyle: 'italic', marginBottom: '0.25rem' }}>{exp.role}</div>
        <p style={{ textAlign: 'justify', whiteSpace: 'pre-line' }}>{exp.details}</p>
    </div>
);

const ProjectItem = ({ proj }) => (
    <div className="resume-section-item" style={{ marginBottom: '0.75rem' }}>
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
        <p style={{ textAlign: 'justify' }}>{proj.description}</p>
    </div>
);

const SkillsList = ({ skills, isCompact }) => (
    <div className="resume-section-item" style={{ marginBottom: isCompact ? '0.5rem' : '1.5rem' }}>
        <ul style={{
            listStyleType: 'disc',
            listStylePosition: 'inside',
            ...(isCompact ? { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0 1rem' } : {})
        }}>
            {skills.map((skill, index) => (
                <li key={index}>{skill}</li>
            ))}
        </ul>
    </div>
);

const CertificationItem = ({ cert }) => (
    <div className="resume-section-item" style={{ marginBottom: '0.25rem' }}>
        <ul style={{ listStyleType: 'disc', listStylePosition: 'inside', margin: 0 }}>
            <li>
                {cert.link ? (
                    <a href={cert.link} target="_blank" rel="noopener noreferrer" style={{ fontWeight: 600, textDecoration: 'none', color: 'inherit' }}>
                        {cert.name}
                    </a>
                ) : (
                    <span style={{ fontWeight: 600 }}>{cert.name}</span>
                )}
                {cert.details && ` - ${cert.details}`}
            </li>
        </ul>
    </div>
);


const ResumePreview = forwardRef(({ resume, layoutMode = 'standard' }, ref) => {
    const isCompact = layoutMode === 'compact';
    const [pages, setPages] = useState([]);
    const [scale, setScale] = useState(1);
    const hiddenContainerRef = useRef(null);
    const containerRef = useRef(null);

    // 1. Flatten the resume into a list of "Blocks" to be rendered
    const blocks = useMemo(() => {
        const list = [];

        // Header
        if (resume.personalDetails) {
            list.push({ type: 'header', data: resume.personalDetails });
        }

        // Summary
        const summary = resume.aiGenerated?.careerObjective || resume.personalDetails?.objective;
        if (summary) {
            list.push({ type: 'title', title: 'Professional Summary' });
            list.push({ type: 'text', text: summary });
        }

        // Education
        if (resume.education?.length > 0) {
            list.push({ type: 'title', title: 'Education' });
            resume.education.forEach(edu => list.push({ type: 'education', data: edu }));
        }

        // Experience
        if (resume.experience?.length > 0) {
            list.push({ type: 'title', title: 'Experience' });
            resume.experience.forEach(exp => list.push({ type: 'experience', data: exp }));
        }

        // Projects
        if (resume.projects?.length > 0) {
            list.push({ type: 'title', title: 'Projects' });
            resume.projects.forEach(proj => list.push({ type: 'project', data: proj }));
        }

        // Skills
        if (resume.skills?.length > 0) {
            list.push({ type: 'title', title: 'Skills' });
            list.push({ type: 'skills', data: resume.skills });
        }

        // Certifications
        if (resume.certifications?.length > 0) {
            list.push({ type: 'title', title: 'Certifications' });
            resume.certifications.forEach(cert => list.push({ type: 'certification', data: cert }));
        }

        // Declaration
        const declaration = resume.aiGenerated?.declaration || resume.personalDetails?.declaration;
        if (declaration) {
            list.push({ type: 'title', title: 'Declaration' });
            list.push({ type: 'text', text: declaration });
        }

        return list;
    }, [resume]);


    // 2. Measure and Paginate
    useLayoutEffect(() => {
        if (!hiddenContainerRef.current) return;

        const container = hiddenContainerRef.current;
        const children = Array.from(container.children);

        // Settings
        // The CSS sets padding: 2rem (approx 32px) standard, 1.5rem compact.
        // A4 Height = 1122px (297mm @ 96 DPI).
        // Standard: 1122 - 64 (padding) = 1058px.
        // Compact: 1122 - 40 (padding approx) = 1082px.
        // We push the limit as close as possible (1055/1080) to avoid "empty space" at the bottom.
        const CONTENT_HEIGHT_LIMIT = isCompact ? 1080 : 1056;

        const newPages = [];
        let currentPage = [];
        let currentHeight = 0;
        let previousMarginBottom = 0;

        children.forEach((child, index) => {
            const style = window.getComputedStyle(child);
            const marginTop = parseFloat(style.marginTop);
            const marginBottom = parseFloat(style.marginBottom);
            const offsetHeight = child.offsetHeight;
            const blockData = blocks[index];

            // Calculate space required for this item, accounting for margin collapse
            let spaceAbove = 0;
            if (currentPage.length === 0) {
                // First item on page: respects its margin-top (relative to container padding)
                spaceAbove = marginTop;
            } else {
                // Subsequent items: margin collapses with previous item's margin-bottom
                spaceAbove = Math.max(previousMarginBottom, marginTop);
            }

            // Projected bottom position of this item
            const projectedBottom = currentHeight + spaceAbove + offsetHeight;

            // We also check if the item's bottom margin would push it out (important for last item)
            // adhering strictly to the limit
            if (projectedBottom + marginBottom > CONTENT_HEIGHT_LIMIT && currentPage.length > 0) {
                // Push to new page
                newPages.push(currentPage);
                currentPage = [];
                currentHeight = 0;
                previousMarginBottom = 0;

                // Recalc for new page being first item
                spaceAbove = marginTop;
                currentHeight = spaceAbove + offsetHeight;
                previousMarginBottom = marginBottom;
                currentPage.push(blockData);
            } else {
                // Fits on current page
                currentHeight = projectedBottom;
                previousMarginBottom = marginBottom;
                currentPage.push(blockData);
            }
        });

        if (currentPage.length > 0) {
            newPages.push(currentPage);
        }

        setPages(newPages);

    }, [blocks, isCompact, resume]); // Re-run when blocks or layout changes

    // 3. Auto-Scaling Logic
    useEffect(() => {
        const handleResize = () => {
            if (containerRef.current) {
                const containerWidth = containerRef.current.offsetWidth;
                const standardA4WidthPx = 794; // 210mm @ 96 DPI
                const paddingBuffer = 40; // Extra breathing room

                // If container is smaller than A4, scale down.
                // If container is larger, keep scale 1 (optional, or scale up)
                let newScale = (containerWidth - paddingBuffer) / standardA4WidthPx;

                if (newScale > 1) newScale = 1; // Don't scale up past 100% to avoid blurriness, unless desired.
                if (newScale < 0.3) newScale = 0.3; // Minimum readable scale

                setScale(newScale);
            }
        };

        // Initial calc
        handleResize();

        // Observer
        const resizeObserver = new ResizeObserver(() => {
            handleResize();
        });

        if (containerRef.current) {
            resizeObserver.observe(containerRef.current);
        }

        // Cleanup
        return () => {
            resizeObserver.disconnect();
            window.removeEventListener('resize', handleResize);
        };
    }, []);


    const renderBlock = (block, idx) => {
        switch (block.type) {
            case 'header': return <HeaderSection key={idx} data={block.data} isCompact={isCompact} />;
            case 'title': return <SectionTitle key={idx} title={block.title} />;
            case 'text': return <TextItem key={idx} text={block.text} />;
            case 'education': return <EducationItem key={idx} edu={block.data} />;
            case 'experience': return <ExperienceItem key={idx} exp={block.data} />;
            case 'project': return <ProjectItem key={idx} proj={block.data} />;
            case 'skills': return <SkillsList key={idx} skills={block.data} isCompact={isCompact} />;
            case 'certification': return <CertificationItem key={idx} cert={block.data} />;
            default: return null;
        }
    };

    useImperativeHandle(ref, () => ({
        downloadPdf: () => {
            const element = document.getElementById('resume-export-container');
            // Reset transform for clean download, then restore
            const currentTransform = element.style.transform;
            element.style.transform = 'none';

            const opt = {
                margin: 0,
                filename: `${resume.personalDetails?.fullName || 'Resume'}.pdf`,
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { scale: 2, useCORS: true },
                jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
            };

            html2pdf().set(opt).from(element).save().then(() => {
                element.style.transform = currentTransform; // Restore scale if needed, though state drives it
            });
        }
    }));


    return (
        <div className="resume-preview-container" ref={containerRef}>
            {/* Rendered Paginated Pages */}
            <div
                id="resume-export-container"
                style={{
                    transform: `scale(${scale})`,
                    // We must ensure the height takes up the scaled space properly or use margins
                    marginBottom: `-${(1 - scale) * 100}%` // Hacky margin adjust? No, transform-origin top helps.
                }}
            >
                {pages.map((pageBlocks, pageIndex) => (
                    <div
                        key={pageIndex}
                        className={`resume-page ${isCompact ? 'compact-mode' : ''}`}
                        style={{
                            padding: isCompact ? '1.5rem' : '2rem',
                            paddingTop: isCompact ? '1rem' : '1.5rem',
                        }}
                    >
                        {pageBlocks.map((block, i) => renderBlock(block, i))}
                    </div>
                ))}
            </div>

            {/* Hidden Measurement Container */}
            <div
                ref={hiddenContainerRef}
                className={`resume-page ${isCompact ? 'compact-mode' : ''}`}
                style={{
                    position: 'absolute',
                    top: '-9999px',
                    left: '-9999px',
                    visibility: 'hidden',
                    // Override fixed height/overflow from .resume-page to allow full content measurement
                    height: 'auto',
                    minHeight: 'auto',
                    overflow: 'visible',
                    boxShadow: 'none',
                }}
            >
                {blocks.map((block, i) => renderBlock(block, i))}
            </div>

            {pages.length === 0 && (
                <div style={{ color: 'gray' }}>Generating pages...</div>
            )}
        </div>
    );
});


export default ResumePreview;
