package com.dwfw.controller;

import com.dwfw.dto.LoginRequest;
import com.dwfw.dto.LoginResponse;
import com.dwfw.service.AuthService;
import com.dwfw.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

/**
 * 인증 컨트롤러
 */
@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    @Autowired
    private AuthService authService;

    @Autowired
    private UserService userService;

    /**
     * 로그인
     * @param loginRequest 로그인 요청
     * @return 로그인 응답
     */
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest) {
        try {
            System.out.println("🔐 로그인 요청 수신: " + loginRequest.getUsername());
            LoginResponse response = authService.login(loginRequest);
            System.out.println("✅ 로그인 성공: " + response.getUsername());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.out.println("❌ 로그인 실패: " + e.getMessage());
            e.printStackTrace();
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    /**
     * 로그아웃
     * @return 로그아웃 응답
     */
    @PostMapping("/logout")
    public ResponseEntity<?> logout() {
        Map<String, String> response = new HashMap<>();
        response.put("message", "로그아웃되었습니다.");
        return ResponseEntity.ok(response);
    }

    /**
     * 사용자 정보 조회
     * @return 사용자 정보
     */
    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser() {
        try {
            return ResponseEntity.ok(authService.getCurrentUser());
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    /**
     * 관리자 계정 초기화 (GET 요청 - 정보만 반환)
     * @return 초기화 안내 메시지
     */
    @GetMapping("/init-admin")
    public ResponseEntity<?> getInitAdminInfo() {
        Map<String, String> response = new HashMap<>();
        response.put("message", "관리자 계정 초기화는 POST 메서드로 요청해야 합니다.");
        response.put("method", "POST");
        response.put("endpoint", "/api/auth/init-admin");
        response.put("description", "프론트엔드에서 버튼을 클릭하거나, curl/postman 등을 사용하여 POST 요청을 보내세요.");
        return ResponseEntity.ok(response);
    }

    /**
     * 관리자 계정 초기화 (POST 요청 - 실제 초기화 수행)
     * @return 초기화 결과
     */
    @PostMapping("/init-admin")
    public ResponseEntity<?> initializeAdmin() {
        try {
            System.out.println("🔧 관리자 계정 초기화 요청 수신");
            System.out.println("   데이터 경로: " + System.getProperty("spring.json.data-path", "기본값"));
            
            userService.initializeAdminUser();
            
            Map<String, String> response = new HashMap<>();
            response.put("message", "관리자 계정이 초기화되었습니다.");
            response.put("username", "ADMIN");
            response.put("password", "1");
            
            System.out.println("✅ 관리자 계정 초기화 성공");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.err.println("❌ 관리자 계정 초기화 실패: " + e.getMessage());
            e.printStackTrace();
            
            Map<String, Object> error = new HashMap<>();
            error.put("error", e.getMessage());
            error.put("detail", e.getClass().getName());
            if (e.getCause() != null) {
                error.put("cause", e.getCause().getMessage());
            }
            return ResponseEntity.badRequest().body(error);
        }
    }
}



