package com.dwfw.util;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;

/**
 * 보안 관련 유틸리티 클래스
 */
public class SecurityUtil {

    /**
     * SHA-256 해시 생성
     * @param input 원본 문자열
     * @return SHA-256 해시값
     */
    public static String sha256(String input) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(input.getBytes(StandardCharsets.UTF_8));
            
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) {
                    hexString.append('0');
                }
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("SHA-256 알고리즘을 찾을 수 없습니다.", e);
        }
    }

    /**
     * 비밀번호 검증
     * @param rawPassword 원본 비밀번호
     * @param encodedPassword 인코딩된 비밀번호
     * @return 일치 여부
     */
    public static boolean matches(String rawPassword, String encodedPassword) {
        return sha256(rawPassword).equals(encodedPassword);
    }

    /**
     * 관리자 계정 기본 비밀번호 ("1")의 SHA-256 해시값
     * @return SHA-256 해시값
     */
    public static String getAdminDefaultPassword() {
        return sha256("1");
    }
}



