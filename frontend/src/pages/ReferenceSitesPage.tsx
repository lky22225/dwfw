import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ExternalLink } from 'lucide-react';

type ReferenceLink = {
  label: string;
  url: string;
  key: string;
};

const links: ReferenceLink[] = [
  { label: '누리인포스 홈페이지', url: 'https://www.nis.co.kr', key: 'nuriinfos-homepage' },
  { label: '누리인포스 연락처', url: 'https://www.nis.co.kr/move/contact/contact4.html', key: 'nuriinfos-contact' },
  { label: '온라인방판이란?', url: 'https://www.nis.co.kr', key: 'what-is-online-sales' },
  { label: '온라인 도움말', url: 'https://www.nis.co.kr', key: 'online-help' },
  { label: '직접판매공제조합', url: 'https://www.macco.or.kr', key: 'direct-selling-association' },
  { label: '특수판매공제조합', url: 'https://www.kossa.or.kr', key: 'special-selling-association' },
  { label: '한국직접판매협회', url: 'https://www.kdsa.or.kr', key: 'korea-direct-selling-association' },
  { label: '공정거래위원회', url: 'https://www.ftc.go.kr', key: 'fair-trade-commission' },
  { label: '소비자보호원', url: 'https://www.kca.go.kr', key: 'consumer-protection-agency' },
  { label: '법제처', url: 'https://www.moleg.go.kr', key: 'ministry-of-legislation' },
  { label: '방문판매등에관한법률', url: 'http://www.law.go.kr/LSW/lsSc.do?mouseY=443&menuId=0&p1=&subMenu=1&searchChk=2&lawSearchName=LicLs%2C0&query=%EB%B0%A9%EB%AC%B8%ED%8C%90%EB%A7%A4%EB%93%B1%EC%97%90%EA%B4%80%ED%95%9C%EB%B2%95%EB%A5%A0#', key: 'door-to-door-sales-act' },
  { label: '판례소개', url: 'https://www.ftc.go.kr', key: 'case-law-introduction' },
  { label: '네이버', url: 'https://www.naver.com', key: 'naver' },
  { label: '다음', url: 'https://www.daum.net', key: 'daum' },
  { label: '네이트', url: 'https://www.nate.com', key: 'nate' },
  { label: '야후', url: 'https://www.yahoo.co.kr', key: 'yahoo' }
];

const ReferenceSitesPage: React.FC = () => {
  const { site } = useParams<{ site: string }>();
  const navigate = useNavigate();

  // 특정 사이트가 선택된 경우
  if (site) {
    const selectedLink = links.find(link => link.key === site);
    
    if (selectedLink) {
      return (
        <div className="space-y-4">
          {/* 헤더 */}
          <div className="bg-sky-50 rounded-xl shadow-lg border border-sky-200 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => navigate('/dashboard/mlm/reference-sites')}
                  className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>목록으로 돌아가기</span>
                </button>
                <div className="h-6 w-px bg-gray-300"></div>
                <h1 className="text-xl font-bold text-gray-900">{selectedLink.label}</h1>
              </div>
              <a
                href={selectedLink.url}
                target="_blank"
                rel="noreferrer noopener"
                className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 transition-colors"
              >
                <ExternalLink className="h-4 w-4" />
                <span>새 탭에서 열기</span>
              </a>
            </div>
          </div>

          {/* iframe */}
          <div className="bg-sky-50 rounded-xl shadow-lg border border-sky-200 overflow-hidden p-2">
            <iframe
              src={selectedLink.url}
              className="w-full border-0 rounded-lg"
              style={{ height: 'calc(100vh - 120px)' }}
              title={selectedLink.label}
              sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
            />
          </div>
        </div>
      );
    }
  }

  // 기본 목록 페이지
  return (
    <div className="space-y-8">
      <div className="bg-sky-50 rounded-2xl shadow-lg border border-sky-200 p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">참고사이트</h1>
        <p className="text-gray-600 mb-6">자주 사용하는 외부 참고 사이트 모음입니다. 클릭하면 컨텐츠 영역에서 바로 확인할 수 있습니다.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {links.map((item, idx) => (
            <button
              key={idx}
              onClick={() => navigate(`/dashboard/mlm/reference-sites/${item.key}`)}
              className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl border border-gray-100 hover:shadow-md hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-200 text-left"
            >
              <span className="font-medium text-gray-900">{item.label}</span>
              <ExternalLink className="h-4 w-4 text-blue-600" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ReferenceSitesPage;


