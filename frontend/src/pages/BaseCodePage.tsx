import React, { useState, useEffect } from 'react';
import { Search, Plus, Trash2, Save, RefreshCw } from 'lucide-react';
import apiService from '../services/api';

interface BaseCode {
  codeCategory: string;
  code: string;
  codeName: string;
  division1?: string;
  division2?: string;
  division3?: string;
  codeDescription?: string;
  sortOrder: number;
  useYn: string;
  remark?: string;
  itemDefinition?: string;
  discountRate1?: number;
  discountRate2?: number;
  discountRate3?: number;
  amount1?: number;
  amount2?: number;
  amount3?: number;
  image1?: string;
  image2?: string;
  image3?: string;
  regDate?: string;
  modDate?: string;
  regUser?: string;
  modUser?: string;
}

interface CodeCategory {
  codeCategory: string;
  code: string;
  codeName: string;
  codeDescription?: string;
  itemDefinition?: string;
}

const BaseCodePage: React.FC = () => {
  const [codeCategories, setCodeCategories] = useState<CodeCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedCategoryInfo, setSelectedCategoryInfo] = useState<CodeCategory | null>(null);
  const [baseCodes, setBaseCodes] = useState<BaseCode[]>([]);
  const [selectedCodes, setSelectedCodes] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // 코드분류 목록 조회
  const fetchCodeCategories = async () => {
    try {
      const categories = await apiService.getBaseCodeCategories();
      const safeCategories: CodeCategory[] = (Array.isArray(categories) ? categories : []).filter(c => c && c.code && c.codeName);
      const fallback: CodeCategory[] = [
        { codeCategory: 'ROOT', code: '1', codeName: '회원구분' },
        { codeCategory: 'ROOT', code: '2', codeName: '주문구분' },
        { codeCategory: 'ROOT', code: '3', codeName: '주문경로' },
        { codeCategory: 'ROOT', code: '4', codeName: '거래처구분' },
        { codeCategory: 'ROOT', code: '5', codeName: '상담구분' },
        { codeCategory: 'ROOT', code: '6', codeName: '국가구분' },
        { codeCategory: 'ROOT', code: '7', codeName: '이메일' },
        { codeCategory: 'ROOT', code: '8', codeName: '입출고구분' }
      ];
      const finalList = safeCategories.length > 0 ? safeCategories : fallback;
      setCodeCategories(finalList);
      if (finalList.length > 0 && !selectedCategory) {
        setSelectedCategory(finalList[0].code);
        setSelectedCategoryInfo(finalList[0]);
      }
    } catch (error) {
      console.error('코드분류 조회 오류:', error);
      showMessage('error', '코드분류 조회 중 오류가 발생했습니다.');
      // 오류 발생 시 fallback 사용
      const fallback: CodeCategory[] = [
        { codeCategory: 'ROOT', code: '1', codeName: '회원구분' },
        { codeCategory: 'ROOT', code: '2', codeName: '주문구분' },
        { codeCategory: 'ROOT', code: '3', codeName: '주문경로' },
        { codeCategory: 'ROOT', code: '4', codeName: '거래처구분' },
        { codeCategory: 'ROOT', code: '5', codeName: '상담구분' },
        { codeCategory: 'ROOT', code: '6', codeName: '국가구분' },
        { codeCategory: 'ROOT', code: '7', codeName: '이메일' },
        { codeCategory: 'ROOT', code: '8', codeName: '입출고구분' }
      ];
      setCodeCategories(fallback);
      if (fallback.length > 0 && !selectedCategory) {
        setSelectedCategory(fallback[0].code);
        setSelectedCategoryInfo(fallback[0]);
      }
    }
  };

  // 선택된 코드분류의 기초코드 조회
  const fetchBaseCodes = async (categoryCode: string) => {
    if (!categoryCode) return;
    
    setLoading(true);
    try {
      const codes = await apiService.getBaseCodesByCategory(categoryCode);
      setBaseCodes(Array.isArray(codes) ? codes : []);
      setSelectedCodes(new Set());
    } catch (error) {
      console.error('기초코드 조회 오류:', error);
      showMessage('error', '기초코드 조회 중 오류가 발생했습니다.');
      setBaseCodes([]);
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
    fetchBaseCodes(selectedCategory);
  };

  // 추가 버튼 클릭
  const handleAdd = () => {
    const newCode: BaseCode = {
      codeCategory: selectedCategory,
      code: '',
      codeName: '',
      sortOrder: baseCodes.length + 1,
      useYn: 'Y'
    };
    setBaseCodes([...baseCodes, newCode]);
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
      await apiService.deleteBaseCodes(codeIds);
      showMessage('success', '기초코드가 성공적으로 삭제되었습니다.');
      fetchBaseCodes(selectedCategory);
    } catch (error) {
      console.error('삭제 오류:', error);
      showMessage('error', '기초코드 삭제 중 오류가 발생했습니다.');
    }
  };

  // 저장 버튼 클릭
  const handleSave = async () => {
    try {
      if (!selectedCategory) {
        showMessage('error', '코드분류를 선택하세요.');
        return;
      }

      // 선택된 코드분류만 전송 (다른 카테고리 보존용)
      const filteredCodes = baseCodes.filter(b => b.codeCategory === selectedCategory);
      
      // 코드분류에 따라 저장할 필드 결정
      const payload = filteredCodes.map(code => {
        const cleanCode: any = {
          codeCategory: code.codeCategory,
          code: code.code,
          codeName: code.codeName,
          sortOrder: code.sortOrder,
          useYn: code.useYn,
          remark: code.remark,
          regDate: code.regDate,
          modDate: code.modDate,
          regUser: code.regUser,
          modUser: code.modUser,
        };
        
        // 입출고구분(8)은 division1 저장
        if (selectedCategory === '8') {
          cleanCode.division1 = code.division1;
        }
        
        // 주문구분(2)은 discountRate1, discountRate2 저장
        if (selectedCategory === '2') {
          cleanCode.discountRate1 = code.discountRate1;
          cleanCode.discountRate2 = code.discountRate2;
        }
        
        return cleanCode;
      });

      await apiService.saveBaseCodes(payload);
      showMessage('success', '기초코드가 성공적으로 저장되었습니다.');
      fetchBaseCodes(selectedCategory);
    } catch (error) {
      console.error('저장 오류:', error);
      showMessage('error', '기초코드 저장 중 오류가 발생했습니다.');
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
    if (selectedCodes.size === baseCodes.length) {
      setSelectedCodes(new Set());
    } else {
      const allIds = baseCodes.map(code => `${code.codeCategory}_${code.code}`);
      setSelectedCodes(new Set(allIds));
    }
  };

  // 코드분류 변경
  const handleCategoryChange = (categoryCode: string) => {
    setSelectedCategory(categoryCode);
    const catInfo = codeCategories.find(c => c.code === categoryCode);
    setSelectedCategoryInfo(catInfo || null);
    fetchBaseCodes(categoryCode);
  };

  // itemDefinition 파싱하여 그리드 헤더 생성
  const parseItemDefinition = (itemDef?: string): { headers: string[], keyMap: Map<string, keyof BaseCode> } => {
    if (!itemDef) {
      return {
        headers: ['코드', '코드명', '정렬순서', '사용여부', '비고'],
        keyMap: new Map([
          ['코드', 'code'],
          ['코드명', 'codeName'],
          ['정렬순서', 'sortOrder'],
          ['사용여부', 'useYn'],
          ['비고', 'remark'],
        ])
      };
    }
    // "code=회원구분|codeName=회원구분명|division1=입출고구분" 형식 파싱
    const parts = itemDef.split('|');
    const headers: string[] = [];
    const keyMap = new Map<string, keyof BaseCode>();
    
    parts.forEach(p => {
      const [key, label] = p.split('=');
      const displayLabel = label || key;
      headers.push(displayLabel);
      // key를 필드명으로 매핑
      if (key === 'code') keyMap.set(displayLabel, 'code');
      else if (key === 'codeName') keyMap.set(displayLabel, 'codeName');
      else if (key === 'division1') keyMap.set(displayLabel, 'division1');
      else if (key === 'discountRate1') keyMap.set(displayLabel, 'discountRate1');
      else if (key === 'discountRate2') keyMap.set(displayLabel, 'discountRate2');
      else if (key === 'discountRate3') keyMap.set(displayLabel, 'discountRate3');
    });
    
    // 정렬순서와 사용여부, 비고는 항상 마지막에 추가
    headers.push('정렬순서', '사용여부', '비고');
    keyMap.set('정렬순서', 'sortOrder');
    keyMap.set('사용여부', 'useYn');
    keyMap.set('비고', 'remark');
    
    return { headers, keyMap };
  };

  // itemDefinition 파싱 결과를 메모이제이션
  const parsedDef = parseItemDefinition(selectedCategoryInfo?.itemDefinition);
  const gridHeaders = parsedDef.headers;
  const headerKeyMap = parsedDef.keyMap;

  // itemDefinition 기반 필드명 매핑
  const getFieldNameForHeader = (header: string): keyof BaseCode | null => {
    return headerKeyMap.get(header) || null;
  };

  // 그리드 데이터 변경
  const handleGridChange = (index: number, field: keyof BaseCode, value: any) => {
    const newCodes = [...baseCodes];
    newCodes[index] = { ...newCodes[index], [field]: value };
    setBaseCodes(newCodes);
  };

  // 필드 렌더링 헬퍼
  const renderCellContent = (code: BaseCode, fieldName: string, index: number) => {
    switch (fieldName) {
      case 'code':
        return (
          <input
            type="text"
            value={code.code}
            maxLength={20}
            onChange={(e) => handleGridChange(index, 'code', e.target.value)}
            className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        );
      case 'codeName':
        return (
          <input
            type="text"
            value={code.codeName}
            onChange={(e) => handleGridChange(index, 'codeName', e.target.value)}
            className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        );
      case 'sortOrder':
        return (
          <input
            type="number"
            inputMode="numeric"
            min={0}
            max={999}
            value={code.sortOrder}
            onChange={(e) => {
              const v = e.target.value.slice(0, 3);
              const n = Math.min(999, Math.max(0, parseInt(v) || 0));
              handleGridChange(index, 'sortOrder', n);
            }}
            className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-center"
          />
        );
      case 'useYn':
        return (
          <select
            value={code.useYn}
            onChange={(e) => handleGridChange(index, 'useYn', e.target.value)}
            className="px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="Y">사용</option>
            <option value="N">미사용</option>
          </select>
        );
      case 'remark':
        return (
          <input
            type="text"
            value={code.remark || ''}
            onChange={(e) => handleGridChange(index, 'remark', e.target.value)}
            className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        );
      case 'division1':
        return (
          <input
            type="text"
            value={code.division1 || ''}
            onChange={(e) => handleGridChange(index, 'division1', e.target.value)}
            className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        );
      case 'discountRate1':
      case 'discountRate2':
      case 'discountRate3':
        return (
          <input
            type="number"
            value={code[fieldName as keyof BaseCode] || ''}
            onChange={(e) => handleGridChange(index, fieldName as keyof BaseCode, e.target.value ? parseFloat(e.target.value) : null)}
            className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        );
      default:
        return null;
    }
  };

  // 컴포넌트 마운트 시 코드분류 조회
  useEffect(() => {
    fetchCodeCategories();
  }, []);

  // 선택된 코드분류가 변경될 때 기초코드 조회
  useEffect(() => {
    if (selectedCategory) {
      fetchBaseCodes(selectedCategory);
    }
  }, [selectedCategory]);

  return (
    <div className="space-y-6">
      {/* 페이지 제목 (복원) */}
      <div className="bg-sky-50 rounded-xl shadow-lg border border-sky-200 p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">기초코드 등록</h1>
        <p className="text-gray-600">
          시스템에서 사용하는 각종 코드 및 명칭을 등록하는 메뉴입니다. 
          기초코드는 다른 메뉴들에서 빈번히 참조하기 때문에 그 의미가 중요합니다.
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

      {/* 메시지 (복원) */}
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
        <div className="flex items-start space-x-4">
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">코드분류:</label>
            <select
              value={selectedCategory}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">코드분류를 선택하세요</option>
              {codeCategories.map((category) => (
                <option key={category.code} value={category.code}>
                  {category.code} - {category.codeName}
                </option>
              ))}
            </select>
          </div>
          {selectedCategoryInfo && selectedCategoryInfo.codeDescription && (
            <div className="flex-1">
              <div className="w-full px-3 py-2 text-gray-900 whitespace-normal break-words">
                {selectedCategoryInfo.codeDescription}
              </div>
            </div>
          )}
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
                {gridHeaders.map((header, idx) => {
                  const fieldName = getFieldNameForHeader(header);
                  if (fieldName === 'code') return <col key={idx} className="w-40" />;
                  if (fieldName === 'codeName') return <col key={idx} className="w-64" />;
                  if (fieldName === 'sortOrder') return <col key={idx} className="w-24" />;
                  if (fieldName === 'useYn') return <col key={idx} className="w-28" />;
                  if (fieldName === 'division1' || fieldName === 'discountRate1' || fieldName === 'discountRate2' || fieldName === 'discountRate3') return <col key={idx} className="w-32" />;
                  return <col key={idx} />;
                })}
              </colgroup>
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedCodes.size === baseCodes.length && baseCodes.length > 0}
                      onChange={handleSelectAll}
                      className="rounded border-gray-300"
                    />
                  </th>
                  {gridHeaders.map((header, idx) => (
                    <th key={idx} className="px-4 py-3 text-left text-sm font-medium text-gray-700 whitespace-nowrap">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {baseCodes.map((code, index) => {
                  const codeId = `${code.codeCategory}_${code.code}`;
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
                      {gridHeaders.map((header, hIdx) => {
                        const fieldName = getFieldNameForHeader(header);
                        if (!fieldName) return null;
                        return (
                          <td key={hIdx} className="px-4 py-3">
                            {renderCellContent(code, fieldName, index)}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
            
            {baseCodes.length === 0 && (
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

export default BaseCodePage;
