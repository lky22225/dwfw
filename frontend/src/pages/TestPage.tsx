import React from 'react';
import { Home, LogIn } from 'lucide-react';

const TestPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-blue-500 flex items-center justify-center">
      {/* 파란 배경 테스트 */}
      <div className="text-center">
        {/* 홈 아이콘 */}
        <div className="mb-8">
          <Home className="w-20 h-20 text-white mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-white mb-2">Tailwind CSS 테스트</h1>
          <p className="text-blue-100 text-lg">파란 배경이 보이면 Tailwind가 작동 중입니다!</p>
        </div>

        {/* 로그인 버튼 */}
        <button className="bg-white text-blue-500 px-8 py-4 rounded-xl text-lg font-bold hover:bg-blue-50 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center mx-auto">
          <LogIn className="w-6 h-6 mr-2" />
          테스트 로그인 버튼
        </button>

        {/* 추가 테스트 요소들 */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-6 text-white">
            <h3 className="text-xl font-bold mb-2">그라데이션 테스트</h3>
            <div className="w-full h-4 bg-gradient-to-r from-red-500 to-yellow-500 rounded-full"></div>
          </div>
          
          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-6 text-white">
            <h3 className="text-xl font-bold mb-2">그림자 테스트</h3>
            <div className="w-full h-4 bg-green-500 rounded-full shadow-lg"></div>
          </div>
          
          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-6 text-white">
            <h3 className="text-xl font-bold mb-2">애니메이션 테스트</h3>
            <div className="w-full h-4 bg-purple-500 rounded-full animate-pulse"></div>
          </div>
        </div>

        {/* 상태 표시 */}
        <div className="mt-8 bg-green-500 text-white px-6 py-3 rounded-full font-bold text-lg">
          ✅ Tailwind CSS가 정상 작동 중입니다!
        </div>
      </div>
    </div>
  );
};

export default TestPage;
