import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

// 디버깅: 초기화 확인
console.log('React 앱 초기화 시작');
console.log('API URL:', process.env.REACT_APP_API_URL || '/api');

const rootElement = document.getElementById('root');
if (!rootElement) {
  console.error('root element를 찾을 수 없습니다!');
  document.body.innerHTML = '<div style="padding: 20px; color: red;">오류: root element를 찾을 수 없습니다.</div>';
} else {
  console.log('root element 발견:', rootElement);
  const root = ReactDOM.createRoot(rootElement);
  
  try {
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
    console.log('React 앱 렌더링 완료');
  } catch (error) {
    console.error('React 렌더링 에러:', error);
    rootElement.innerHTML = `<div style="padding: 20px; color: red;">렌더링 에러: ${error}</div>`;
  }
}



