package com.dwfw.service;

import org.springframework.stereotype.Service;

@Service
public class JwtTokenService {

    /**
     * JWT 토큰 생성 (임시 구현)
     * @param username 사용자명
     * @param role 사용자 역할
     * @return JWT 토큰
     */
    public String generateToken(String username, String role) {
        // 임시로 단순한 토큰 생성
        return "token_" + username + "_" + role + "_" + System.currentTimeMillis();
    }

    /**
     * 토큰에서 사용자명 추출 (임시 구현)
     * @param token JWT 토큰
     * @return 사용자명
     */
    public String extractUsername(String token) {
        if (token != null && token.startsWith("token_")) {
            String[] parts = token.split("_");
            if (parts.length >= 2) {
                return parts[1];
            }
        }
        return null;
    }

    /**
     * 토큰 만료 여부 확인 (임시 구현)
     * @param token JWT 토큰
     * @return 만료 여부
     */
    public Boolean isTokenExpired(String token) {
        // 임시로 항상 false 반환 (만료되지 않음)
        return false;
    }

    /**
     * 토큰 유효성 검증 (임시 구현)
     * @param token JWT 토큰
     * @param username 사용자명
     * @return 유효성 여부
     */
    public Boolean validateToken(String token, String username) {
        String extractedUsername = extractUsername(token);
        return extractedUsername != null && extractedUsername.equals(username) && !isTokenExpired(token);
    }

    /**
     * 토큰에서 역할 추출 (임시 구현)
     * @param token JWT 토큰
     * @return 역할
     */
    public String extractRole(String token) {
        if (token != null && token.startsWith("token_")) {
            String[] parts = token.split("_");
            if (parts.length >= 3) {
                return parts[2];
            }
        }
        return null;
    }
}