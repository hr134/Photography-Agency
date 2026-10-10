import type { Metadata } from 'next';
import DeveloperScrollAnimation from './components/DeveloperScrollAnimation';
import HarunNav from './components/HarunNav';
import HeroSection from './components/HeroSection';
import AboutSection from './components/AboutSection';
import SkillsSection from './components/SkillsSection';
import ProjectsSection from './components/ProjectsSection';
import CVSection from './components/CVSection';
import ContactSection from './components/ContactSection';
import HarunFooter from './components/HarunFooter';

export const metadata: Metadata = {
  title: "Harun Rashid | Engineer Portfolio",
  description: "Personal engineering portfolio for Harun Rashid. Systems engineering, modern software platforms, architecture, and high-performance applications.",
};

export default function HarunPortfolioPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white selection:bg-purple-500 selection:text-white w-full max-w-full overflow-x-clip">
      {/* 1. FULLSCREEN DEVICE-FIT SMOOTH SCROLL ANIMATION (300 FRAMES) */}
      <DeveloperScrollAnimation />

      {/* NAVIGATION (REVEALS SMOOTHLY ONCE SCROLL ANIMATION COMPLETES) */}
      <HarunNav />

      {/* 2. CURRENT PORTFOLIO CONTENTS (SMOOTHLY APPEAR WITH SCROLLING) */}
      <main id="content-start" className="relative z-10">
        {/* 1. HERO SECTION */}
        <HeroSection />

        {/* 2. ABOUT SECTION */}
        <AboutSection />

        {/* 3. SKILLS / SERVICES SECTION */}
        <SkillsSection />

        {/* 4. PROJECTS SECTION (3D Stacked Wix Studio Scrolling Animation) */}
        <ProjectsSection />

        {/* 5. CV & CREDENTIALS SECTION */}
        <CVSection />

        {/* 6. CONTACT SECTION (Editable by Admin) */}
        <ContactSection />

        {/* 7. FOOTER */}
        <HarunFooter />
      </main>
    </div>
  );
}
