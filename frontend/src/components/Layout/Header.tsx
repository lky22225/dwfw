import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { Bell, Search, Settings, LogOut, User, ChevronDown, ArrowRight } from 'lucide-react';

interface SearchMenuItem {
  label: string;
  path: string;
  parentLabel?: string;
  icon?: React.ReactNode;
}

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchMenuItem[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
  };

  // 메뉴 데이터 생성 (사이드바와 동일한 구조)
  const getAllMenuItems = (): SearchMenuItem[] => {
    if (!user) return [];

    const menuItems: SearchMenuItem[] = [];

    switch (user.role) {
      case 'SYSTEM_ADMIN':
        // 대시보드
        menuItems.push({
          label: '대시보드',
          path: '/dashboard'
        });

        // 기초정보
        menuItems.push({
          label: '기초정보',
          path: '/mlm/basic'
        });
        const basicItems = [
          '기초코드등록', '공통코드등록', '은행등록', '카드사용', '입금계좌등록',
          '휴일등록', '직급등록', '센터등록', '거래처등록', '거래처검색',
          '거래처담당자일람', '우편번호검색', '우편번호업데이트'
        ];
        basicItems.forEach(item => {
          menuItems.push({
            label: item,
            path: `/mlm/basic/${item.toLowerCase().replace(/\s+/g, '-')}`,
            parentLabel: '기초정보'
          });
        });

        // 상품관리
        menuItems.push({
          label: '상품관리',
          path: '/mlm/product'
        });
        const productItems = [
          '카테고리등록', '상품등록', '판매금액변경', '자재등록상품설정', '추가지급상품설정',
          '상품검색', '상품가격표', '상품관리대장', '공급처정보조회', '카테고리별 조회',
          '자재등록', '자재검색', 'BOM등록'
        ];
        productItems.forEach(item => {
          menuItems.push({
            label: item,
            path: `/mlm/product/${item.toLowerCase().replace(/\s+/g, '-')}`,
            parentLabel: '상품관리'
          });
        });

        // 회원관리
        menuItems.push({
          label: '회원관리',
          path: '/mlm/member'
        });
        const memberItems = [
          '회원등록', '회원검색', '회원정보수정', '회원상태변경', '회원등급관리',
          '회원별주문내역', '회원별구매통계', '회원별수당내역', '회원별입금내역'
        ];
        memberItems.forEach(item => {
          menuItems.push({
            label: item,
            path: `/mlm/member/${item.toLowerCase().replace(/\s+/g, '-')}`,
            parentLabel: '회원관리'
          });
        });

        // 회원관리II
        menuItems.push({
          label: '회원관리II',
          path: '/mlm/member2'
        });
        const member2Items = [
          '추천인관리', '후원인관리', '회원트리뷰', '회원별추천현황', '회원별후원현황',
          '회원별활동현황', '회원별성과현황', '회원별랭킹', '회원별포인트내역'
        ];
        member2Items.forEach(item => {
          menuItems.push({
            label: item,
            path: `/mlm/member2/${item.toLowerCase().replace(/\s+/g, '-')}`,
            parentLabel: '회원관리II'
          });
        });

        // 주문관리
        menuItems.push({
          label: '주문관리',
          path: '/mlm/order'
        });
        const orderItems = [
          '주문등록', '주문검색', '주문수정', '주문취소', '주문승인',
          '주문별배송관리', '주문별입금관리', '주문별수당계산', '주문별통계'
        ];
        orderItems.forEach(item => {
          menuItems.push({
            label: item,
            path: `/mlm/order/${item.toLowerCase().replace(/\s+/g, '-')}`,
            parentLabel: '주문관리'
          });
        });

        // 입금관리
        menuItems.push({
          label: '입금관리',
          path: '/mlm/payment'
        });
        const paymentItems = [
          '입금등록', '입금검색', '입금승인', '입금취소', '입금별통계',
          '입금별수당계산', '입금별배송관리', '입금별주문관리'
        ];
        paymentItems.forEach(item => {
          menuItems.push({
            label: item,
            path: `/mlm/payment/${item.toLowerCase().replace(/\s+/g, '-')}`,
            parentLabel: '입금관리'
          });
        });

        // 물류관리
        menuItems.push({
          label: '물류관리',
          path: '/mlm/logistics'
        });
        const logisticsItems = [
          '배송등록', '배송검색', '배송수정', '배송취소', '배송승인',
          '배송별통계', '배송별입금관리', '배송별주문관리', '배송별수당계산'
        ];
        logisticsItems.forEach(item => {
          menuItems.push({
            label: item,
            path: `/mlm/logistics/${item.toLowerCase().replace(/\s+/g, '-')}`,
            parentLabel: '물류관리'
          });
        });

        // 재고관리
        menuItems.push({
          label: '재고관리',
          path: '/mlm/inventory'
        });
        const inventoryItems = [
          '재고등록', '재고검색', '재고수정', '재고이동', '재고조정',
          '재고별통계', '재고별입금관리', '재고별주문관리', '재고별수당계산'
        ];
        inventoryItems.forEach(item => {
          menuItems.push({
            label: item,
            path: `/mlm/inventory/${item.toLowerCase().replace(/\s+/g, '-')}`,
            parentLabel: '재고관리'
          });
        });

        // SMS관리
        menuItems.push({
          label: 'SMS관리',
          path: '/mlm/sms'
        });
        const smsItems = [
          'SMS등록', 'SMS검색', 'SMS수정', 'SMS발송', 'SMS승인',
          'SMS별통계', 'SMS별입금관리', 'SMS별주문관리', 'SMS별수당계산'
        ];
        smsItems.forEach(item => {
          menuItems.push({
            label: item,
            path: `/mlm/sms/${item.toLowerCase().replace(/\s+/g, '-')}`,
            parentLabel: 'SMS관리'
          });
        });

        // 공제조합
        menuItems.push({
          label: '공제조합',
          path: '/mlm/association'
        });
        const associationItems = [
          '공제조합등록', '공제조합검색', '공제조합수정', '공제조합승인',
          '공제조합별통계', '공제조합별입금관리', '공제조합별주문관리'
        ];
        associationItems.forEach(item => {
          menuItems.push({
            label: item,
            path: `/mlm/association/${item.toLowerCase().replace(/\s+/g, '-')}`,
            parentLabel: '공제조합'
          });
        });

        // 수당계산
        menuItems.push({
          label: '수당계산',
          path: '/mlm/commission'
        });
        const commissionItems = [
          '수당계산등록', '수당계산검색', '수당계산수정', '수당계산승인',
          '수당계산별통계', '수당계산별입금관리', '수당계산별주문관리'
        ];
        commissionItems.forEach(item => {
          menuItems.push({
            label: item,
            path: `/mlm/commission/${item.toLowerCase().replace(/\s+/g, '-')}`,
            parentLabel: '수당계산'
          });
        });

        // 수당지급
        menuItems.push({
          label: '수당지급',
          path: '/mlm/payout'
        });
        const payoutItems = [
          '수당지급등록', '수당지급검색', '수당지급수정', '수당지급승인',
          '수당지급별통계', '수당지급별입금관리', '수당지급별주문관리'
        ];
        payoutItems.forEach(item => {
          menuItems.push({
            label: item,
            path: `/mlm/payout/${item.toLowerCase().replace(/\s+/g, '-')}`,
            parentLabel: '수당지급'
          });
        });

        // 데이터분석/통계
        menuItems.push({
          label: '데이터분석/통계',
          path: '/mlm/analytics'
        });
        const analyticsItems = [
          '매출통계', '회원통계', '상품통계', '주문통계', '입금통계',
          '배송통계', '재고통계', 'SMS통계', '공제조합통계', '수당통계'
        ];
        analyticsItems.forEach(item => {
          menuItems.push({
            label: item,
            path: `/mlm/analytics/${item.toLowerCase().replace(/\s+/g, '-')}`,
            parentLabel: '데이터분석/통계'
          });
        });

        // 시스템관리
        menuItems.push({
          label: '시스템관리',
          path: '/mlm/system'
        });
        const systemItems = [
          '사용자관리', '권한관리', '시스템설정', '로그관리', '백업관리',
          '시스템모니터링', '시스템점검', '시스템업데이트'
        ];
        systemItems.forEach(item => {
          menuItems.push({
            label: item,
            path: `/mlm/system/${item.toLowerCase().replace(/\s+/g, '-')}`,
            parentLabel: '시스템관리'
          });
        });

        // 참고사이트
        menuItems.push({
          label: '참고사이트',
          path: '/dashboard/mlm/reference-sites'
        });
        const referenceItems = [
          '누리인포스 홈페이지', '누리인포스 연락처', '온라인방판이란?', '온라인 도움말',
          '직접판매공제조합', '특수판매공제조합', '한국직접판매협회', '공정거래위원회',
          '소비자보호원', '법제처', '방문판매등에관한법률', '판례소개',
          '네이버', '다음', '네이트', '야후'
        ];
        referenceItems.forEach(item => {
          menuItems.push({
            label: item,
            path: `/dashboard/mlm/reference-sites/${item.toLowerCase().replace(/\s+/g, '-')}`,
            parentLabel: '참고사이트'
          });
        });

        break;
      default:
        break;
    }

    return menuItems;
  };

  // 검색 로직
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    
    if (query.trim() === '') {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    const allItems = getAllMenuItems();
    const filtered = allItems.filter(item => 
      item.label.toLowerCase().includes(query.toLowerCase()) ||
      (item.parentLabel && item.parentLabel.toLowerCase().includes(query.toLowerCase()))
    );

    setSearchResults(filtered.slice(0, 10)); // 최대 10개 결과
    setShowSearchResults(true);
    setSelectedIndex(-1);
  };

  // 키보드 네비게이션
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSearchResults) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < searchResults.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < searchResults.length) {
          navigate(searchResults[selectedIndex].path);
          setShowSearchResults(false);
          setSearchQuery('');
          inputRef.current?.blur();
        }
        break;
      case 'Escape':
        setShowSearchResults(false);
        setSearchQuery('');
        inputRef.current?.blur();
        break;
    }
  };

  // 외부 클릭 감지
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <header className="bg-sky-50 border-b-2 border-sky-200 px-8 py-6 flex items-center justify-between shadow-sm">
      {/* 왼쪽 영역 - 검색 */}
      <div className="flex items-center space-x-6">
        <div className="relative" ref={searchRef}>
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            ref={inputRef}
            type="text"
            placeholder="메뉴 검색..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => searchQuery && setShowSearchResults(true)}
            className="pl-12 pr-4 py-3 w-96 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all duration-200 bg-gray-50 focus:bg-white"
          />
          
          {/* 검색 결과 드롭다운 */}
          {showSearchResults && searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white/80 backdrop-blur-md rounded-xl shadow-2xl border border-gray-200/50 overflow-hidden z-50">
              <div className="max-h-80 overflow-y-auto">
                {searchResults.map((item, index) => (
                  <button
                    key={`${item.path}-${index}`}
                    onClick={() => {
                      navigate(item.path);
                      setShowSearchResults(false);
                      setSearchQuery('');
                      inputRef.current?.blur();
                    }}
                    className={`w-full px-4 py-3 text-left hover:bg-white/50 transition-colors duration-150 flex items-center justify-between ${
                      index === selectedIndex ? 'bg-blue-50/70 border-l-4 border-blue-500' : ''
                    }`}
                  >
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-gray-900">{item.label}</span>
                      {item.parentLabel && (
                        <span className="text-xs text-gray-500 mt-1">{item.parentLabel}</span>
                      )}
                    </div>
                    <ArrowRight className="h-4 w-4 text-gray-400" />
                  </button>
                ))}
              </div>
              
              {/* 검색 결과 하단 정보 */}
              <div className="px-4 py-2 bg-gray-50/70 backdrop-blur-sm border-t border-gray-200/50">
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>{searchResults.length}개 결과</span>
                  <div className="flex items-center space-x-2">
                    <span>↑↓</span>
                    <span>선택</span>
                    <span>Esc</span>
                    <span>닫기</span>
                  </div>
                </div>

        
              </div>
            </div>
          )}
          
          {/* 검색 결과가 없을 때 */}
          {showSearchResults && searchResults.length === 0 && searchQuery.trim() !== '' && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white/80 backdrop-blur-md rounded-xl shadow-2xl border border-gray-200/50 z-50">
              <div className="px-4 py-6 text-center">
                <Search className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500">검색 결과가 없습니다</p>
                <p className="text-xs text-gray-400 mt-1">다른 키워드로 검색해보세요</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 오른쪽 영역 - 알림, 설정, 사용자 메뉴 */}
      <div className="flex items-center space-x-6">
        {/* 알림 */}
        <button className="relative p-3 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-200">
          <Bell className="h-6 w-6" />
          <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center font-bold shadow-lg">
            3
          </span>
        </button>

        {/* 설정 */}
        <button className="p-3 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-200">
          <Settings className="h-6 w-6" />
        </button>

        {/* 사용자 메뉴 */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center space-x-4 p-3 text-gray-700 hover:bg-gray-50 rounded-xl transition-all duration-200 border-2 border-transparent hover:border-gray-200"
          >
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-lg">
              <User className="h-6 w-6 text-white" />
            </div>
            <div className="text-left">
              <p className="text-sm font-bold text-gray-900">{user?.name}</p>
              <p className="text-xs text-gray-500 font-medium">{user?.role}</p>
            </div>
            <ChevronDown className="h-5 w-5 text-gray-400" />
          </button>

          {/* 사용자 드롭다운 메뉴 */}
          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-strong border border-secondary-200 py-2 z-50">
              {/* 사용자 정보 */}
              <div className="px-4 py-3 border-b border-secondary-200">
                <p className="font-medium text-secondary-900">{user?.name}</p>
                <p className="text-sm text-secondary-600">{user?.email}</p>
                {user?.companyName && (
                  <p className="text-sm text-secondary-500">{user.companyName}</p>
                )}
              </div>

              {/* 메뉴 항목들 */}
              <div className="py-2">
                <button className="w-full px-4 py-2 text-left text-sm text-secondary-700 hover:bg-secondary-50 flex items-center space-x-2">
                  <User className="h-4 w-4" />
                  <span>프로필</span>
                </button>
                <button className="w-full px-4 py-2 text-left text-sm text-secondary-700 hover:bg-secondary-50 flex items-center space-x-2">
                  <Settings className="h-4 w-4" />
                  <span>설정</span>
                </button>
                <div className="border-t border-secondary-200 my-2"></div>
                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-2 text-left text-sm text-error-600 hover:bg-error-50 flex items-center space-x-2"
                >
                  <LogOut className="h-4 w-4" />
                  <span>로그아웃</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 오버레이 - 드롭다운 메뉴 닫기 */}
      {(showUserMenu || showSearchResults) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setShowUserMenu(false);
            setShowSearchResults(false);
          }}
        />
      )}
    </header>
  );
};

export default Header;


