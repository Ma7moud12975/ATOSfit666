import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../components/AppIcon';
import AppImage from '../../components/AppImage';
import { useLanguage } from '../../contexts/LanguageContext';
import { applyTheme, getSavedTheme } from '../../utils/theme';

const AboutPage = () => {
  const navigate = useNavigate();
  const { language, toggleLanguage } = useLanguage();
  const [theme, setTheme] = useState(getSavedTheme);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const teamMembers = [
    {
      name: 'Ahmed Harfoush',
      linkedin: 'https://www.linkedin.com/in/ahmed-harfoush-109a29241/',
      image: '/Ahmed Harfoush.jpeg'
    },
    {
      name: 'Mahmoud Ayman',
      linkedin: 'https://www.linkedin.com/in/mahmoud-ayman-041462361',
      image: '/Mahmoud Ayman.jpeg'
    },
    {
      name: 'Khaled Zakaria',
      linkedin: 'https://www.linkedin.com/in/khaled-zakaria-6627a5253',
      image: '/Khaled Zakaria.jpg'
    },
    {
      name: 'Mohamed Aamer',
      linkedin: 'https://www.linkedin.com/in/mohammed-aamer-790298383/',
      image: '/Mohamed Aamer.jpeg'
    },
    {
      name: 'Khaled Ali',
      linkedin: 'https://www.linkedin.com/in/khaled-ali-eleraky/',
      image: '/Khaled Ali.jpg'
    }
  ];

  const values = [
    {
      icon: 'Heart',
      title: 'People-First Innovation',
      description: 'We believe technology should serve humanity. Every feature we build is designed to genuinely improve people\'s lives and well-being.'
    },
    {
      icon: 'Shield',
      title: 'Privacy by Design',
      description: 'Your data belongs to you. We\'ve architected ATOS fit from the ground up to ensure complete privacy and user control.'
    },
    {
      icon: 'Zap',
      title: 'Cutting-Edge AI',
      description: 'We leverage the latest advances in artificial intelligence to provide real-time, accurate, and personalized fitness guidance.'
    },
    {
      icon: 'Users',
      title: 'Collaborative Spirit',
      description: 'As friends and study partners, we bring diverse perspectives together to create innovative solutions that work for everyone.'
    }
  ];

  return (
    <div className="min-h-screen bg-[#F7F8FA] dark:bg-[#08080A] text-[#0F1015] dark:text-[#FFFFFF] font-sans relative overflow-x-hidden selection:bg-[#FAA802]/30 selection:text-white">
      {/* Background accent glows */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-[rgba(250, 168, 2,0.12)] dark:bg-[rgba(250, 168, 2,0.15)] rounded-full blur-3xl" />
        <div className="absolute top-1/2 -right-40 w-[500px] h-[500px] bg-[rgba(250, 168, 2,0.08)] dark:bg-[rgba(250, 168, 2,0.1)] rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/2 w-[700px] h-[700px] bg-[rgba(250, 168, 2,0.06)] dark:bg-[rgba(250, 168, 2,0.08)] rounded-full blur-3xl" />
      </div>

      {/* Navigation */}
      <nav className="relative z-50 px-6 py-4 border-b border-black/[0.08] dark:border-white/[0.06] bg-white/80 dark:bg-[#050506]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => navigate('/')}>
            <img src="/assets/images/atosfit.png" alt="ATOS fit Logo" className="w-10 h-10 object-contain" />
            <span className="text-2xl font-bold text-[#0F1015] dark:text-[#FFFFFF] tracking-tight">ATOS fit</span>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <button onClick={() => navigate('/')} className="text-[#636779] dark:text-[#A8A8A8] hover:text-[#0F1015] dark:hover:text-[#EDEDEF] font-medium transition-colors text-sm">Home</button>
            <button onClick={() => navigate('/pricing')} className="text-[#636779] dark:text-[#A8A8A8] hover:text-[#0F1015] dark:hover:text-[#EDEDEF] font-medium transition-colors text-sm">Pricing</button>
            <button onClick={() => navigate('/privacy')} className="text-[#636779] dark:text-[#A8A8A8] hover:text-[#0F1015] dark:hover:text-[#EDEDEF] font-medium transition-colors text-sm">Privacy</button>
            <a href="#about" className="text-[#FAA802] font-semibold text-sm">About Us</a>
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            <button
              type="button"
              onClick={() => setTheme(applyTheme(theme === 'dark' ? 'light' : 'dark'))}
              className="w-9 h-9 rounded-xl flex items-center justify-center border border-black/[0.08] dark:border-white/[0.08] text-[#0F1015] dark:text-[#FFFFFF] hover:bg-black/[0.04] dark:hover:bg-white/[0.05] transition-colors"
              title={theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
            >
              <Icon name={theme === 'dark' ? 'Sun' : 'Moon'} size={17} />
            </button>
            <button
              type="button"
              onClick={toggleLanguage}
              className="atos-language-toggle"
              title={language === 'ar' ? 'English' : 'عربي'}
            >
              <Icon name="Languages" size={16} />
              <span>{language === 'ar' ? 'EN' : 'AR'}</span>
            </button>
            <button
              onClick={() => navigate('/login-screen')}
              className="inline-flex items-center justify-center linear-btn-primary px-5 py-2 rounded-full text-sm font-medium"
            >
              Sign In
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-2">
            <button
              type="button"
              onClick={() => setTheme(applyTheme(theme === 'dark' ? 'light' : 'dark'))}
              className="w-9 h-9 rounded-xl flex items-center justify-center border border-black/[0.08] dark:border-white/[0.08] text-[#0F1015] dark:text-[#FFFFFF]"
            >
              <Icon name={theme === 'dark' ? 'Sun' : 'Moon'} size={16} />
            </button>
            <button
              type="button"
              onClick={toggleLanguage}
              className="atos-language-toggle"
            >
              <Icon name="Languages" size={15} />
              <span>{language === 'ar' ? 'EN' : 'AR'}</span>
            </button>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-[#0F1015] dark:text-[#FFFFFF] p-2"
              aria-label="Toggle mobile menu"
            >
              <Icon name={isMobileMenuOpen ? "X" : "Menu"} size={24} />
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-white/95 dark:bg-[#141416]/95 backdrop-blur-2xl border-t border-black/[0.08] dark:border-white/[0.06] shadow-2xl">
            <div className="px-6 py-4 space-y-4">
              <button 
                onClick={() => {
                  navigate('/');
                  setIsMobileMenuOpen(false);
                }} 
                className="block text-[#636779] dark:text-[#A8A8A8] hover:text-[#0F1015] dark:hover:text-[#EDEDEF] font-medium transition-colors text-sm py-2 w-full text-left"
              >
                Home
              </button>
              <button 
                onClick={() => {
                  navigate('/pricing');
                  setIsMobileMenuOpen(false);
                }} 
                className="block text-[#636779] dark:text-[#A8A8A8] hover:text-[#0F1015] dark:hover:text-[#EDEDEF] font-medium transition-colors text-sm py-2 w-full text-left"
              >
                Pricing
              </button>
              <button 
                onClick={() => {
                  navigate('/privacy');
                  setIsMobileMenuOpen(false);
                }} 
                className="block text-[#636779] dark:text-[#A8A8A8] hover:text-[#0F1015] dark:hover:text-[#EDEDEF] font-medium transition-colors text-sm py-2 w-full text-left"
              >
                Privacy
              </button>
              <a 
                href="#about" 
                className="block text-sm text-[#FAA802] font-semibold py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                About Us
              </a>
              <button
                onClick={() => {
                  navigate('/login-screen');
                  setIsMobileMenuOpen(false);
                }}
                className="w-full linear-btn-primary py-2.5 rounded-full text-sm font-medium mt-4"
              >
                Sign In
              </button>
            </div>
          </div>
        )}
      </nav> 
     {/* Hero Section */}
      <section id="about" className="relative z-10 px-6 lg:px-8 py-24 lg:py-32">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold linear-gradient-text mb-4 tracking-tight">
            Meet the <span className="text-[#FAA802]">ATOS fit</span> Team
          </h1>
          <p className="text-xl text-sm text-[#8A8F98] leading-relaxed mb-12">
            We're a group of passionate Egyptian AI Experts and friends, 
            united by a shared mission to create technology that genuinely benefits people's lives.
          </p>
          
          <div className="linear-card rounded-3xl p-8 mb-16 hover:border-white/[0.15] hover:shadow-[0_0_25px_rgba(250, 168, 2,0.15)] transition-all duration-300">
            <h2 className="text-2xl md:text-3xl font-semibold text-[#0F1015] dark:text-[#FFFFFF] mb-3">Our Mission</h2>
            <p className="text-lg text-sm text-[#525866] dark:text-[#A8A8A8] leading-relaxed">
              To revolutionize fitness and wellness through AI-powered solutions that prioritize user privacy, 
              accessibility, and genuine health benefits. We believe that technology should empower individuals 
              to achieve their fitness goals safely and effectively, without compromising their personal data or privacy.
            </p>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="relative z-10 px-6 lg:px-8 pb-24 lg:pb-32">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20 lg:mb-24">
            <h2 className="text-3xl md:text-4xl font-semibold linear-gradient-text mb-4">
              The Minds Behind ATOS fit
            </h2>
            <p className="text-xl text-[#525866] dark:text-[#A8A8A8]">
              Five friends, one vision: making AI work for everyone
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-6 mb-20 lg:mb-24">
            {teamMembers.map((member, index) => (
              <div
                key={index}
                className="linear-card rounded-3xl p-8 text-center hover:border-white/[0.15] hover:shadow-[0_0_25px_rgba(250, 168, 2,0.15)] transition-all duration-300"
              >
                <div className="w-20 h-20 rounded-full overflow-hidden mx-auto mb-6 border-2 border-[rgba(250, 168, 2,0.3)]">
                  <AppImage
                    src={member.image}
                    alt={`${member.name} profile picture`}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                <h3 className="text-lg font-semibold text-[#0F1015] dark:text-[#FFFFFF] mb-4">{member.name}</h3>
                
                <a
                  href={member.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-2 text-[#FAA802] hover:text-[#0F1015] dark:hover:text-white transition-colors"
                >
                  <Icon name="Linkedin" size={20} />
                  <span>LinkedIn</span>
                </a>
              </div>
            ))}
          </div>

          {/* Education Section */}
          <div className="linear-card rounded-3xl p-10 text-center hover:border-white/[0.15] hover:shadow-[0_0_25px_rgba(250, 168, 2,0.15)] transition-all duration-300">
            <div className="flex items-center justify-center space-x-4 mb-6">
              <Icon name="GraduationCap" size={40} className="text-[#FAA802]" />
              <h3 className="text-2xl md:text-3xl font-semibold text-[#0F1015] dark:text-[#FFFFFF]">Egyptian AI Experts</h3>
            </div>
            <p className="text-lg text-sm text-[#525866] dark:text-[#A8A8A8] leading-relaxed max-w-3xl mx-auto">
              We're Egyptian Experts passionate about Artificial Intelligence and its applications in health and wellness. 
              Our academic journey has provided us with a strong foundation in machine learning, computer vision, 
              and AI ethics, which we apply directly to building ATOS fit. Our diverse backgrounds and collaborative spirit 
              drive us to create innovative solutions that work for everyone.
            </p>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="relative z-10 px-6 lg:px-8 pb-24 lg:pb-32">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20 lg:mb-24">
            <h2 className="text-3xl md:text-4xl font-semibold linear-gradient-text mb-4">
              Our Core Values
            </h2>
            <p className="text-xl text-[#525866] dark:text-[#A8A8A8]">
              The principles that guide everything we build
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10">
            {values.map((value, index) => (
              <div
                key={index}
                className="linear-card rounded-3xl p-8 hover:border-white/[0.15] hover:shadow-[0_0_25px_rgba(250, 168, 2,0.15)] transition-all duration-300"
              >
                <div className="w-16 h-16 bg-[rgba(250, 168, 2,0.06)] dark:bg-white/[0.04] border border-[rgba(250, 168, 2,0.12)] dark:border-white/[0.06] rounded-2xl flex items-center justify-center mb-6">
                  <Icon name={value.icon} size={32} className="text-[#FAA802]" />
                </div>
                <h3 className="text-xl font-semibold text-[#0F1015] dark:text-[#FFFFFF] mb-3">{value.title}</h3>
                <p className="text-sm text-[#525866] dark:text-[#A8A8A8] leading-relaxed">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Journey Section */}
      <section className="relative z-10 px-6 lg:px-8 pb-24 lg:pb-32">
        <div className="max-w-4xl mx-auto">
          <div className="linear-card rounded-3xl p-10 hover:border-white/[0.15] hover:shadow-[0_0_25px_rgba(250, 168, 2,0.15)] transition-all duration-300">
            <h2 className="text-3xl md:text-4xl font-semibold linear-gradient-text mb-8 text-center">
              Our Journey
            </h2>
            
            <div className="space-y-8">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-[#FAA802] rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <Icon name="Lightbulb" size={24} className="text-white" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-[#0F1015] dark:text-[#FFFFFF] mb-1">The Idea</h3>
                  <p className="text-sm text-[#525866] dark:text-[#A8A8A8] leading-relaxed">
                    It started with a simple observation: existing fitness apps compromise user privacy and often 
                    provide generic advice. As AI Experts, we knew we could do better by combining cutting-edge 
                    technology with privacy-first design.
                  </p>
                </div> 
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-[#FAA802] rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <Icon name="Code" size={24} className="text-white" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-[#0F1015] dark:text-[#FFFFFF] mb-1">The Development</h3>
                  <p className="text-sm text-[#525866] dark:text-[#A8A8A8] leading-relaxed">
                    Combining our diverse expertise in AI, blockchain, we built ATOS fit 
                    from the ground up. Every line of code reflects our commitment to user privacy and 
                    technological excellence.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-[#FAA802] rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <Icon name="Target" size={24} className="text-white" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-[#0F1015] dark:text-[#FFFFFF] mb-1">The Mission</h3>
                  <p className="text-sm text-[#525866] dark:text-[#A8A8A8] leading-relaxed">
                    Today, ATOS fit represents our vision of what AI-powered fitness should be: private, 
                    personalized, and genuinely helpful. We're not just building an app; we're pioneering 
                    a new standard for ethical AI in health and wellness.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="relative z-10 px-6 lg:px-8 pb-24 lg:pb-32">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-[rgba(250, 168, 2,0.08)] border border-[rgba(250, 168, 2,0.2)] rounded-[32px] p-10">
            <h2 className="text-4xl font-semibold text-[#0F1015] dark:text-white mb-6">
              Let's Connect
            </h2>
            <p className="text-lg text-[#525866] dark:text-[#A8A8A8] mb-8">
              We'd love to hear from you! Whether you have questions, feedback, or just want to chat about AI and fitness, 
              don't hesitate to reach out to any of our team members on LinkedIn.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <button
                onClick={() => navigate('/register-screen')}
                className="inline-flex items-center justify-center linear-btn-primary px-8 py-3 rounded-full text-sm font-semibold"
              >
                Join Our Beta
              </button>
              <button
                onClick={() => navigate('/privacy')}
                className="linear-btn-secondary px-8 py-3 rounded-full font-semibold text-sm transition-all duration-300"
              >
                Learn About Privacy
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 px-6 lg:px-8 py-16 lg:py-20 border-t border-black/[0.08] dark:border-[rgba(255,255,255,0.1)] mt-24 lg:mt-32 bg-[#ECEFF3] dark:bg-transparent text-[#636779] dark:text-[#A8A8A8]">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center space-x-3 cursor-pointer" onClick={() => navigate('/')}>
              <img src="/assets/images/atosfit.png" alt="ATOS fit Logo" className="w-8 h-8 object-contain" />
              <span className="text-xl font-bold text-[#0F1015] dark:text-white">ATOS fit</span>
            </div>

            <div className="flex items-center space-x-8">
              <button onClick={() => navigate('/')} className="text-[#636779] dark:text-[#A8A8A8] hover:text-[#0F1015] dark:hover:text-[#EDEDEF] transition-colors text-sm">Home</button>
              <button onClick={() => navigate('/pricing')} className="text-[#636779] dark:text-[#A8A8A8] hover:text-[#0F1015] dark:hover:text-[#EDEDEF] transition-colors text-sm">Pricing</button>
              <button onClick={() => navigate('/privacy')} className="text-[#636779] dark:text-[#A8A8A8] hover:text-[#0F1015] dark:hover:text-[#EDEDEF] transition-colors text-sm">Privacy</button>
              <a href="#about" className="text-[#FAA802] font-semibold">About Us</a>
            </div>

            <div className="flex items-center space-x-4">
              <a 
                href="https://www.linkedin.com/company/atos-fit" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-[rgba(255,255,255,0.4)] hover:text-[#FAA802] transition-colors"
                aria-label="LinkedIn"
              >
                <Icon name="Linkedin" size={24} />
              </a>
              <a 
                href="https://twitter.com/AtosFit" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-[rgba(255,255,255,0.4)] hover:text-[#FAA802] transition-colors"
                aria-label="Twitter/X"
              >
                <Icon name="Twitter" size={24} />
              </a>
              <a 
                href="https://www.producthunt.com/posts/atos-fit?utm_source=other&utm_medium=social" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-[rgba(255,255,255,0.4)] hover:text-[#FAA802] transition-colors"
                aria-label="Product Hunt"
              >
                <Icon name="ExternalLink" size={24} />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AboutPage;