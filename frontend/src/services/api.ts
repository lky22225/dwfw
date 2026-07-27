import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { LoginRequest, LoginResponse, AuthUser } from '../types';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    // 환경 변수에서 API URL 가져오기
    // 1. 빌드 시 환경 변수 (process.env.REACT_APP_API_URL)
    // 2. 런타임 설정 파일 (window.REACT_APP_API_URL)
    // 3. 기본값 (/api)
    const apiUrl = process.env.REACT_APP_API_URL || 
                   (typeof window !== 'undefined' && (window as any).REACT_APP_API_URL) || 
                   '/api';
    
    console.log('🔗 API Service 초기화');
    console.log('   빌드 시 환경 변수:', process.env.REACT_APP_API_URL || '설정되지 않음');
    console.log('   런타임 설정:', (typeof window !== 'undefined' && (window as any).REACT_APP_API_URL) || '설정되지 않음');
    console.log('   최종 API URL:', apiUrl);
    
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
      (error) => {
        return Promise.reject(error);
      }
    );

    // 응답 인터셉터 - 에러 처리
    this.api.interceptors.response.use(
      (response: AxiosResponse) => {
        return response;
      },
      (error) => {
        if (error.response?.status === 401) {
          // 토큰 만료 시 로그아웃 처리
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // 인증 관련 API
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await this.api.post('/auth/login', credentials);
    return response.data;
  }

  async logout(): Promise<void> {
    await this.api.post('/auth/logout');
  }

  async getCurrentUser(): Promise<AuthUser> {
    const response = await this.api.get('/auth/me');
    return response.data;
  }

  async initializeAdmin(): Promise<{ message: string; username: string; password: string }> {
    const response = await this.api.post('/auth/init-admin');
    return response.data;
  }

  // 사용자 관리 API
  async getUsers(): Promise<any[]> {
    const response = await this.api.get('/users');
    return response.data;
  }

  async createUser(userData: any): Promise<any> {
    const response = await this.api.post('/users', userData);
    return response.data;
  }

  async updateUser(id: number, userData: any): Promise<any> {
    const response = await this.api.put(`/users/${id}`, userData);
    return response.data;
  }

  async deleteUser(id: number): Promise<void> {
    await this.api.delete(`/users/${id}`);
  }

  // 주문 관리 API
  async getOrders(params?: any): Promise<any[]> {
    const response = await this.api.get('/orders', { params });
    return response.data;
  }

  async getOrder(id: number): Promise<any> {
    const response = await this.api.get(`/orders/${id}`);
    return response.data;
  }

  async createOrder(orderData: any): Promise<any> {
    const response = await this.api.post('/orders', orderData);
    return response.data;
  }

  async updateOrder(id: number, orderData: any): Promise<any> {
    const response = await this.api.put(`/orders/${id}`, orderData);
    return response.data;
  }

  async deleteOrder(id: number): Promise<void> {
    await this.api.delete(`/orders/${id}`);
  }

  // 상품 관리 API
  async getProducts(params?: any): Promise<any[]> {
    const response = await this.api.get('/products', { params });
    return response.data;
  }

  async getProduct(id: number): Promise<any> {
    const response = await this.api.get(`/products/${id}`);
    return response.data;
  }

  async createProduct(productData: any): Promise<any> {
    const response = await this.api.post('/products', productData);
    return response.data;
  }

  async updateProduct(id: number, productData: any): Promise<any> {
    const response = await this.api.put(`/products/${id}`, productData);
    return response.data;
  }

  async deleteProduct(id: number): Promise<void> {
    await this.api.delete(`/products/${id}`);
  }

  // 거래처 관리 API
  async getPartners(params?: any): Promise<any[]> {
    const response = await this.api.get('/partners', { params });
    return response.data;
  }

  async getPartner(id: number): Promise<any> {
    const response = await this.api.get(`/partners/${id}`);
    return response.data;
  }

  async createPartner(partnerData: any): Promise<any> {
    const response = await this.api.post('/partners', partnerData);
    return response.data;
  }

  async updatePartner(id: number, partnerData: any): Promise<any> {
    const response = await this.api.put(`/partners/${id}`, partnerData);
    return response.data;
  }

  async deletePartner(id: number): Promise<void> {
    await this.api.delete(`/partners/${id}`);
  }

  // 게시판 API
  async getBoards(params?: any): Promise<any[]> {
    const response = await this.api.get('/boards', { params });
    return response.data;
  }

  async getBoard(id: number): Promise<any> {
    const response = await this.api.get(`/boards/${id}`);
    return response.data;
  }

  async createBoard(boardData: any): Promise<any> {
    const response = await this.api.post('/boards', boardData);
    return response.data;
  }

  async updateBoard(id: number, boardData: any): Promise<any> {
    const response = await this.api.put(`/boards/${id}`, boardData);
    return response.data;
  }

  async deleteBoard(id: number): Promise<void> {
    await this.api.delete(`/boards/${id}`);
  }

  // 조직 관리 API
  async getOrganizations(): Promise<any[]> {
    const response = await this.api.get('/organizations');
    return response.data;
  }

  async createOrganization(orgData: any): Promise<any> {
    const response = await this.api.post('/organizations', orgData);
    return response.data;
  }

  async updateOrganization(id: number, orgData: any): Promise<any> {
    const response = await this.api.put(`/organizations/${id}`, orgData);
    return response.data;
  }

  async deleteOrganization(id: number): Promise<void> {
    await this.api.delete(`/organizations/${id}`);
  }

  // 기초코드 관리 API
  async getBaseCodeCategories(): Promise<any[]> {
    const response = await this.api.get('/base-codes/categories');
    return response.data;
  }

  async getBaseCodesByCategory(categoryCode: string): Promise<any[]> {
    const response = await this.api.get(`/base-codes/category/${categoryCode}`);
    return response.data;
  }

  async saveBaseCodes(baseCodes: any[]): Promise<any> {
    const response = await this.api.post('/base-codes', baseCodes);
    return response.data;
  }

  async deleteBaseCodes(codeIds: string[]): Promise<void> {
    await this.api.delete('/base-codes', { data: codeIds });
  }

  // 공통코드 관리 API
  async getCommonCodeRoots(): Promise<any[]> {
    const response = await this.api.get('/common-codes/roots');
    return response.data;
  }

  async getCommonCodesByDivision(division: string): Promise<any[]> {
    const divisionParam = division || 'EMPTY';
    const response = await this.api.get(`/common-codes/division/${encodeURIComponent(divisionParam)}`);
    return response.data;
  }

  async saveCommonCodes(commonCodes: any[]): Promise<any> {
    const response = await this.api.post('/common-codes', commonCodes);
    return response.data;
  }

  async deleteCommonCodes(codeIds: string[]): Promise<void> {
    await this.api.delete('/common-codes', { data: codeIds });
  }

  // 은행코드 관리 API
  async getBankCodes(searchQuery?: string): Promise<any[]> {
    if (searchQuery) {
      const response = await this.api.get('/bank-codes/search', { params: { q: searchQuery } });
      return response.data;
    } else {
      const response = await this.api.get('/bank-codes');
      return response.data;
    }
  }

  async saveBankCodes(bankCodes: any[]): Promise<any> {
    const response = await this.api.post('/bank-codes', bankCodes);
    return response.data;
  }

  async deleteBankCodes(bankCodes: string[]): Promise<void> {
    await this.api.delete('/bank-codes', { data: bankCodes });
  }
}

export const apiService = new ApiService();
export default apiService;


