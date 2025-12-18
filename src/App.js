import React, { useEffect, useState } from 'react';
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
    initializeTheme();
    addSampleNotifications();

    const shouldRequireAuth = (p) => p.startsWith('/chat') || p.startsWith('/create-community');
    const matchesRoute = (p, base) => p === `/${base}` || p.startsWith(`/${base}/`);

    const resolvePageFromPath = (p) => {
      if (!isLoggedIn() && shouldRequireAuth(p)) return 'login';
      if (matchesRoute(p, 'explore')) return 'explore';
      if (matchesRoute(p, 'popular')) return 'popular';
      if (matchesRoute(p, 'create-community')) return 'create-community';
      if (matchesRoute(p, 'accessibility')) return 'accessibility';
      if (matchesRoute(p, 'developer-platform')) return 'developer-platform';
      if (matchesRoute(p, 'about')) return 'about';
      if (matchesRoute(p, 'advertise')) return 'advertise';
      if (matchesRoute(p, 'best')) return 'best';
      if (matchesRoute(p, 'blog')) return 'blog';
      if (matchesRoute(p, 'careers')) return 'careers';
      if (matchesRoute(p, 'communities')) return 'communities';
      if (matchesRoute(p, 'help')) return 'help';
      if (matchesRoute(p, 'press')) return 'press';
      if (matchesRoute(p, 'privacy')) return 'privacy';
      if (matchesRoute(p, 'rules')) return 'rules';
      if (matchesRoute(p, 'user-agreement')) return 'user-agreement';
      if (matchesRoute(p, 'login')) return 'login';
      if (matchesRoute(p, 'signup')) return 'signup';
      if (matchesRoute(p, 'notifications')) return 'notifications';
      if (matchesRoute(p, 'forgot-password')) return 'forgot-password';
      if (matchesRoute(p, 'reset-password')) return 'reset-password';
      if (matchesRoute(p, 'favorites')) return 'favorites';
      if (matchesRoute(p, 'chat')) return 'chat';
      if (p.includes('/user/')) return 'profile';
      if (matchesRoute(p, 'profile')) return 'profile';
      if (matchesRoute(p, 'settings')) return 'settings';
      if (matchesRoute(p, 'achievements')) return 'achievements';
      if (matchesRoute(p, 'edit-avatar')) return 'edit-avatar';
      if (matchesRoute(p, 'my-community')) return 'my-community';
      if (matchesRoute(p, 'submit')) return 'create-post';
      if (p.includes('/r/') && p.includes('/submit')) return 'create-post';
      if (p.includes('/r/') && p.includes('/comments/')) return 'post';
      if (p.includes('/r/') || p.includes('/community')) return 'community';
      return 'home';
    };

    const path = window.location.pathname;
    const page = resolvePageFromPath(path);
    if (page === 'login' && !isLoggedIn() && shouldRequireAuth(path)) {
      window.history.replaceState({}, '', '/login');
    }
    setCurrentPage(page);

    const handlePopState = () => {
      const newPath = window.location.pathname;
      const next = resolvePageFromPath(newPath);
      if (next === 'login' && !isLoggedIn() && shouldRequireAuth(newPath)) {
        window.history.replaceState({}, '', '/login');
      }
      setCurrentPage(next);
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
 

