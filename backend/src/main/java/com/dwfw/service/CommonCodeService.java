package com.dwfw.service;

import com.dwfw.entity.CommonCode;
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
public class CommonCodeService {
    
    private static final String DATA_FILE = "data/common_codes.json";
    private final ObjectMapper objectMapper;

    public CommonCodeService() {
        this.objectMapper = new ObjectMapper();
        this.objectMapper.registerModule(new JavaTimeModule());
        this.objectMapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
    }
    
    /**
     * 모든 공통코드 조회
     */
    public List<CommonCode> getAllCommonCodes() {
        try {
            File file = new File(DATA_FILE);
            System.out.println("공통코드 파일 경로: " + file.getAbsolutePath());
            System.out.println("파일 존재 여부: " + file.exists());
            
            if (!file.exists()) {
                System.out.println("파일이 없어서 초기 데이터를 생성합니다.");
                initializeDefaultData();
            }
            List<CommonCode> codes;
            try {
                codes = objectMapper.readValue(file, new TypeReference<List<CommonCode>>() {});
                System.out.println("조회된 공통코드 개수: " + (codes != null ? codes.size() : 0));
            } catch (Exception parseException) {
                System.err.println("JSON 파싱 오류: " + parseException.getMessage());
                parseException.printStackTrace();
                // 파싱 오류 시 초기 데이터로 재생성
                System.out.println("JSON 파싱 오류로 인해 초기 데이터를 재생성합니다.");
                initializeDefaultData();
                codes = objectMapper.readValue(file, new TypeReference<List<CommonCode>>() {});
                System.out.println("재생성 후 조회된 공통코드 개수: " + (codes != null ? codes.size() : 0));
            }
            
            if (codes == null || codes.isEmpty()) {
                System.out.println("코드가 비어있어서 초기 데이터를 생성합니다.");
                initializeDefaultData();
                codes = objectMapper.readValue(file, new TypeReference<List<CommonCode>>() {});
            }
            return codes != null ? codes : new ArrayList<>();
        } catch (IOException e) {
            System.err.println("공통코드 조회 중 오류: " + e.getMessage());
            e.printStackTrace();
            return new ArrayList<>();
        }
    }
    
    /**
     * 코드구분별 공통코드 조회
     */
    public List<CommonCode> getCommonCodesByDivision(String codeDivision) {
        if (codeDivision == null || codeDivision.isEmpty()) {
            return getAllCommonCodes();
        }
        
        List<CommonCode> list = getAllCommonCodes().stream()
                .filter(code -> codeDivision.equals(code.getCodeDivision()))
                .collect(Collectors.toList());

        if (list.isEmpty() && "ROOT".equals(codeDivision)) {
            initializeDefaultData();
            list = getAllCommonCodes().stream()
                    .filter(code -> "ROOT".equals(code.getCodeDivision()))
                    .collect(Collectors.toList());
        }

        return list;
    }
    
    /**
     * ROOT 코드 목록 조회 (코드구분 셀렉트 박스용)
     */
    public List<CommonCode> getRootCodes() {
        List<CommonCode> allCodes = getAllCommonCodes();
        System.out.println("전체 공통코드 개수: " + allCodes.size());
        
        List<CommonCode> rootCodes = allCodes.stream()
                .filter(code -> code != null && "ROOT".equals(code.getCodeDivision()))
                .collect(Collectors.toList());

        System.out.println("ROOT 코드 개수: " + rootCodes.size());
        if (!rootCodes.isEmpty()) {
            rootCodes.forEach(code -> System.out.println("ROOT 코드: " + code.getCode() + " - " + code.getCodeName()));
        }

        if (rootCodes.isEmpty()) {
            System.out.println("ROOT 코드가 없어서 초기 데이터를 생성합니다.");
            initializeDefaultData();
            allCodes = getAllCommonCodes();
            rootCodes = allCodes.stream()
                    .filter(code -> code != null && "ROOT".equals(code.getCodeDivision()))
                    .collect(Collectors.toList());
            System.out.println("초기화 후 ROOT 코드 개수: " + rootCodes.size());
        }

        return rootCodes;
    }
    
    /**
     * 공통코드 저장
     */
    public void saveCommonCodes(List<CommonCode> commonCodes) {
        try {
            if (commonCodes == null) {
                return;
            }

            // 저장 대상 코드구분 집합 수집
            Set<String> targetDivisions = commonCodes.stream()
                    .map(CommonCode::getCodeDivision)
                    .filter(Objects::nonNull)
                    .collect(Collectors.toSet());

            // 기존 데이터 로드
            List<CommonCode> existing = getAllCommonCodes();

            // 기존 데이터 중 대상 코드구분을 제외
            List<CommonCode> preserved = existing.stream()
                    .filter(c -> c.getCodeDivision() != null && !targetDivisions.contains(c.getCodeDivision()))
                    .collect(Collectors.toList());

            // 신규/수정 데이터 정비 (등록/수정 메타 세팅)
            LocalDateTime now = LocalDateTime.now();
            for (CommonCode code : commonCodes) {
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

            // 병합: 보존 + 신규목록
            List<CommonCode> merged = new ArrayList<>();
            merged.addAll(preserved);
            merged.addAll(commonCodes);

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
            throw new RuntimeException("공통코드 저장 중 오류가 발생했습니다.", e);
        }
    }
    
    /**
     * 공통코드 추가
     */
    public void addCommonCode(CommonCode commonCode) {
        List<CommonCode> allCodes = getAllCommonCodes();
        commonCode.setRegDate(LocalDateTime.now());
        commonCode.setRegUser("SYSTEM");
        commonCode.setModDate(LocalDateTime.now());
        commonCode.setModUser("SYSTEM");
        
        if (commonCode.getUseYn() == null) {
            commonCode.setUseYn("Y");
        }
        if (commonCode.getSortOrder() == null) {
            commonCode.setSortOrder(0);
        }
        
        allCodes.add(commonCode);
        saveCommonCodes(allCodes);
    }
    
    /**
     * 공통코드 삭제
     */
    public void deleteCommonCodes(List<String> codeIds) {
        List<CommonCode> allCodes = getAllCommonCodes();
        List<CommonCode> filteredCodes = allCodes.stream()
                .filter(code -> !codeIds.contains(code.getCodeDivision() + "_" + code.getCode()))
                .collect(Collectors.toList());
        
        saveCommonCodes(filteredCodes);
    }
    
    /**
     * 기본 데이터 초기화
     */
    private void initializeDefaultData() {
        List<CommonCode> defaultCodes = new ArrayList<>();
        LocalDateTime now = LocalDateTime.now();
        
        // ROOT 코드들 (코드구분)
        CommonCode root1 = new CommonCode("ROOT", "A01", "출근(근태)");
        root1.setSortOrder(1);
        root1.setRegDate(now);
        root1.setRegUser("SYSTEM");
        root1.setModDate(now);
        root1.setModUser("SYSTEM");
        defaultCodes.add(root1);
        
        CommonCode root2 = new CommonCode("ROOT", "B01", "AS항목");
        root2.setSortOrder(2);
        root2.setRegDate(now);
        root2.setRegUser("SYSTEM");
        root2.setModDate(now);
        root2.setModUser("SYSTEM");
        defaultCodes.add(root2);
        
        CommonCode root3 = new CommonCode("ROOT", "C01", "AS구분");
        root3.setSortOrder(3);
        root3.setRegDate(now);
        root3.setRegUser("SYSTEM");
        root3.setModDate(now);
        root3.setModUser("SYSTEM");
        defaultCodes.add(root3);
        
        // 코드구분 A01: 출근(근태)
        CommonCode a0101 = new CommonCode("A01", "A0101", "출근");
        a0101.setSortOrder(1);
        a0101.setRegDate(now);
        a0101.setRegUser("SYSTEM");
        a0101.setModDate(now);
        a0101.setModUser("SYSTEM");
        defaultCodes.add(a0101);
        
        CommonCode a0102 = new CommonCode("A01", "A0102", "오전근무");
        a0102.setSortOrder(2);
        a0102.setRegDate(now);
        a0102.setRegUser("SYSTEM");
        a0102.setModDate(now);
        a0102.setModUser("SYSTEM");
        defaultCodes.add(a0102);
        
        CommonCode a0103 = new CommonCode("A01", "A0103", "오후근무");
        a0103.setSortOrder(3);
        a0103.setRegDate(now);
        a0103.setRegUser("SYSTEM");
        a0103.setModDate(now);
        a0103.setModUser("SYSTEM");
        defaultCodes.add(a0103);
        
        CommonCode a0104 = new CommonCode("A01", "A0104", "조퇴");
        a0104.setSortOrder(4);
        a0104.setRegDate(now);
        a0104.setRegUser("SYSTEM");
        a0104.setModDate(now);
        a0104.setModUser("SYSTEM");
        defaultCodes.add(a0104);
        
        CommonCode a0105 = new CommonCode("A01", "A0105", "지각");
        a0105.setSortOrder(5);
        a0105.setRegDate(now);
        a0105.setRegUser("SYSTEM");
        a0105.setModDate(now);
        a0105.setModUser("SYSTEM");
        defaultCodes.add(a0105);
        
        // 코드구분 B01: AS항목
        CommonCode b0101 = new CommonCode("B01", "B0101", "제품");
        b0101.setSortOrder(1);
        b0101.setRegDate(now);
        b0101.setRegUser("SYSTEM");
        b0101.setModDate(now);
        b0101.setModUser("SYSTEM");
        defaultCodes.add(b0101);
        
        CommonCode b0102 = new CommonCode("B01", "B0102", "서비스");
        b0102.setSortOrder(2);
        b0102.setRegDate(now);
        b0102.setRegUser("SYSTEM");
        b0102.setModDate(now);
        b0102.setModUser("SYSTEM");
        defaultCodes.add(b0102);
        
        // 코드구분 C01: AS구분
        CommonCode c0101 = new CommonCode("C01", "C0101", "고장");
        c0101.setSortOrder(1);
        c0101.setRegDate(now);
        c0101.setRegUser("SYSTEM");
        c0101.setModDate(now);
        c0101.setModUser("SYSTEM");
        defaultCodes.add(c0101);
        
        CommonCode c0102 = new CommonCode("C01", "C0102", "교체");
        c0102.setSortOrder(2);
        c0102.setRegDate(now);
        c0102.setRegUser("SYSTEM");
        c0102.setModDate(now);
        c0102.setModUser("SYSTEM");
        defaultCodes.add(c0102);
        
        CommonCode c0103 = new CommonCode("C01", "C0103", "수리");
        c0103.setSortOrder(3);
        c0103.setRegDate(now);
        c0103.setRegUser("SYSTEM");
        c0103.setModDate(now);
        c0103.setModUser("SYSTEM");
        defaultCodes.add(c0103);
        
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

