import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Package, 
  ShoppingCart, 
  Truck,
  FileText,
  Bell,
  Calendar,
  DollarSign
} from 'lucide-react';

const DashboardPage: React.FC = () => {
  const { user } = useAuth();

  const getRoleTitle = () => {
    switch (user?.role) {
      case 'SYSTEM_ADMIN':
        return '시스템관리자 대시보드';
      case 'SYSTEM_USER':
        return '시스템사용자 대시보드';
      case 'PARTNER_USER':
        return '파트너사용자 대시보드';
      default:
        return '대시보드';
    }
  };

  const getRoleDescription = () => {
    switch (user?.role) {
      case 'SYSTEM_ADMIN':
        return '전체 시스템을 관리하고 모니터링할 수 있습니다.';
      case 'SYSTEM_USER':
        return '주문 관리 및 게시판 기능을 사용할 수 있습니다.';
      case 'PARTNER_USER':
        return '주문 및 출고 관리, 공지사항을 확인할 수 있습니다.';
      default:
        return '';
    }
  };

  const getDashboardCards = () => {
    const commonCards = [
      {
        title: '총 주문',
        value: '1,234',
        change: '+12%',
        changeType: 'positive' as const,
        icon: <ShoppingCart className="h-8 w-8" />,
        color: 'bg-blue-500'
      },
      {
        title: '총 매출',
        value: '₩45,678,900',
        change: '+8%',
        changeType: 'positive' as const,
        icon: <DollarSign className="h-8 w-8" />,
        color: 'bg-green-500'
      }
    ];

    switch (user?.role) {
      case 'SYSTEM_ADMIN':
        return [
          ...commonCards,
          {
            title: '총 사용자',
            value: '156',
            change: '+5%',
            changeType: 'positive' as const,
            icon: <Users className="h-8 w-8" />,
            color: 'bg-purple-500'
          },
          {
            title: '총 상품',
            value: '2,847',
            change: '+3%',
            changeType: 'positive' as const,
            icon: <Package className="h-8 w-8" />,
            color: 'bg-orange-500'
          },
          {
            title: '출고 완료',
            value: '892',
            change: '+15%',
            changeType: 'positive' as const,
            icon: <Truck className="h-8 w-8" />,
            color: 'bg-indigo-500'
          },
          {
            title: '게시글',
            value: '67',
            change: '+2%',
            changeType: 'positive' as const,
            icon: <FileText className="h-8 w-8" />,
            color: 'bg-pink-500'
          }
        ];

      case 'SYSTEM_USER':
        return [
          ...commonCards,
          {
            title: '처리 대기',
            value: '23',
            change: '-5%',
            changeType: 'negative' as const,
            icon: <Bell className="h-8 w-8" />,
            color: 'bg-yellow-500'
          },
          {
            title: '출고 준비',
            value: '45',
            change: '+10%',
            changeType: 'positive' as const,
            icon: <Truck className="h-8 w-8" />,
            color: 'bg-indigo-500'
          }
        ];

      case 'PARTNER_USER':
        return [
          ...commonCards,
          {
            title: '신규 주문',
            value: '12',
            change: '+8%',
            changeType: 'positive' as const,
            icon: <Bell className="h-8 w-8" />,
            color: 'bg-yellow-500'
          },
          {
            title: '출고 요청',
            value: '8',
            change: '+3%',
            changeType: 'positive' as const,
            icon: <Truck className="h-8 w-8" />,
            color: 'bg-indigo-500'
          }
        ];

      default:
        return commonCards;
    }
  };

  const dashboardCards = getDashboardCards();

  return (
    <div className="space-y-8">
      {/* 페이지 헤더 */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">{getRoleTitle()}</h1>
            <p className="text-blue-100 text-lg">{getRoleDescription()}</p>
          </div>
          <div className="flex items-center space-x-3 text-blue-100">
            <Calendar className="h-5 w-5" />
            <span className="text-lg font-medium">{new Date().toLocaleDateString('ko-KR', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric',
              weekday: 'long'
            })}</span>
          </div>
        </div>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {dashboardCards.map((card, index) => (
          <div key={index} className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-200 hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-600 mb-2">{card.title}</p>
                <p className="text-3xl font-bold text-gray-900 mb-2">{card.value}</p>
                <div className="flex items-center">
                  <span className={`text-sm font-bold px-2 py-1 rounded-full ${
                    card.changeType === 'positive' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {card.change}
                  </span>
                  <span className="text-sm text-gray-500 ml-2">전월 대비</span>
                </div>
              </div>
              <div className={`${card.color} rounded-2xl p-4 text-white shadow-lg`}>
                {card.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 차트 및 테이블 영역 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 매출 차트 */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">매출 현황</h3>
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              <span className="text-sm font-medium text-green-600">상승 추세</span>
            </div>
          </div>
          <div className="h-72 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl flex items-center justify-center border-2 border-dashed border-gray-200">
            <div className="text-center">
              <BarChart3 className="h-16 w-16 text-blue-400 mx-auto mb-4" />
              <p className="text-gray-600 font-medium">차트 데이터가 여기에 표시됩니다</p>
              <p className="text-gray-400 text-sm mt-1">실시간 매출 데이터를 확인하세요</p>
            </div>
          </div>
        </div>

        {/* 최근 주문 */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">최근 주문</h3>
            <div className="flex items-center space-x-2">
              <ShoppingCart className="h-5 w-5 text-blue-500" />
              <span className="text-sm font-medium text-blue-600">실시간 업데이트</span>
            </div>
          </div>
          <div className="space-y-4">
            {[
              { id: 'ORD-001', customer: '홍길동', amount: '₩125,000', status: '처리중' },
              { id: 'ORD-002', customer: '김철수', amount: '₩89,500', status: '완료' },
              { id: 'ORD-003', customer: '이영희', amount: '₩234,000', status: '배송중' },
              { id: 'ORD-004', customer: '박민수', amount: '₩156,000', status: '처리중' },
              { id: 'ORD-005', customer: '정수진', amount: '₩78,900', status: '완료' }
            ].map((order, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl border border-gray-100 hover:shadow-md transition-all duration-200">
                <div>
                  <p className="font-bold text-gray-900 text-lg">{order.id}</p>
                  <p className="text-sm text-gray-600 font-medium">{order.customer}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900 text-lg">{order.amount}</p>
                  <span className={`text-xs px-3 py-1 rounded-full font-bold ${
                    order.status === '완료' ? 'bg-green-100 text-green-700' :
                    order.status === '처리중' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 알림 및 공지사항 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 중요 알림 */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">중요 알림</h3>
            <div className="flex items-center space-x-2">
              <Bell className="h-5 w-5 text-red-500" />
              <span className="text-sm font-medium text-red-600">긴급</span>
            </div>
          </div>
          <div className="space-y-4">
            <div className="p-4 bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-200 rounded-xl">
              <p className="font-bold text-red-900 text-lg">시스템 점검 안내</p>
              <p className="text-sm text-red-700 mt-2 font-medium">2024년 1월 15일 02:00-04:00 시스템 점검 예정</p>
            </div>
            <div className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-200 rounded-xl">
              <p className="font-bold text-yellow-900 text-lg">새로운 기능 업데이트</p>
              <p className="text-sm text-yellow-700 mt-2 font-medium">주문 관리 시스템이 업데이트되었습니다.</p>
            </div>
          </div>
        </div>

        {/* 최근 공지사항 */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">최근 공지사항</h3>
            <div className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-blue-500" />
              <span className="text-sm font-medium text-blue-600">최신 업데이트</span>
            </div>
          </div>
          <div className="space-y-4">
            {[
              { title: '2024년 1월 정기 업데이트', date: '2024-01-10' },
              { title: '새로운 결제 시스템 도입', date: '2024-01-08' },
              { title: '사용자 교육 일정 안내', date: '2024-01-05' },
              { title: '보안 강화 업데이트', date: '2024-01-03' }
            ].map((notice, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl border border-gray-100 hover:shadow-md hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 cursor-pointer transition-all duration-200">
                <p className="font-bold text-gray-900">{notice.title}</p>
                <span className="text-sm text-gray-600 font-medium bg-white px-3 py-1 rounded-full">{notice.date}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;


