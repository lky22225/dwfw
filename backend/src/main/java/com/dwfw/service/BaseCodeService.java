package com.dwfw.service;

import com.dwfw.entity.BaseCode;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.fasterxml.jackson.databind.SerializationFeature;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.IOException;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class BaseCodeService {
    
    private static final String DATA_FILE = "data/base_codes.json";
    private final ObjectMapper objectMapper;

    public BaseCodeService() {
        this.objectMapper = new ObjectMapper();
        this.objectMapper.registerModule(new JavaTimeModule());
        this.objectMapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
    }
    
    /**
     * 모든 기초코드 조회
     */
    public List<BaseCode> getAllBaseCodes() {
        try {
            File file = new File(DATA_FILE);
            if (!file.exists()) {
                initializeDefaultData();
            }
            List<BaseCode> codes = objectMapper.readValue(file, new TypeReference<List<BaseCode>>() {});
            if (codes == null || codes.isEmpty()) {
                // 파일이 있지만 비어있는 경우 기본 데이터로 재초기화
                initializeDefaultData();
                codes = objectMapper.readValue(file, new TypeReference<List<BaseCode>>() {});
            }
            return codes;
        } catch (IOException e) {
            e.printStackTrace();
            return new ArrayList<>();
        }
    }
    
    /**
     * 코드분류별 기초코드 조회
     */
    public List<BaseCode> getBaseCodesByCategory(String codeCategory) {
        List<BaseCode> list = getAllBaseCodes().stream()
                .filter(code -> codeCategory.equals(code.getCodeCategory()))
                .collect(Collectors.toList());

        if (list.isEmpty()) {
            // 데이터가 비어있으면 기본 데이터로 재초기화 후 재조회
            initializeDefaultData();
            list = getAllBaseCodes().stream()
                    .filter(code -> codeCategory.equals(code.getCodeCategory()))
                    .collect(Collectors.toList());
        }

        return list;
    }
    
    /**
     * 코드분류 목록 조회 (ROOT 코드들)
     */
    public List<BaseCode> getCodeCategories() {
        List<BaseCode> categories = getAllBaseCodes().stream()
                .filter(code -> "ROOT".equals(code.getCodeCategory()))
                .collect(Collectors.toList());

        if (categories.isEmpty()) {
            // 파일이 비어있거나 ROOT가 없을 때 안전한 기본값 반환
            List<BaseCode> defaults = new ArrayList<>();
            defaults.add(new BaseCode("ROOT", "1", "회원구분"));
            defaults.add(new BaseCode("ROOT", "2", "주문구분"));
            defaults.add(new BaseCode("ROOT", "3", "주문경로"));
            defaults.add(new BaseCode("ROOT", "4", "거래처구분"));
            defaults.add(new BaseCode("ROOT", "5", "상담구분"));
            defaults.add(new BaseCode("ROOT", "6", "국가구분"));
            defaults.add(new BaseCode("ROOT", "7", "이메일"));
            defaults.add(new BaseCode("ROOT", "8", "입출고구분"));
            return defaults;
        }

        return categories;
    }
    
    /**
     * 기초코드 저장
     */
    public void saveBaseCodes(List<BaseCode> baseCodes) {
        try {
            if (baseCodes == null) {
                return;
            }

            // 저장 대상 카테고리 집합 수집 (일반적으로 하나)
            Set<String> targetCategories = baseCodes.stream()
                    .map(BaseCode::getCodeCategory)
                    .filter(Objects::nonNull)
                    .collect(Collectors.toSet());

            // 기존 데이터 로드
            List<BaseCode> existing = getAllBaseCodes();

            // 기존 데이터 중 대상 카테고리를 제외
            List<BaseCode> preserved = existing.stream()
                    .filter(c -> c.getCodeCategory() != null && !targetCategories.contains(c.getCodeCategory()))
                    .collect(Collectors.toList());

            // 신규/수정 데이터 정비 (등록/수정 메타 세팅)
            LocalDateTime now = LocalDateTime.now();
            for (BaseCode code : baseCodes) {
                if (code.getUseYn() == null) {
                    code.setUseYn("Y");
                }
                if (code.getSortOrder() == null) {
                    code.setSortOrder(0);
                }
                if (code.getRegDate() == null) {
                    code.setRegDate(now);
                    code.setRegUser("SYSTEM");
                }
                code.setModDate(now);
                code.setModUser("SYSTEM");
            }

            // 병합: 보존 + 신규목록(대상 카테고리 전체 대체)
            List<BaseCode> merged = new ArrayList<>();
            merged.addAll(preserved);
            merged.addAll(baseCodes);

            // 디렉토리 보장 후 저장
            File dataFile = new File(DATA_FILE);
            File parent = dataFile.getParentFile();
            if (parent != null && !parent.exists()) {
                parent.mkdirs();
            }

            objectMapper.writerWithDefaultPrettyPrinter()
                    .writeValue(dataFile, merged);
        } catch (IOException e) {
            e.printStackTrace();
            throw new RuntimeException("기초코드 저장 중 오류가 발생했습니다.", e);
        }
    }
    
    /**
     * 기초코드 추가
     */
    public void addBaseCode(BaseCode baseCode) {
        List<BaseCode> allCodes = getAllBaseCodes();
        baseCode.setRegDate(LocalDateTime.now());
        baseCode.setRegUser("SYSTEM");
        baseCode.setModDate(LocalDateTime.now());
        baseCode.setModUser("SYSTEM");
        
        allCodes.add(baseCode);
        saveBaseCodes(allCodes);
    }
    
    /**
     * 기초코드 삭제
     */
    public void deleteBaseCodes(List<String> codeIds) {
        List<BaseCode> allCodes = getAllBaseCodes();
        List<BaseCode> filteredCodes = allCodes.stream()
                .filter(code -> !codeIds.contains(code.getCodeCategory() + "_" + code.getCode()))
                .collect(Collectors.toList());
        
        saveBaseCodes(filteredCodes);
    }
    
    /**
     * 기본 데이터 초기화
     */
    private void initializeDefaultData() {
        List<BaseCode> defaultCodes = new ArrayList<>();
        
        // ROOT 코드들 (코드분류)
        defaultCodes.add(new BaseCode("ROOT", "1", "회원구분"));
        defaultCodes.add(new BaseCode("ROOT", "2", "주문구분"));
        defaultCodes.add(new BaseCode("ROOT", "3", "주문경로"));
        defaultCodes.add(new BaseCode("ROOT", "4", "거래처구분"));
        defaultCodes.add(new BaseCode("ROOT", "5", "상담구분"));
        defaultCodes.add(new BaseCode("ROOT", "6", "국가구분"));
        defaultCodes.add(new BaseCode("ROOT", "7", "이메일"));
        defaultCodes.add(new BaseCode("ROOT", "8", "입출고구분"));
        
        // 코드분류 1: 회원구분
        BaseCode code1_0 = new BaseCode("1", "0", "소비자");
        code1_0.setSortOrder(1);
        defaultCodes.add(code1_0);
        
        BaseCode code1_1 = new BaseCode("1", "1", "회원");
        code1_1.setSortOrder(2);
        defaultCodes.add(code1_1);
        
        // 코드분류 2: 주문구분
        BaseCode code2_0 = new BaseCode("2", "0", "일반주문");
        code2_0.setSortOrder(1);
        defaultCodes.add(code2_0);
        
        // 코드분류 3: 주문경로
        BaseCode code3_0 = new BaseCode("3", "0", "본사");
        code3_0.setSortOrder(1);
        defaultCodes.add(code3_0);
        
        BaseCode code3_1 = new BaseCode("3", "1", "지사");
        code3_1.setSortOrder(2);
        defaultCodes.add(code3_1);
        
        BaseCode code3_2 = new BaseCode("3", "2", "온라인");
        code3_2.setSortOrder(3);
        defaultCodes.add(code3_2);
        
        // 코드분류 4: 거래처구분
        BaseCode code4_0 = new BaseCode("4", "0", "운송업체");
        code4_0.setSortOrder(1);
        defaultCodes.add(code4_0);
        
        BaseCode code4_1 = new BaseCode("4", "1", "공급처");
        code4_1.setSortOrder(2);
        defaultCodes.add(code4_1);
        
        BaseCode code4_2 = new BaseCode("4", "2", "물류센터");
        code4_2.setSortOrder(3);
        defaultCodes.add(code4_2);
        
        // 코드분류 5: 상담구분
        BaseCode code5_A = new BaseCode("5", "A", "회원");
        code5_A.setSortOrder(1);
        defaultCodes.add(code5_A);
        
        BaseCode code5_B = new BaseCode("5", "B", "주문");
        code5_B.setSortOrder(2);
        defaultCodes.add(code5_B);
        
        BaseCode code5_C = new BaseCode("5", "C", "수당");
        code5_C.setSortOrder(3);
        defaultCodes.add(code5_C);
        
        BaseCode code5_D = new BaseCode("5", "D", "배송");
        code5_D.setSortOrder(4);
        defaultCodes.add(code5_D);
        
        BaseCode code5_E = new BaseCode("5", "E", "교환반품");
        code5_E.setSortOrder(5);
        defaultCodes.add(code5_E);
        
        BaseCode code5_F = new BaseCode("5", "F", "탈퇴");
        code5_F.setSortOrder(6);
        defaultCodes.add(code5_F);
        
        BaseCode code5_G = new BaseCode("5", "G", "홈페이지");
        code5_G.setSortOrder(7);
        defaultCodes.add(code5_G);
        
        // 코드분류 6: 국가구분
        BaseCode code6_KR = new BaseCode("6", "KR", "대한민국");
        code6_KR.setSortOrder(1);
        defaultCodes.add(code6_KR);
        
        // 코드분류 7: 이메일
        BaseCode code7_daum = new BaseCode("7", "daum.net", "다음");
        code7_daum.setSortOrder(1);
        defaultCodes.add(code7_daum);
        
        BaseCode code7_gmail = new BaseCode("7", "gmail.com", "지메일");
        code7_gmail.setSortOrder(2);
        defaultCodes.add(code7_gmail);
        
        // 코드분류 8: 입출고구분
        BaseCode code8_0 = new BaseCode("8", "0", "구매");
        code8_0.setDivision1("입고");
        code8_0.setSortOrder(1);
        defaultCodes.add(code8_0);
        
        BaseCode code8_1 = new BaseCode("8", "1", "교환");
        code8_1.setDivision1("입고");
        code8_1.setSortOrder(2);
        defaultCodes.add(code8_1);
        
        BaseCode code8_2 = new BaseCode("8", "2", "반품");
        code8_2.setDivision1("입고");
        code8_2.setSortOrder(3);
        defaultCodes.add(code8_2);
        
        // 등록일시 설정
        LocalDateTime now = LocalDateTime.now();
        for (BaseCode code : defaultCodes) {
            code.setRegDate(now);
            code.setRegUser("SYSTEM");
            code.setModDate(now);
            code.setModUser("SYSTEM");
        }
        
        try {
            // data 디렉토리 생성
            File dataDir = new File("data");
            if (!dataDir.exists()) {
                dataDir.mkdirs();
            }
            
            objectMapper.writerWithDefaultPrettyPrinter()
                    .writeValue(new File(DATA_FILE), defaultCodes);
        } catch (IOException e) {
            e.printStackTrace();
            throw new RuntimeException("기본 데이터 초기화 중 오류가 발생했습니다.", e);
        }
    }
}
