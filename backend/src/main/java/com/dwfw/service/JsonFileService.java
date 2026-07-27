package com.dwfw.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

/**
 * JSON 파일 기반 데이터 저장소 서비스
 */
@Service
public class JsonFileService {

    @Value("${spring.json.data-path:./data/}")
    private String dataPath;

    private final ObjectMapper objectMapper;

    public JsonFileService() {
        this.objectMapper = new ObjectMapper();
        this.objectMapper.registerModule(new JavaTimeModule());
    }

    /**
     * 데이터 디렉토리 초기화
     */
    public void initializeDataDirectory() {
        try {
            Path path = Paths.get(dataPath);
            if (!Files.exists(path)) {
                Files.createDirectories(path);
            }
        } catch (IOException e) {
            throw new RuntimeException("데이터 디렉토리 생성 실패", e);
        }
    }

    /**
     * 객체를 JSON 파일로 저장
     * @param filename 파일명
     * @param data 저장할 데이터
     * @param <T> 데이터 타입
     */
    public <T> void saveToFile(String filename, T data) {
        try {
            initializeDataDirectory();
            File file = new File(dataPath + filename);
            objectMapper.writerWithDefaultPrettyPrinter().writeValue(file, data);
        } catch (IOException e) {
            throw new RuntimeException("파일 저장 실패: " + filename, e);
        }
    }

    /**
     * JSON 파일에서 객체 읽기
     * @param filename 파일명
     * @param clazz 클래스 타입
     * @param <T> 데이터 타입
     * @return 읽어온 데이터
     */
    public <T> T readFromFile(String filename, Class<T> clazz) {
        try {
            File file = new File(dataPath + filename);
            if (!file.exists()) {
                return null;
            }
            return objectMapper.readValue(file, clazz);
        } catch (IOException e) {
            throw new RuntimeException("파일 읽기 실패: " + filename, e);
        }
    }

    /**
     * JSON 파일에서 리스트 읽기
     * @param filename 파일명
     * @param clazz 클래스 타입
     * @param <T> 데이터 타입
     * @return 읽어온 리스트 (null 가능)
     */
    public <T> List<T> readListFromFile(String filename, Class<T> clazz) {
        try {
            File file = new File(dataPath + filename);
            if (!file.exists()) {
                return null; // null 반환 (호출하는 쪽에서 ArrayList로 변환)
            }
            return objectMapper.readValue(file, 
                objectMapper.getTypeFactory().constructCollectionType(List.class, clazz));
        } catch (IOException e) {
            throw new RuntimeException("파일 읽기 실패: " + filename, e);
        }
    }

    /**
     * 파일 존재 여부 확인
     * @param filename 파일명
     * @return 존재 여부
     */
    public boolean fileExists(String filename) {
        File file = new File(dataPath + filename);
        return file.exists();
    }
}



