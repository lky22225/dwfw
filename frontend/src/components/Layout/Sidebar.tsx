import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  ChevronDown, 
  ChevronRight, 
  Building2, 
  ShoppingCart, 
  FileText, 
  Shield,
  Home,
  Users,
  CreditCard,
  Truck,
  Package,
  MessageSquare,
  Briefcase,
  Calculator,
  Wallet,
  BarChart,
  Settings,
  Globe
} from 'lucide-react';

interface MenuItemProps {
  label: string;
  path: string;
  icon: React.ReactNode;
  children?: { label: string; path: string }[];
}

const Sidebar: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [expandedMenus, setExpandedMenus] = useState<{ [key: string]: boolean }>({});

  const toggleMenu = (menuKey: string) => {
    setExpandedMenus(prev => {
      const newState = { ...prev };
      // 다른 메뉴들을 모두 닫고 현재 메뉴만 토글
      Object.keys(newState).forEach(key => {
        if (key !== menuKey) {
          newState[key] = false;
        }
      });
      newState[menuKey] = !prev[menuKey];
      return newState;
    });
  };

  const getMenuItems = (): MenuItemProps[] => {
    if (!user) return [];

    switch (user.role) {
      case 'SYSTEM_ADMIN':
        return [
          {
            label: '대시보드',
            path: '/dashboard',
            icon: <Home className="h-5 w-5" />
          },
          {
            label: '기초정보',
            path: '/mlm/basic',
            icon: <Building2 className="h-5 w-5" />,
            children: [
              { label: '기초코드등록', path: '/dashboard/mlm/basic/base-codes' },
              { label: '공통코드등록', path: '/dashboard/mlm/basic/common-codes' },
              { label: '은행코드등록', path: '/dashboard/mlm/basic/bank-codes' },
              { label: '은행등록', path: '/mlm/basic/banks' },
              { label: '카드사용', path: '/mlm/basic/cards' },
              { label: '입금계좌등록', path: '/mlm/basic/deposit-accounts' },
              { label: '휴일등록', path: '/mlm/basic/holidays' },
              { label: '직급등록', path: '/mlm/basic/positions' },
              { label: '센터등록', path: '/mlm/basic/centers' },
              { label: '거래처등록', path: '/mlm/basic/partners' },
              { label: '거래처검색', path: '/mlm/basic/partner-search' },
              { label: '거래처담당자일람', path: '/mlm/basic/partner-contacts' },
              { label: '우편번호검색', path: '/mlm/basic/zip-search' },
              { label: '우편번호업데이트', path: '/mlm/basic/zip-update' }
            ]
          },
          {
            label: '상품관리',
            path: '/mlm/product',
            icon: <ShoppingCart className="h-5 w-5" />,
            children: [
              { label: '카테고리등록', path: '/mlm/product/categories' },
              { label: '상품등록', path: '/mlm/product/items' },
              { label: '판매금액변경', path: '/mlm/product/price-change' },
              { label: '자재등록상품설정', path: '/mlm/product/material-mapping' },
              { label: '추가지급상품설정', path: '/mlm/product/additional-mapping' },
              { label: '상품검색', path: '/mlm/product/search' },
              { label: '상품가격표', path: '/mlm/product/price-list' },
              { label: '상품관리대장', path: '/mlm/product/ledger' },
              { label: '공급처정보조회', path: '/mlm/product/suppliers' },
              { label: '카테고리별 조회', path: '/mlm/product/category-report' },
              { label: '자재등록', path: '/mlm/product/materials' },
              { label: '자재검색', path: '/mlm/product/materials-search' },
              { label: 'BOM등록', path: '/mlm/product/bom' },
              { label: 'BOM리스트', path: '/mlm/product/bom-list' },
              { label: '상품별구성내역조회', path: '/mlm/product/item-components' },
              { label: '자재별구성내역조회', path: '/mlm/product/material-components' }
            ]
          },
          {
            label: '회원관리',
            path: '/mlm/member',
            icon: <Users className="h-5 w-5" />,
            children: [
              { label: '회원등록', path: '/mlm/member/register' },
              { label: '회원수정등록', path: '/mlm/member/edit' },
              { label: '회원가입승인처리', path: '/mlm/member/approve' },
              { label: '회원종합정보', path: '/mlm/member/overview' },
              { label: '회원검색', path: '/mlm/member/search' },
              { label: '개인정보변경', path: '/mlm/member/privacy' },
              { label: '회원정보변경', path: '/mlm/member/info' },
              { label: '사업자정보변경', path: '/mlm/member/bizinfo' },
              { label: '센터이관변경', path: '/mlm/member/center-transfer' },
              { label: '패스워드변경', path: '/mlm/member/password' },
              { label: '직급승급/강등처리', path: '/mlm/member/rank-change' },
              { label: '변경이력조회', path: '/mlm/member/change-log' },
              { label: '박스계보도', path: '/mlm/member/box-tree' },
              { label: '라인계보도', path: '/mlm/member/line-tree' },
              { label: '트리계보도', path: '/mlm/member/tree' },
              { label: '바이너리계보도', path: '/mlm/member/binary-tree' },
              { label: '바이너리회원일람', path: '/mlm/member/binary-list' },
              { label: '바이너리주문일람', path: '/mlm/member/binary-orders' },
              { label: '바이너리계좌자일람', path: '/mlm/member/binary-accounts' },
              { label: '3레그계보도', path: '/mlm/member/threeleg-tree' },
              { label: '3레그회원일람', path: '/mlm/member/threeleg-list' },
              { label: '3레그정산일람', path: '/mlm/member/threeleg-settlements' },
              { label: '3레그직급자일람', path: '/mlm/member/threeleg-ranks' },
              { label: '회원마감', path: '/mlm/member/close' }
            ]
          },
          {
            label: '회원관리II',
            path: '/mlm/member-ii',
            icon: <FileText className="h-5 w-5" />,
            children: [
              { label: '체크리스트', path: '/mlm/member-ii/checklist' },
              { label: '상담일람', path: '/mlm/member-ii/counsels' },
              { label: '상담등록', path: '/mlm/member-ii/counsel-new' },
              { label: '상담집행내역조회', path: '/mlm/member-ii/counsel-exec' },
              { label: '상담분석', path: '/mlm/member-ii/counsel-analytics' },
              { label: 'DM라벨인쇄', path: '/mlm/member-ii/dm-label' },
              { label: '회원우품증인쇄', path: '/mlm/member-ii/cert-print' },
              { label: '회원일수집계', path: '/mlm/member-ii/day-aggregate' },
              { label: '생일자일람', path: '/mlm/member-ii/birthdays' },
              { label: '서류미제출자일람', path: '/mlm/member-ii/unsubmitted' },
              { label: '출근등록', path: '/mlm/member-ii/attendance' },
              { label: '출근조회및집계', path: '/mlm/member-ii/attendance-report' },
              { label: '교육원정등록', path: '/mlm/member-ii/academy-register' },
              { label: '교육참가등록', path: '/mlm/member-ii/academy-join' },
              { label: '교육참가자조회', path: '/mlm/member-ii/academy-attendees' },
              { label: '교육참가자등록', path: '/mlm/member-ii/academy-attendee-new' },
              { label: '교육참가자조회(선택)', path: '/mlm/member-ii/academy-attendees-select' },
              { label: '소비자주문등록(인력)', path: '/mlm/member-ii/customer-order-staff' },
              { label: '소비자주문등록(선택)', path: '/mlm/member-ii/customer-order-select' },
              { label: '소비자주문현황', path: '/mlm/member-ii/customer-orders' },
              { label: '소비자상세', path: '/mlm/member-ii/customer-detail' },
              { label: '소비자검색', path: '/mlm/member-ii/customer-search' },
              { label: '소비자종합정보조회', path: '/mlm/member-ii/customer-overview' }
            ]
          },
          {
            label: '주문관리',
            path: '/mlm/order',
            icon: <ShoppingCart className="h-5 w-5" />,
            children: [
              { label: '주문등록(간편결제)', path: '/mlm/order/simple-payment' },
              { label: '주문등록(상세결제)', path: '/mlm/order/detailed-payment' },
              { label: '주문등록(결제없음)', path: '/mlm/order/no-payment' },
              { label: '주문승인처리', path: '/mlm/order/approval' },
              { label: '교환/반품등록', path: '/mlm/order/exchange-return' },
              { label: '주문검색', path: '/mlm/order/search' },
              { label: '주문상품검색', path: '/mlm/order/product-search' },
              { label: '영업일보', path: '/mlm/order/daily-report' },
              { label: '영업월보', path: '/mlm/order/monthly-report' },
              { label: '일일주문내역서', path: '/mlm/order/daily-statement' },
              { label: '월간주문카렌다', path: '/mlm/order/monthly-calendar' },
              { label: '회원별주문조회', path: '/mlm/order/member-inquiry' },
              { label: '센터별주문조회', path: '/mlm/order/center-inquiry' },
              { label: '상품별주문조회', path: '/mlm/order/product-inquiry' },
              { label: '미구입자일람', path: '/mlm/order/non-purchasers' },
              { label: '기간별주문집계', path: '/mlm/order/period-aggregation' },
              { label: '회원별주문집계', path: '/mlm/order/member-aggregation' },
              { label: '레그별주문집계', path: '/mlm/order/leg-aggregation' },
              { label: '센터별주문집계', path: '/mlm/order/center-aggregation' },
              { label: '지역별주문집계', path: '/mlm/order/region-aggregation' },
              { label: '상품별주문집계', path: '/mlm/order/product-aggregation' }
            ]
          },
          {
            label: '입금관리',
            path: '/mlm/deposit',
            icon: <CreditCard className="h-5 w-5" />,
            children: [
              { label: '입금등록', path: '/mlm/deposit/registration' },
              { label: '입금내역조회', path: '/mlm/deposit/history' },
              { label: '입금처리', path: '/mlm/deposit/processing' },
              { label: '입금처리내역조회', path: '/mlm/deposit/processing-history' },
              { label: '미입금주문', path: '/mlm/deposit/unpaid-orders' },
              { label: '카드결제내역조회', path: '/mlm/deposit/card-payment-history' },
              { label: '카드사별집계', path: '/mlm/deposit/card-company-aggregation' },
              { label: '선수금/외상매출금', path: '/mlm/deposit/advance-receivable' }
            ]
          },
          {
            label: '물류관리',
            path: '/mlm/logistics',
            icon: <Truck className="h-5 w-5" />,
            children: [
              { label: '출고지시등록', path: '/mlm/logistics/shipment-instruction' },
              { label: '출고지시조회', path: '/mlm/logistics/shipment-inquiry' },
              { label: '미출고지시조회', path: '/mlm/logistics/unshipped-instruction' },
              { label: '미출고내역조회', path: '/mlm/logistics/unshipped-history' },
              { label: '미출고상품집계', path: '/mlm/logistics/unshipped-product-aggregation' },
              { label: '출고완료등록', path: '/mlm/logistics/shipment-completion' },
              { label: '출고완료조회', path: '/mlm/logistics/shipment-completion-inquiry' },
              { label: '송장/명세서인쇄', path: '/mlm/logistics/invoice-printing' },
              { label: '배송조회', path: '/mlm/logistics/delivery-tracking' },
              { label: '센터출고등록', path: '/mlm/logistics/center-shipment' },
              { label: '센터입고처리', path: '/mlm/logistics/center-receipt' },
              { label: '센터입출고조회', path: '/mlm/logistics/center-inout-inquiry' },
              { label: '발주서작성', path: '/mlm/logistics/purchase-order-creation' },
              { label: '발주입고처리', path: '/mlm/logistics/purchase-order-receipt' },
              { label: '발주서검색', path: '/mlm/logistics/purchase-order-search' },
              { label: '발주품목검색', path: '/mlm/logistics/purchase-item-search' },
              { label: '발주입고집계', path: '/mlm/logistics/purchase-receipt-aggregation' },
              { label: '발주미입고집계', path: '/mlm/logistics/unreceived-purchase-aggregation' }
            ]
          },
          {
            label: '재고관리',
            path: '/mlm/inventory',
            icon: <Package className="h-5 w-5" />,
            children: [
              { label: '입출고현황조회', path: '/mlm/inventory/inout-status' },
              { label: '재고수불부조회', path: '/mlm/inventory/ledger' },
              { label: '재고현황조회', path: '/mlm/inventory/status' },
              { label: '부족재고일람', path: '/mlm/inventory/insufficient-list' },
              { label: '실시간재고조회', path: '/mlm/inventory/realtime' },
              { label: '일일생산등록', path: '/mlm/inventory/daily-production' },
              { label: '일일생산일람', path: '/mlm/inventory/daily-production-list' },
              { label: '재고조정등록', path: '/mlm/inventory/adjustment' },
              { label: '재고조정조회', path: '/mlm/inventory/adjustment-inquiry' },
              { label: '기초재고등록', path: '/mlm/inventory/initial-registration' }
            ]
          },
          {
            label: 'SMS관리',
            path: '/mlm/sms',
            icon: <MessageSquare className="h-5 w-5" />,
            children: [
              { label: '문자보내기(개인)', path: '/mlm/sms/send-individual' },
              { label: 'SMS전화번호부 등록', path: '/mlm/sms/phonebook-register' },
              { label: '문자보내기(그룹)', path: '/mlm/sms/send-group' },
              { label: '문자보내기(대량전송)', path: '/mlm/sms/send-bulk' },
              { label: '완료실패 조회', path: '/mlm/sms/view-completion-failure' },
              { label: '대기발송중 조회', path: '/mlm/sms/view-pending-shipments' },
              { label: '사용집계 후불제', path: '/mlm/sms/usage-summary-postpaid' },
              { label: '사용집계 선불제', path: '/mlm/sms/usage-summary-prepaid' },
              { label: '월간사용 카렌다', path: '/mlm/sms/monthly-usage-calendar' },
              { label: '월별 사용량분석', path: '/mlm/sms/monthly-usage-analysis' },
              { label: '포인트충전', path: '/mlm/sms/point-recharge' },
              { label: '개인별 사용집계', path: '/mlm/sms/individual-usage-summary' },
              { label: '전체사용집계', path: '/mlm/sms/overall-usage-summary' }
            ]
          },
          {
            label: '공제조합',
            path: '/mlm/mutual-aid',
            icon: <Briefcase className="h-5 w-5" />,
            children: [
              { label: '매출신고', path: '/mlm/mutual-aid/sales-report' },
              { label: '출고신고', path: '/mlm/mutual-aid/shipment-report' },
              { label: '신고내역조회', path: '/mlm/mutual-aid/view-report-details' },
              { label: '신고오류데이터조회', path: '/mlm/mutual-aid/view-report-error-data' },
              { label: '필수교육이수자', path: '/mlm/mutual-aid/mandatory-education-completers' }
            ]
          },
          {
            label: '수당계산',
            path: '/mlm/commission-calc',
            icon: <Calculator className="h-5 w-5" />,
            children: [
              { label: '수당계산', path: '/mlm/commission-calc/calculate' },
              { label: '수당계산집계조회', path: '/mlm/commission-calc/summary' },
              { label: '수당계산내역확인', path: '/mlm/commission-calc/confirm-details' },
              { label: '수당계산내역조회', path: '/mlm/commission-calc/view-details' },
              { label: '수당계산내역추적', path: '/mlm/commission-calc/track-details' },
              { label: '수당계산카렌다', path: '/mlm/commission-calc/calendar' },
              { label: '수당계산내역집계', path: '/mlm/commission-calc/details-summary' },
              { label: '회원별계산조회', path: '/mlm/commission-calc/member-wise' },
              { label: '지급율신고조회', path: '/mlm/commission-calc/payment-rate-report' },
              { label: '승급자/강등자조회', path: '/mlm/commission-calc/promoted-demoted' },
              { label: '기간별계산집계', path: '/mlm/commission-calc/period-wise-summary' },
              { label: '회원별계산집계', path: '/mlm/commission-calc/member-wise-summary' },
              { label: '센터별계산집계', path: '/mlm/commission-calc/center-wise-summary' },
              { label: '위촉직급등록', path: '/mlm/commission-calc/register-position' },
              { label: '인정주문등록', path: '/mlm/commission-calc/register-order' },
              { label: '수당명칭설정', path: '/mlm/commission-calc/set-name' }
            ]
          },
          {
            label: '수당지급',
            path: '/mlm/commission-pay',
            icon: <Wallet className="h-5 w-5" />,
            children: [
              { label: '수당지급계산', path: '/mlm/commission-pay/calculate' },
              { label: '수당지급집계조회', path: '/mlm/commission-pay/summary' },
              { label: '수당지급내역확인', path: '/mlm/commission-pay/confirm-details' },
              { label: '수당지급내역조회', path: '/mlm/commission-pay/view-details' },
              { label: '수당지급내역집계', path: '/mlm/commission-pay/details-summary' },
              { label: '회원별지급조회', path: '/mlm/commission-pay/member-wise' },
              { label: '센터별지급조회', path: '/mlm/commission-pay/center-wise' },
              { label: '수당지급카렌다', path: '/mlm/commission-pay/calendar' },
              { label: '은행별지불내역서', path: '/mlm/commission-pay/bank-statement' },
              { label: '수당문자전송', path: '/mlm/commission-pay/send-sms' },
              { label: '원천징수내역서', path: '/mlm/commission-pay/withholding-tax' },
              { label: '기간별지급집계', path: '/mlm/commission-pay/period-wise-summary' },
              { label: '회원별지급집계', path: '/mlm/commission-pay/member-wise-summary' },
              { label: '센터별지급집계', path: '/mlm/commission-pay/center-wise-summary' },
              { label: '수당지급액조정', path: '/mlm/commission-pay/adjust-amount' },
              { label: '기타지급/공제액등록', path: '/mlm/commission-pay/register-other' },
              { label: '지불보류등록', path: '/mlm/commission-pay/register-hold' },
              { label: '가지급금등록', path: '/mlm/commission-pay/register-advance' },
              { label: '가지급금관리대장', path: '/mlm/commission-pay/advance-payment-ledger' }
            ]
          },
          {
            label: '데이터분석/통계',
            path: '/mlm/data-analysis',
            icon: <BarChart className="h-5 w-5" />,
            children: [
              { label: '회원전체인수', path: '/mlm/data-analysis/total-members' },
              { label: '직급별인수', path: '/mlm/data-analysis/members-by-position' },
              { label: '센터별인수', path: '/mlm/data-analysis/members-by-center' },
              { label: '지역별인수', path: '/mlm/data-analysis/members-by-region' },
              { label: '연령별인수', path: '/mlm/data-analysis/members-by-age' },
              { label: '일일주문피봇테이블', path: '/mlm/data-analysis/daily-order-pivot' },
              { label: '월별주문피봇테이블', path: '/mlm/data-analysis/monthly-order-pivot' },
              { label: '기간별주문피봇테이블', path: '/mlm/data-analysis/period-order-pivot' },
              { label: '일일주문분석', path: '/mlm/data-analysis/daily-order-analysis' },
              { label: '월별주문분석', path: '/mlm/data-analysis/monthly-order-analysis' },
              { label: '기간별주문분석', path: '/mlm/data-analysis/period-order-analysis' },
              { label: '센터별주문분석', path: '/mlm/data-analysis/center-order-analysis' },
              { label: '지역별주문분석', path: '/mlm/data-analysis/region-order-analysis' },
              { label: '연령별주문분석', path: '/mlm/data-analysis/age-order-analysis' },
              { label: '상품별주문분석', path: '/mlm/data-analysis/product-order-analysis' },
              { label: '결제유형별분석', path: '/mlm/data-analysis/payment-type-analysis' },
              { label: '카드사별분석', path: '/mlm/data-analysis/card-company-analysis' },
              { label: '일일수당분석', path: '/mlm/data-analysis/daily-commission-analysis' },
              { label: '월별수당분석', path: '/mlm/data-analysis/monthly-commission-analysis' },
              { label: '수당지급율분석', path: '/mlm/data-analysis/commission-rate-analysis' },
              { label: '수당지급율신고조회', path: '/mlm/data-analysis/commission-rate-declaration-inquiry' },
              { label: '회원별수당분석', path: '/mlm/data-analysis/member-commission-analysis' },
              { label: '센터별수당분석', path: '/mlm/data-analysis/center-commission-analysis' },
              { label: '직급별수당분석', path: '/mlm/data-analysis/position-commission-analysis' },
              { label: '지역별수당분석', path: '/mlm/data-analysis/region-commission-analysis' },
              { label: '연령별수당분석', path: '/mlm/data-analysis/age-commission-analysis' }
            ]
          },
          {
            label: '시스템관리',
            path: '/mlm/system-management',
            icon: <Settings className="h-5 w-5" />,
            children: [
              { label: '사용자등록', path: '/mlm/system-management/user-registration' },
              { label: '접속자확인', path: '/mlm/system-management/connected-users' },
              { label: '회사정보등록', path: '/mlm/system-management/company-info' },
              { label: '로그조회', path: '/mlm/system-management/log-inquiry' },
              { label: '로그집계', path: '/mlm/system-management/log-aggregation' },
              { label: '실시간로그조회', path: '/mlm/system-management/realtime-log-inquiry' },
              { label: '로그백업', path: '/mlm/system-management/log-backup' },
              { label: '환경설정', path: '/mlm/system-management/environment-settings' },
              { label: '시스템초기화', path: '/mlm/system-management/system-initialization' },
              { label: '시뮬레이션회원등록', path: '/mlm/system-management/simulation-member-registration' },
              { label: '시뮬레이션주문등록', path: '/mlm/system-management/simulation-order-registration' },
              { label: '시뮬레이션데이터삭제', path: '/mlm/system-management/simulation-data-deletion' }
            ]
          },
          {
            label: '참고사이트',
            path: '/dashboard/mlm/reference-sites',
            icon: <Globe className="h-5 w-5" />,
            children: [
              { label: '누리인포스 홈페이지', path: '/dashboard/mlm/reference-sites/nuriinfos-homepage' },
              { label: '누리인포스 연락처', path: '/dashboard/mlm/reference-sites/nuriinfos-contact' },
              { label: '온라인방판이란?', path: '/dashboard/mlm/reference-sites/what-is-online-sales' },
              { label: '온라인 도움말', path: '/dashboard/mlm/reference-sites/online-help' },
              { label: '직접판매공제조합', path: '/dashboard/mlm/reference-sites/direct-selling-association' },
              { label: '특수판매공제조합', path: '/dashboard/mlm/reference-sites/special-selling-association' },
              { label: '한국직접판매협회', path: '/dashboard/mlm/reference-sites/korea-direct-selling-association' },
              { label: '공정거래위원회', path: '/dashboard/mlm/reference-sites/fair-trade-commission' },
              { label: '소비자보호원', path: '/dashboard/mlm/reference-sites/consumer-protection-agency' },
              { label: '법제처', path: '/dashboard/mlm/reference-sites/ministry-of-legislation' },
              { label: '방문판매등에관한법률', path: '/dashboard/mlm/reference-sites/door-to-door-sales-act' },
              { label: '판례소개', path: '/dashboard/mlm/reference-sites/case-law-introduction' },
              { label: '네이버', path: '/dashboard/mlm/reference-sites/naver' },
              { label: '다음', path: '/dashboard/mlm/reference-sites/daum' },
              { label: '네이트', path: '/dashboard/mlm/reference-sites/nate' },
              { label: '야후', path: '/dashboard/mlm/reference-sites/yahoo' }
            ]
          }
        ];

      case 'SYSTEM_USER':
        return [
          {
            label: '대시보드',
            path: '/dashboard',
            icon: <Home className="h-5 w-5" />
          },
          {
            label: '주문관리',
            path: '/user/order',
            icon: <ShoppingCart className="h-5 w-5" />,
            children: [
              { label: '주문관리', path: '/user/orders' },
              { label: '출고관리', path: '/user/shipments' }
            ]
          },
          {
            label: '게시판',
            path: '/user/board',
            icon: <FileText className="h-5 w-5" />,
            children: [
              { label: '공지사항', path: '/user/notices' }
            ]
          }
        ];

      case 'PARTNER_USER':
        return [
          {
            label: '대시보드',
            path: '/dashboard',
            icon: <Home className="h-5 w-5" />
          },
          {
            label: '기준정보',
            path: '/partner/basic',
            icon: <Building2 className="h-5 w-5" />,
            children: [
              { label: '주문관리', path: '/partner/orders' },
              { label: '출고관리', path: '/partner/shipments' }
            ]
          },
          {
            label: '게시판',
            path: '/partner/board',
            icon: <FileText className="h-5 w-5" />,
            children: [
              { label: '공지사항', path: '/partner/notices' }
            ]
          }
        ];

      default:
        return [];
    }
  };

  const menuItems = getMenuItems();

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const handleMenuClick = (path: string, hasChildren?: boolean) => {
    if (hasChildren) {
      const menuKey = path;
      toggleMenu(menuKey);
    } else {
      navigate(path);
    }
  };

  return (
    <aside className="w-72 bg-gradient-to-b from-sky-50 to-sky-100 border-r border-sky-200 flex flex-col shadow-lg">
      {/* 로고 영역 */}
      <div className="p-8 border-b-2 border-gray-100 bg-gradient-to-r from-blue-600 to-indigo-700">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
            <Building2 className="h-7 w-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">DwFw</h1>
            <p className="text-sm text-blue-100 font-medium">관리자 시스템</p>
          </div>
        </div>
      </div>

      {/* 메뉴 영역 */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {menuItems.map((item, index) => (
          <div key={index}>
            {/* 메인 메뉴 항목 */}
            <button
              onClick={() => handleMenuClick(item.path, !!item.children)}
              className={`w-full sidebar-item ${
                isActive(item.path) ? 'active' : ''
              } ${item.children ? 'justify-between' : ''}`}
            >
              <div className="flex items-center space-x-3">
                {item.icon}
                <span className="text-base font-semibold">{item.label}</span>
              </div>
              {item.children && (
                expandedMenus[item.path] ? 
                <ChevronDown className="h-4 w-4" /> : 
                <ChevronRight className="h-4 w-4" />
              )}
            </button>

            {/* 하위 메뉴 */}
            {item.children && expandedMenus[item.path] && (
              <div className="ml-4 mt-1 space-y-0">
                {item.children.map((child, childIndex) => (
                  <button
                    key={childIndex}
                    onClick={() => navigate(child.path)}
                    className={`w-full text-base px-6 py-1.5 rounded-lg transition-all duration-200 text-left ${
                      isActive(child.path) 
                        ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg transform scale-105' 
                        : 'text-gray-600 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:text-blue-700'
                    }`}
                  >
                    <span>{child.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>

      {/* 하단 사용자 정보 */}
      <div className="p-4 border-t border-secondary-200">
        <div className="flex items-center space-x-3 p-3 bg-secondary-50 rounded-lg">
          <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
            <Users className="h-4 w-4 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-secondary-900 truncate">
              {user?.name}
            </p>
            <p className="text-xs text-secondary-500 truncate">
              {user?.role}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;


