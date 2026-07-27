import React, { useEffect, useMemo, useRef, useState } from 'react';
import apiService from '../services/api';

interface BankCode {
  bankCode: string;
  bankName: string;
  effectiveDate?: string; // yyyy-MM-dd
  remitFee?: number;
  sortOrder?: number;
  useYn?: 'Y' | 'N' | string;
  remark?: string;
  regDate?: string;
  modDate?: string;
  regUser?: string;
  modUser?: string;
}

type Message = { type: 'success' | 'error'; text: string } | null;

const BankCodePage: React.FC = () => {
  const [keyword, setKeyword] = useState('');
  const [banks, setBanks] = useState<BankCode[]>([]);
  const [originalBanks, setOriginalBanks] = useState<BankCode[]>([]); // 원본 데이터 저장
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<Message>(null);
  const bankCodeRefs = useRef<Array<HTMLInputElement | null>>([]);
  const bankNameRefs = useRef<Array<HTMLInputElement | null>>([]);

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  const fetchBanks = async () => {
    setLoading(true);
    try {
      const searchQuery = keyword.trim() || undefined;
      const bankList = await apiService.getBankCodes(searchQuery);
      const safeList = Array.isArray(bankList) ? bankList : [];
      setBanks(safeList);
      setOriginalBanks(JSON.parse(JSON.stringify(safeList))); // 원본 데이터 깊은 복사
      setSelected(new Set());
    } catch (e: any) {
      console.error('조회 오류:', e);
      showMessage('error', `조회 중 오류가 발생했습니다: ${e?.message || '네트워크 오류'}`);
      setBanks([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => fetchBanks();

  const handleAdd = () => {
    setBanks(prev => [
      {
        bankCode: '',
        bankName: '',
        effectiveDate: '2000-01-01',
        remitFee: 0,
        sortOrder: (prev?.length || 0) + 1,
        useYn: 'Y',
        remark: ''
      },
      ...prev,
    ]);
  };

  const handleDelete = async () => {
    if (selected.size === 0) {
      showMessage('error', '삭제할 항목을 선택하세요.');
      return;
    }
    if (!window.confirm(`선택된 ${selected.size}개 항목을 삭제하시겠습니까?`)) return;
    try {
      await apiService.deleteBankCodes(Array.from(selected));
      showMessage('success', '삭제되었습니다.');
      // 삭제 후 원본 데이터도 갱신
      await fetchBanks();
    } catch (e: any) {
      showMessage('error', `삭제 중 오류가 발생했습니다: ${e?.message || '네트워크 오류'}`);
    }
  };

  const handleSave = async () => {
    // 간단한 검증
    for (const b of banks) {
      if (!b.bankCode || !b.bankName) {
        showMessage('error', '은행코드와 은행명은 필수입니다.');
        return;
      }
      if (b.effectiveDate && !/^\d{4}-\d{2}-\d{2}$/.test(b.effectiveDate)) {
        showMessage('error', `적용일자 형식이 올바르지 않습니다: ${b.effectiveDate}`);
        return;
      }
    }

    // 변경된 항목과 추가된 항목만 추출
    const originalMap = new Map(originalBanks.map(b => [b.bankCode, b]));
    const changedOrNew: BankCode[] = [];

    for (const bank of banks) {
      const original = originalMap.get(bank.bankCode);
      // 새로 추가된 항목 (원본에 없음)
      if (!original) {
        changedOrNew.push(bank);
      } else {
        // 변경된 항목인지 확인 (은행코드/명 제외한 필드 변경 체크)
        const isChanged = 
          original.effectiveDate !== bank.effectiveDate ||
          original.remitFee !== bank.remitFee ||
          original.sortOrder !== bank.sortOrder ||
          original.useYn !== bank.useYn ||
          original.remark !== bank.remark;
        
        if (isChanged) {
          changedOrNew.push(bank);
        }
      }
    }

    if (changedOrNew.length === 0) {
      showMessage('error', '변경된 항목이 없습니다.');
      return;
    }

    try {
      await apiService.saveBankCodes(changedOrNew);
      showMessage('success', `${changedOrNew.length}개 항목이 저장되었습니다.`);
      fetchBanks(); // 최신 데이터로 다시 조회
    } catch (e: any) {
      showMessage('error', `저장 중 오류가 발생했습니다: ${e?.message || '네트워크 오류'}`);
    }
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelected(new Set(banks.filter(b => b.bankCode).map(b => b.bankCode)));
    } else {
      setSelected(new Set());
    }
  };

  const toggleSelect = (code: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(code)) next.delete(code); else next.add(code);
      return next;
    });
  };

  const updateCell = (index: number, key: keyof BankCode, value: any) => {
    setBanks(prev => {
      const next = [...prev];
      (next[index] as any)[key] = value;
      return next;
    });
  };

  useEffect(() => { fetchBanks(); }, []);

  return (
    <div className="space-y-6">
      {/* 제목 */}
      <div className="bg-sky-50 rounded-xl shadow-lg border border-sky-200 p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">은행코드 등록</h1>
        <p className="text-gray-600">송금에 필요한 은행코드, 은행명, 송금수수료 등을 관리합니다. (은행코드/명은 외부 표준을 따르므로 수정/삭제 제한됨)</p>
      </div>

      {/* 버튼 영역 */}
      <div className="bg-sky-50 rounded-xl shadow-lg border border-sky-200 p-4">
        <div className="flex items-center space-x-4">
          <button onClick={handleSearch} className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <span>조회</span>
          </button>
          <button onClick={handleAdd} className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
            <span>추가</span>
          </button>
          <button onClick={handleDelete} className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
            <span>삭제</span>
          </button>
          <button onClick={handleSave} className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
            <span>저장</span>
          </button>
        </div>
      </div>

      {/* 메시지 */}
      {message && (
        <div className={`p-4 rounded-lg ${message.type === 'success' ? 'bg-green-50 border border-green-200 text-green-800' : 'bg-red-50 border border-red-200 text-red-800'}`}>
          {message.text}
        </div>
      )}

      {/* 조건 영역 */}
      <div className="bg-sky-50 rounded-xl shadow-lg border border-sky-200 p-4">
        <div className="flex items-center space-x-3">
          <label className="text-sm font-medium text-gray-700">은행코드/명:</label>
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="예: 004 또는 국민"
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* 그리드 */}
      <div className="bg-sky-50 rounded-xl shadow-lg border border-sky-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12 text-gray-600">로딩 중...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full table-fixed">
              <colgroup>
                <col style={{ width: '3rem' }} />
                <col style={{ width: '8rem' }} />
                <col style={{ width: '16rem' }} />
                <col style={{ width: '10rem' }} />
                <col style={{ width: '8rem' }} />
                <col style={{ width: '8rem' }} />
                <col style={{ width: '8rem' }} />
                <col />
              </colgroup>
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left"><input type="checkbox" onChange={handleSelectAll} checked={selected.size>0 && selected.size===banks.filter(b=>b.bankCode).length} /></th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">은행코드</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">은행명</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">적용일자</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">송금수수료</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">정렬순서</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">사용여부</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">비고</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {banks.map((b, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <input type="checkbox" checked={!!b.bankCode && selected.has(b.bankCode)} onChange={() => b.bankCode && toggleSelect(b.bankCode)} />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        ref={(el) => (bankCodeRefs.current[i] = el)}
                        type="text"
                        value={b.bankCode || ''}
                        maxLength={3}
                        onChange={(e) => {
                          const val = e.target.value.replace(/[^0-9]/g, '');
                          updateCell(i, 'bankCode', val);
                          if (val.length < 3) {
                            // 3자리 전에는 은행코드 입력란 포커스 유지
                            setTimeout(() => bankCodeRefs.current[i]?.focus(), 0);
                          } else if (val.length === 3) {
                            // 3자리 도달 시 은행명으로 이동
                            setTimeout(() => bankNameRefs.current[i]?.focus(), 0);
                          }
                        }}
                        className="w-full px-2 py-1 border border-gray-300 rounded"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        ref={(el) => (bankNameRefs.current[i] = el)}
                        type="text"
                        value={b.bankName || ''}
                        onChange={(e) => updateCell(i, 'bankName', e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input type="date" value={b.effectiveDate || ''} onChange={(e)=>updateCell(i,'effectiveDate', e.target.value)} className="px-2 py-1 border border-gray-300 rounded" />
                    </td>
                    <td className="px-4 py-3">
                      <input type="number" value={b.remitFee ?? 0} onChange={(e)=>updateCell(i,'remitFee', parseInt(e.target.value||'0',10))} className="w-24 px-2 py-1 border border-gray-300 rounded" />
                    </td>
                    <td className="px-4 py-3">
                      <input type="number" value={b.sortOrder ?? 0} onChange={(e)=>updateCell(i,'sortOrder', parseInt(e.target.value||'0',10))} className="w-20 px-2 py-1 border border-gray-300 rounded" />
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={b.useYn || 'Y'}
                        onChange={(e) => updateCell(i, 'useYn', e.target.value)}
                        className="px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="Y">사용</option>
                        <option value="N">미사용</option>
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <input type="text" value={b.remark || ''} onChange={(e)=>updateCell(i,'remark', e.target.value)} className="w-full px-2 py-1 border border-gray-300 rounded" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {banks.length === 0 && (
              <div className="text-center py-12 text-gray-500">조회된 데이터가 없습니다.</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default BankCodePage;
