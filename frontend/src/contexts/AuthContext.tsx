import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthUser, LoginRequest, LoginResponse, UserRole } from '../types';
import { apiService } from '../services/api';
import toast from 'react-hot-toast';

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginRequest) => Promise<boolean>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user;

  // 초기 사용자 정보 로드
  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('token');
      const savedUser = localStorage.getItem('user');

      if (token && savedUser) {
        try {
          const userData = JSON.parse(savedUser);
          setUser(userData);
          
          // 토큰 유효성 검증
          await refreshUser();
        } catch (error) {
          console.error('사용자 정보 로드 실패:', error);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      }
      
      setIsLoading(false);
    };

    initializeAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = async (credentials: LoginRequest): Promise<boolean> => {
    try {
      setIsLoading(true);
      console.log('로그인 시도:', credentials);
      const response: LoginResponse = await apiService.login(credentials);
      console.log('로그인 응답:', response);
      
      // 토큰 저장
      localStorage.setItem('token', response.token);
      
      // 사용자 정보 저장
      const userData = {
        id: 0, // 실제로는 서버에서 받아와야 함
        username: response.username,
        name: response.name,
        email: response.email,
        role: response.role,
        companyName: response.companyName,
        menus: getMenusByRole(response.role)
      };
      
      console.log('사용자 데이터 저장:', userData);
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      
      toast.success(`${response.name}님, 환영합니다!`);
      return true;
    } catch (error: any) {
      console.error('로그인 오류:', error);
      const errorMessage = error.response?.data?.error || '로그인에 실패했습니다.';
      toast.error(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await apiService.logout();
    } catch (error) {
      console.error('로그아웃 API 호출 실패:', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
      toast.success('로그아웃되었습니다.');
    }
  };

  const refreshUser = async () => {
    try {
      const userData = await apiService.getCurrentUser();
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
    } catch (error) {
      console.error('사용자 정보 갱신 실패:', error);
      logout();
    }
  };

  // 사용자 역할에 따른 메뉴 반환
  const getMenusByRole = (role: UserRole) => {
    const menus: { [key: string]: { [key: string]: string } } = {};

    switch (role) {
      case UserRole.SYSTEM_ADMIN:
        menus['기준정보'] = {
          '조직': '/admin/organization',
          '상품': '/admin/products',
          '거래처': '/admin/partners'
        };
        menus['주문관리'] = {
          '주문관리': '/admin/orders',
          '출고관리': '/admin/shipments'
        };
        menus['게시판'] = {
          '공지사항': '/admin/notices',
          '게시판': '/admin/board'
        };
        menus['시스템관리'] = {
          '권한': '/admin/permissions',
          '설정': '/admin/settings'
        };
        break;

      case UserRole.SYSTEM_USER:
        menus['주문관리'] = {
          '주문관리': '/user/orders',
          '출고관리': '/user/shipments'
        };
        menus['게시판'] = {
          '공지사항': '/user/notices'
        };
        break;

      case UserRole.PARTNER_USER:
        menus['기준정보'] = {
          '주문관리': '/partner/orders',
          '출고관리': '/partner/shipments'
        };
        menus['게시판'] = {
          '공지사항': '/partner/notices'
        };
        break;
    }

    return menus;
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    login,
    logout,
    refreshUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};


