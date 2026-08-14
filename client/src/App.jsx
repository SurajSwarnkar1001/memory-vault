import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import DashboardPage from './pages/DashboardPage';
import ProjectPage from './pages/ProjectPage';
import InvitePage from './pages/InvitePage';
import { Loader2 } from 'lucide-react';

function AppContent() {
  const { user, loading } = useAuth();
  
  // Initialize path mapping '/' to '/dashboard'
  const initialPath = window.location.pathname === '/' ? '/dashboard' : window.location.pathname;
  const [path, setPath] = useState(initialPath);

  // Track browser navigation popstate events (back/forward clicks)
  useEffect(() => {
    const handlePopState = () => {
      const currentPath = window.location.pathname === '/' ? '/dashboard' : window.location.pathname;
      setPath(currentPath);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (newPath) => {
    window.history.pushState({}, '', newPath);
    setPath(newPath);
  };

  // Redirect unauthenticated users or redirect authenticated users from login/signup
  useEffect(() => {
    if (loading) return;

    const isAuthRoute = ['/login', '/signup'].includes(path);
    const isInviteRoute = path.startsWith('/invite/');
    
    if (!user && !isAuthRoute && !isInviteRoute) {
      navigate('/login');
    } else if (user && isAuthRoute) {
      navigate('/dashboard');
    }
  }, [user, path, loading]);

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-light flex flex-col items-center justify-center text-slate-400 gap-2">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
        <span className="text-xs font-semibold">Restoring session...</span>
      </div>
    );
  }

  // Parse path for dynamic routes like /project/:id
  const getProjectId = () => {
    if (path.startsWith('/project/')) {
      return path.split('/project/')[1];
    }
    return null;
  };

  const getInviteToken = () => {
    if (path.startsWith('/invite/')) {
      return path.split('/invite/')[1];
    }
    return null;
  };

  const projectId = getProjectId();
  const inviteToken = getInviteToken();

  if (inviteToken) {
    return <InvitePage token={inviteToken} onNavigate={navigate} />;
  }

  // Render correct pages
  if (!user) {
    if (path === '/signup') {
      return <SignupPage onNavigate={navigate} />;
    }
    return <LoginPage onNavigate={navigate} />;
  }

  if (projectId) {
    return <ProjectPage projectId={projectId} onNavigate={navigate} />;
  }

  // Default page is Dashboard
  return <DashboardPage onNavigate={navigate} />;
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
