package com.dwfw.controller;

import com.dwfw.entity.BaseCode;
import com.dwfw.service.BaseCodeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/base-codes")
@CrossOrigin(origins = "*")
public class BaseCodeController {
    
    @Autowired
    private BaseCodeService baseCodeService;
    
    /**
     * 모든 기초코드 조회
     */
    @GetMapping
    public ResponseEntity<List<BaseCode>> getAllBaseCodes() {
        try {
            List<BaseCode> baseCodes = baseCodeService.getAllBaseCodes();
            return ResponseEntity.ok(baseCodes);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * 코드분류 목록 조회 (ROOT 코드들)
     */
    @GetMapping("/categories")
    public ResponseEntity<List<BaseCode>> getCodeCategories() {
        try {
            List<BaseCode> categories = baseCodeService.getCodeCategories();
            return ResponseEntity.ok(categories);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * 코드분류별 기초코드 조회
     */
    @GetMapping("/category/{codeCategory}")
    public ResponseEntity<List<BaseCode>> getBaseCodesByCategory(@PathVariable String codeCategory) {
        try {
            List<BaseCode> baseCodes = baseCodeService.getBaseCodesByCategory(codeCategory);
            return ResponseEntity.ok(baseCodes);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * 기초코드 저장
     */
    @PostMapping
    public ResponseEntity<Map<String, String>> saveBaseCodes(@RequestBody List<BaseCode> baseCodes) {
        try {
            baseCodeService.saveBaseCodes(baseCodes);
            return ResponseEntity.ok(Map.of("message", "기초코드가 성공적으로 저장되었습니다."));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "기초코드 저장 중 오류가 발생했습니다: " + e.getMessage()));
        }
    }
    
    /**
     * 기초코드 추가
     */
    @PostMapping("/add")
    public ResponseEntity<Map<String, String>> addBaseCode(@RequestBody BaseCode baseCode) {
        try {
            baseCodeService.addBaseCode(baseCode);
            return ResponseEntity.ok(Map.of("message", "기초코드가 성공적으로 추가되었습니다."));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "기초코드 추가 중 오류가 발생했습니다: " + e.getMessage()));
        }
    }
    
    /**
     * 기초코드 삭제
     */
    @DeleteMapping
    public ResponseEntity<Map<String, String>> deleteBaseCodes(@RequestBody List<String> codeIds) {
        try {
            baseCodeService.deleteBaseCodes(codeIds);
            return ResponseEntity.ok(Map.of("message", "기초코드가 성공적으로 삭제되었습니다."));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "기초코드 삭제 중 오류가 발생했습니다: " + e.getMessage()));
        }
    }
}
