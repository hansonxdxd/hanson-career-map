import React from 'react';
import { useSiteContent } from '../hooks/useSiteContent';
import HeroSection from '../components/HeroSection';
import CoreThesis from '../components/CoreThesis';
import CareerEvolution from '../components/CareerEvolution';
import ProjectsSection from '../components/ProjectsSection';
import CapabilitiesSection from '../components/CapabilitiesSection';
import NowNextSection from '../components/NowNextSection';
import ContactSection from '../components/ContactSection';

const LoadingScreen = () => (
  <div className="min-h-screen bg-slate-950 flex items-center justify-center" data-testid="site-loading">
    <div className="flex flex-col items-center gap-4">
      <div className="w-12 h-12 border-2 border-cyan-500/30 border-t-cyan-400 rounded-full animate-spin" />
      <p className="text-cyan-400 text-sm tracking-widest">LOADING</p>
    </div>
  </div>
);

const LandingPage = () => {
  const { content, loading } = useSiteContent();

  if (loading || !content) return <LoadingScreen />;

  return (
    <div className="App bg-slate-950" data-testid="landing-page">
      <HeroSection data={content.hero} />
      <CoreThesis data={content.coreThesis} />
      <CareerEvolution data={content.careerEvolution} />
      <ProjectsSection data={content.projects} />
      <CapabilitiesSection data={content.capabilities} />
      <NowNextSection data={content.nowNext} />
      <ContactSection data={content.contact} />
    </div>
  );
};

export default LandingPage;
