import { useState } from 'react'

const portfolioNav = [
  { label: 'Home', href: '#home' },
  { label: 'About', href: '#about' },
  { label: 'Education', href: '#education' },
  { label: 'Experience', href: '#experience' },
  { label: 'Skills', href: '#skills' },
  { label: 'AI Tools', href: '#ai-tools' },
  { label: 'Projects', href: '#projects' },
  { label: 'Contact', href: '#contact' },
]

const skillGroups = [
  {
    title: 'Frontend',
    items: ['HTML5', 'CSS3', 'JavaScript', 'React', 'Responsive Design', 'Bootstrap', 'Tailwind CSS'],
  },
  {
    title: 'Backend / Programming',
    items: ['PHP', 'Java', 'Laravel', 'REST APIs', 'MySQL'],
  },
  {
    title: 'Tools & Others',
    items: ['Git & GitHub', 'VS Code', 'WordPress', 'Shopify CMS', 'UI/UX Basics'],
  },
]

const aiTools = [
  { name: 'CodeX', badge: 'CX', tone: 'blue', image: 'https://cdn.simpleicons.org/code/1d4ed8' },
  { name: 'GitHub Copilot', badge: 'GH', tone: 'slate', image: 'https://cdn.simpleicons.org/github/1f2937' },
  { name: 'Cursor AI', badge: 'CU', tone: 'purple', image: 'https://cdn.simpleicons.org/cursor/7c3aed' },
  { name: 'ChatGPT', badge: 'AI', tone: 'teal', image: 'https://cdn.simpleicons.org/openai/0f766e' },
  { name: 'Gemini', badge: 'GM', tone: 'amber', image: 'https://cdn.simpleicons.org/google/ea4335' },
  { name: 'Claude', badge: 'CL', tone: 'orange', image: 'https://cdn.simpleicons.org/anthropic/ea580c' },
  { name: 'Figma', badge: 'FG', tone: 'pink', image: 'https://cdn.simpleicons.org/figma/f472b6' },
  { name: 'Notion', badge: 'NT', tone: 'gray', image: 'https://cdn.simpleicons.org/notion/111827' },
]

const projects = [
  {
    title: 'Job Portal',
    description: 'A job search platform that helps candidates discover opportunities and apply for roles, while employers can share openings and connect with applicants.',
    stack: ['Job Listings', 'Search', 'Applications'],
    latest: true,
    link: 'https://github.com/manish25er-2003/',
    linkLabel: 'View on GitHub',
  },
  {
    title: 'RoomSpot',
    description: 'A room rental platform where people can search available rooms and properties, while tenants and administrators manage accounts, payments, and rental activity.',
    stack: ['React', 'Express', 'MongoDB'],
    latest: true,
    link: 'https://github.com/manish25er-2003/',
    linkLabel: 'View on GitHub',
  },
  {
    title: 'SmartBank Systems',
    description: 'A secure banking application with user authentication, account management, and transaction processing.',
    stack: ['Java', 'MySQL'],
    link: 'https://github.com/mainshKumar50/SmartBanksys/tree/master',
  },
  {
    title: 'ShopVenture Website',
    description: 'An e-commerce platform with product browsing, shopping cart, and checkout functionality.',
    stack: ['PHP', 'Laravel', 'MySQL'],
    link: 'https://github.com/mainshKumar50/ShopVenture_Websites',
  },
  {
    title: 'Music Website',
    description: 'A music streaming platform with playlist creation, song browsing, and audio playback features.',
    stack: ['PHP', 'HTML', 'CSS', 'JavaScript'],
    link: 'https://github.com/mainshKumar50/music-site',
  },
]

const experience = [
  {
    title: 'Software Development Intern',
    company: 'ThinkNext Technologies',
    period: 'January 2025 – August 2025',
    status: '',
    description: 'Gained practical experience in software and web application development. Worked on frontend and backend development tasks. Developed CRUD functionality and worked with REST APIs. Practiced database integration, debugging, testing, and Git/GitHub workflows.',
    tags: ['Frontend', 'Backend', 'REST APIs', 'GitHub'],
  },
  {
    title: 'Software Developer',
    company: 'Baseline Technologies',
    period: 'August 2025 – December 2025',
    status: '',
    description: 'Worked on web application development and API-based features. Implemented CRUD functionality and integrated frontend with backend APIs. Worked with databases, debugging, testing, and application improvements.',
    tags: ['CRUD', 'APIs', 'Database', 'Testing'],
  },
  {
    title: 'Software Developer',
    company: 'Binary Data',
    period: 'December 2025 – Present',
    status: 'Current',
    description: 'Working on web application development and backend/API integration. Developing and maintaining application features using modern web technologies. Working with databases, REST APIs, debugging, and application improvements.',
    tags: ['Backend', 'APIs', 'Databases', 'Debugging'],
  },
]

const education = [
  {
    title: 'B.Tech in Computer Science Engineering',
    institution: 'Chandigarh Group of Colleges',
    period: '2022 - 2025',
    detail: 'Graduate',
  },
  {
    title: 'Diploma in Computer Science Engineering',
    institution: 'Sri Sukhmani Polytechnic College, Dera-Bassi',
    period: '2019 - 2022',
    detail: 'Completed',
  },
]

export default function PortfolioPage() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [expandedExperience, setExpandedExperience] = useState({})

  return (
    <div className="portfolio-page">
      <header className="portfolio-header">
        <div className="container portfolio-header-inner">
          <div className="portfolio-brand">
            <div className="brand-mark">
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M3 10.5 12 4l9 6.5V20a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1v-9.5Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
              </svg>
            </div>
            <span>Manish Kumar</span>
          </div>

          <nav
            id="portfolio-navigation"
            className={`portfolio-nav${menuOpen ? ' portfolio-nav-open' : ''}`}
            aria-label="Portfolio navigation"
          >
            {portfolioNav.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="portfolio-nav-link"
                onClick={() => setMenuOpen(false)}
              >
                {item.label}
              </a>
            ))}
          </nav>

          <a href="/" className="portfolio-home-btn">
            Back to Home
          </a>
          <button
            type="button"
            className="portfolio-menu-toggle"
            aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={menuOpen}
            aria-controls="portfolio-navigation"
            onClick={() => setMenuOpen((open) => !open)}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </header>

      <main className="portfolio-main">
        <section id="home" className="portfolio-hero">
          <div className="container portfolio-hero-inner">
            <div className="portfolio-hero-copy">
              <span className="portfolio-badge">Software Developer Engineer</span>
              <h1>Hi, I&apos;m Manish Kumar</h1>
              <p>
                I&apos;m a Full Stack Developer passionate about building clean, responsive and
                user-friendly web applications with modern technologies.
              </p>

              <div className="portfolio-hero-actions">
                <a href="#projects" className="portfolio-primary-btn">View Projects</a>
                <a href="#contact" className="portfolio-secondary-btn">Contact Me</a>
              </div>
            </div>

            <div className="portfolio-profile-card">
              <div className="portfolio-photo-wrap">
                <img
                  src="https://manish2026.lovable.app/assets/profile-photo-IkZr3Xq4.jpeg"
                  alt="Manish Kumar"
                  className="portfolio-real-photo"
                />
              </div>
              <div className="portfolio-mini-stats">
                <div>
                  <strong>3+</strong>
                  <span>Projects built</span>
                </div>
                <div>
                  <strong>B.Tech</strong>
                  <span>CS graduate</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="about" className="portfolio-section about-section">
          <div className="container">
            <div className="about-showcase">
              <div className="about-copy">
                <h2>About Me</h2>
                <span className="about-line" aria-hidden="true" />

                <p>
                  I&apos;m a Full Stack Developer with a strong foundation in both
                  frontend and backend development. I enjoy turning ideas into
                  real-world applications and continuously improving my skills
                  through hands-on projects.
                </p>

                <p>
                  I specialize in building complete web applications using PHP,
                  Laravel, Java for backend and React, HTML, CSS, JavaScript for
                  frontend. I love creating practical applications that solve real
                  problems and deliver exceptional user experiences.
                </p>

                <div className="about-stats">
                  <div className="stat-item">
                    <strong>3+</strong>
                    <span>Projects Built</span>
                  </div>
                  <div className="stat-item">
                    <strong>B.Tech</strong>
                    <span>CS Graduate</span>
                  </div>
                  <div className="stat-item">
                    <strong>1+</strong>
                    <span>Years Learning</span>
                  </div>
                </div>
              </div>

              <div className="feature-stack">
                <div className="feature-card">
                  <div className="feature-icon">&lt;/&gt;</div>
                  <div className="feature-text">
                    <h3>Clean Code</h3>
                    <p>Writing maintainable, scalable code</p>
                  </div>
                </div>

                <div className="feature-card">
                  <div className="feature-icon">Ω</div>
                  <div className="feature-text">
                    <h3>Problem Solver</h3>
                    <p>Turning ideas into reality</p>
                  </div>
                </div>

                <div className="feature-card">
                  <div className="feature-icon">⚡</div>
                  <div className="feature-text">
                    <h3>Fast Learner</h3>
                    <p>Always exploring new technologies</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="experience" className="portfolio-section experience-section">
          <div className="container experience-grid-layout">
            <div className="experience-column">
              <div className="portfolio-section-heading left-text">
                <h2>Experience</h2>
                <span className="underline-mark" aria-hidden="true" />
              </div>

              <div className="timeline-list">
                {experience.map((item, index) => (
                  <article key={item.company} className="timeline-card">
                    <div className="timeline-head-row">
                      <div>
                        <h3>{item.title}</h3>
                        <p>{item.company}</p>
                      </div>
                      <span className="experience-badge">{item.status}</span>
                    </div>

                    <div className="timeline-year-row">
                      <span className="timeline-year">{item.period}</span>
                    </div>

                    <p
                      id={`experience-description-${index}`}
                      className={`timeline-description${expandedExperience[index] ? ' timeline-description-expanded' : ''}`}
                    >
                      {item.description}
                    </p>
                    <button
                      type="button"
                      className="experience-description-toggle"
                      aria-expanded={Boolean(expandedExperience[index])}
                      aria-controls={`experience-description-${index}`}
                      onClick={() => setExpandedExperience((current) => ({
                        ...current,
                        [index]: !current[index],
                      }))}
                    >
                      {expandedExperience[index] ? 'Show less' : 'Read more'}
                    </button>

                    <div className="tag-list">
                      {item.tags.map((tag) => (
                        <span key={tag} className="tag-pill">{tag}</span>
                      ))}
                    </div>
                  </article>
                ))}
              </div>
            </div>

            <div className="education-column" id="education">
              <div className="portfolio-section-heading left-text">
                <h2>Education</h2>
                <span className="underline-mark" aria-hidden="true" />
              </div>

              <div className="education-grid">
                {education.map((item) => (
                  <article key={item.title} className="education-card">
                    <div className="education-head-row">
                      <div className="education-badge">{item.detail}</div>
                    </div>

                    <div className="timeline-year-row">
                      <span className="timeline-year">{item.period}</span>
                    </div>

                    <h3>{item.title}</h3>
                    <p>{item.institution}</p>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="skills" className="portfolio-section">
          <div className="container">
            <div className="portfolio-section-heading">
              <span className="portfolio-kicker">Technical Skills</span>
              <h2>Skills and tools</h2>
            </div>

            <div className="skill-grid">
              {skillGroups.map((group) => (
                <div key={group.title} className="skill-card">
                  <h3>{group.title}</h3>
                  <div className="tag-list">
                    {group.items.map((skill) => (
                      <span key={skill} className="tag-pill">{skill}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="ai-tools" className="portfolio-section light-section">
          <div className="container">
            <div className="portfolio-section-heading">
              <span className="portfolio-kicker">My AI Tools</span>
              <h2>Workflow and productivity stack</h2>
            </div>

            <div className="ai-tools-grid">
              {aiTools.map((tool) => (
                <div key={tool.name} className={`ai-tool-card ai-tool-${tool.tone}`}>
                  <div className="ai-tool-icon">
                    <img src={tool.image} alt={tool.name} />
                  </div>
                  <span>{tool.name}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="projects" className="portfolio-section">
          <div className="container">
            <div className="portfolio-section-heading">
              <span className="portfolio-kicker">Projects</span>
              <h2>Selected work</h2>
            </div>

            <div className="project-grid">
              {projects.map((project) => (
                <article key={project.title} className="project-card">
                  <div className="project-body">
                    {project.latest && <span className="project-latest-label">Latest project</span>}
                    <h3>{project.title}</h3>
                    <p>{project.description}</p>
                    <div className="tag-list">
                      {project.stack.map((item) => (
                        <span key={item} className="tag-pill">{item}</span>
                      ))}
                    </div>
                    <a
                      href={project.link}
                      target={project.link.startsWith('#') ? undefined : '_blank'}
                      rel={project.link.startsWith('#') ? undefined : 'noreferrer'}
                      className="project-link"
                    >
                      {project.linkLabel || 'View Project'}
                    </a>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="contact" className="portfolio-section contact-section">
          <div className="container contact-wrap">
            <div className="contact-copy">
              <h2>Get In Touch</h2>
              <span className="about-line" aria-hidden="true" />
              <p>
                I&apos;m always open to discussing new projects, job opportunities, or collaborations.
                Feel free to reach out!
              </p>
            </div>

            <div className="contact-grid">
              <div className="contact-form-panel">
                <div className="contact-panel-header">Send a Message</div>

                <div className="contact-form-grid">
                  <label>
                    Your Name
                    <input type="text" placeholder="John Doe" />
                  </label>
                  <label>
                    Email Address
                    <input type="email" placeholder="john@example.com" />
                  </label>
                  <label>
                    Your Message
                    <textarea rows="5" placeholder="Tell me about your project or just say hello..." />
                  </label>
                </div>

                <button type="button" className="contact-submit">Send Message ↗</button>
              </div>

              <div className="contact-info-panel">
                <div className="contact-panel-header">Contact Info</div>

                <div className="info-row">
                  <div className="info-icon">✉</div>
                  <div className="info-text">
                    <small>Email</small>
                    <strong>manishkumar@example.com</strong>
                  </div>
                </div>

                <div className="info-row">
                  <div className="info-icon">☎</div>
                  <div className="info-text">
                    <small>Phone</small>
                    <strong>+91 70873 38600</strong>
                  </div>
                </div>

                <div className="info-row">
                  <div className="info-icon">⌘</div>
                  <div className="info-text">
                    <small>GitHub</small>
                    <strong>github.com/manishkumar</strong>
                  </div>
                </div>

                <div className="info-row">
                  <div className="info-icon">in</div>
                  <div className="info-text">
                    <small>LinkedIn</small>
                    <strong>LinkedIn Profile</strong>
                  </div>
                </div>

                <div className="call-card">Call Now</div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="portfolio-footer">
        <div className="container portfolio-footer-inner">
          <span>© 2026 Manish Kumar. All rights reserved.</span>
          <a href="/" className="portfolio-footer-link">Back to RoomSpot</a>
        </div>
      </footer>
    </div>
  )
}
