package com.dwfw.controller;

import com.dwfw.entity.CommonCode;
import com.dwfw.service.CommonCodeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/common-codes")
@CrossOrigin(origins = "*")
public class CommonCodeController {
    
    @Autowired
    private CommonCodeService commonCodeService;
    
    /**
     * 모든 공통코드 조회
     */
    @GetMapping
    public ResponseEntity<List<CommonCode>> getAllCommonCodes() {
        try {
            List<CommonCode> commonCodes = commonCodeService.getAllCommonCodes();
            return ResponseEntity.ok(commonCodes);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * ROOT 코드 목록 조회 (코드구분 셀렉트 박스용)
     */
    @GetMapping("/roots")
    public ResponseEntity<?> getRootCodes() {
        try {
            System.out.println("ROOT 코드 목록 조회 요청 수신");
            List<CommonCode> rootCodes = commonCodeService.getRootCodes();
            System.out.println("ROOT 코드 목록 조회 성공: " + rootCodes.size() + "개");
            return ResponseEntity.ok(rootCodes);
        } catch (Exception e) {
            System.err.println("ROOT 코드 목록 조회 중 오류: " + e.getMessage());
            e.printStackTrace();
            Map<String, String> error = new HashMap<>();
            error.put("error", "ROOT 코드 목록 조회 중 오류가 발생했습니다: " + e.getMessage());
            return ResponseEntity.internalServerError().body(error);
        }
    }
    
    /**
     * 코드구분별 공통코드 조회
     */
    @GetMapping("/division/{codeDivision}")
    public ResponseEntity<?> getCommonCodesByDivision(@PathVariable String codeDivision) {
        try {
            System.out.println("코드구분별 공통코드 조회 요청: " + codeDivision);
            // "EMPTY" 문자열이면 전체 조회
            if ("EMPTY".equals(codeDivision)) {
                List<CommonCode> allCodes = commonCodeService.getAllCommonCodes();
                System.out.println("전체 공통코드 조회 성공: " + allCodes.size() + "개");
                return ResponseEntity.ok(allCodes);
            }
            List<CommonCode> commonCodes = commonCodeService.getCommonCodesByDivision(codeDivision);
            System.out.println("코드구분 [" + codeDivision + "] 조회 성공: " + commonCodes.size() + "개");
            return ResponseEntity.ok(commonCodes);
        } catch (Exception e) {
            System.err.println("코드구분별 공통코드 조회 중 오류: " + e.getMessage());
            e.printStackTrace();
            Map<String, String> error = new HashMap<>();
            error.put("error", "공통코드 조회 중 오류가 발생했습니다: " + e.getMessage());
            return ResponseEntity.internalServerError().body(error);
        }
    }
    
    /**
     * 공통코드 저장
     */
    @PostMapping
    public ResponseEntity<Map<String, String>> saveCommonCodes(@RequestBody List<CommonCode> commonCodes) {
        try {
            commonCodeService.saveCommonCodes(commonCodes);
            return ResponseEntity.ok(Map.of("message", "공통코드가 성공적으로 저장되었습니다."));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "공통코드 저장 중 오류가 발생했습니다: " + e.getMessage()));
        }
    }
    
    /**
     * 공통코드 추가
     */
    @PostMapping("/add")
    public ResponseEntity<Map<String, String>> addCommonCode(@RequestBody CommonCode commonCode) {
        try {
            commonCodeService.addCommonCode(commonCode);
            return ResponseEntity.ok(Map.of("message", "공통코드가 성공적으로 추가되었습니다."));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "공통코드 추가 중 오류가 발생했습니다: " + e.getMessage()));
        }
    }
    
    /**
     * 공통코드 삭제
     */
    @DeleteMapping
    public ResponseEntity<Map<String, String>> deleteCommonCodes(@RequestBody List<String> codeIds) {
        try {
            commonCodeService.deleteCommonCodes(codeIds);
            return ResponseEntity.ok(Map.of("message", "공통코드가 성공적으로 삭제되었습니다."));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "공통코드 삭제 중 오류가 발생했습니다: " + e.getMessage()));
        }
    }
}

