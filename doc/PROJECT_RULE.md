# DwFw 프로젝트 규칙 (Project Rule)

작성일: 2025-10-30  
버전: 1.0  
기준 프로그램: 기초코드등록 (BaseCodePage)

---

## 1. 개요

본 문서는 DwFw 시스템의 모든 프로그램 개발 시 준수해야 하는 기본 규칙을 정의합니다. 이러한 규칙은 **기초코드등록 프로그램**에서 실제로 검증되고 적용된 방식입니다.

---

## 2. 프론트엔드 (React + TypeScript) 규칙

### 2.1 컴포넌트 구조

```typescript
// 1. 인터페이스 정의 (데이터 구조 명확히)
interface MainEntity {
  requiredField1: string;
  requiredField2: number;
  optionalField1?: string;
  regDate?: string;
  modDate?: string;
  regUser?: string;
  modUser?: string;
}

interface HelperEntity {
  id: string;
  name: string;
  description?: string;
}

// 2. 상태 관리
const Component: React.FC = () => {
  // 메인 데이터
  const [mainData, setMainData] = useState<MainEntity[]>([]);
  
  // 선택된 항목
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  
  // 조건/필터 데이터
  const [conditionData, setConditionData] = useState<string>('');
  
  // UI 상태
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  // ... 로직
};
```

### 2.2 API 통신 패턴

**⚠️ 중요: 하드코딩된 URL 금지**
- **절대 사용 금지**: `http://localhost:8080`, `http://localhost:3000` 등 하드코딩된 URL
- **반드시 사용**: `apiService`를 통한 중앙화된 API 호출
- 배포 환경(localhost, 개발서버, 프로덕션)에 따라 자동으로 올바른 URL 사용

**API 서비스 구조:**
```typescript
// frontend/src/services/api.ts
import axios, { AxiosInstance } from 'axios';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    // 환경 변수에서 API URL 가져오기 (우선순위: 1. 빌드 시 환경 변수, 2. 런타임 config.js, 3. 기본값)
    const apiUrl = process.env.REACT_APP_API_URL || 
                   (typeof window !== 'undefined' && (window as any).REACT_APP_API_URL) || 
                   '/api';
    
    this.api = axios.create({
      baseURL: apiUrl,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // 요청 인터셉터 - 토큰 자동 추가
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // 응답 인터셉터 - 에러 처리
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // 엔티티별 API 메서드 예시
  async getEntities(): Promise<any[]> {
    const response = await this.api.get('/entity-name');
    return response.data;
  }

  async getEntityById(id: string): Promise<any> {
    const response = await this.api.get(`/entity-name/${id}`);
    return response.data;
  }

  async saveEntities(entities: any[]): Promise<any> {
    const response = await this.api.post('/entity-name', entities);
    return response.data;
  }

  async deleteEntities(ids: string[]): Promise<void> {
    await this.api.delete('/entity-name', { data: ids });
  }
}

export const apiService = new ApiService();
export default apiService;
```

**프론트엔드 컴포넌트에서 사용:**
```typescript
import apiService from '../services/api';

// ❌ 잘못된 방법 (하드코딩된 URL)
const fetchList = async () => {
  const response = await fetch('http://localhost:8080/api/entity-name');
  // ...
};

// ✅ 올바른 방법 (apiService 사용)
const fetchList = async () => {
  try {
    const data = await apiService.getEntities();
    setMainData(data);
  } catch (error) {
    console.error('조회 오류:', error);
    showMessage('error', '조회 중 오류가 발생했습니다.');
  }
};

// 조회 (By Condition) - apiService 사용
const fetchByCondition = async (condition: string) => {
  if (!condition) return;
  setLoading(true);
  try {
    const data = await apiService.getEntitiesByCondition(condition);
    setMainData(Array.isArray(data) ? data : []);
    setSelectedItems(new Set());
  } catch (error) {
    console.error('조회 오류:', error);
    showMessage('error', '조회 중 오류가 발생했습니다.');
  } finally {
    setLoading(false);
  }
};

// 저장 (Save) - apiService 사용
const handleSave = async () => {
  try {
    if (!conditionData) {
      showMessage('error', '조건을 선택하세요.');
      return;
    }
    
    const payload = mainData.filter(item => item.conditionField === conditionData);
    await apiService.saveEntities(payload);
    showMessage('success', '저장되었습니다.');
    fetchByCondition(conditionData);
  } catch (error) {
    console.error('저장 오류:', error);
    showMessage('error', '저장 중 오류가 발생했습니다.');
  }
};

// 삭제 (Delete) - apiService 사용
const handleDelete = async () => {
  if (selectedItems.size === 0) {
    showMessage('error', '삭제할 항목을 선택해주세요.');
    return;
  }
  
  if (!window.confirm(`선택된 ${selectedItems.size}개 항목을 삭제하시겠습니까?`)) {
    return;
  }
  
  try {
    const ids = Array.from(selectedItems);
    await apiService.deleteEntities(ids);
    showMessage('success', '삭제되었습니다.');
    fetchByCondition(conditionData);
  } catch (error) {
    console.error('삭제 오류:', error);
    showMessage('error', '삭제 중 오류가 발생했습니다.');
  }
};
```

**메시지 표시 헬퍼:**
```typescript
const showMessage = (type: 'success' | 'error', text: string) => {
  setMessage({ type, text });
  setTimeout(() => setMessage(null), 3000);
};
```

### 2.3 UI 레이아웃 패턴

**기본 구조:**
```tsx
return (
  <div className="space-y-6">
    {/* 1. 페이지 제목 */}
    <div className="bg-sky-50 rounded-xl shadow-lg border border-sky-200 p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">화면명</h1>
      <p className="text-gray-600">
        화면 설명
      </p>
    </div>

    {/* 2. 버튼 영역 */}
    <div className="bg-sky-50 rounded-xl shadow-lg border border-sky-200 p-4">
      <div className="flex items-center space-x-4">
        <button onClick={handleSearch} className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          <Search className="h-4 w-4" />
          <span>조회</span>
        </button>
        <button onClick={handleAdd} className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
          <Plus className="h-4 w-4" />
          <span>추가</span>
        </button>
        <button onClick={handleDelete} className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
          <Trash2 className="h-4 w-4" />
          <span>삭제</span>
        </button>
        <button onClick={handleSave} className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
          <Save className="h-4 w-4" />
          <span>저장</span>
        </button>
      </div>
    </div>

    {/* 3. 메시지 (조건부) */}
    {message && (
      <div className={`p-4 rounded-lg ${
        message.type === 'success' 
          ? 'bg-green-50 border border-green-200 text-green-800' 
          : 'bg-red-50 border border-red-200 text-red-800'
      }`}>
        {message.text}
      </div>
    )}

    {/* 4. 조건 영역 */}
    <div className="bg-sky-50 rounded-xl shadow-lg border border-sky-200 p-4">
      <div className="flex items-start space-x-4">
        <label className="text-sm font-medium text-gray-700">조건명:</label>
        <select
          value={conditionData}
          onChange={(e) => handleConditionChange(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">선택하세요</option>
          {conditionList.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </select>
        {/* 추가 설명 표시 */}
        {selectedConditionInfo && selectedConditionInfo.description && (
          <div className="flex-1">
            <div className="w-full px-3 py-2 text-gray-900 whitespace-normal break-words">
              {selectedConditionInfo.description}
            </div>
          </div>
        )}
      </div>
    </div>

    {/* 5. 그리드 영역 */}
    <div className="bg-sky-50 rounded-xl shadow-lg border border-sky-200 overflow-hidden">
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="h-8 w-8 text-blue-600 animate-spin" />
          <span className="ml-2 text-gray-600">데이터를 불러오는 중...</span>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedItems.size === mainData.length && mainData.length > 0}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300"
                  />
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">컬럼1</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">컬럼2</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {mainData.map((item, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedItems.has(`${item.idField1}_${item.idField2}`)}
                      onChange={() => handleSelectItem(`${item.idField1}_${item.idField2}`)}
                      className="rounded border-gray-300"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <input
                      type="text"
                      value={item.field1}
                      onChange={(e) => handleGridChange(index, 'field1', e.target.value)}
                      className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <input
                      type="text"
                      value={item.field2}
                      onChange={(e) => handleGridChange(index, 'field2', e.target.value)}
                      className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {mainData.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              조회된 데이터가 없습니다.
            </div>
          )}
        </div>
      )}
    </div>
  </div>
);
```

### 2.4 Color Scheme

**프로그램 기본 색상:**
- Container Background: `bg-sky-50`
- Container Border: `border-sky-200`
- 버튼: 
  - 조회 (Search): `bg-blue-600 hover:bg-blue-700`
  - 추가 (Add): `bg-green-600 hover:bg-green-700`
  - 삭제 (Delete): `bg-red-600 hover:bg-red-700`
  - 저장 (Save): `bg-purple-600 hover:bg-purple-700`
- 메시지:
  - Success: `bg-green-50 border-green-200 text-green-800`
  - Error: `bg-red-50 border-red-200 text-red-800`
- 그리드:
  - Header: `bg-gray-50`
  - Hover: `hover:bg-gray-50`

### 2.5 API URL 설정 (환경별)

**런타임 설정 파일 (권장):**
- 위치: `frontend/public/config.js`
- 내용:
```javascript
window.REACT_APP_API_URL = 'https://backend-url.com/api';
```
- 장점: 빌드 없이 환경별 URL 변경 가능
- 사용: `index.html`에서 `<script src="%PUBLIC_URL%/config.js"></script>`로 로드

**빌드 시 환경 변수:**
- 파일: `.env.production`, `.env.development`
- 내용: `REACT_APP_API_URL=https://backend-url.com/api`
- 장점: 환경별 빌드 분리 가능

**기본값 (fallback):**
- 상대 경로: `/api`
- 프록시 사용 시: `package.json`의 `proxy` 설정 활용

---

## 3. 빌드 및 배포 규칙

### 3.1 로컬 개발 환경

**백엔드 실행:**
```bash
cd backend
mvn clean spring-boot:run
```

**프론트엔드 실행:**
```bash
cd frontend
npm install
npm start
```

### 3.2 프로덕션 빌드

**백엔드 빌드:**
```bash
cd backend
mvn clean package -DskipTests
# 결과물: backend/target/dwfw-backend-1.0.0.jar
```

**프론트엔드 빌드:**
```bash
cd frontend
npm install
npm run build
# 결과물: frontend/build/
```

### 3.3 GCP Cloud Run 배포

**배포 스크립트:**
- 위치: `scripts/deploy-gcp.ps1` (PowerShell)
- 사용법:
```powershell
# 전체 배포
.\scripts\deploy-gcp.ps1 all

# 백엔드만 배포
.\scripts\deploy-gcp.ps1 backend

# 프론트엔드만 배포
.\scripts\deploy-gcp.ps1 frontend
```

**배포 프로세스:**

1. **백엔드 배포**
   - Maven 빌드 (`mvn clean package -DskipTests`)
   - Docker 이미지 빌드 (Cloud Build)
   - Cloud Run에 배포
   - 환경 변수 설정:
     - `SPRING_JSON_DATA_PATH=/tmp/data`
     - `SPRING_PROFILES_ACTIVE=cloudrun`

2. **프론트엔드 배포**
   - 백엔드 URL 자동 조회
   - `config.js` 파일 업데이트 (백엔드 URL 반영)
   - `npm run build` 실행
   - Docker 이미지 빌드 (Cloud Build)
   - Cloud Run에 배포

**배포 전 확인사항:**
- [ ] GCP 프로젝트 ID 설정 확인
- [ ] gcloud CLI 로그인 및 프로젝트 설정 확인
- [ ] Cloud Run API 활성화 확인
- [ ] Docker 이미지 빌드 권한 확인
- [ ] 프론트엔드 `config.js` 백엔드 URL 확인

**배포 후 확인사항:**
- [ ] 백엔드 서비스 URL 확인
- [ ] 프론트엔드 서비스 URL 확인
- [ ] API 연결 테스트
- [ ] CORS 설정 확인
- [ ] 로그 확인: `gcloud run services logs read <service-name> --region=asia-northeast3`

### 3.4 Docker 설정

**백엔드 Dockerfile:**
```dockerfile
FROM eclipse-temurin:17-jdk-alpine
WORKDIR /app
COPY target/dwfw-backend-1.0.0.jar app.jar
RUN mkdir -p /tmp/data
EXPOSE 8080
ENV PORT=8080
ENV SPRING_JSON_DATA_PATH=/tmp/data
ENV SPRING_PROFILES_ACTIVE=cloudrun
ENTRYPOINT ["java", "-jar", "app.jar"]
```

**프론트엔드 Dockerfile:**
```dockerfile
FROM nginx:alpine
COPY build/ /usr/share/nginx/html/
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### 3.5 환경 변수 관리

**백엔드 환경 변수:**
- 개발: `application.yml`
- 프로덕션: `application-cloudrun.yml`
- Cloud Run: `--set-env-vars` 옵션으로 설정

**프론트엔드 환경 변수:**
- 런타임: `public/config.js` (권장)
- 빌드 시: `.env.production`, `.env.development`

---

## 4. 백엔드 (Spring Boot + Java) 규칙

### 4.1 엔티티 구조

```java
package com.dwfw.entity;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.fasterxml.jackson.datatype.jsr310.deser.LocalDateTimeDeserializer;
import com.fasterxml.jackson.datatype.jsr310.ser.LocalDateTimeSerializer;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EntityName {
    private String idField1;
    private String idField2;
    
    // 필수 필드
    private String requiredField1;
    private Integer requiredField2;
    
    // 선택 필드
    private String optionalField1;
    private String optionalField2;
    
    // 등록/수정 정보
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    @JsonDeserialize(using = LocalDateTimeDeserializer.class)
    @JsonSerialize(using = LocalDateTimeSerializer.class)
    private LocalDateTime regDate;
    
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    @JsonDeserialize(using = LocalDateTimeDeserializer.class)
    @JsonSerialize(using = LocalDateTimeSerializer.class)
    private LocalDateTime modDate;
    
    private String regUser;
    private String modUser;
    
    // 간소화된 생성자
    public EntityName(String idField1, String idField2, String requiredField1) {
        this.idField1 = idField1;
        this.idField2 = idField2;
        this.requiredField1 = requiredField1;
        this.requiredField2 = 0;
        this.regDate = LocalDateTime.now();
        this.modDate = LocalDateTime.now();
        this.regUser = "SYSTEM";
        this.modUser = "SYSTEM";
    }
}
```

### 4.2 Service 구조

```java
package com.dwfw.service;

import com.dwfw.entity.EntityName;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.fasterxml.jackson.databind.SerializationFeature;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.IOException;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class EntityNameService {
    
    private static final String DATA_FILE = "./data/entity_name.json";
    private final ObjectMapper objectMapper;
    
    public EntityNameService() {
        objectMapper = new ObjectMapper();
        objectMapper.registerModule(new JavaTimeModule());
        objectMapper.configure(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS, false);
    }
    
    /**
     * 모든 데이터 조회
     */
    public List<EntityName> getAllEntities() throws IOException {
        File dataFile = new File(DATA_FILE);
        if (!dataFile.exists() || dataFile.length() == 0) {
            initializeDefaultData();
        }
        return objectMapper.readValue(dataFile, new TypeReference<List<EntityName>>() {});
    }
    
    /**
     * 조건별 조회
     */
    public List<EntityName> getEntitiesByCondition(String condition) {
        List<EntityName> list = getAllBaseCodes().stream()
                .filter(item -> condition.equals(item.getConditionField()))
                .collect(Collectors.toList());
        
        if (list.isEmpty()) {
            initializeDefaultData();
            list = getAllEntities().stream()
                    .filter(item -> condition.equals(item.getConditionField()))
                    .collect(Collectors.toList());
        }
        
        return list;
    }
    
    /**
     * 목록 조회 (조건 데이터용)
     */
    public List<EntityName> getConditionList() {
        List<EntityName> conditions = getAllEntities().stream()
                .filter(item -> "ROOT".equals(item.getConditionType()))
                .collect(Collectors.toList());
        
        if (conditions.isEmpty()) {
            List<EntityName> defaults = new ArrayList<>();
            defaults.add(new EntityName("ROOT", "1", "조건1"));
            defaults.add(new EntityName("ROOT", "2", "조건2"));
            return defaults;
        }
        
        return conditions;
    }
    
    /**
     * 저장 (병합 방식)
     */
    public void saveEntities(List<EntityName> entities) throws IOException {
        if (entities == null || entities.isEmpty()) {
            return;
        }
        
        String targetCondition = entities.get(0).getConditionField();
        List<EntityName> allEntities = getAllEntities();
        
        // 대상 조건의 기존 데이터 제거
        List<EntityName> preserved = allEntities.stream()
                .filter(item -> !item.getConditionField().equals(targetCondition))
                .collect(Collectors.toList());
        
        // 등록/수정 정보 업데이트
        LocalDateTime now = LocalDateTime.now();
        for (EntityName item : entities) {
            if (item.getRegDate() == null) {
                item.setRegDate(now);
                item.setRegUser("SYSTEM");
            }
            item.setModDate(now);
            item.setModUser("SYSTEM");
        }
        
        // 병합
        List<EntityName> merged = new ArrayList<>();
        merged.addAll(preserved);
        merged.addAll(entities);
        
        // 저장
        File dataFile = new File(DATA_FILE);
        File parent = dataFile.getParentFile();
        if (parent != null && !parent.exists()) {
            parent.mkdirs();
        }
        
        objectMapper.writerWithDefaultPrettyPrinter()
                .writeValue(dataFile, merged);
    }
    
    /**
     * 삭제
     */
    public void deleteEntities(List<String> ids) throws IOException {
        List<EntityName> allEntities = getAllEntities();
        List<EntityName> filtered = allEntities.stream()
                .filter(item -> !ids.contains(item.getIdField1() + "_" + item.getIdField2()))
                .collect(Collectors.toList());
        
        saveEntities(filtered);
    }
    
    /**
     * 기본 데이터 초기화
     */
    private void initializeDefaultData() {
        List<EntityName> defaultData = new ArrayList<>();
        
        // 기본 데이터 추가
        defaultData.add(new EntityName("ROOT", "1", "조건1"));
        defaultData.add(new EntityName("ROOT", "2", "조건2"));
        
        // 데이터 파일 저장
        File dataFile = new File(DATA_FILE);
        File parent = dataFile.getParentFile();
        if (parent != null && !parent.exists()) {
            parent.mkdirs();
        }
        
        try {
            objectMapper.writerWithDefaultPrettyPrinter()
                    .writeValue(dataFile, defaultData);
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}
```

### 4.3 Controller 구조

```java
package com.dwfw.controller;

import com.dwfw.entity.EntityName;
import com.dwfw.service.EntityNameService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/entity-name")
@CrossOrigin(origins = "*")  // 프로덕션에서는 특정 도메인으로 제한 권장
public class EntityNameController {
    
    @Autowired
    private EntityNameService entityNameService;
    
    @GetMapping
    public ResponseEntity<List<EntityName>> getAllEntities() {
        try {
            List<EntityName> entities = entityNameService.getAllEntities();
            return ResponseEntity.ok(entities);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
    
    @GetMapping("/condition/{condition}")
    public ResponseEntity<List<EntityName>> getEntitiesByCondition(@PathVariable String condition) {
        try {
            List<EntityName> entities = entityNameService.getEntitiesByCondition(condition);
            return ResponseEntity.ok(entities);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
    
    @GetMapping("/categories")
    public ResponseEntity<List<EntityName>> getCategories() {
        try {
            List<EntityName> categories = entityNameService.getConditionList();
            return ResponseEntity.ok(categories);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
    
    @PostMapping
    public ResponseEntity<String> saveEntities(@RequestBody List<EntityName> entities) {
        try {
            entityNameService.saveEntities(entities);
            return ResponseEntity.ok("저장되었습니다.");
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("저장 중 오류가 발생했습니다.");
        }
    }
    
    @DeleteMapping
    public ResponseEntity<String> deleteEntities(@RequestBody List<String> ids) {
        try {
            entityNameService.deleteEntities(ids);
            return ResponseEntity.ok("삭제되었습니다.");
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("삭제 중 오류가 발생했습니다.");
        }
    }
}
```

### 4.4 Security 설정 및 CORS

**CORS 설정 (SecurityConfig.java):**
```java
@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
public class SecurityConfig {
    // ... 기타 설정 ...
    
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http.cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(csrf -> csrf.disable())
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/auth/**").permitAll()
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers("/entity-name/**").permitAll()  // 새 엔티티 API 추가
                .requestMatchers("/error").permitAll()
                .anyRequest().authenticated());
        
        return http.build();
    }
    
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        // Cloud Run 도메인 및 모든 origin 허용 (프로덕션 환경)
        configuration.setAllowedOriginPatterns(Arrays.asList(
            "https://*.run.app",
            "http://localhost:*",
            "*"
        ));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L); // preflight 결과 캐싱 시간
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
```

**⚠️ 중요:**
- `application-cloudrun.yml`의 CORS 설정은 무시됨 (SecurityConfig에서 통합 관리)
- 프로덕션에서는 특정 도메인만 허용하도록 제한 권장
- `setAllowedOriginPatterns` 사용 (와일드카드 패턴 지원)

---

## 5. 데이터 저장 규칙

### 5.1 JSON 파일 구조

- **저장 위치**: `backend/data/{entity_name}.json`
- **데이터 형식**: JSON 배열
- **초기 데이터**: 파일이 없거나 비어있으면 자동으로 초기화

### 5.2 필드 저장 규칙

**기본적으로 모든 필드를 저장하되, 필요시 조건에 따라 필드를 필터링:**

```typescript
// 프론트엔드 저장 시 조건별 필드 결정
const payload = filteredData.map(item => {
  const cleanItem: any = {
    requiredField1: item.requiredField1,
    requiredField2: item.requiredField2,
    // ... 기본 필드
  };
  
  // 조건별로 특정 필드만 추가
  if (selectedCondition === 'special') {
    cleanItem.specialField = item.specialField;
  }
  
  return cleanItem;
});
```

---

## 6. 동적 그리드 생성 (선택사항)

### 6.1 itemDefinition 파싱

```typescript
const parseItemDefinition = (itemDef?: string): { headers: string[], keyMap: Map<string, keyof Entity> } => {
  if (!itemDef) {
    return {
      headers: ['컬럼1', '컬럼2', '정렬순서', '사용여부', '비고'],
      keyMap: new Map([
        ['컬럼1', 'field1'],
        ['컬럼2', 'field2'],
        ['정렬순서', 'sortOrder'],
        ['사용여부', 'useYn'],
        ['비고', 'remark'],
      ])
    };
  }
  
  const parts = itemDef.split('|');
  const headers: string[] = [];
  const keyMap = new Map<string, keyof Entity>();
  
  parts.forEach(p => {
    const [key, label] = p.split('=');
    const displayLabel = label || key;
    headers.push(displayLabel);
    keyMap.set(displayLabel, key as keyof Entity);
  });
  
  headers.push('정렬순서', '사용여부', '비고');
  keyMap.set('정렬순서', 'sortOrder');
  keyMap.set('사용여부', 'useYn');
  keyMap.set('비고', 'remark');
  
  return { headers, keyMap };
};
```

---

## 7. 개발 체크리스트

### 7.1 프론트엔드

- [ ] TypeScript 인터페이스 정의 완료
- [ ] 상태 관리 (useState) 설정 완료
- [ ] **apiService를 통한 API 통신 구현** (하드코딩된 URL 금지)
- [ ] UI 레이아웃 (제목, 버튼, 조건, 그리드) 구현
- [ ] 메시지 표시 기능 구현
- [ ] 로딩 스피너 구현
- [ ] 에러 처리 구현
- [ ] 색상 스키마 적용
- [ ] 조건별 필드 저장 로직 구현
- [ ] `config.js` 설정 확인 (배포 환경)

### 7.2 백엔드

- [ ] Entity 클래스 정의 (Jackson 어노테이션 포함)
- [ ] Service 클래스 구현 (CRUD 메서드)
- [ ] Controller 클래스 구현 (RESTful API)
- [ ] Security 설정에 API 경로 추가
- [ ] **CORS 설정 확인** (SecurityConfig에서 통합 관리)
- [ ] JSON 파일 초기화 로직 구현
- [ ] LocalDateTime 처리 설정
- [ ] 병합 저장 로직 구현
- [ ] `application-cloudrun.yml` 설정 확인 (배포 환경)

### 7.3 배포

- [ ] 배포 스크립트 실행 전 확인사항 체크
- [ ] 백엔드 빌드 성공 확인
- [ ] 프론트엔드 빌드 성공 확인
- [ ] Docker 이미지 빌드 확인
- [ ] Cloud Run 배포 확인
- [ ] 배포 후 API 연결 테스트
- [ ] CORS 설정 테스트

### 7.4 테스트

- [ ] 조회 기능 테스트
- [ ] 추가 기능 테스트
- [ ] 수정 기능 테스트
- [ ] 삭제 기능 테스트
- [ ] 저장 기능 테스트
- [ ] 로딩 상태 테스트
- [ ] 에러 처리 테스트
- [ ] 조건 변경 테스트

---

## 8. 참고 사항

### 8.1 파일 구조

```
프로젝트루트/
├── backend/
│   ├── src/main/java/com/dwfw/
│   │   ├── entity/
│   │   │   └── EntityName.java
│   │   ├── service/
│   │   │   └── EntityNameService.java
│   │   └── controller/
│   │       └── EntityNameController.java
│   └── data/
│       └── entity_name.json
└── frontend/
    └── src/
        ├── pages/
        │   └── EntityNamePage.tsx
        └── components/
```

### 7.2 네이밍 규칙

- **Entity**: `EntityName.java`
- **Service**: `EntityNameService.java`
- **Controller**: `EntityNameController.java`
- **JSON 파일**: `{entity_name}.json`
- **React 컴포넌트**: `{EntityName}Page.tsx`
- **URL 경로**: `/entity-name` (kebab-case)

### 7.3 공통 패턴

1. **Fallback 데이터**: API 실패 시 프론트엔드에서 하드코딩된 기본 데이터 제공
2. **자동 초기화**: JSON 파일이 없거나 비어있으면 백엔드에서 자동 초기화
3. **병합 저장**: 전체 데이터를 덮어쓰지 않고 조건별로 병합
4. **메타 정보**: 모든 엔티티에 `regDate`, `modDate`, `regUser`, `modUser` 자동 관리
5. **Key 관리**: 복합키 사용 시 `{field1}_{field2}` 형식으로 ID 생성

### 7.4 코드 관리 프로그램 변형 패턴

프로젝트 내에는 **기초코드등록**과 **공통코드등록** 두 가지 유사한 프로그램이 있습니다. 각 프로그램은 기본 패턴은 동일하지만 다음 차이점을 가집니다:

#### 7.4.1 용어 및 필드명 차이

| 항목 | 기초코드 | 공통코드 |
|------|---------|---------|
| 조건 필드명 | `codeCategory` (코드분류) | `codeDivision` (코드구분) |
| ROOT 코드 형식 | 숫자 (1, 2, 3...) | 문자 (A01, B01, C01...) |
| 추가 필드 | `division1~3`, `codeDescription`, `itemDefinition`, `discountRate`, `amount`, `image` 등 | `codeValueNum`, `codeValueStr` |

#### 7.4.2 조회 방식 패턴

**패턴 A - 자동 조회 (기초코드 방식)**
```typescript
// 조건 변경 시 즉시 조회
<select
  value={conditionData}
  onChange={(e) => {
    handleConditionChange(e.target.value);
    fetchByCondition(e.target.value); // 자동 조회
  }}
>
```

**패턴 B - 수동 조회 (공통코드 방식)**
```typescript
// 조건 변경 시 조회 버튼 클릭 필요
<select
  value={conditionData}
  onChange={(e) => handleConditionChange(e.target.value)} // 상태만 변경
>
<button onClick={handleSearch}>조회</button> // 별도 조회 버튼
```

**선택 기준:**
- 사용자가 조건을 선택하면 즉시 결과를 보고 싶은 경우 → 패턴 A
- 사용자가 조건 선택 후 추가 확인 후 조회하고 싶은 경우 → 패턴 B

#### 7.4.3 초기 데이터 구조 차이

**기초코드 초기 데이터:**
```json
[
  { "codeCategory": "ROOT", "code": "1", "codeName": "분류1", ... },
  { "codeCategory": "ROOT", "code": "2", "codeName": "분류2", ... }
]
```

**공통코드 초기 데이터:**
```json
[
  { "codeDivision": "ROOT", "code": "A01", "codeName": "출근(근태)", ... },
  { "codeDivision": "ROOT", "code": "B01", "codeName": "AS항목", ... }
]
```

#### 7.4.4 새 코드 관리 프로그램 개발 시 체크리스트

새로운 코드 관리 프로그램을 개발할 때는 다음을 결정해야 합니다:

- [ ] 조건 필드명 결정 (`codeCategory` vs `codeDivision` vs 기타)
- [ ] ROOT 코드 형식 결정 (숫자 vs 문자 vs 기타)
- [ ] 조회 방식 결정 (자동 조회 vs 수동 조회)
- [ ] 추가 필드 필요 여부 확인 (`codeValueNum`, `codeValueStr` 등)
- [ ] 초기 데이터 구조 및 내용 정의
- [ ] 기존 코드 관리 프로그램과의 차이점 명세서에 기록

### 7.5 부분 저장/병합 규칙 (Changed-only Save Rule)

다음 규칙은 코드 관리형 화면(기초코드/공통코드/은행코드 등)에서 공통 적용한다.

- 프론트엔드
  - 조회 시 원본 데이터 스냅샷을 별도 상태로 보관한다(`originalData`).
  - 저장 시 현재 데이터와 원본을 비교해 “추가/변경된 항목”만 추출하여 전송한다.
  - 삭제는 별도 DELETE API로 선택된 식별자만 전송한다.

- 백엔드
  - POST로 전달된 항목 목록만 기존 JSON 데이터와 병합한다(전체 덮어쓰기 금지).
  - 신규 항목: `regDate`, `regUser`를 생성하고 기본값 보정 후 추가한다.
  - 기존 항목: `regDate`, `regUser`는 유지하고 `modDate`, `modUser`만 갱신한다.
  - 식별키(예: `bankCode`) 기준으로 매핑/병합한다.
  - 불변 필드(예: 외부 표준에서 제공되는 `bankName`)는 기존 값을 우선한다.

- 예시 (은행코드)
  - FE: `originalBanks` 보관 → 저장 시 달라진 행만 `POST /api/bank-codes`로 전송
  - BE: 전달받은 행만 기존 맵에 업데이트 후 전체 리스트로 재작성하여 저장


---

## 9. 프로그램 명세서 작성 규칙

### 8.1 개요

프로그램이 완료될 때마다 반드시 프로그램 명세서를 작성합니다. 명세서는 향후 유지보수 및 기능 확장을 위한 중요한 문서입니다.

### 8.2 명세서 작성 시점

- 프로그램 개발 완료 후 즉시 작성
- 주요 기능 변경 후 업데이트
- 버그 수정 후 변경 사항 기록

### 8.3 명세서 파일 구조

**파일명**: `{화면명}_명세서.{확장자}`

**저장 위치**: `doc/` 디렉토리

**지원 형식**:
- Markdown: `{화면명}_명세서.md`
- HTML: `{화면명}_명세서.html`
- PDF: `{화면명}_명세서.pdf`
- Word: `{화면명}_명세서.docx`

### 8.4 명세서 필수 구성요소

#### 1. 화면 구성도 (Browser Screen Capture)
- 실제 브라우저 캡처 이미지
- 화면 전체 스크린샷
- 이미지 파일: `doc/assets/{화면명}_screen.png` 또는 `doc/steps/` 하위

#### 2. 기능 설명
- 주요 버튼 기능 (조회, 추가, 삭제, 저장)
- 조건 영역 설명 (selectbox, input 등)
- 그리드 필드 설명 및 입력 방식

#### 3. 데이터 구조도
- Entity 클래스 구조
- JSON 데이터 구조
- 필드 타입 및 제약사항

#### 4. UML 다이어그램
- 클래스 다이어그램 (간단한 구조도)
- 데이터 흐름도
- 프로세스 플로우

#### 5. 프런트엔드 동작 흐름
- 사용자 인터랙션 시나리오
- 상태 변경 흐름
- API 호출 순서

#### 6. UI 정책 & 제약
- 입력 필드 제약사항 (maxLength, min/max 값)
- 버튼 활성화 조건
- 에러 처리 방식
- 로딩 표시 방식

#### 7. 테스트 체크리스트
- 조회 기능 테스트
- CRUD 기능 테스트
- 에러 처리 테스트
- UI/UX 테스트

#### 8. 부록
- 사용된 라이브러리 목록
- 참고 문서
- 개발 중 이슈 및 해결 방법

### 8.5 자동 명세서 생성 도구

`scripts/gen_{화면명}_spec.js` 스크립트를 사용하여 자동 생성한다. 명세서를 생성하라는 요청이 있을 때는 반드시 MD + HTML + PDF + DOCX 모두 생성한다.

실행 규칙
- 입력: `doc/{화면명}_명세서.md`
- 출력: `doc/{화면명}_명세서.{html,pdf,docx}` 및 스크린샷 `doc/{화면명}_screen.png` 또는 `doc/steps/*.png`
- 스크립트: `scripts/gen_{화면명}_spec.js` (예: `gen_basecode_spec.js`, `gen_bankcode_spec.js`)
- 환경변수: `TARGET_URL`(대상 화면 URL), `LOGIN_URL`, `LOGIN_ID`, `LOGIN_PW`, `HEADLESS`
- 의존성: `puppeteer`, `docx`, `html-docx-js`, `markdown-it`

```bash
# 예: 은행코드 명세서 생성
TARGET_URL=http://localhost:3000/dashboard/mlm/basic/bank-codes \
node scripts/gen_bankcode_spec.js
```

**기존 예시**: `scripts/gen_basecode_spec.js`

### 8.6 명세서 템플릿

Markdown 템플릿은 다음 구조를 따릅니다:

```markdown
# {화면명} 화면 명세서

작성일: YYYY-MM-DD  
작성자: 작성자명  
버전: 1.0

## 1. 화면구성도 (@Browser screen capture)
[스크린샷 이미지]

## 2. 기능 설명
### 2.1 버튼 영역
- 조회: ...
- 추가: ...
- 삭제: ...
- 저장: ...

### 2.2 조건 영역
- ...

### 2.3 그리드 영역
- ...

## 3. 데이터 구조도
[Entity 구조]

## 4. UML 다이어그램
[다이어그램]

## 5. 프런트엔드 동작 흐름
[흐름도]

## 6. UI 정책 & 제약
[제약사항]

## 7. 테스트 체크리스트
[체크리스트]

## 8. 부록
[부가 정보]
```

### 8.7 체크리스트

프로그램 완료 시 다음 사항을 확인:

- [ ] 프로그램 기능 정상 작동 확인
- [ ] Markdown 명세서 작성 완료
- [ ] 스크린샷 이미지 포함
- [ ] HTML/PDF/DOCX 버전 생성
- [ ] 기능 설명 완전히 기록
- [ ] 데이터 구조 명시
- [ ] 테스트 체크리스트 완료
- [ ] doc/ 디렉토리에 저장
- [ ] README.md나 관련 문서에 명세서 링크 추가

---

## 10. 버전 이력

| 버전 | 날짜 | 변경 내용 | 작성자 |
|------|------|----------|--------|
| 1.0 | 2025-10-30 | 초안 작성 (기초코드등록 기준) | 시스템 |
| 1.1 | 2025-10-30 | 프로그램 명세서 작성 규칙 추가 | 시스템 |
| 1.2 | 2025-01-27 | 코드 관리 프로그램 변형 패턴 추가 (공통코드등록 기준) | 시스템 |
| 1.3 | 2025-11-06 | API 통신 패턴 개선 (apiService 중앙화), 빌드/배포 규칙 추가 | 시스템 |

---

**본 문서는 DwFw 시스템의 모든 프로그램 개발 시 반드시 준수해야 합니다.**

