import React, { useState, useEffect } from 'react';
import AppNavbar from './layout/Navbar';
import HomePage from './pages/HomePage';
import ExplorePage from './pages/ExplorePage';
import PopularPage from './pages/PopularPage';
import StartCommunityPage from './pages/StartCommunityPage';
import AccessibilityPage from './pages/AccessibilityPage';
import DeveloperPlatformPage from './pages/DeveloperPlatformPage';
import AboutPage from './pages/AboutPage';
import AdvertisePage from './pages/AdvertisePage';
import BestOfRedditPage from './pages/BestOfRedditPage';
import BlogPage from './pages/BlogPage';
import CareersPage from './pages/CareersPage';
import CommunitiesHubPage from './pages/CommunitiesHubPage';
import HelpPage from './pages/HelpPage';
import PressPage from './pages/PressPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import RedditRulesPage from './pages/RedditRulesPage';
import UserAgreementPage from './pages/UserAgreementPage';

function App() {
  const [currentPage, setCurrentPage] = useState('home');

  useEffect(() => {
    // Check URL path to determine which page to show
    const path = window.location.pathname;
    if (path.includes('/explore')) {
      setCurrentPage('explore');
    } else if (path.includes('/popular')) {
      setCurrentPage('popular');
    } else if (path.includes('/create-community')) {
      setCurrentPage('create-community');
    } else if (path.includes('/accessibility')) {
      setCurrentPage('accessibility');
    } else if (path.includes('/developer-platform')) {
      setCurrentPage('developer-platform');
    } else if (path.includes('/about')) {
      setCurrentPage('about');
    } else if (path.includes('/advertise')) {
      setCurrentPage('advertise');
    } else if (path.includes('/best')) {
      setCurrentPage('best');
    } else if (path.includes('/blog')) {
      setCurrentPage('blog');
    } else if (path.includes('/careers')) {
      setCurrentPage('careers');
    } else if (path.includes('/communities')) {
      setCurrentPage('communities');
    } else if (path.includes('/help')) {
      setCurrentPage('help');
    } else if (path.includes('/press')) {
      setCurrentPage('press');
    } else if (path.includes('/privacy')) {
      setCurrentPage('privacy');
    } else if (path.includes('/rules')) {
      setCurrentPage('rules');
    } else if (path.includes('/user-agreement')) {
      setCurrentPage('user-agreement');
    } else {
      setCurrentPage('home');
    }

    // Listen for navigation
    const handlePopState = () => {
      const newPath = window.location.pathname;
      if (newPath.includes('/explore')) {
        setCurrentPage('explore');
      } else if (newPath.includes('/popular')) {
        setCurrentPage('popular');
      } else if (newPath.includes('/create-community')) {
        setCurrentPage('create-community');
      } else if (newPath.includes('/accessibility')) {
        setCurrentPage('accessibility');
      } else if (newPath.includes('/developer-platform')) {
        setCurrentPage('developer-platform');
      } else if (newPath.includes('/about')) {
        setCurrentPage('about');
      } else if (newPath.includes('/advertise')) {
        setCurrentPage('advertise');
      } else if (newPath.includes('/best')) {
        setCurrentPage('best');
      } else if (newPath.includes('/blog')) {
        setCurrentPage('blog');
      } else if (newPath.includes('/careers')) {
        setCurrentPage('careers');
      } else if (newPath.includes('/communities')) {
        setCurrentPage('communities');
      } else if (newPath.includes('/help')) {
        setCurrentPage('help');
      } else if (newPath.includes('/press')) {
        setCurrentPage('press');
      } else if (newPath.includes('/privacy')) {
        setCurrentPage('privacy');
      } else if (newPath.includes('/rules')) {
        setCurrentPage('rules');
      } else if (newPath.includes('/user-agreement')) {
        setCurrentPage('user-agreement');
      } else {
        setCurrentPage('home');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleNavigate = (page, path) => {
    setCurrentPage(page);
    window.history.pushState({}, '', path);
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'explore':
        return <ExplorePage />;
      case 'popular':
        return <PopularPage />;
      case 'create-community':
        return <StartCommunityPage />;
      case 'accessibility':
        return <AccessibilityPage />;
      case 'developer-platform':
        return <DeveloperPlatformPage />;
      case 'about':
        return <AboutPage />;
      case 'advertise':
        return <AdvertisePage />;
      case 'best':
        return <BestOfRedditPage />;
      case 'blog':
        return <BlogPage />;
      case 'careers':
        return <CareersPage />;
      case 'communities':
        return <CommunitiesHubPage />;
      case 'help':
        return <HelpPage />;
      case 'press':
        return <PressPage />;
      case 'privacy':
        return <PrivacyPolicyPage />;
      case 'rules':
        return <RedditRulesPage />;
      case 'user-agreement':
        return <UserAgreementPage />;
      default:
        return <HomePage />;
    }
  };

  return (
    <div>
      <AppNavbar onNavigate={handleNavigate} />
      {renderPage()}
    </div>
  );
}

export default App;


