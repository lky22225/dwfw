// 사용자 관련 타입
export enum UserRole {
  SYSTEM_ADMIN = 'SYSTEM_ADMIN',
  SYSTEM_USER = 'SYSTEM_USER',
  PARTNER_USER = 'PARTNER_USER'
}

export interface User {
  id: number;
  username: string;
  name: string;
  email: string;
  role: UserRole;
  companyName?: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

// 인증 관련 타입
export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  username: string;
  name: string;
  email: string;
  role: UserRole;
  companyName?: string;
}

export interface AuthUser {
  id: number;
  username: string;
  name: string;
  email: string;
  role: UserRole;
  companyName?: string;
  menus: MenuStructure;
}

// 메뉴 관련 타입
export interface MenuStructure {
  [key: string]: {
    [key: string]: string;
  };
}

export interface MenuItem {
  label: string;
  path: string;
  icon?: string;
  children?: MenuItem[];
}

// API 응답 타입
export interface ApiResponse<T = any> {
  data?: T;
  message?: string;
  error?: string;
  status?: number;
}

// 폼 관련 타입
export interface FormErrors {
  [key: string]: string;
}

// 테이블 관련 타입
export interface TableColumn {
  key: string;
  title: string;
  dataIndex: string;
  width?: number;
  align?: 'left' | 'center' | 'right';
  render?: (value: any, record: any) => React.ReactNode;
}

// 페이지네이션 타입
export interface Pagination {
  current: number;
  pageSize: number;
  total: number;
}

// 검색 타입
export interface SearchParams {
  keyword?: string;
  startDate?: string;
  endDate?: string;
  status?: string;
  [key: string]: any;
}

// 주문 관련 타입
export interface Order {
  id: number;
  orderNumber: string;
  customerName: string;
  orderDate: string;
  status: OrderStatus;
  totalAmount: number;
  items: OrderItem[];
}

export enum OrderStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED'
}

export interface OrderItem {
  id: number;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

// 상품 관련 타입
export interface Product {
  id: number;
  productCode: string;
  productName: string;
  category: string;
  price: number;
  stock: number;
  description?: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

// 거래처 관련 타입
export interface Partner {
  id: number;
  partnerCode: string;
  partnerName: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  businessType: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

// 게시판 관련 타입
export interface Board {
  id: number;
  title: string;
  content: string;
  author: string;
  category: string;
  viewCount: number;
  isNotice: boolean;
  createdAt: string;
  updatedAt: string;
}

// 조직 관련 타입
export interface Organization {
  id: number;
  orgCode: string;
  orgName: string;
  parentId?: number;
  level: number;
  sortOrder: number;
  active: boolean;
  children?: Organization[];
}



