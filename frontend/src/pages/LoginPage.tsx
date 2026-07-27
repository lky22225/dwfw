import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LoginRequest } from '../types';
import { Eye, EyeOff, Lock, User, Building2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { apiService } from '../services/api';

const LoginPage: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const { login, isLoading, isAuthenticated } = useAuth();
  const { register, handleSubmit, formState: { errors } } = useForm<LoginRequest>();
  const navigate = useNavigate();

  // 인증 상태가 변경되면 대시보드로 이동
  useEffect(() => {
    console.log('인증 상태 변경:', isAuthenticated);
    if (isAuthenticated) {
      console.log('대시보드로 이동');
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const onSubmit = async (data: LoginRequest) => {
    console.log('로그인 폼 제출:', data);
    const result = await login(data);
    console.log('로그인 결과:', result);
    // login 함수가 성공하면 useEffect에서 자동으로 리다이렉트됨
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
      {/* 소스 반영 확인용 - 매우 눈에 띄는 표시 */}
      <div className="fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg font-bold text-lg shadow-xl z-50">
        🚀 NEW DESIGN LOADED! Version 1.0
      </div>
      <div className="max-w-md w-full">
        {/* 로고 및 제목 영역 */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl mb-6 shadow-lg">
            <Building2 className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-3">DwFw</h1>
          <p className="text-gray-600 text-lg">관리자 시스템에 로그인하세요</p>
          {/* 버전 표시 */}
          <div className="mt-4 inline-block bg-gradient-to-r from-green-500 to-blue-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg">
            Version 1.0 - 개선된 디자인
          </div>
        </div>

        {/* 로그인 폼 */}
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-10">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* 사용자명 입력 */}
            <div>
              <label htmlFor="username" className="block text-sm font-semibold text-gray-700 mb-3">
                사용자명
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...register('username', {
                    required: '사용자명을 입력해주세요.',
                    minLength: {
                      value: 2,
                      message: '사용자명은 최소 2자 이상이어야 합니다.'
                    }
                  })}
                  type="text"
                  id="username"
                  className="w-full px-4 py-4 pl-12 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all duration-200 bg-gray-50 focus:bg-white"
                  placeholder="사용자명을 입력하세요"
                />
              </div>
              {errors.username && (
                <p className="mt-2 text-sm text-red-600 font-medium">{errors.username.message}</p>
              )}
            </div>

            {/* 비밀번호 입력 */}
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-3">
                비밀번호
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...register('password', { 
                    required: '비밀번호를 입력해주세요.',
                    minLength: {
                      value: 1,
                      message: '비밀번호를 입력해주세요.'
                    }
                  })}
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  className="w-full px-4 py-4 pl-12 pr-12 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all duration-200 bg-gray-50 focus:bg-white"
                  placeholder="비밀번호를 입력하세요"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-4 flex items-center hover:text-gray-600 transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-2 text-sm text-red-600 font-medium">{errors.password.message}</p>
              )}
            </div>

            {/* 로그인 버튼 */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-4 px-6 rounded-xl text-lg font-bold hover:from-blue-700 hover:to-indigo-800 focus:ring-4 focus:ring-blue-500/20 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                  로그인 중...
                </div>
              ) : (
                '로그인'
              )}
            </button>

            {/* 관리자 계정 초기화 버튼 */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={async () => {
                  try {
                    const result = await apiService.initializeAdmin();
                    toast.success(`관리자 계정이 초기화되었습니다.\n사용자명: ${result.username}\n비밀번호: ${result.password}`);
                  } catch (error: any) {
                    toast.error(error.response?.data?.error || '관리자 계정 초기화에 실패했습니다.');
                  }
                }}
                className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-xl text-sm font-medium hover:bg-gray-200 focus:ring-4 focus:ring-gray-500/20 focus:ring-offset-2 transition-all duration-200"
              >
                관리자 계정 초기화
              </button>
              <p className="text-xs text-gray-500 text-center mt-3">
                초기 설정 시에만 사용하세요
              </p>
            </div>
          </form>
        </div>

        {/* 하단 정보 */}
        <div className="text-center mt-8">
          <p className="text-sm text-secondary-500 mb-4">
            © 2024 DwFw. All rights reserved.
          </p>
          {/* 테스트 페이지 링크 */}
          <a 
            href="/test" 
            className="inline-block bg-yellow-500 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-yellow-600 transition-colors"
          >
            🧪 Tailwind CSS 테스트 페이지
          </a>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
