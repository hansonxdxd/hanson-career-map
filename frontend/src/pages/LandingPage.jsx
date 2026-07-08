import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getContent, getProfileBySlug } from '../lib/api';
import { siteContent as fallbackContent } from '../data/mockData';
import { TopNav, SectionDots } from '../components/SiteNav';
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

const NotFound = () => (
  <div className="min-h-screen bg-slate-950 flex items-center justify-center px-6" data-testid="profile-not-found">
    <div className="text-center">
      <h1 className="text-4xl font-bold text-white mb-4">404</h1>
      <p className="text-slate-400">找不到此設定檔頁面</p>
    </div>
  </div>
);

const isVisible = (section) => section && section.visible !== false;

const LandingPage = () => {
  const { slug } = useParams();
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setNotFound(false);
    const loader = slug ? getProfileBySlug(slug).then((d) => d.content) : getContent();
    loader
      .then((data) => { if (mounted) setContent(data); })
      .catch((err) => {
        if (!mounted) return;
        if (slug && err.response?.status === 404) setNotFound(true);
        else setContent(fallbackContent);
      })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, [slug]);

  if (loading) return <LoadingScreen />;
  if (notFound) return <NotFound />;
  if (!content) return <LoadingScreen />;

  return (
    <div className="App bg-slate-950" data-testid="landing-page">
      <TopNav name={content.hero?.name} />
      <SectionDots />
      {isVisible(content.hero) && <HeroSection data={content.hero} />}
      {isVisible(content.coreThesis) && <CoreThesis data={content.coreThesis} />}
      {isVisible(content.careerEvolution) && <CareerEvolution data={content.careerEvolution} content={content} slug={slug} />}
      {isVisible(content.projects) && <ProjectsSection data={content.projects} content={content} slug={slug} />}
      {isVisible(content.capabilities) && <CapabilitiesSection data={content.capabilities} />}
      {isVisible(content.nowNext) && <NowNextSection data={content.nowNext} />}
      {isVisible(content.contact) && <ContactSection data={content.contact} />}
    </div>
  );
};

export default LandingPage;
