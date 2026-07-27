package com.dwfw.service;

import com.dwfw.dto.LoginRequest;
import com.dwfw.dto.LoginResponse;
import com.dwfw.entity.User;
import com.dwfw.entity.UserRole;
import com.dwfw.util.SecurityUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.atomic.AtomicLong;

/**
 * 사용자 서비스
 */
@Service
public class UserService {

    @Autowired
    private JsonFileService jsonFileService;

    @Autowired
    private JwtTokenService jwtTokenService;

    private static final String USERS_FILE = "users.json";
    private static final String USER_ID_SEQUENCE_FILE = "user_id_sequence.json";

    /**
     * 사용자 인증
     * @param loginRequest 로그인 요청
     * @return 로그인 응답 (JWT 토큰 포함)
     */
    public LoginResponse authenticate(LoginRequest loginRequest) {
        User user = findByUsername(loginRequest.getUsername())
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));

        System.out.println("🔐 로그인 인증 디버깅:");
        System.out.println("   입력된 비밀번호: " + loginRequest.getPassword());
        System.out.println("   저장된 비밀번호 해시: " + user.getPassword());
        System.out.println("   입력 비밀번호 해시: " + SecurityUtil.sha256(loginRequest.getPassword()));
        System.out.println("   비밀번호 일치 여부: " + SecurityUtil.matches(loginRequest.getPassword(), user.getPassword()));

        if (!SecurityUtil.matches(loginRequest.getPassword(), user.getPassword())) {
            throw new RuntimeException("비밀번호가 일치하지 않습니다.");
        }

        if (!user.getActive()) {
            throw new RuntimeException("비활성화된 계정입니다.");
        }

        String token = jwtTokenService.generateToken(user.getUsername(), user.getRole().name());
        return new LoginResponse(token, user);
    }

    /**
     * 사용자명으로 사용자 조회
     * @param username 사용자명
     * @return 사용자 정보
     */
    public Optional<User> findByUsername(String username) {
        List<User> users = getAllUsers();
        return users.stream()
                .filter(user -> user.getUsername().equals(username))
                .findFirst();
    }

    /**
     * ID로 사용자 조회
     * @param id 사용자 ID
     * @return 사용자 정보
     */
    public Optional<User> findById(Long id) {
        List<User> users = getAllUsers();
        return users.stream()
                .filter(user -> user.getId().equals(id))
                .findFirst();
    }

    /**
     * 모든 사용자 조회
     * @return 사용자 목록 (수정 가능한 리스트)
     */
    public List<User> getAllUsers() {
        List<User> users = jsonFileService.readListFromFile(USERS_FILE, User.class);
        // 불변 리스트일 수 있으므로 새로운 ArrayList로 복사
        return users != null ? new ArrayList<>(users) : new ArrayList<>();
    }

    /**
     * 사용자 저장
     * @param user 저장할 사용자
     * @return 저장된 사용자
     */
    public User saveUser(User user) {
        List<User> existingUsers = getAllUsers();
        List<User> users = new ArrayList<>(existingUsers);
        
        if (user.getId() == null) {
            user.setId(getNextUserId());
        }
        
        System.out.println("💾 사용자 저장 디버깅:");
        System.out.println("   저장할 사용자명: " + user.getUsername());
        System.out.println("   저장할 비밀번호: " + user.getPassword());
        System.out.println("   저장할 비밀번호 해시: " + user.getPassword());
        
        // 기존 사용자 업데이트
        users.removeIf(u -> u.getId().equals(user.getId()));
        users.add(user);
        
        jsonFileService.saveToFile(USERS_FILE, users);
        
        // 저장 후 확인
        User savedUser = findByUsername(user.getUsername()).orElse(null);
        if (savedUser != null) {
            System.out.println("   저장된 사용자명: " + savedUser.getUsername());
            System.out.println("   저장된 비밀번호: " + savedUser.getPassword());
        }
        
        return user;
    }

    /**
     * 사용자 삭제
     * @param id 삭제할 사용자 ID
     */
    public void deleteUser(Long id) {
        List<User> users = getAllUsers(); // 이미 수정 가능한 리스트 반환
        users.removeIf(user -> user.getId().equals(id));
        jsonFileService.saveToFile(USERS_FILE, users);
    }

    /**
     * 다음 사용자 ID 생성
     * @return 다음 사용자 ID
     */
    private Long getNextUserId() {
        AtomicLong sequence = jsonFileService.readFromFile(USER_ID_SEQUENCE_FILE, AtomicLong.class);
        if (sequence == null) {
            sequence = new AtomicLong(1);
        }
        Long nextId = sequence.incrementAndGet();
        jsonFileService.saveToFile(USER_ID_SEQUENCE_FILE, sequence);
        return nextId;
    }

    /**
     * 관리자 계정 초기화
     */
    public void initializeAdminUser() {
        try {
            System.out.println("🔧 관리자 계정 초기화 시작");
            
            // 기존 관리자 계정 삭제
            List<User> existingUsers = getAllUsers();
            System.out.println("   기존 사용자 수: " + existingUsers.size());
            existingUsers.removeIf(user -> "ADMIN".equals(user.getUsername()));
            jsonFileService.saveToFile(USERS_FILE, existingUsers);
            System.out.println("   기존 관리자 계정 삭제 완료");
            
            String hashedPassword = SecurityUtil.getAdminDefaultPassword();
            System.out.println("🔐 생성할 관리자 계정 정보:");
            System.out.println("   사용자명: ADMIN");
            System.out.println("   원본 비밀번호: 1");
            System.out.println("   해시된 비밀번호: " + hashedPassword);
            
            User adminUser = new User(
                "ADMIN",
                hashedPassword,
                "시스템관리자",
                "admin@dwfw.com",
                UserRole.SYSTEM_ADMIN
            );
            adminUser.setCompanyName("DwFw System");
            adminUser.setActive(true);
            
            saveUser(adminUser);
            
            // 저장 확인
            Optional<User> savedAdmin = findByUsername("ADMIN");
            if (savedAdmin.isPresent()) {
                System.out.println("✅ 관리자 계정 생성 완료");
                System.out.println("   저장된 사용자 ID: " + savedAdmin.get().getId());
            } else {
                throw new RuntimeException("관리자 계정 저장 후 확인 실패");
            }
        } catch (Exception e) {
            System.err.println("❌ 관리자 계정 초기화 중 오류: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("관리자 계정 초기화 실패: " + e.getMessage(), e);
        }
    }
}


