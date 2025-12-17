import React, { useState, useEffect } from 'react';
import AppNavbar from './layout/Navbar';
import { initializeTheme } from './utils/theme';
import { addSampleNotifications } from './utils/notifications';
import { isLoggedIn } from './utils/auth';
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
import ProfilePage from './pages/ProfilePage';
import SettingsPage from './pages/SettingsPage';
import AchievementsPage from './pages/AchievementsPage';
import EditAvatarPage from './pages/EditAvatarPage';
import NotificationsPage from './pages/NotificationsPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import FavoritesPage from './pages/FavoritesPage';

function App() {
  const [currentPage, setCurrentPage] = useState('home');

  useEffect(() => {
    // Initialize theme and notifications on app load
    initializeTheme();
    addSampleNotifications();
    
    const shouldRequireAuth = (p) => p.startsWith('/chat') || p.startsWith('/create-community');
    const matchesRoute = (p, base) => p === `/${base}` || p.startsWith(`/${base}/`);

    // Check URL path to determine which page to show
    const path = window.location.pathname;
    if (!isLoggedIn() && shouldRequireAuth(path)) {
      window.history.replaceState({}, '', '/login');
      setCurrentPage('login');
      return;
    }
    if (matchesRoute(path, 'explore')) {
      setCurrentPage('explore');
    } else if (matchesRoute(path, 'popular')) {
      setCurrentPage('popular');
    } else if (matchesRoute(path, 'create-community')) {
      setCurrentPage('create-community');
    } else if (matchesRoute(path, 'accessibility')) {
      setCurrentPage('accessibility');
    } else if (matchesRoute(path, 'developer-platform')) {
      setCurrentPage('developer-platform');
    } else if (matchesRoute(path, 'about')) {
      setCurrentPage('about');
    } else if (matchesRoute(path, 'advertise')) {
      setCurrentPage('advertise');
    } else if (matchesRoute(path, 'best')) {
      setCurrentPage('best');
    } else if (matchesRoute(path, 'blog')) {
      setCurrentPage('blog');
    } else if (matchesRoute(path, 'careers')) {
      setCurrentPage('careers');
    } else if (matchesRoute(path, 'communities')) {
      setCurrentPage('communities');
    } else if (matchesRoute(path, 'help')) {
      setCurrentPage('help');
    } else if (matchesRoute(path, 'press')) {
      setCurrentPage('press');
    } else if (matchesRoute(path, 'privacy')) {
      setCurrentPage('privacy');
    } else if (matchesRoute(path, 'rules')) {
      setCurrentPage('rules');
    } else if (matchesRoute(path, 'user-agreement')) {
      setCurrentPage('user-agreement');
    } else if (matchesRoute(path, 'login')) {
      setCurrentPage('login');
    } else if (matchesRoute(path, 'signup')) {
      setCurrentPage('signup');
    } else if (matchesRoute(path, 'notifications')) {
      setCurrentPage('notifications');
    } else if (matchesRoute(path, 'forgot-password')) {
      setCurrentPage('forgot-password');
    } else if (matchesRoute(path, 'reset-password')) {
      setCurrentPage('reset-password');
    } else if (matchesRoute(path, 'favorites')) {
      setCurrentPage('favorites');
    } else if (matchesRoute(path, 'chat')) {
      setCurrentPage('chat');
    } else if (path.includes('/user/')) {
      setCurrentPage('profile');
    } else if (matchesRoute(path, 'profile')) {
      setCurrentPage('profile');
    } else if (matchesRoute(path, 'settings')) {
      setCurrentPage('settings');
    } else if (matchesRoute(path, 'achievements')) {
      setCurrentPage('achievements');
    } else if (matchesRoute(path, 'edit-avatar')) {
      setCurrentPage('edit-avatar');
    } else if (matchesRoute(path, 'my-community')) {
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
      if (!isLoggedIn() && shouldRequireAuth(newPath)) {
        window.history.replaceState({}, '', '/login');
        setCurrentPage('login');
        return;
      }
      if (matchesRoute(newPath, 'explore')) {
        setCurrentPage('explore');
      } else if (matchesRoute(newPath, 'popular')) {
        setCurrentPage('popular');
      } else if (matchesRoute(newPath, 'create-community')) {
        setCurrentPage('create-community');
      } else if (matchesRoute(newPath, 'accessibility')) {
        setCurrentPage('accessibility');
      } else if (matchesRoute(newPath, 'developer-platform')) {
        setCurrentPage('developer-platform');
      } else if (matchesRoute(newPath, 'about')) {
        setCurrentPage('about');
      } else if (matchesRoute(newPath, 'advertise')) {
        setCurrentPage('advertise');
      } else if (matchesRoute(newPath, 'best')) {
        setCurrentPage('best');
      } else if (matchesRoute(newPath, 'blog')) {
        setCurrentPage('blog');
      } else if (matchesRoute(newPath, 'careers')) {
        setCurrentPage('careers');
      } else if (matchesRoute(newPath, 'communities')) {
        setCurrentPage('communities');
      } else if (matchesRoute(newPath, 'help')) {
        setCurrentPage('help');
      } else if (matchesRoute(newPath, 'press')) {
        setCurrentPage('press');
      } else if (matchesRoute(newPath, 'privacy')) {
        setCurrentPage('privacy');
      } else if (matchesRoute(newPath, 'rules')) {
        setCurrentPage('rules');
      } else if (matchesRoute(newPath, 'user-agreement')) {
        setCurrentPage('user-agreement');
      } else if (matchesRoute(newPath, 'login')) {
        setCurrentPage('login');
      } else if (matchesRoute(newPath, 'signup')) {
        setCurrentPage('signup');
      } else if (matchesRoute(newPath, 'notifications')) {
        setCurrentPage('notifications');
      } else if (matchesRoute(newPath, 'forgot-password')) {
        setCurrentPage('forgot-password');
      } else if (matchesRoute(newPath, 'reset-password')) {
        setCurrentPage('reset-password');
      } else if (matchesRoute(newPath, 'favorites')) {
        setCurrentPage('favorites');
      } else if (matchesRoute(newPath, 'chat')) {
        setCurrentPage('chat');
      } else if (newPath.includes('/user/')) {
        setCurrentPage('profile');
      } else if (matchesRoute(newPath, 'profile')) {
        setCurrentPage('profile');
      } else if (matchesRoute(newPath, 'settings')) {
        setCurrentPage('settings');
      } else if (matchesRoute(newPath, 'achievements')) {
        setCurrentPage('achievements');
      } else if (matchesRoute(newPath, 'edit-avatar')) {
        setCurrentPage('edit-avatar');
      } else if (matchesRoute(newPath, 'my-community')) {
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
      case 'notifications':
        return <NotificationsPage />;
      case 'forgot-password':
        return <ForgotPasswordPage />;
      case 'reset-password':
        return <ResetPasswordPage />;
      case 'favorites':
        return <FavoritesPage />;
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
      case 'profile':
        return <ProfilePage onNavigate={handleNavigate} />;
      case 'settings':
        return <SettingsPage onNavigate={handleNavigate} />;
      case 'achievements':
        return <AchievementsPage onNavigate={handleNavigate} />;
      case 'edit-avatar':
        return <EditAvatarPage onNavigate={handleNavigate} />;
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


