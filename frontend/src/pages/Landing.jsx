import React, { useEffect, useRef, useState } from 'react';
import styled, { createGlobalStyle, keyframes } from 'styled-components';
import { Link } from 'react-router-dom';
import NearByLogo from '../assets/NearByLogo.png';

const GlobalStyle = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap');

  :root {
    --nb-aqua-light: #8DF2E8;
    --nb-yellow: #F2E205;
    --nb-yellow-soft: #F2E74B;
    --nb-off-white: #F2F2F2;
    --nb-black: #0D0D0D;
    --nb-gray: #CCCCCC;
    --nb-link: #3CCFC4;
    --nb-link-hover: #1F8F87;
    --nb-link-active: #0F4F4A;
  }

  html {
    scroll-behavior: smooth;
  }

  body {
    margin: 0;
    font-family: 'Poppins', sans-serif;
    background: var(--nb-off-white);
    color: var(--nb-black);
  }

  * {
    box-sizing: border-box;
  }
`;

const fadeUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.03); }
  100% { transform: scale(1); }
`;

const floatY = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-9px); }
  100% { transform: translateY(0px); }
`;

const shimmer = keyframes`
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`;

const Page = styled.div`
  min-height: 100vh;
  position: relative;
  overflow-x: hidden;
  background:
    radial-gradient(circle at 12% 8%, rgba(242, 226, 5, 0.24), transparent 32%),
    radial-gradient(circle at 82% 18%, rgba(60, 207, 196, 0.2), transparent 34%),
    linear-gradient(180deg, #ffffff 0%, #f7fffd 58%, #f2f2f2 100%);
`;

const ScrollProgress = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  height: 4px;
  width: ${(props) => props.value}%;
  z-index: 60;
  background: linear-gradient(90deg, var(--nb-link) 0%, var(--nb-yellow-soft) 100%);
  box-shadow: 0 0 14px rgba(60, 207, 196, 0.6);
  transition: width 0.12s linear;
`;

const FloatingOrb = styled.div`
  position: absolute;
  width: ${(props) => props.size || '220px'};
  height: ${(props) => props.size || '220px'};
  border-radius: 50%;
  filter: blur(2px);
  opacity: 0.44;
  pointer-events: none;
  background: ${(props) => props.color || 'rgba(141, 242, 232, 0.5)'};
  top: ${(props) => props.top || '10%'};
  left: ${(props) => props.left || 'auto'};
  right: ${(props) => props.right || 'auto'};
  animation: ${floatY} ${(props) => props.duration || '6.5s'} ease-in-out infinite;
`;

const Container = styled.div`
  width: min(1120px, 92vw);
  margin: 0 auto;
`;

const Nav = styled.nav`
  position: sticky;
  top: 0;
  z-index: 20;
  backdrop-filter: blur(8px);
  background: rgba(255, 255, 255, 0.8);
  border-bottom: 1px solid rgba(13, 13, 13, 0.08);
`;

const NavWrap = styled(Container)`
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 74px;
  gap: 12px;
`;

const Brand = styled.a`
  display: flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
  color: var(--nb-black);
  font-weight: 700;
  letter-spacing: 0.2px;
`;

const Logo = styled.img`
  width: 36px;
  height: 36px;
  object-fit: contain;
`;

const NavLinks = styled.div`
  display: flex;
  align-items: center;
  gap: 18px;

  @media (max-width: 840px) {
    display: none;
  }
`;

const Anchor = styled.a`
  text-decoration: none;
  color: ${(props) => (props.$active ? 'var(--nb-link-hover)' : 'var(--nb-black)')};
  font-weight: 500;
  font-size: 0.95rem;
  position: relative;
  transition: color 0.2s ease;

  &::after {
    content: '';
    position: absolute;
    left: 0;
    bottom: -5px;
    width: 100%;
    height: 2px;
    border-radius: 999px;
    background: var(--nb-link-hover);
    transform: scaleX(${(props) => (props.$active ? 1 : 0)});
    transform-origin: left;
    transition: transform 0.2s ease;
  }

  &:hover {
    color: var(--nb-link-hover);
  }

  &:hover::after {
    transform: scaleX(1);
  }
`;

const NavActions = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const GhostLink = styled(Link)`
  text-decoration: none;
  color: var(--nb-link);
  font-weight: 600;
  font-size: 0.92rem;

  &:hover {
    color: var(--nb-link-hover);
  }

  &:active {
    color: var(--nb-link-active);
  }
`;

const PrimaryButton = styled.button`
  text-decoration: none;
  border: 0;
  border-radius: 999px;
  padding: 11px 18px;
  font-weight: 700;
  font-size: 0.9rem;
  color: var(--nb-black);
  background: linear-gradient(125deg, var(--nb-yellow) 0%, var(--nb-yellow-soft) 100%);
  box-shadow: 0 8px 24px rgba(242, 226, 5, 0.28);
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 28px rgba(242, 226, 5, 0.34);
  }

  cursor: pointer;
`;

const Hero = styled.section`
  padding: 84px 0 68px;
`;

const HeroGrid = styled(Container)`
  display: grid;
  grid-template-columns: 1.2fr 1fr;
  gap: 26px;
  align-items: stretch;

  @media (max-width: 930px) {
    grid-template-columns: 1fr;
  }
`;

const HeroText = styled.div`
  animation: ${fadeUp} 0.65s ease;
`;

const Eyebrow = styled.p`
  margin: 0 0 12px;
  display: inline-block;
  padding: 7px 12px;
  border-radius: 999px;
  font-size: 0.79rem;
  font-weight: 700;
  letter-spacing: 0.28px;
  color: var(--nb-black);
  background: rgba(141, 242, 232, 0.42);
`;

const HeroTitle = styled.h1`
  margin: 0;
  font-size: clamp(2rem, 5.3vw, 3.8rem);
  line-height: 1.05;
  letter-spacing: -0.5px;
  max-width: 620px;
`;

const HeroAccent = styled.span`
  color: var(--nb-link-hover);
`;

const HeroSub = styled.p`
  margin: 18px 0 28px;
  max-width: 560px;
  color: #343434;
  line-height: 1.65;
`;

const HeroActions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
`;

const MainCTA = styled.button`
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 0;
  border-radius: 999px;
  padding: 13px 24px;
  font-weight: 700;
  color: #ffffff;
  background: linear-gradient(125deg, var(--nb-link) 0%, var(--nb-link-hover) 100%);
  box-shadow: 0 10px 28px rgba(31, 143, 135, 0.28);
  transition: transform 0.2s ease;

  &:hover {
    transform: translateY(-2px);
  }

  cursor: pointer;
`;

const SecondaryCTA = styled.a`
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  padding: 13px 24px;
  font-weight: 700;
  color: var(--nb-black);
  border: 1px solid rgba(13, 13, 13, 0.18);
  background: #ffffff;
`;

const HeroCard = styled.div`
  background: linear-gradient(165deg, rgba(141, 242, 232, 0.48) 0%, #ffffff 60%);
  border: 1px solid rgba(13, 13, 13, 0.08);
  border-radius: 24px;
  padding: 24px;
  animation: ${fadeUp} 0.82s ease;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: radial-gradient(circle at var(--mx, 50%) var(--my, 50%), rgba(242, 226, 5, 0.26), transparent 44%);
    transition: background 0.12s ease;
    pointer-events: none;
  }
`;

const Stat = styled.div`
  border-radius: 16px;
  background: #ffffff;
  border: 1px solid rgba(13, 13, 13, 0.07);
  padding: 16px;
  margin-bottom: 12px;
  position: relative;
  overflow: hidden;

  &::after {
    content: '';
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    height: 3px;
    background: linear-gradient(90deg, transparent 0%, rgba(60, 207, 196, 0.7) 50%, transparent 100%);
    background-size: 200% 100%;
    animation: ${shimmer} 3.2s linear infinite;
  }

  strong {
    display: block;
    font-size: 1.25rem;
    margin-bottom: 4px;
  }

  span {
    color: #555555;
    font-size: 0.92rem;
  }
`;

const Badge = styled.div`
  display: inline-block;
  margin-top: 6px;
  padding: 8px 12px;
  border-radius: 999px;
  font-size: 0.82rem;
  font-weight: 700;
  color: #ffffff;
  background: var(--nb-link-hover);
  animation: ${pulse} 2.2s ease-in-out infinite;
`;

const Section = styled.section`
  padding: 68px 0;
  opacity: 0;
  transform: translateY(20px);
  transition: opacity 0.6s ease, transform 0.6s ease;

  .stagger-item {
    opacity: 0;
    transform: translateY(16px);
  }

  &.in-view {
    opacity: 1;
    transform: translateY(0);
  }

  &.in-view .stagger-item {
    animation: ${fadeUp} 0.55s ease forwards;
    animation-delay: var(--stagger, 0ms);
  }
`;

const SectionHead = styled.div`
  margin-bottom: 26px;

  h2 {
    margin: 0;
    font-size: clamp(1.55rem, 3.6vw, 2.45rem);
  }

  p {
    margin: 10px 0 0;
    color: #444444;
    max-width: 700px;
  }
`;

const FeatureGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;

  @media (max-width: 960px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const FeatureCard = styled.article`
  border-radius: 18px;
  background: #ffffff;
  border: 1px solid rgba(13, 13, 13, 0.08);
  padding: 18px;
  transition: transform 0.2s ease, border-color 0.2s ease;

  &:hover {
    transform: translateY(-3px);
    border-color: rgba(31, 143, 135, 0.45);
  }

  h3 {
    margin: 0 0 8px;
    font-size: 1rem;
  }

  p {
    margin: 0;
    color: #4f4f4f;
    line-height: 1.55;
    font-size: 0.93rem;
  }
`;

const IconDot = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 10px;
  background: linear-gradient(145deg, var(--nb-yellow) 0%, var(--nb-aqua-light) 100%);
  margin-bottom: 10px;
`;

const Steps = styled.div`
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;

  @media (max-width: 980px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
`;

const Step = styled.div`
  border-radius: 18px;
  padding: 18px;
  background: #ffffff;
  border: 1px solid rgba(13, 13, 13, 0.08);

  strong {
    font-size: 1.25rem;
    color: var(--nb-link-hover);
  }

  h4 {
    margin: 8px 0 6px;
  }

  p {
    margin: 0;
    color: #4f4f4f;
    font-size: 0.94rem;
    line-height: 1.55;
  }
`;

const ShotGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

const Shot = styled.div`
  border-radius: 18px;
  min-height: 180px;
  border: 1px dashed rgba(13, 13, 13, 0.26);
  background:
    linear-gradient(180deg, rgba(141, 242, 232, 0.35) 0%, rgba(242, 242, 242, 0.8) 100%),
    repeating-linear-gradient(
      45deg,
      rgba(255, 255, 255, 0.8),
      rgba(255, 255, 255, 0.8) 8px,
      rgba(242, 242, 242, 0.8) 8px,
      rgba(242, 242, 242, 0.8) 16px
    );
  display: grid;
  place-content: center;
  text-align: center;
  padding: 14px;

  strong {
    font-size: 1rem;
  }

  span {
    font-size: 0.88rem;
    color: #5f5f5f;
  }
`;

const ImpactGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;

  @media (max-width: 760px) {
    grid-template-columns: 1fr;
  }
`;

const ImpactItem = styled.div`
  border-radius: 16px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(13, 13, 13, 0.08);
  font-weight: 500;
`;

const FAQWrap = styled.div`
  display: grid;
  gap: 10px;
`;

const FAQItem = styled.details`
  border-radius: 14px;
  background: #ffffff;
  border: 1px solid rgba(13, 13, 13, 0.1);
  padding: 12px 14px;

  summary {
    cursor: pointer;
    font-weight: 600;
  }

  p {
    margin: 10px 0 0;
    color: #4f4f4f;
    line-height: 1.6;
  }
`;

const ContactCard = styled.div`
  border-radius: 20px;
  padding: 24px;
  background: linear-gradient(130deg, var(--nb-black) 0%, #1b1b1b 100%);
  color: #ffffff;

  p {
    margin: 7px 0 0;
    color: #d6d6d6;
  }
`;

const ContactActions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 16px;
`;

const ContactLink = styled.a`
  text-decoration: none;
  border-radius: 999px;
  padding: 11px 16px;
  font-weight: 700;
  font-size: 0.9rem;

  &.primary {
    color: var(--nb-black);
    background: var(--nb-yellow-soft);
  }

  &.ghost {
    color: #ffffff;
    border: 1px solid rgba(255, 255, 255, 0.28);
  }
`;

const Footer = styled.footer`
  border-top: 1px solid rgba(13, 13, 13, 0.1);
  margin-top: 44px;
  padding: 24px 0 34px;
`;

const FooterWrap = styled(Container)`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
  justify-content: space-between;

  p {
    margin: 0;
    color: #545454;
    font-size: 0.9rem;
  }
`;

const FooterLinks = styled.div`
  display: flex;
  gap: 12px;
  flex-wrap: wrap;

  a {
    text-decoration: none;
    color: var(--nb-link);
    font-size: 0.9rem;
    font-weight: 600;
  }

  a:hover {
    color: var(--nb-link-hover);
  }
`;

const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 40;
  display: grid;
  place-items: center;
  padding: 22px;
  background: rgba(13, 13, 13, 0.62);
  backdrop-filter: blur(4px);
`;

const ModalPanel = styled.div`
  width: min(980px, 95vw);
  max-height: min(92vh, 860px);
  overflow: auto;
  border-radius: 22px;
  padding: 22px;
  background: linear-gradient(165deg, #ffffff 0%, #f6fffe 100%);
  border: 1px solid rgba(13, 13, 13, 0.12);
  box-shadow: 0 30px 90px rgba(0, 0, 0, 0.24);
`;

const ModalHeader = styled.div`
  display: flex;
  align-items: start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 16px;

  h3 {
    margin: 0;
    font-size: clamp(1.4rem, 3.2vw, 2rem);
  }

  p {
    margin: 8px 0 0;
    color: #505050;
  }
`;

const CloseModal = styled.button`
  border: 0;
  border-radius: 12px;
  width: 38px;
  height: 38px;
  font-size: 1.2rem;
  font-weight: 700;
  line-height: 1;
  background: #ececec;
  color: #3e3e3e;
  cursor: pointer;
`;

const RoleGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;

  @media (max-width: 860px) {
    grid-template-columns: 1fr;
  }
`;

const RoleCard = styled.article`
  border-radius: 16px;
  padding: 16px;
  border: 1px solid rgba(13, 13, 13, 0.11);
  background: #ffffff;
  position: relative;
  overflow: hidden;
  transform-style: preserve-3d;
  transition: transform 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: radial-gradient(circle at var(--mx, 50%) var(--my, 50%), rgba(242, 226, 5, 0.28), transparent 46%);
    pointer-events: none;
  }

  &:hover {
    border-color: rgba(31, 143, 135, 0.35);
    box-shadow: 0 16px 32px rgba(31, 143, 135, 0.16);
  }

  > * {
    position: relative;
    z-index: 1;
  }

  h4 {
    margin: 0 0 8px;
    font-size: 1.05rem;
  }

  p {
    margin: 0 0 14px;
    color: #555555;
    font-size: 0.92rem;
    line-height: 1.5;
  }
`;

const RoleActions = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
`;

const RoleLink = styled(Link)`
  text-decoration: none;
  border-radius: 999px;
  padding: 10px 14px;
  font-weight: 700;
  font-size: 0.86rem;

  &.login {
    color: #ffffff;
    background: var(--nb-link-hover);
  }

  &.join {
    color: var(--nb-black);
    background: var(--nb-yellow-soft);
  }
`;

const DisabledRoleButton = styled.button`
  border: 1px solid rgba(13, 13, 13, 0.12);
  border-radius: 999px;
  padding: 10px 14px;
  font-weight: 700;
  font-size: 0.86rem;
  color: #8a8a8a;
  background: #f3f3f3;
`;

const AdminCard = styled.div`
  margin-top: 12px;
  border-radius: 16px;
  padding: 16px;
  border: 1px solid rgba(13, 13, 13, 0.11);
  background: linear-gradient(120deg, rgba(13, 13, 13, 0.95) 0%, rgba(36, 36, 36, 0.95) 100%);
  color: #ffffff;

  h4 {
    margin: 0 0 8px;
  }

  p {
    margin: 0 0 12px;
    color: #dddddd;
    font-size: 0.92rem;
  }
`;

const AdminLoginLink = styled.a`
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  padding: 10px 16px;
  font-weight: 700;
  font-size: 0.88rem;
  color: var(--nb-black);
  background: var(--nb-yellow-soft);
`;

function Landing() {
  const [isAccessOpen, setIsAccessOpen] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [heroStats, setHeroStats] = useState({ residents: 0, sellers: 0, alerts: 0 });
  const [heroGlow, setHeroGlow] = useState({ x: '50%', y: '50%' });
  const [activeSection, setActiveSection] = useState('home');
  const sectionRefs = useRef([]);

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setIsAccessOpen(false);
      }
    };

    if (isAccessOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleEscape);
    };
  }, [isAccessOpen]);

  useEffect(() => {
    const handleScroll = () => {
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      const progress = maxScroll > 0 ? (window.scrollY / maxScroll) * 100 : 0;
      setScrollProgress(Math.max(0, Math.min(100, progress)));
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const targets = { residents: 1200, sellers: 180, alerts: 24 };
    const duration = 1400;
    const intervalMs = 25;
    const steps = duration / intervalMs;
    let currentStep = 0;

    const timer = window.setInterval(() => {
      currentStep += 1;
      const ratio = Math.min(1, currentStep / steps);
      setHeroStats({
        residents: Math.floor(targets.residents * ratio),
        sellers: Math.floor(targets.sellers * ratio),
        alerts: Math.floor(targets.alerts * ratio),
      });

      if (ratio >= 1) {
        window.clearInterval(timer);
      }
    }, intervalMs);

    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
          }
        });
      },
      { threshold: 0.15 }
    );

    sectionRefs.current.forEach((section) => {
      if (section) observer.observe(section);
    });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const navSections = ['home', 'features', 'how-it-works', 'faq', 'contact'];
    const observed = navSections
      .map((id) => document.getElementById(id))
      .filter(Boolean);

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntries = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

        if (visibleEntries.length > 0) {
          setActiveSection(visibleEntries[0].target.id);
        }
      },
      {
        threshold: [0.2, 0.45, 0.7],
        rootMargin: '-15% 0px -55% 0px',
      }
    );

    observed.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, []);

  const handleHeroMove = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    setHeroGlow({ x: `${x}%`, y: `${y}%` });
  };

  const handleRoleCardMove = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const px = (event.clientX - rect.left) / rect.width;
    const py = (event.clientY - rect.top) / rect.height;
    const mx = px * 100;
    const my = py * 100;
    const rotateY = (px - 0.5) * 10;
    const rotateX = (0.5 - py) * 10;

    event.currentTarget.style.setProperty('--mx', `${mx}%`);
    event.currentTarget.style.setProperty('--my', `${my}%`);
    event.currentTarget.style.transform = `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
  };

  const handleRoleCardLeave = (event) => {
    event.currentTarget.style.transform = 'perspective(900px) rotateX(0deg) rotateY(0deg)';
    event.currentTarget.style.setProperty('--mx', '50%');
    event.currentTarget.style.setProperty('--my', '50%');
  };

  return (
    <Page>
      <GlobalStyle />
      <ScrollProgress value={scrollProgress} />
      <FloatingOrb top="10%" right="-80px" size="210px" color="rgba(141, 242, 232, 0.45)" duration="6.4s" />
      <FloatingOrb top="58%" left="-90px" size="250px" color="rgba(242, 226, 5, 0.34)" duration="7.2s" />

      <Nav>
        <NavWrap>
          <Brand href="#home">
            <Logo src={NearByLogo} alt="NearBy logo" />
            NearBy
          </Brand>

          <NavLinks>
            <Anchor href="#features" $active={activeSection === 'features'} aria-current={activeSection === 'features' ? 'page' : undefined}>Features</Anchor>
            <Anchor href="#how-it-works" $active={activeSection === 'how-it-works'} aria-current={activeSection === 'how-it-works' ? 'page' : undefined}>How it Works</Anchor>
            <Anchor href="#faq" $active={activeSection === 'faq'} aria-current={activeSection === 'faq' ? 'page' : undefined}>FAQ</Anchor>
            <Anchor href="#contact" $active={activeSection === 'contact'} aria-current={activeSection === 'contact' ? 'page' : undefined}>Contact</Anchor>
          </NavLinks>

          <NavActions>
            <PrimaryButton type="button" onClick={() => setIsAccessOpen(true)}>Login / Join</PrimaryButton>
            <PrimaryButton type="button" onClick={() => setIsAccessOpen(true)}>Get Started</PrimaryButton>
          </NavActions>
        </NavWrap>
      </Nav>

      <Hero id="home">
        <HeroGrid>
          <HeroText>
            <Eyebrow>NearBy Community Platform</Eyebrow>
            <HeroTitle>
              A smarter way to connect with your <HeroAccent>neighborhood</HeroAccent>.
            </HeroTitle>
            <HeroSub>
              NearBy brings communication, local services, and community marketplace into one secure platform.
              Stay informed, share resources, and build a stronger neighborhood together.
            </HeroSub>
            <HeroActions>
              <MainCTA type="button" onClick={() => setIsAccessOpen(true)}>Get Started</MainCTA>
              <SecondaryCTA href="#contact">Join Waitlist</SecondaryCTA>
            </HeroActions>
          </HeroText>

          <HeroCard
            onMouseMove={handleHeroMove}
            style={{ '--mx': heroGlow.x, '--my': heroGlow.y }}
          >
            <Stat>
              <strong>{heroStats.residents.toLocaleString()}+ Residents</strong>
              <span>Connected through one organized notice, event, and update stream.</span>
            </Stat>
            <Stat>
              <strong>{heroStats.sellers}+ Local Sellers</strong>
              <span>Growing neighborhood marketplace participation.</span>
            </Stat>
            <Stat>
              <strong>{heroStats.alerts} sec Avg. Alert Reach</strong>
              <span>Fast, high-visibility emergency notifications for urgent moments.</span>
            </Stat>
            <Badge>Verified Community Access</Badge>
          </HeroCard>
        </HeroGrid>
      </Hero>

      <Section id="features" ref={(element) => { sectionRefs.current[0] = element; }}>
        <Container>
          <SectionHead>
            <h2>Everything your neighborhood needs, in one place</h2>
            <p>Built for residents first, and designed to support local sellers, riders, and community managers.</p>
          </SectionHead>

          <FeatureGrid>
            <FeatureCard className="stagger-item" style={{ '--stagger': '50ms' }}>
              <IconDot />
              <h3>Smart Notice Board</h3>
              <p>Never miss announcements, events, or maintenance updates with structured community posts.</p>
            </FeatureCard>

            <FeatureCard className="stagger-item" style={{ '--stagger': '100ms' }}>
              <IconDot />
              <h3>Emergency Alerts</h3>
              <p>Receive instant notifications for critical events such as safety threats and urgent incidents.</p>
            </FeatureCard>

            <FeatureCard className="stagger-item" style={{ '--stagger': '150ms' }}>
              <IconDot />
              <h3>Local Marketplace</h3>
              <p>Buy, sell, and offer services inside your trusted neighborhood network.</p>
            </FeatureCard>

            <FeatureCard className="stagger-item" style={{ '--stagger': '200ms' }}>
              <IconDot />
              <h3>Verified Community</h3>
              <p>Role-based onboarding and verification help keep interactions secure and reliable.</p>
            </FeatureCard>

            <FeatureCard className="stagger-item" style={{ '--stagger': '250ms' }}>
              <IconDot />
              <h3>Community Interaction</h3>
              <p>Collaborate with neighbors through updates, response loops, and shared participation.</p>
            </FeatureCard>

            <FeatureCard className="stagger-item" style={{ '--stagger': '300ms' }}>
              <IconDot />
              <h3>Unified Experience</h3>
              <p>Communication, alerts, and neighborhood services connected in a single platform flow.</p>
            </FeatureCard>
          </FeatureGrid>
        </Container>
      </Section>

      <Section id="how-it-works" ref={(element) => { sectionRefs.current[1] = element; }}>
        <Container>
          <SectionHead>
            <h2>Simple. Secure. Connected.</h2>
          </SectionHead>
          <Steps>
            <Step className="stagger-item" style={{ '--stagger': '50ms' }}>
              <strong>1</strong>
              <h4>Sign Up</h4>
              <p>Create an account as a resident, seller, or rider.</p>
            </Step>
            <Step className="stagger-item" style={{ '--stagger': '100ms' }}>
              <strong>2</strong>
              <h4>Get Verified</h4>
              <p>Join your neighborhood with trusted access rules.</p>
            </Step>
            <Step className="stagger-item" style={{ '--stagger': '150ms' }}>
              <strong>3</strong>
              <h4>Start Using Features</h4>
              <p>Access notices, marketplace tools, and local services.</p>
            </Step>
            <Step className="stagger-item" style={{ '--stagger': '200ms' }}>
              <strong>4</strong>
              <h4>Stay Connected</h4>
              <p>Receive real-time updates and engage with your community.</p>
            </Step>
          </Steps>
        </Container>
      </Section>

      <Section id="screenshots" ref={(element) => { sectionRefs.current[2] = element; }}>
        <Container>
          <SectionHead>
            <h2>Product Screens</h2>
            <p>Replace these placeholders with your Figma exports or in-app screenshots as they evolve.</p>
          </SectionHead>
          <ShotGrid>
            <Shot className="stagger-item" style={{ '--stagger': '60ms' }}>
              <strong>User Community Home</strong>
              <span>Placeholder screenshot</span>
            </Shot>
            <Shot className="stagger-item" style={{ '--stagger': '120ms' }}>
              <strong>Seller Dashboard</strong>
              <span>Placeholder screenshot</span>
            </Shot>
            <Shot className="stagger-item" style={{ '--stagger': '180ms' }}>
              <strong>Emergency Alerts Feed</strong>
              <span>Placeholder screenshot</span>
            </Shot>
          </ShotGrid>
        </Container>
      </Section>

      <Section id="impact" ref={(element) => { sectionRefs.current[3] = element; }}>
        <Container>
          <SectionHead>
            <h2>Building stronger neighborhoods</h2>
          </SectionHead>
          <ImpactGrid>
            <ImpactItem className="stagger-item" style={{ '--stagger': '60ms' }}>Improves communication and transparency across the community.</ImpactItem>
            <ImpactItem className="stagger-item" style={{ '--stagger': '120ms' }}>Enhances safety through real-time emergency visibility.</ImpactItem>
            <ImpactItem className="stagger-item" style={{ '--stagger': '180ms' }}>Supports local businesses through neighborhood commerce.</ImpactItem>
            <ImpactItem className="stagger-item" style={{ '--stagger': '240ms' }}>Encourages participation and reduces information gaps.</ImpactItem>
          </ImpactGrid>
        </Container>
      </Section>

      <Section id="faq" ref={(element) => { sectionRefs.current[4] = element; }}>
        <Container>
          <SectionHead>
            <h2>FAQ</h2>
          </SectionHead>
          <FAQWrap>
            <FAQItem className="stagger-item" style={{ '--stagger': '70ms' }}>
              <summary>Is NearBy free?</summary>
              <p>Yes. NearBy is designed to stay accessible, with minimal ad interruption.</p>
            </FAQItem>
            <FAQItem className="stagger-item" style={{ '--stagger': '140ms' }}>
              <summary>Who can join?</summary>
              <p>Verified members of a community, including residents and local service roles.</p>
            </FAQItem>
            <FAQItem className="stagger-item" style={{ '--stagger': '210ms' }}>
              <summary>What can I do on NearBy?</summary>
              <p>View notices, discover events, access local marketplace activity, and stay connected with neighbors.</p>
            </FAQItem>
          </FAQWrap>
        </Container>
      </Section>

      <Section id="contact" ref={(element) => { sectionRefs.current[5] = element; }}>
        <Container>
          <ContactCard>
            <h2>Bring your neighborhood online with NearBy</h2>
            <p>Start with residents, onboard local sellers, and build one trusted digital community space.</p>
            <ContactActions>
              <ContactLink className="primary" href="mailto:nearby.project@gmail.com">nearby.project@gmail.com</ContactLink>
              <ContactLink className="ghost" href="#home">Back to top</ContactLink>
            </ContactActions>
          </ContactCard>
        </Container>
      </Section>

      <Footer>
        <FooterWrap>
          <p>NearBy - A Smarter Neighborhood Communication Platform</p>
          <FooterLinks>
            <a href="#home">About</a>
            <a href="#features">Features</a>
            <a href="#contact">Contact</a>
            <a href="#faq">Privacy Policy</a>
          </FooterLinks>
        </FooterWrap>
      </Footer>

      {isAccessOpen && (
        <ModalOverlay onClick={() => setIsAccessOpen(false)}>
          <ModalPanel onClick={(event) => event.stopPropagation()}>
            <ModalHeader>
              <div>
                <h3>Choose your access</h3>
                <p>Login or join based on your role. Admin access is login-only.</p>
              </div>
              <CloseModal type="button" onClick={() => setIsAccessOpen(false)} aria-label="Close">x</CloseModal>
            </ModalHeader>

            <RoleGrid>
              <RoleCard onMouseMove={handleRoleCardMove} onMouseLeave={handleRoleCardLeave}>
                <h4>User</h4>
                <p>For residents who want community updates and local services.</p>
                <RoleActions>
                  <RoleLink className="login" to="/user/login" onClick={() => setIsAccessOpen(false)}>Login</RoleLink>
                  <RoleLink className="join" to="/user/register" onClick={() => setIsAccessOpen(false)}>Join</RoleLink>
                </RoleActions>
              </RoleCard>

              <RoleCard onMouseMove={handleRoleCardMove} onMouseLeave={handleRoleCardLeave}>
                <h4>Seller</h4>
                <p>For local businesses and service providers serving nearby communities.</p>
                <RoleActions>
                  <RoleLink className="login" to="/seller/login" onClick={() => setIsAccessOpen(false)}>Login</RoleLink>
                  <RoleLink className="join" to="/seller/register" onClick={() => setIsAccessOpen(false)}>Join</RoleLink>
                </RoleActions>
              </RoleCard>

              <RoleCard onMouseMove={handleRoleCardMove} onMouseLeave={handleRoleCardLeave}>
                <h4>Rider</h4>
                <p>For delivery partners helping local sellers and residents with nearby fulfillment.</p>
                <RoleActions>
                  <RoleLink className="login" to="/rider/login" onClick={() => setIsAccessOpen(false)}>Login</RoleLink>
                  <RoleLink className="join" to="/rider/register" onClick={() => setIsAccessOpen(false)}>Join</RoleLink>
                </RoleActions>
              </RoleCard>
            </RoleGrid>

            <AdminCard>
              <h4>Admin Access</h4>
              <p>Administrative access is restricted. Use admin login only.</p>
              <AdminLoginLink href="/admin/login">Admin Login</AdminLoginLink>
            </AdminCard>
          </ModalPanel>
        </ModalOverlay>
      )}
    </Page>
  );
}

export default Landing;
