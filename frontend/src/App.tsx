import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import DashboardLayout from './components/Layout/DashboardLayout';
import ReferenceSitesPage from './pages/ReferenceSitesPage';
import BaseCodePage from './pages/BaseCodePage';
import CommonCodePage from './pages/CommonCodePage';
import BankCodePage from './pages/BankCodePage';
import TestPage from './pages/TestPage';

// 보호된 라우트 컴포넌트
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

// 공개 라우트 컴포넌트 (로그인된 사용자는 대시보드로 리다이렉트)
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* 공개 라우트 */}
          <Route 
            path="/login" 
            element={
              <PublicRoute>
                <LoginPage />
              </PublicRoute>
            } 
          />

          {/* 테스트 페이지 */}
          <Route 
            path="/test" 
            element={<TestPage />} 
          />

          {/* 보호된 라우트 */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            } 
          >
            <Route index element={<DashboardPage />} />
            {/* 기초정보 */}
            <Route path="mlm/basic/base-codes" element={<BaseCodePage />} />
            <Route path="mlm/basic/common-codes" element={<CommonCodePage />} />
            <Route path="mlm/basic/bank-codes" element={<BankCodePage />} />
            {/* 참고사이트 */}
            <Route path="mlm/reference-sites" element={<ReferenceSitesPage />} />
            <Route path="mlm/reference-sites/:site" element={<ReferenceSitesPage />} />
          </Route>

          {/* 기본 라우트 */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          
          {/* 404 페이지 */}
          <Route 
            path="*" 
            element={
              <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                  <h1 className="text-4xl font-bold text-secondary-900 mb-4">404</h1>
                  <p className="text-secondary-600 mb-6">페이지를 찾을 수 없습니다.</p>
                  <button 
                    onClick={() => window.history.back()}
                    className="btn btn-primary"
                  >
                    이전 페이지로 돌아가기
                  </button>
                </div>
              </div>
            } 
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;


