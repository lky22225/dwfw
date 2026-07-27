package com.dwfw.dto;

import com.dwfw.entity.User;
import com.dwfw.entity.UserRole;

/**
 * 로그인 응답 DTO
 */
public class LoginResponse {
    private String token;
    private String username;
    private String name;
    private String email;
    private UserRole role;
    private String companyName;

    // 기본 생성자
    public LoginResponse() {}

    // 생성자
    public LoginResponse(String token, User user) {
        this.token = token;
        this.username = user.getUsername();
        this.name = user.getName();
        this.email = user.getEmail();
        this.role = user.getRole();
        this.companyName = user.getCompanyName();
    }

    // Getter와 Setter
    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public UserRole getRole() {
        return role;
    }

    public void setRole(UserRole role) {
        this.role = role;
    }

    public String getCompanyName() {
        return companyName;
    }

    public void setCompanyName(String companyName) {
        this.companyName = companyName;
    }

    @Override
    public String toString() {
        return "LoginResponse{" +
                "username='" + username + '\'' +
                ", name='" + name + '\'' +
                ", email='" + email + '\'' +
                ", role=" + role +
                ", companyName='" + companyName + '\'' +
                '}';
    }
}
