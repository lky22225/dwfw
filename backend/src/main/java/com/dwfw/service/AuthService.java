package com.dwfw.service;

import com.dwfw.dto.LoginRequest;
import com.dwfw.dto.LoginResponse;
import com.dwfw.entity.User;
import com.dwfw.entity.UserRole;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

/**
 * 인증 서비스
 */
@Service
public class AuthService {

    @Autowired
    private UserService userService;

    @Autowired
    private JwtTokenService jwtTokenService;

    /**
     * 로그인 처리
     * @param loginRequest 로그인 요청
     * @return 로그인 응답
     */
    public LoginResponse login(LoginRequest loginRequest) {
        return userService.authenticate(loginRequest);
    }

    /**
     * 현재 사용자 정보 조회
     * @return 현재 사용자 정보
     */
    public Map<String, Object> getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new RuntimeException("인증되지 않은 사용자입니다.");
        }

        String username = authentication.getName();
        User user = userService.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));

        Map<String, Object> userInfo = new HashMap<>();
        userInfo.put("id", user.getId());
        userInfo.put("username", user.getUsername());
        userInfo.put("name", user.getName());
        userInfo.put("email", user.getEmail());
        userInfo.put("role", user.getRole());
        userInfo.put("companyName", user.getCompanyName());
        userInfo.put("menus", getMenusByRole(user.getRole()));

        return userInfo;
    }

    /**
     * 사용자 역할에 따른 메뉴 반환
     * @param role 사용자 역할
     * @return 메뉴 목록
     */
    private Map<String, Object> getMenusByRole(UserRole role) {
        Map<String, Object> menus = new HashMap<>();

        switch (role) {
            case SYSTEM_ADMIN:
                menus.put("기준정보", Map.of(
                    "조직", "/admin/organization",
                    "상품", "/admin/products",
                    "거래처", "/admin/partners"
                ));
                menus.put("주문관리", Map.of(
                    "주문관리", "/admin/orders",
                    "출고관리", "/admin/shipments"
                ));
                menus.put("게시판", Map.of(
                    "공지사항", "/admin/notices",
                    "게시판", "/admin/board"
                ));
                menus.put("시스템관리", Map.of(
                    "권한", "/admin/permissions",
                    "설정", "/admin/settings"
                ));
                break;

            case SYSTEM_USER:
                menus.put("주문관리", Map.of(
                    "주문관리", "/user/orders",
                    "출고관리", "/user/shipments"
                ));
                menus.put("게시판", Map.of(
                    "공지사항", "/user/notices"
                ));
                break;

            case PARTNER_USER:
                menus.put("기준정보", Map.of(
                    "주문관리", "/partner/orders",
                    "출고관리", "/partner/shipments"
                ));
                menus.put("게시판", Map.of(
                    "공지사항", "/partner/notices"
                ));
                break;
        }

        return menus;
    }
}



