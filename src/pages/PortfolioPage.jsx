import { useEffect, useState } from 'react'

const portfolioNav = [
  { label: 'Home', href: '#home' },
  { label: 'About', href: '#about' },
  { label: 'Experience', href: '#experience' },
  { label: 'Skills', href: '#skills' },
  { label: 'AI Tools', href: '#ai-tools' },
  { label: 'Projects', href: '#projects' },
  { label: 'Contact', href: '#contact' },
]

const skillGroups = [
  {
    title: 'Frontend',
    items: ['HTML5', 'CSS3', 'JavaScript', 'React', 'Responsive Design', 'Tailwind CSS'],
    icon: '👨‍💻',
    color: 'indigo',
  },
  {
    title: 'Backend & DB',
    items: ['PHP', 'Java', 'Laravel', 'REST APIs', 'MySQL', 'MongoDB'],
    icon: '⚙️',
    color: 'cyan',
  },
  {
    title: 'Tools & Others',
    items: ['Git & GitHub', 'VS Code', 'WordPress', 'UI/UX Basics', 'Firebase'],
    icon: '🛠️',
    color: 'emerald',
  },
]

const aiTools = [
  { name: 'CodeX', icon: '🔵', color: 'sky' },
  { name: 'GitHub Copilot', icon: '⚫', color: 'slate' },
  { name: 'Cursor AI', icon: '🟣', color: 'purple' },
  { name: 'ChatGPT', icon: '🟢', color: 'emerald' },
  { name: 'Gemini', icon: '🔷', color: 'indigo' },
  { name: 'Claude', icon: '🟠', color: 'orange' },
  { name: 'Figma', icon: '🩷', color: 'pink' },
  { name: 'Notion', icon: '⚪', color: 'slate' },
]

const projects = [
  {
    title: 'Job Portal Platform',
    description: 'A comprehensive job search platform where candidates can discover opportunities, apply for roles, and employers can share openings. Features include advanced filtering, saved jobs, and application tracking.',
    stack: ['React', 'Express', 'MongoDB'],
    image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80',
    link: 'https://github.com/manish25er-2003/',
  },
  {
    title: 'RoomSpot - Rental Platform',
    description: 'A complete room rental management system where tenants can search properties, manage bookings, and administrators oversee payments and activity. Built with modern web stack.',
    stack: ['React', 'Express', 'MongoDB'],
    image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80',
    link: 'https://github.com/manish25er-2003/',
  },
  {
    title: 'SmartBank Systems',
    description: 'A secure banking application with user authentication, account management, and real-time transaction processing. Features encryption and comprehensive security protocols.',
    stack: ['Java', 'MySQL', 'Swing'],
    image: 'https://images.unsplash.com/photo-1563013544-824b1adac3e9?auto=format&fit=crop&w=800&q=80',
    link: 'https://github.com/mainshKumar50/SmartBanksys/tree/master',
  },
]

const experience = [
  {
    title: 'Software Development Intern',
    company: 'ThinkNext Technologies',
    period: 'January 2025 – August 2025',
    status: 'Intern',
    description: 'Gained practical experience in software and web application development. Worked on frontend and backend development tasks including CRUD functionality, REST APIs, database integration, debugging, testing, and Git/GitHub workflows.',
    icon: '💼',
  },
  {
    title: 'Software Developer',
    company: 'Baseline Technologies',
    period: 'August 2025 – December 2025',
    status: 'Developer',
    description: 'Worked on web application development and API-based features. Implemented CRUD functionality and integrated frontend with backend APIs. Worked with databases, debugging, testing, and application improvements.',
    icon: '🚀',
  },
  {
    title: 'Software Developer',
    company: 'Binary Data',
    period: 'December 2025 – Present',
    status: 'Current',
    description: 'Working on web application development and backend/API integration. Developing and maintaining application features using modern web technologies. Working with databases, REST APIs, debugging, and application improvements.',
    icon: '⭐',
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

const rotatingHeroPhrases = ['Software Developer', 'Frontend Engineer', 'Full Stack Engineer']

function TypewriterText({ phrases }) {
  const [displayText, setDisplayText] = useState('')
  const [phraseIndex, setPhraseIndex] = useState(0)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    const currentPhrase = phrases[phraseIndex]
    const typeDelay = isDeleting ? 45 : 90

    const timeout = window.setTimeout(() => {
      if (!isDeleting) {
        const nextText = currentPhrase.slice(0, displayText.length + 1)
        setDisplayText(nextText)

        if (nextText === currentPhrase) {
          window.setTimeout(() => setIsDeleting(true), 1400)
        }
      } else {
        const nextText = currentPhrase.slice(0, displayText.length - 1)
        setDisplayText(nextText)

        if (nextText === '') {
          setIsDeleting(false)
          setPhraseIndex((prev) => (prev + 1) % phrases.length)
        }
      }
    }, typeDelay)

    return () => window.clearTimeout(timeout)
  }, [displayText, isDeleting, phraseIndex, phrases])

  return (
    <span className="portfolio-typewriter-wrap">
      <span className="portfolio-typewriter-text">{displayText}</span>
      <span className="portfolio-typewriter-cursor" aria-hidden="true" />
    </span>
  )
}

export default function PortfolioPage() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [formMessage, setFormMessage] = useState('')

  const handleFormSubmit = (e) => {
    e.preventDefault()
    setFormMessage('Message sent successfully!')
    setTimeout(() => setFormMessage(''), 5000)
  }

  return (
    <div style={{ background: '#0B0F19', color: '#E2E8F0', minHeight: '100vh', fontFamily: "'Inter', sans-serif" }}>
      {/* Global Background Orbs */}
      <div style={{
        position: 'fixed',
        top: '-10%',
        left: '-10%',
        width: '500px',
        height: '500px',
        background: 'rgba(99, 102, 241, 0.2)',
        borderRadius: '50%',
        filter: 'blur(120px)',
        pointerEvents: 'none',
        zIndex: 0,
        animation: 'pulse 8s ease-in-out infinite',
      }} />
      <div style={{
        position: 'fixed',
        bottom: '-10%',
        right: '-10%',
        width: '600px',
        height: '600px',
        background: 'rgba(6, 182, 212, 0.1)',
        borderRadius: '50%',
        filter: 'blur(120px)',
        pointerEvents: 'none',
        zIndex: 0,
      }} />

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Fira+Code:wght@400;500&display=swap');
        
        * {
          font-family: 'Inter', sans-serif;
        }
        
        .mono { font-family: 'Fira Code', monospace; }
        
        .glass-panel {
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.05);
        }
        
        .glass-card {
          background: rgba(255, 255, 255, 0.02);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          transition: all 0.3s ease;
        }
        
        .glass-card:hover {
          background: rgba(255, 255, 255, 0.04);
          border-color: rgba(99, 102, 241, 0.3);
          transform: translateY(-4px);
          box-shadow: 0 10px 30px -10px rgba(99, 102, 241, 0.2);
        }
        
        .text-gradient {
          background: linear-gradient(135deg, #6366F1 0%, #3B82F6 50%, #06B6D4 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.6; }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        
        .animate-float-delayed {
          animation: float 6s ease-in-out 3s infinite;
        }
        
        @keyframes typewriter {
          0%, 5% { width: 0; }
          10%, 90% { width: 100%; }
          95%, 100% { width: 0; }
        }
        
        @keyframes blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0; }
        }
        
        .hero-text {
          display: inline-block;
          height: 1.2em;
          overflow: hidden;
          border-right: 2px solid #06b6d4;
          animation: blink 0.7s infinite;
        }
        
        input, textarea {
          transition: all 0.3s ease;
        }
        
        input:focus, textarea:focus {
          outline: none;
          background: rgba(255, 255, 255, 0.08);
          border-color: rgba(99, 102, 241, 0.5);
          box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
        }
      `}</style>

      {/* Header */}
      <header style={{
        position: 'fixed',
        top: 0,
        zIndex: 50,
        width: '100%',
        background: 'rgba(11, 15, 25, 0.8)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
      }}>
        <div style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '0 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '80px',
        }}>
          <a href="#home" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            textDecoration: 'none',
            color: 'white',
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: 'linear-gradient(to top right, #6366f1, #06b6d4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 'bold',
              fontSize: '18px',
              boxShadow: '0 4px 16px rgba(99, 102, 241, 0.3)',
            }}>M</div>
            <span style={{ fontSize: '18px', fontWeight: 'bold', letterSpacing: '-0.01em' }}>
              Manish<span style={{ color: '#06b6d4' }}>.dev</span>
            </span>
          </a>

          <nav style={{
            display: 'flex',
            gap: '32px',
          }} className="hidden md:flex">
            {portfolioNav.map((item) => (
              <a
                key={item.label}
                href={item.href}
                style={{
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#cbd5e1',
                  textDecoration: 'none',
                  transition: 'color 0.3s',
                }}
                onMouseEnter={(e) => e.target.style.color = '#06b6d4'}
                onMouseLeave={(e) => e.target.style.color = '#cbd5e1'}
              >
                {item.label}
              </a>
            ))}
          </nav>

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            style={{
              display: 'block',
              background: 'none',
              border: 'none',
              color: '#cbd5e1',
              cursor: 'pointer',
              fontSize: '20px',
            }}
            className="md:hidden"
          >
            <i className={`fa-solid ${menuOpen ? 'fa-xmark' : 'fa-bars'}`} />
          </button>
        </div>
      </header>

      <main style={{ position: 'relative', zIndex: 10 }}>
        {/* Hero Section */}
        <section id="home" style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          paddingTop: '140px',
          paddingBottom: '80px',
        }}>
          <div style={{
            maxWidth: '1280px',
            margin: '0 auto',
            padding: '0 24px',
            width: '100%',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '48px',
            alignItems: 'center',
          }}>
            {/* Left Content */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div className="glass-panel" style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                borderRadius: '9999px',
                color: '#a5d6ff',
                fontSize: '14px',
                fontWeight: '500',
                width: 'fit-content',
              }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#06b6d4' }} />
                <span>Available for new opportunities</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <h2 style={{
                  fontSize: '18px',
                  fontWeight: '500',
                  color: '#cbd5e1',
                  margin: 0,
                }}>Hey there, welcome!</h2>
                <h1 style={{
                  fontSize: 'clamp(2.5rem, 7vw, 4rem)',
                  fontWeight: '800',
                  letterSpacing: '-0.02em',
                  color: 'white',
                  lineHeight: 1.2,
                  margin: 0,
                }}>
                  I'm Manish Kumar
                </h1>
                <div className="portfolio-typewriter-shell" style={{
                  fontSize: 'clamp(1.5rem, 4vw, 2rem)',
                  fontWeight: '700',
                  letterSpacing: '-0.01em',
                  lineHeight: 1.3,
                  minHeight: '60px',
                }}>
                  <span style={{ color: '#cbd5e1' }}>A </span>
                  <span className="portfolio-typewriter-highlight">
                    <TypewriterText phrases={rotatingHeroPhrases} />
                  </span>
                </div>
              </div>

              <p style={{
                fontSize: '18px',
                color: '#cbd5e1',
                lineHeight: 1.6,
                maxWidth: '500px',
                margin: 0,
              }}>
                I am a passionate software developer dedicated to crafting robust, scalable applications and delivering exceptional user experiences through clean code.
              </p>

              <div style={{
                display: 'flex',
                gap: '16px',
                paddingTop: '8px',
                flexWrap: 'wrap',
              }}>
                <a href="#contact" style={{
                  padding: '12px 32px',
                  borderRadius: '12px',
                  background: 'linear-gradient(to right, #6366f1, #06b6d4)',
                  color: 'white',
                  fontWeight: '600',
                  fontSize: '16px',
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: '0 0 20px rgba(99, 102, 241, 0.3)',
                  transition: 'all 0.3s',
                }}
                  onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
                  onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
                >
                  <i className="fa-regular fa-paper-plane" />
                  <span>Get In Touch</span>
                </a>
                <button style={{
                  padding: '12px 32px',
                  borderRadius: '12px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: '#cbd5e1',
                  fontWeight: '600',
                  fontSize: '16px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.3s',
                  cursor: 'pointer',
                }}
                  onMouseEnter={(e) => {
                    e.target.style.background = 'rgba(255, 255, 255, 0.2)';
                    e.target.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                    e.target.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = 'rgba(255, 255, 255, 0.1)';
                    e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                    e.target.style.transform = 'translateY(0)';
                  }}
                >
                  <i className="fa-solid fa-arrow-down" />
                  <span>Download Resume</span>
                </button>
              </div>
            </div>

            {/* Right Content - Profile Card */}
            <div style={{ display: 'flex', justifyContent: 'center', position: 'relative' }}>
              <div className="glass-card" style={{
                borderRadius: '24px',
                padding: '16px',
                maxWidth: '400px',
                width: '100%',
              }}>
                <div style={{
                  position: 'relative',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  aspectRatio: '4/5',
                  background: 'linear-gradient(to bottom, #1e293b, #0f172a)',
                }}>
                  <img
                    src="/profile-photo.png"
                    alt="Manish Kumar"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      objectPosition: 'center',
                      transition: 'transform 0.7s ease-out',
                      filter: 'none',
                    }}
                    onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
                    onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                  />
                  <div style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(to top, rgba(11, 15, 25, 0.9), transparent)',
                  }} />
                  <div className="glass-panel" style={{
                    position: 'absolute',
                    bottom: '16px',
                    left: '16px',
                    right: '16px',
                    padding: '12px',
                    borderRadius: '12px',
                  }}>
                    <div style={{
                      fontSize: '12px',
                      color: '#cbd5e1',
                      fontFamily: "'Fira Code', monospace",
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981' }} />
                        Available
                      </span>
                      <span style={{ color: '#06b6d4' }}>&lt;dev/&gt;</span>
                    </div>
                  </div>
                </div>

                {/* Float Badge 1 */}
                <div className="animate-float" style={{
                  position: 'absolute',
                  top: '-20px',
                  left: '-20px',
                  zIndex: 20,
                }}>
                  <div className="glass-panel" style={{
                    padding: '16px',
                    borderRadius: '16px',
                    display: 'flex',
                    gap: '12px',
                    alignItems: 'center',
                  }}>
                    <div style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '12px',
                      background: 'linear-gradient(135deg, #6366f1, #06b6d4)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '24px',
                    }}>
                      <i className="fa-solid fa-briefcase" style={{ color: 'white' }} />
                    </div>
                    <div>
                      <p style={{ fontSize: '18px', fontWeight: '800', color: 'white', margin: 0 }}>1+ Year</p>
                      <p style={{ fontSize: '12px', color: '#cbd5e1', margin: '4px 0 0 0' }}>Experience</p>
                    </div>
                  </div>
                </div>

                {/* Float Badge 2 */}
                <div className="animate-float-delayed" style={{
                  position: 'absolute',
                  bottom: '-20px',
                  right: '-20px',
                  zIndex: 20,
                }}>
                  <div className="glass-panel" style={{
                    padding: '12px 16px',
                    borderRadius: '16px',
                    display: 'flex',
                    gap: '12px',
                    alignItems: 'center',
                  }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '10px',
                      background: 'linear-gradient(135deg, #10b981, #14b8a6)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '18px',
                    }}>
                      <i className="fa-solid fa-circle-check" style={{ color: 'white' }} />
                    </div>
                    <div>
                      <p style={{ fontSize: '13px', fontWeight: '700', color: 'white', margin: 0 }}>5+ Projects</p>
                      <p style={{ fontSize: '11px', color: '#cbd5e1', margin: '2px 0 0 0' }}>Completed</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* About Section */}
        <section id="about" style={{
          paddingTop: '96px',
          paddingBottom: '96px',
          borderTop: '1px solid rgba(255, 255, 255, 0.05)',
        }}>
          <div style={{
            maxWidth: '1280px',
            margin: '0 auto',
            padding: '0 24px',
          }}>
            <div style={{ textAlign: 'center', marginBottom: '64px' }}>
              <h2 style={{
                fontSize: '14px',
                fontWeight: '700',
                letterSpacing: '0.05em',
                color: '#6366f1',
                textTransform: 'uppercase',
                margin: '0 0 8px 0',
              }}>About Me</h2>
              <h3 style={{
                fontSize: 'clamp(2rem, 5vw, 2.5rem)',
                fontWeight: 'bold',
                color: 'white',
                margin: '0 0 24px 0',
              }}>Discover</h3>
              <div style={{
                width: '80px',
                height: '4px',
                background: 'linear-gradient(to right, #6366f1, #06b6d4)',
                borderRadius: '9999px',
                margin: '0 auto',
              }} />
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '32px',
            }}>
              <div className="glass-card" style={{
                padding: '32px',
                borderRadius: '24px',
              }}>
                <h4 style={{
                  fontSize: '20px',
                  fontWeight: 'bold',
                  color: 'white',
                  marginBottom: '16px',
                }}>Full Stack Developer</h4>
                <p style={{
                  fontSize: '16px',
                  color: '#cbd5e1',
                  lineHeight: 1.7,
                  margin: '0 0 16px 0',
                }}>
                  I'm passionate about crafting robust, scalable web applications and delivering exceptional user experiences through clean, efficient code.
                </p>
                <p style={{
                  fontSize: '16px',
                  color: '#cbd5e1',
                  lineHeight: 1.7,
                  margin: 0,
                }}>
                  With expertise in both frontend and backend development, I create complete solutions that combine beautiful design with powerful functionality.
                </p>
              </div>

              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
              }}>
                {[
                  { label: '5+', value: 'Projects Built', icon: '🎯' },
                  { label: '1+', value: 'Years Experience', icon: '⚡' },
                  { label: '3+', value: 'Tech Stacks', icon: '💻' },
                ].map((stat) => (
                  <div key={stat.label} className="glass-card" style={{
                    padding: '20px',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                  }}>
                    <div style={{
                      fontSize: '28px',
                    }}>{stat.icon}</div>
                    <div>
                      <p style={{
                        fontSize: '18px',
                        fontWeight: 'bold',
                        color: '#6366f1',
                        margin: 0,
                      }}>{stat.label}</p>
                      <p style={{
                        fontSize: '13px',
                        color: '#cbd5e1',
                        margin: '4px 0 0 0',
                      }}>{stat.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Experience Section */}
        <section id="experience" style={{
          paddingTop: '96px',
          paddingBottom: '96px',
          borderTop: '1px solid rgba(255, 255, 255, 0.05)',
          background: 'rgba(255, 255, 255, 0.01)',
        }}>
          <div style={{
            maxWidth: '1280px',
            margin: '0 auto',
            padding: '0 24px',
          }}>
            <div style={{ textAlign: 'center', marginBottom: '64px' }}>
              <h2 style={{
                fontSize: '14px',
                fontWeight: '700',
                letterSpacing: '0.05em',
                color: '#6366f1',
                textTransform: 'uppercase',
                margin: '0 0 8px 0',
              }}>Journey</h2>
              <h3 style={{
                fontSize: 'clamp(2rem, 5vw, 2.5rem)',
                fontWeight: 'bold',
                color: 'white',
                margin: '0 0 24px 0',
              }}>Experience & Education</h3>
              <div style={{
                width: '80px',
                height: '4px',
                background: 'linear-gradient(to right, #6366f1, #06b6d4)',
                borderRadius: '9999px',
                margin: '0 auto',
              }} />
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '48px',
            }}>
              {/* Experience Column */}
              <div>
                <h4 style={{
                  fontSize: '18px',
                  fontWeight: '700',
                  color: 'white',
                  marginBottom: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                }}>
                  <i className="fa-solid fa-briefcase" style={{ color: '#6366f1' }} />Experience
                </h4>
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '24px',
                  position: 'relative',
                  paddingLeft: '24px',
                }}>
                  <div style={{
                    position: 'absolute',
                    left: '5px',
                    top: '0',
                    bottom: '0',
                    width: '2px',
                    background: 'linear-gradient(to bottom, #6366f1 0%, #6366f1 60%, transparent)',
                    borderRadius: '9999px',
                  }} />
                  {experience.map((exp, idx) => (
                    <div key={exp.company} style={{ position: 'relative' }}>
                      <div style={{
                        position: 'absolute',
                        left: '-30px',
                        top: '2px',
                        width: '14px',
                        height: '14px',
                        borderRadius: '50%',
                        background: '#6366f1',
                        border: '3px solid rgba(11, 15, 25, 1)',
                        zIndex: 10,
                      }} />
                      <div className="glass-card" style={{
                        padding: '20px',
                        borderRadius: '12px',
                      }}>
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'start',
                          marginBottom: '6px',
                        }}>
                          <h5 style={{ fontSize: '14px', fontWeight: '700', color: 'white', margin: 0 }}>{exp.title}</h5>
                          <span style={{
                            fontSize: '11px',
                            fontWeight: '600',
                            padding: '2px 8px',
                            borderRadius: '12px',
                            background: '#6366f1/20',
                            color: '#a5d6ff',
                            whiteSpace: 'nowrap',
                          }}>
                            {exp.period.split('–')[1]?.trim()}
                          </span>
                        </div>
                        <p style={{ fontSize: '12px', color: '#06b6d4', margin: '0 0 8px 0', fontWeight: '600' }}>{exp.company}</p>
                        <p style={{ fontSize: '13px', color: '#cbd5e1', lineHeight: 1.5, margin: '0 0 12px 0' }}>{exp.description}</p>
                        <div style={{
                          display: 'flex',
                          flexWrap: 'wrap',
                          gap: '6px',
                        }}>
                          {['React', 'Backend', 'REST APIs'].map((skill) => (
                            <span key={skill} style={{
                              fontSize: '11px',
                              padding: '3px 8px',
                              borderRadius: '6px',
                              background: 'rgba(99, 102, 241, 0.15)',
                              color: '#a5d6ff',
                              border: '1px solid rgba(99, 102, 241, 0.2)',
                            }}>
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Education Column */}
              <div>
                <h4 style={{
                  fontSize: '18px',
                  fontWeight: '700',
                  color: 'white',
                  marginBottom: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                }}>
                  <i className="fa-solid fa-graduation-cap" style={{ color: '#06b6d4' }} />Education
                </h4>
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '24px',
                  position: 'relative',
                  paddingLeft: '24px',
                }}>
                  <div style={{
                    position: 'absolute',
                    left: '5px',
                    top: '0',
                    bottom: '0',
                    width: '2px',
                    background: 'linear-gradient(to bottom, #06b6d4 0%, #06b6d4 60%, transparent)',
                    borderRadius: '9999px',
                  }} />
                  {education.map((edu) => (
                    <div key={edu.title} style={{ position: 'relative' }}>
                      <div style={{
                        position: 'absolute',
                        left: '-30px',
                        top: '2px',
                        width: '14px',
                        height: '14px',
                        borderRadius: '50%',
                        background: '#06b6d4',
                        border: '3px solid rgba(11, 15, 25, 1)',
                        zIndex: 10,
                      }} />
                      <div className="glass-card" style={{
                        padding: '20px',
                        borderRadius: '12px',
                      }}>
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'start',
                          marginBottom: '6px',
                        }}>
                          <h5 style={{ fontSize: '14px', fontWeight: '700', color: 'white', margin: 0 }}>{edu.title}</h5>
                          <span style={{
                            fontSize: '11px',
                            fontWeight: '600',
                            padding: '2px 8px',
                            borderRadius: '12px',
                            background: '#06b6d4/20',
                            color: '#a5f3fc',
                            whiteSpace: 'nowrap',
                          }}>
                            {edu.period}
                          </span>
                        </div>
                        <p style={{ fontSize: '12px', color: '#06b6d4', margin: '0 0 8px 0', fontWeight: '600' }}>{edu.institution}</p>
                        <p style={{ fontSize: '13px', color: '#cbd5e1', lineHeight: 1.5, margin: 0 }}>
                          Focused on computer science fundamentals, algorithms, and web technologies.
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Skills Section */}
        <section id="skills" style={{
          paddingTop: '96px',
          paddingBottom: '96px',
          borderTop: '1px solid rgba(255, 255, 255, 0.05)',
        }}>
          <div style={{
            maxWidth: '1280px',
            margin: '0 auto',
            padding: '0 24px',
          }}>
            <div style={{ textAlign: 'center', marginBottom: '64px' }}>
              <h2 style={{
                fontSize: '14px',
                fontWeight: '700',
                letterSpacing: '0.05em',
                color: '#6366f1',
                textTransform: 'uppercase',
                margin: '0 0 8px 0',
              }}>Expertise</h2>
              <h3 style={{
                fontSize: 'clamp(2rem, 5vw, 2.5rem)',
                fontWeight: 'bold',
                color: 'white',
                margin: '0 0 24px 0',
              }}>Skills & Tools</h3>
              <div style={{
                width: '80px',
                height: '4px',
                background: 'linear-gradient(to right, #6366f1, #06b6d4)',
                borderRadius: '9999px',
                margin: '0 auto',
              }} />
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '32px',
            }}>
              {skillGroups.map((group) => (
                <div key={group.title} className="glass-card" style={{
                  padding: '32px',
                  borderRadius: '24px',
                }}>
                  <div style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '16px',
                    background: group.color === 'indigo' ? 'rgba(99, 102, 241, 0.1)' : group.color === 'cyan' ? 'rgba(6, 182, 212, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '28px',
                    marginBottom: '16px',
                    color: group.color === 'indigo' ? '#6366f1' : group.color === 'cyan' ? '#06b6d4' : '#10b981',
                    border: `1px solid ${group.color === 'indigo' ? 'rgba(99, 102, 241, 0.2)' : group.color === 'cyan' ? 'rgba(6, 182, 212, 0.2)' : 'rgba(16, 185, 129, 0.2)'}`,
                  }}>
                    {group.icon}
                  </div>
                  <h4 style={{ fontSize: '18px', fontWeight: 'bold', color: 'white', marginBottom: '16px' }}>
                    {group.title}
                  </h4>
                  <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '8px',
                  }}>
                    {group.items.map((skill) => (
                      <span
                        key={skill}
                        style={{
                          fontSize: '13px',
                          padding: '6px 12px',
                          background: 'rgba(255, 255, 255, 0.05)',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          borderRadius: '8px',
                          color: '#cbd5e1',
                          transition: 'all 0.3s',
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.background = 'rgba(99, 102, 241, 0.2)';
                          e.target.style.borderColor = 'rgba(99, 102, 241, 0.5)';
                          e.target.style.color = '#a5d6ff';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.background = 'rgba(255, 255, 255, 0.05)';
                          e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                          e.target.style.color = '#cbd5e1';
                        }}
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* AI Tools Section */}
        <section id="ai-tools" style={{
          paddingTop: '96px',
          paddingBottom: '96px',
          borderTop: '1px solid rgba(255, 255, 255, 0.05)',
        }}>
          <div style={{
            maxWidth: '1280px',
            margin: '0 auto',
            padding: '0 24px',
          }}>
            <div style={{ textAlign: 'center', marginBottom: '64px' }}>
              <div className="glass-panel" style={{
                display: 'inline-block',
                padding: '8px 16px',
                borderRadius: '9999px',
                marginBottom: '16px',
                fontSize: '12px',
                fontWeight: '700',
                letterSpacing: '0.05em',
                color: '#6366f1',
              }}>
                MY AI TOOLS
              </div>
              <h3 style={{
                fontSize: 'clamp(2rem, 5vw, 2.5rem)',
                fontWeight: 'bold',
                color: 'white',
                margin: '0 0 24px 0',
              }}>Workflow and productivity stack</h3>
              <div style={{
                width: '80px',
                height: '4px',
                background: 'linear-gradient(to right, #6366f1, #06b6d4)',
                borderRadius: '9999px',
                margin: '0 auto',
              }} />
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '16px',
            }}>
              {aiTools.map((tool) => (
                <div key={tool.name} className="glass-card" style={{
                  padding: '20px',
                  borderRadius: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '12px',
                    background: tool.color === 'sky' ? 'rgba(14, 165, 233, 0.1)' :
                      tool.color === 'slate' ? 'rgba(100, 116, 139, 0.1)' :
                      tool.color === 'purple' ? 'rgba(168, 85, 247, 0.1)' :
                      tool.color === 'emerald' ? 'rgba(16, 185, 129, 0.1)' :
                      tool.color === 'indigo' ? 'rgba(99, 102, 241, 0.1)' :
                      tool.color === 'orange' ? 'rgba(249, 115, 22, 0.1)' :
                      tool.color === 'pink' ? 'rgba(236, 72, 153, 0.1)' : 'rgba(71, 85, 105, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '20px',
                    border: `1px solid ${
                      tool.color === 'sky' ? 'rgba(14, 165, 233, 0.2)' :
                      tool.color === 'slate' ? 'rgba(100, 116, 139, 0.2)' :
                      tool.color === 'purple' ? 'rgba(168, 85, 247, 0.2)' :
                      tool.color === 'emerald' ? 'rgba(16, 185, 129, 0.2)' :
                      tool.color === 'indigo' ? 'rgba(99, 102, 241, 0.2)' :
                      tool.color === 'orange' ? 'rgba(249, 115, 22, 0.2)' :
                      tool.color === 'pink' ? 'rgba(236, 72, 153, 0.2)' : 'rgba(71, 85, 105, 0.2)'
                    }`,
                  }}>
                    {tool.icon}
                  </div>
                  <span style={{ fontSize: '14px', fontWeight: '600', color: '#cbd5e1' }}>{tool.name}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Projects Section */}
        <section id="projects" style={{
          paddingTop: '96px',
          paddingBottom: '96px',
          borderTop: '1px solid rgba(255, 255, 255, 0.05)',
          background: 'rgba(8, 12, 20, 1)',
          position: 'relative',
        }}>
          <div style={{
            position: 'absolute',
            top: '20%',
            left: 0,
            width: '400px',
            height: '400px',
            background: 'rgba(99, 102, 241, 0.1)',
            borderRadius: '50%',
            filter: 'blur(100px)',
            pointerEvents: 'none',
            zIndex: 0,
          }} />

          <div style={{
            maxWidth: '1280px',
            margin: '0 auto',
            padding: '0 24px',
            position: 'relative',
            zIndex: 10,
          }}>
            <div style={{ textAlign: 'center', marginBottom: '80px' }}>
              <h2 style={{
                fontSize: '14px',
                fontWeight: '700',
                letterSpacing: '0.05em',
                color: '#6366f1',
                textTransform: 'uppercase',
                margin: '0 0 8px 0',
              }}>Portfolio</h2>
              <h3 style={{
                fontSize: 'clamp(2rem, 5vw, 3rem)',
                fontWeight: 'bold',
                color: 'white',
                margin: '0 0 24px 0',
              }}>Featured Projects</h3>
              <div style={{
                width: '96px',
                height: '4px',
                background: 'linear-gradient(to right, #6366f1, #06b6d4)',
                borderRadius: '9999px',
                margin: '0 auto',
              }} />
            </div>

            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '48px',
            }}>
              {projects.map((project, idx) => (
                <div
                  key={project.title}
                  className="glass-card"
                  style={{
                    borderRadius: '32px',
                    padding: '32px',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                    gap: '48px',
                    alignItems: 'center',
                    border: idx === 0 ? '1px solid rgba(99, 102, 241, 0.3)' : idx === 1 ? '1px solid rgba(6, 182, 212, 0.3)' : '1px solid rgba(255, 255, 255, 0.08)',
                  }}
                >
                  {idx % 2 === 0 ? (
                    <>
                      <div style={{
                        borderRadius: '16px',
                        overflow: 'hidden',
                        aspectRatio: '4/3',
                        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)',
                      }}>
                        <img
                          src={project.image}
                          alt={project.title}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            transition: 'transform 0.5s ease',
                          }}
                          onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
                          onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                        />
                      </div>
                      <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        gap: '16px',
                      }}>
                        <h4 style={{ fontSize: '24px', fontWeight: 'bold', color: 'white', margin: 0 }}>
                          {project.title}
                        </h4>
                        <p style={{
                          fontSize: '16px',
                          color: '#cbd5e1',
                          lineHeight: 1.6,
                          margin: 0,
                        }}>
                          {project.description}
                        </p>
                        <div style={{
                          display: 'flex',
                          flexWrap: 'wrap',
                          gap: '8px',
                          paddingTop: '8px',
                        }}>
                          {project.stack.map((tech) => (
                            <span
                              key={tech}
                              style={{
                                fontSize: '12px',
                                padding: '6px 12px',
                                background: 'rgba(99, 102, 241, 0.1)',
                                border: '1px solid rgba(99, 102, 241, 0.2)',
                                borderRadius: '8px',
                                color: '#a5d6ff',
                              }}
                            >
                              {tech}
                            </span>
                          ))}
                        </div>
                        <a
                          href={project.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '8px',
                            fontSize: '14px',
                            fontWeight: '600',
                            color: '#06b6d4',
                            textDecoration: 'none',
                            marginTop: '8px',
                            transition: 'gap 0.3s',
                          }}
                          onMouseEnter={(e) => e.target.style.gap = '12px'}
                          onMouseLeave={(e) => e.target.style.gap = '8px'}
                        >
                          View Project <i className="fa-solid fa-arrow-right" />
                        </a>
                      </div>
                    </>
                  ) : (
                    <>
                      <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        gap: '16px',
                      }}>
                        <h4 style={{ fontSize: '24px', fontWeight: 'bold', color: 'white', margin: 0 }}>
                          {project.title}
                        </h4>
                        <p style={{
                          fontSize: '16px',
                          color: '#cbd5e1',
                          lineHeight: 1.6,
                          margin: 0,
                        }}>
                          {project.description}
                        </p>
                        <div style={{
                          display: 'flex',
                          flexWrap: 'wrap',
                          gap: '8px',
                          paddingTop: '8px',
                        }}>
                          {project.stack.map((tech) => (
                            <span
                              key={tech}
                              style={{
                                fontSize: '12px',
                                padding: '6px 12px',
                                background: 'rgba(6, 182, 212, 0.1)',
                                border: '1px solid rgba(6, 182, 212, 0.2)',
                                borderRadius: '8px',
                                color: '#a5f3fc',
                              }}
                            >
                              {tech}
                            </span>
                          ))}
                        </div>
                        <a
                          href={project.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '8px',
                            fontSize: '14px',
                            fontWeight: '600',
                            color: '#06b6d4',
                            textDecoration: 'none',
                            marginTop: '8px',
                            transition: 'gap 0.3s',
                          }}
                          onMouseEnter={(e) => e.target.style.gap = '12px'}
                          onMouseLeave={(e) => e.target.style.gap = '8px'}
                        >
                          View Project <i className="fa-solid fa-arrow-right" />
                        </a>
                      </div>
                      <div style={{
                        borderRadius: '16px',
                        overflow: 'hidden',
                        aspectRatio: '4/3',
                        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)',
                      }}>
                        <img
                          src={project.image}
                          alt={project.title}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            transition: 'transform 0.5s ease',
                          }}
                          onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
                          onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                        />
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section id="contact" style={{
          paddingTop: '96px',
          paddingBottom: '96px',
          borderTop: '1px solid rgba(255, 255, 255, 0.05)',
          background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.01) 0%, rgba(99, 102, 241, 0.03) 100%)',
        }}>
          <div style={{
            maxWidth: '1280px',
            margin: '0 auto',
            padding: '0 24px',
          }}>
            <div style={{ textAlign: 'center', marginBottom: '64px' }}>
              <h2 style={{
                fontSize: '14px',
                fontWeight: '700',
                letterSpacing: '0.05em',
                color: '#6366f1',
                textTransform: 'uppercase',
                margin: '0 0 8px 0',
              }}>Get in Touch</h2>
              <h3 style={{
                fontSize: 'clamp(2rem, 5vw, 2.5rem)',
                fontWeight: 'bold',
                color: 'white',
                margin: '0 0 24px 0',
              }}>Let's Work Together</h3>
              <div style={{
                width: '80px',
                height: '4px',
                background: 'linear-gradient(to right, #6366f1, #06b6d4)',
                borderRadius: '9999px',
                margin: '0 auto',
              }} />
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '48px',
            }}>
              {/* Form */}
              <div>
                <form onSubmit={handleFormSubmit} style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '20px',
                }}>
                  {formMessage && (
                    <div style={{
                      padding: '16px',
                      borderRadius: '12px',
                      background: 'rgba(16, 185, 129, 0.1)',
                      border: '1px solid rgba(16, 185, 129, 0.3)',
                      color: '#10b981',
                      fontSize: '14px',
                      display: 'flex',
                      gap: '8px',
                      alignItems: 'center',
                    }}>
                      <i className="fa-solid fa-circle-check" />
                      {formMessage}
                    </div>
                  )}

                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#cbd5e1',
                      marginBottom: '8px',
                    }}>Full Name</label>
                    <input
                      type="text"
                      placeholder="Your name"
                      required
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        borderRadius: '10px',
                        background: 'rgba(255, 255, 255, 0.04)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        color: 'white',
                        fontSize: '14px',
                        boxSizing: 'border-box',
                        transition: 'all 0.3s',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#cbd5e1',
                      marginBottom: '8px',
                    }}>Email Address</label>
                    <input
                      type="email"
                      placeholder="your@email.com"
                      required
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        borderRadius: '10px',
                        background: 'rgba(255, 255, 255, 0.04)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        color: 'white',
                        fontSize: '14px',
                        boxSizing: 'border-box',
                        transition: 'all 0.3s',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#cbd5e1',
                      marginBottom: '8px',
                    }}>Message</label>
                    <textarea
                      placeholder="Tell me about your project or inquiry..."
                      rows="5"
                      required
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        borderRadius: '10px',
                        background: 'rgba(255, 255, 255, 0.04)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        color: 'white',
                        fontSize: '14px',
                        fontFamily: "'Inter', sans-serif",
                        boxSizing: 'border-box',
                        resize: 'none',
                        transition: 'all 0.3s',
                      }}
                    />
                  </div>

                  <button
                    type="submit"
                    style={{
                      padding: '14px 32px',
                      borderRadius: '10px',
                      background: 'linear-gradient(to right, #6366f1, #06b6d4)',
                      color: 'white',
                      fontWeight: '600',
                      fontSize: '15px',
                      border: 'none',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      boxShadow: '0 4px 15px rgba(99, 102, 241, 0.3)',
                      marginTop: '8px',
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.transform = 'translateY(-2px)';
                      e.target.style.boxShadow = '0 6px 20px rgba(99, 102, 241, 0.4)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = '0 4px 15px rgba(99, 102, 241, 0.3)';
                    }}
                  >
                    <i className="fa-solid fa-paper-plane" style={{ marginRight: '8px' }} />
                    Send Message
                  </button>
                </form>
              </div>

              {/* Contact Info Cards */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '20px',
              }}>
                {[
                  { icon: 'fa-envelope', label: 'Email', value: 'manishkumar25er@gmail.com', link: 'mailto:manishkumar25er@gmail.com' },
                  { icon: 'fa-phone', label: 'Phone', value: '+91 70873 38600', link: 'tel:+917087338600' },
                  { icon: 'fa-github', label: 'GitHub', value: 'github.com/manish25er', link: 'https://github.com/manish25er' },
                  { icon: 'fa-linkedin', label: 'LinkedIn', value: 'linkedin.com/in/manish-kumar', link: 'https://linkedin.com/in/manish-kumar' },
                ].map((contact) => (
                  <a key={contact.label} href={contact.link} target={contact.link.startsWith('http') ? '_blank' : '_self'} style={{
                    textDecoration: 'none',
                    cursor: 'pointer',
                  }} rel={contact.link.startsWith('http') ? 'noopener noreferrer' : ''}>
                    <div className="glass-card" style={{
                      padding: '24px',
                      borderRadius: '14px',
                      display: 'flex',
                      gap: '16px',
                      alignItems: 'flex-start',
                      transition: 'all 0.3s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.5)';
                      e.currentTarget.style.background = 'rgba(99, 102, 241, 0.08)';
                      e.currentTarget.style.transform = 'translateX(4px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)';
                      e.currentTarget.style.transform = 'translateX(0)';
                    }}
                    >
                      <div style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '10px',
                        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(6, 182, 212, 0.15))',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '20px',
                        color: '#6366f1',
                        flexShrink: 0,
                        border: '1px solid rgba(99, 102, 241, 0.2)',
                      }}>
                        <i className={`fa-solid ${contact.icon}`} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <p style={{
                          fontSize: '12px',
                          color: '#94a3b8',
                          margin: 0,
                          textTransform: 'uppercase',
                          fontWeight: '600',
                          letterSpacing: '0.05em',
                        }}>
                          {contact.label}
                        </p>
                        <p style={{
                          fontSize: '15px',
                          color: 'white',
                          margin: '8px 0 0 0',
                          fontWeight: '600',
                          wordBreak: 'break-all',
                        }}>
                          {contact.value}
                        </p>
                      </div>
                      <i className="fa-solid fa-arrow-right" style={{
                        color: '#06b6d4',
                        fontSize: '14px',
                        flexShrink: 0,
                        marginTop: '4px',
                      }} />
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer style={{
        paddingTop: '32px',
        paddingBottom: '32px',
        borderTop: '1px solid rgba(255, 255, 255, 0.05)',
        background: 'rgba(8, 11, 19, 1)',
        textAlign: 'center',
        color: '#64748b',
        fontSize: '14px',
      }}>
        <div style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '0 24px',
        }}>
          <p style={{ margin: 0 }}>
            © {new Date().getFullYear()} Manish Kumar. Built with React & Tailwind CSS.
          </p>
        </div>
      </footer>
    </div>
  )
}
