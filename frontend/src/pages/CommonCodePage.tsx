import React, { useState, useEffect } from 'react';
import { Search, Plus, Trash2, Save, RefreshCw } from 'lucide-react';
import apiService from '../services/api';

interface CommonCode {
  codeDivision: string;
  code: string;
  codeName: string;
  codeValueNum?: number;
  codeValueStr?: string;
  sortOrder: number;
  useYn: string;
  remark?: string;
  regDate?: string;
  modDate?: string;
  regUser?: string;
  modUser?: string;
}

const CommonCodePage: React.FC = () => {
  const [rootCodes, setRootCodes] = useState<CommonCode[]>([]);
  const [selectedDivision, setSelectedDivision] = useState<string>('');
  const [commonCodes, setCommonCodes] = useState<CommonCode[]>([]);
  const [selectedCodes, setSelectedCodes] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // ROOT 코드 목록 조회
  const fetchRootCodes = async () => {
    try {
      const rootList = await apiService.getCommonCodeRoots();
      const safeList = Array.isArray(rootList) ? rootList : [];
      setRootCodes(safeList);
      console.log('ROOT 코드 목록:', safeList);
      if (safeList.length === 0) {
        console.warn('ROOT 코드 목록이 비어있습니다.');
      }
    } catch (error: any) {
      console.error('ROOT 코드 조회 오류:', error);
      showMessage('error', `ROOT 코드 조회 중 오류가 발생했습니다: ${error.message || '네트워크 오류'}`);
      setRootCodes([]);
    }
  };

  // 선택된 코드구분의 공통코드 조회
  const fetchCommonCodes = async (division: string) => {
    setLoading(true);
    try {
      const codes = await apiService.getCommonCodesByDivision(division);
      const safeCodes = Array.isArray(codes) ? codes : [];
      setCommonCodes(safeCodes);
      setSelectedCodes(new Set());
      console.log(`공통코드 조회 성공: ${safeCodes.length}개`);
    } catch (error: any) {
      console.error('공통코드 조회 오류:', error);
      showMessage('error', `공통코드 조회 중 오류가 발생했습니다: ${error.message || '네트워크 오류'}`);
      setCommonCodes([]);
    } finally {
      setLoading(false);
    }
  };

  // 메시지 표시
  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  // 조회 버튼 클릭
  const handleSearch = () => {
    fetchCommonCodes(selectedDivision);
  };

  // 추가 버튼 클릭
  const handleAdd = () => {
    if (!selectedDivision) {
      showMessage('error', '코드구분을 먼저 선택하세요.');
      return;
    }
    
    const newCode: CommonCode = {
      codeDivision: selectedDivision,
      code: '',
      codeName: '',
      sortOrder: commonCodes.length + 1,
      useYn: 'Y'
    };
    setCommonCodes([...commonCodes, newCode]);
  };

  // 삭제 버튼 클릭
  const handleDelete = async () => {
    if (selectedCodes.size === 0) {
      showMessage('error', '삭제할 항목을 선택해주세요.');
      return;
    }

    if (!window.confirm(`선택된 ${selectedCodes.size}개 항목을 삭제하시겠습니까?`)) {
      return;
    }

    try {
      const codeIds = Array.from(selectedCodes);
      await apiService.deleteCommonCodes(codeIds);
      showMessage('success', '공통코드가 성공적으로 삭제되었습니다.');
      fetchCommonCodes(selectedDivision);
    } catch (error) {
      console.error('삭제 오류:', error);
      showMessage('error', '공통코드 삭제 중 오류가 발생했습니다.');
    }
  };

  // 저장 버튼 클릭
  const handleSave = async () => {
    try {
      // 선택된 코드구분만 전송
      const filteredCodes = selectedDivision 
        ? commonCodes.filter(c => c.codeDivision === selectedDivision)
        : commonCodes;
      
      // 빈 코드나 코드명이 있는지 검증
      for (const code of filteredCodes) {
        if (!code.code || code.code.trim() === '') {
          showMessage('error', '코드를 입력해주세요.');
          return;
        }
        if (!code.codeName || code.codeName.trim() === '') {
          showMessage('error', '코드명을 입력해주세요.');
          return;
        }
      }

      await apiService.saveCommonCodes(filteredCodes);
      showMessage('success', '공통코드가 성공적으로 저장되었습니다.');
      fetchCommonCodes(selectedDivision);
    } catch (error) {
      console.error('저장 오류:', error);
      showMessage('error', '공통코드 저장 중 오류가 발생했습니다.');
    }
  };

  // 체크박스 선택/해제
  const handleSelectCode = (codeId: string) => {
    const newSelected = new Set(selectedCodes);
    if (newSelected.has(codeId)) {
      newSelected.delete(codeId);
    } else {
      newSelected.add(codeId);
    }
    setSelectedCodes(newSelected);
  };

  // 전체 선택/해제
  const handleSelectAll = () => {
    if (selectedCodes.size === commonCodes.length) {
      setSelectedCodes(new Set());
    } else {
      const allIds = commonCodes.map(code => `${code.codeDivision}_${code.code}`);
      setSelectedCodes(new Set(allIds));
    }
  };

  // 코드구분 변경
  const handleDivisionChange = (division: string) => {
    setSelectedDivision(division);
  };

  // 그리드 데이터 변경
  const handleGridChange = (index: number, field: keyof CommonCode, value: any) => {
    const newCodes = [...commonCodes];
    newCodes[index] = { ...newCodes[index], [field]: value };
    setCommonCodes(newCodes);
  };

  // 컴포넌트 마운트 시 ROOT 코드 조회
  useEffect(() => {
    fetchRootCodes();
  }, []);

  return (
    <div className="space-y-6">
      {/* 페이지 제목 */}
      <div className="bg-sky-50 rounded-xl shadow-lg border border-sky-200 p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">공통코드 등록</h1>
        <p className="text-gray-600">
          시스템에서 사용하는 각종 공통코드 및 명칭을 등록하는 메뉴입니다. 
          공통코드는 기초코드와 비슷한 성격을 가진 항목입니다.
        </p>
      </div>

      {/* 버튼 영역 */}
      <div className="bg-sky-50 rounded-xl shadow-lg border border-sky-200 p-4">
        <div className="flex items-center space-x-4">
          <button
            onClick={handleSearch}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Search className="h-4 w-4" />
            <span>조회</span>
          </button>
          
          <button
            onClick={handleAdd}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>추가</span>
          </button>
          
          <button
            onClick={handleDelete}
            className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <Trash2 className="h-4 w-4" />
            <span>삭제</span>
          </button>
          
          <button
            onClick={handleSave}
            className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <Save className="h-4 w-4" />
            <span>저장</span>
          </button>
        </div>
      </div>

      {/* 메시지 */}
      {message && (
        <div className={`p-4 rounded-lg ${
          message.type === 'success' 
            ? 'bg-green-50 border border-green-200 text-green-800' 
            : 'bg-red-50 border border-red-200 text-red-800'
        }`}>
          {message.text}
        </div>
      )}

      {/* 조건 영역 */}
      <div className="bg-sky-50 rounded-xl shadow-lg border border-sky-200 p-4">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">코드구분:</label>
            <select
              value={selectedDivision}
              onChange={(e) => handleDivisionChange(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">전체</option>
              <option value="ROOT">ROOT</option>
              {rootCodes.map((root) => (
                <option key={root.code} value={root.code}>
                  {root.code} - {root.codeName}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 그리드 영역 */}
      <div className="bg-sky-50 rounded-xl shadow-lg border border-sky-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="h-8 w-8 text-blue-600 animate-spin" />
            <span className="ml-2 text-gray-600">데이터를 불러오는 중...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <colgroup>
                <col className="w-10" />
                <col className="w-32" />
                <col className="w-40" />
                <col className="w-64" />
                <col className="w-24" />
                <col className="w-28" />
                <col />
              </colgroup>
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedCodes.size === commonCodes.length && commonCodes.length > 0}
                      onChange={handleSelectAll}
                      className="rounded border-gray-300"
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">코드구분</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">코드</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">코드명</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">정렬순서</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">사용여부</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">비고</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {commonCodes.map((code, index) => {
                  const codeId = `${code.codeDivision}_${code.code}`;
                  return (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selectedCodes.has(codeId)}
                          onChange={() => handleSelectCode(codeId)}
                          className="rounded border-gray-300"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-gray-900">{code.codeDivision}</span>
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="text"
                          value={code.code || ''}
                          maxLength={20}
                          onChange={(e) => handleGridChange(index, 'code', e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="text"
                          value={code.codeName || ''}
                          onChange={(e) => handleGridChange(index, 'codeName', e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          inputMode="numeric"
                          min={0}
                          max={999}
                          value={code.sortOrder || 0}
                          onChange={(e) => {
                            const v = e.target.value.slice(0, 3);
                            const n = Math.min(999, Math.max(0, parseInt(v) || 0));
                            handleGridChange(index, 'sortOrder', n);
                          }}
                          className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-center"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={code.useYn || 'Y'}
                          onChange={(e) => handleGridChange(index, 'useYn', e.target.value)}
                          className="px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="Y">사용</option>
                          <option value="N">미사용</option>
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="text"
                          value={code.remark || ''}
                          onChange={(e) => handleGridChange(index, 'remark', e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            
            {commonCodes.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                조회된 데이터가 없습니다.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CommonCodePage;

