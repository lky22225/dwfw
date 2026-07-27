package com.dwfw.config;

import com.dwfw.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

/**
 * 애플리케이션 초기화 컴포넌트
 */
@Component
public class ApplicationInitializer implements CommandLineRunner {

    @Autowired
    private UserService userService;

    @Override
    public void run(String... args) throws Exception {
        // 애플리케이션 시작 시 관리자 계정 초기화
        try {
            userService.initializeAdminUser();
            System.out.println("✅ 관리자 계정이 성공적으로 초기화되었습니다.");
            System.out.println("   사용자명: ADMIN");
            System.out.println("   비밀번호: 1");
        } catch (Exception e) {
            System.out.println("⚠️  관리자 계정 초기화 중 오류가 발생했습니다: " + e.getMessage());
            e.printStackTrace();
        }
    }
}



