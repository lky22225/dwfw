package com.dwfw.entity;

/**
 * 사용자 권한 열거형
 */
public enum UserRole {
    SYSTEM_ADMIN("시스템관리자"),
    SYSTEM_USER("시스템사용자"),
    PARTNER_USER("파트너사용자");

    private final String description;

    UserRole(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }

    /**
     * 문자열로부터 UserRole 생성
     */
    public static UserRole fromString(String role) {
        for (UserRole userRole : UserRole.values()) {
            if (userRole.name().equalsIgnoreCase(role)) {
                return userRole;
            }
        }
        throw new IllegalArgumentException("Unknown user role: " + role);
    }
}



