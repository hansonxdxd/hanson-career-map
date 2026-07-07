import React from 'react';
import './App.css';
import { siteContent } from './data/mockData';
import HeroSection from './components/HeroSection';
import CoreThesis from './components/CoreThesis';
import CareerEvolution from './components/CareerEvolution';
import ProjectsSection from './components/ProjectsSection';
import CapabilitiesSection from './components/CapabilitiesSection';
import NowNextSection from './components/NowNextSection';
import ContactSection from './components/ContactSection';

function App() {
  return (
    <div className="App bg-slate-950">
      <HeroSection data={siteContent.hero} />
      <CoreThesis data={siteContent.coreThesis} />
      <CareerEvolution data={siteContent.careerEvolution} />
      <ProjectsSection data={siteContent.projects} />
      <CapabilitiesSection data={siteContent.capabilities} />
      <NowNextSection data={siteContent.nowNext} />
      <ContactSection data={siteContent.contact} />
    </div>
  );
}

export default App;
