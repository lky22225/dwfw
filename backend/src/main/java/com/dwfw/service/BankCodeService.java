package com.dwfw.service;

import com.dwfw.entity.BankCode;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.fasterxml.jackson.databind.SerializationFeature;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.IOException;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
public class BankCodeService {

    private static final String DATA_FILE = "data/bank_codes.json";
    private final ObjectMapper objectMapper;

    public BankCodeService() {
        objectMapper = new ObjectMapper();
        objectMapper.registerModule(new JavaTimeModule());
        objectMapper.configure(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS, false);
    }

    public List<BankCode> getAll() {
        try {
            File file = new File(DATA_FILE);
            if (!file.exists() || file.length() == 0) {
                initializeDefaultData();
            }
            List<BankCode> list = objectMapper.readValue(file, new TypeReference<List<BankCode>>(){});
            return list != null ? list : new ArrayList<>();
        } catch (Exception e) {
            e.printStackTrace();
            initializeDefaultData();
            try {
                return objectMapper.readValue(new File(DATA_FILE), new TypeReference<List<BankCode>>(){});
            } catch (IOException ex) {
                ex.printStackTrace();
                return new ArrayList<>();
            }
        }
    }

    public List<BankCode> searchByKeyword(String keyword) {
        String key = keyword == null ? "" : keyword.trim().toLowerCase(Locale.ROOT);
        if (key.isEmpty()) return getAllSorted();
        return getAll().stream()
                .filter(b -> (b.getBankCode() != null && b.getBankCode().toLowerCase(Locale.ROOT).contains(key))
                        || (b.getBankName() != null && b.getBankName().toLowerCase(Locale.ROOT).contains(key)))
                .sorted(Comparator.comparing(b -> Objects.requireNonNullElse(b.getSortOrder(), 0)))
                .collect(Collectors.toList());
    }

    public List<BankCode> getAllSorted() {
        return getAll().stream()
                .sorted(Comparator.comparing(b -> Objects.requireNonNullElse(b.getSortOrder(), 0)))
                .collect(Collectors.toList());
    }

    public void save(List<BankCode> banks) {
        if (banks == null || banks.isEmpty()) return;
        
        // 기존 전체 데이터 읽기
        List<BankCode> allBanks = getAll();
        Map<String, BankCode> existingMap = new HashMap<>();
        for (BankCode b : allBanks) {
            if (b.getBankCode() != null) {
                existingMap.put(b.getBankCode(), b);
            }
        }
        
        // normalize and set meta
        LocalDateTime now = LocalDateTime.now();
        for (BankCode b : banks) {
            if (b.getEffectiveDate() == null) b.setEffectiveDate(LocalDate.parse("2000-01-01"));
            if (b.getRemitFee() == null) b.setRemitFee(0);
            if (b.getSortOrder() == null) b.setSortOrder(0);
            if (b.getUseYn() == null) b.setUseYn("Y");
            
            BankCode existing = existingMap.get(b.getBankCode());
            if (existing == null) {
                // 새로 추가된 항목
                if (b.getRegDate() == null) {
                    b.setRegDate(now);
                    b.setRegUser("SYSTEM");
                }
            } else {
                // 기존 항목 업데이트 - regDate와 regUser는 유지
                b.setRegDate(existing.getRegDate());
                b.setRegUser(existing.getRegUser());
                // 기존 데이터에서 은행명을 유지 (은행명은 수정 불가)
                if (b.getBankName() == null || b.getBankName().isEmpty()) {
                    b.setBankName(existing.getBankName());
                }
            }
            b.setModDate(now);
            b.setModUser("SYSTEM");
            
            // 기존 맵에 업데이트 또는 추가
            existingMap.put(b.getBankCode(), b);
        }
        
        // 전체 리스트로 변환하여 저장
        writeAll(new ArrayList<>(existingMap.values()));
    }

    public void add(BankCode bank) {
        List<BankCode> all = getAll();
        all.add(bank);
        save(all);
    }

    public void deleteByCodes(List<String> bankCodes) {
        if (bankCodes == null || bankCodes.isEmpty()) return;
        List<BankCode> filtered = getAll().stream()
                .filter(b -> b.getBankCode() == null || !bankCodes.contains(b.getBankCode()))
                .collect(Collectors.toList());
        writeAll(filtered);
    }

    private void writeAll(List<BankCode> list) {
        try {
            File file = new File(DATA_FILE);
            File parent = file.getParentFile();
            if (parent != null && !parent.exists()) parent.mkdirs();
            objectMapper.writerWithDefaultPrettyPrinter().writeValue(file, list);
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    public void initializeDefaultData() {
        List<BankCode> defaults = new ArrayList<>();
        // Minimal KR bank list (sample). Extend as needed.
        defaults.add(new BankCode("004", "국민은행"));
        defaults.add(new BankCode("088", "신한은행"));
        defaults.add(new BankCode("020", "우리은행"));
        defaults.add(new BankCode("081", "하나은행"));
        defaults.add(new BankCode("003", "기업은행"));
        defaults.add(new BankCode("011", "농협은행"));
        defaults.add(new BankCode("027", "씨티은행"));
        defaults.add(new BankCode("023", "SC제일은행"));

        // sortOrder sequence
        for (int i = 0; i < defaults.size(); i++) {
            defaults.get(i).setSortOrder(i + 1);
        }
        writeAll(defaults);
    }
}
