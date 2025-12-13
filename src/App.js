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
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import CommunityPage from './pages/CommunityPage';
import MyCommunityPage from './pages/MyCommunityPage';
import CreatePostPage from './pages/CreatePostPage';
import PostPage from './pages/PostPage';
import ChatPage from './pages/ChatPage';

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
    } else if (path.includes('/login')) {
      setCurrentPage('login');
    } else if (path.includes('/signup')) {
      setCurrentPage('signup');
    } else if (path.includes('/chat')) {
      setCurrentPage('chat');
    } else if (path.includes('/my-community')) {
      setCurrentPage('my-community');
    } else if (path.includes('/r/') && path.includes('/submit')) {
      setCurrentPage('create-post');
    } else if (path.includes('/r/') && path.includes('/comments/')) {
      setCurrentPage('post');
    } else if (path.includes('/r/') || path.includes('/community')) {
      setCurrentPage('community');
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
      } else if (newPath.includes('/login')) {
        setCurrentPage('login');
      } else if (newPath.includes('/signup')) {
        setCurrentPage('signup');
      } else if (newPath.includes('/chat')) {
        setCurrentPage('chat');
      } else if (newPath.includes('/my-community')) {
        setCurrentPage('my-community');
      } else if (newPath.includes('/r/') && newPath.includes('/submit')) {
        setCurrentPage('create-post');
      } else if (newPath.includes('/r/') && newPath.includes('/comments/')) {
        setCurrentPage('post');
      } else if (newPath.includes('/r/') || newPath.includes('/community')) {
        setCurrentPage('community');
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
        return <StartCommunityPage onNavigate={handleNavigate} />;
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
      case 'login':
        return <LoginPage />;
      case 'signup':
        return <SignupPage />;
      case 'my-community':
        return <MyCommunityPage onNavigate={handleNavigate} />;
      case 'community':
        return <CommunityPage />;
      case 'create-post':
        return <CreatePostPage />;
      case 'post':
        return <PostPage />;
      case 'chat':
        return <ChatPage />;
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


