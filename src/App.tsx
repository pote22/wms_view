import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login/Login";
import Container from "./pages/Container"
import PrivateRoute from "./components/PrivateRoute";
import LoadingOverlay from "./components/common/LoadingOverlay";

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <LoadingOverlay />
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        { /* 메인 페이지 (로그인 여부 체크 추가) */}
        <Route path="/main" element={
          <PrivateRoute>
            <Container />
          </PrivateRoute>
        } />
        {/* 정의되지 않은 모든 경로에 대해 처리 (선택사항) */}
        <Route path="*" element={<div>페이지를 찾을 수 없습니다.</div>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
