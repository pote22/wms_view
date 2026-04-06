import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../../api/login/loginApi.ts";
// 스타일(css) 추가
import "../../css/Login/Login.css";

function Login() {
  const navigate                          = useNavigate();
  const [showPassword, setShowPassword]   = useState(false);    // 비밀번호 보여주기 Hook 선언
  const [rememberMe, setRememberMe]       = useState(false);    // 사용자ID 저장 Hook 선언
  const [userId, setUserId]               = useState("");       // 사용자ID Hook 선언
  const [password, setPassword]           = useState("");       // 비밀번호 Hook 선언
  const [popupMessage, setPopupMessage]   = useState("");       // 팝업 메세지 Hook 선언

  // 로그인
  const handleLogin = (e: React.SyntheticEvent) => {
    e.preventDefault();

    if (!userId.trim()) {
      setPopupMessage("아이디를 입력하세요.");
      return;
    }
    if (!password.trim()) {
      setPopupMessage("비밀번호를 입력하세요.");
      return;
    }

    login(
      { userId, password },
      (data) => {
        // 로그인 성공
        console.log("result data : " + JSON.stringify(data));

        // 아이디 저장 처리
        if (rememberMe) {
          localStorage.setItem("savedUserId", userId);
        } else {
          localStorage.removeItem("savedUserId");
        }

        // 페이지 이동
        console.log("메인 페이지 이동")
        //navigate("/main");
      },
      (message) => {
        console.log("result message : " + message);
        // 로그인 실패
        setPopupMessage(message);
      }
    );
  };

  return (
    <div className="login-wrapper">

      {/* 레이어 팝업 */}
      {popupMessage && (
        <div className="popup-overlay">
          <div className="popup-box">
            <div className="popup-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#1a3fa8" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <p className="popup-message">{popupMessage}</p>
            <button className="popup-confirm" onClick={() => setPopupMessage("")}>확인</button>
          </div>
        </div>
      )}
      <div className="login-card">

        {/* 왼쪽 파란 패널 */}
        <div className="login-left">
          <div className="login-logo">
            <div className="login-logo-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                <rect x="3" y="3" width="8" height="8" rx="1" />
                <rect x="13" y="3" width="8" height="8" rx="1" />
                <rect x="3" y="13" width="8" height="8" rx="1" />
                <rect x="13" y="13" width="8" height="8" rx="1" />
              </svg>
            </div>
            <div className="login-logo-text">
              CJ WAREHOUSE MANAGEMENT<br />SYSTEM
            </div>
          </div>

          <div className="login-left-content">
            <h2 className="login-tagline">물류의 정밀한 설계자.</h2>
            <p className="login-description">
              기업 수준의 신뢰와 효율적인 관리로<br />
              창고 운영을 제어하세요.
            </p>
          </div>

          {/* 배경 워터마크 */}
          <div className="login-watermark">WMS</div>
        </div>

        {/* 오른쪽 흰색 패널 */}
        <div className="login-right">
          <div className="login-right-header">
            <h1 className="login-title">LOGIN WMS</h1>
            <p className="login-notice">
              본 시스템은 내부고객 및 임직원에 한하여 사용할 수 있습니다.
              불법적인 접근 및 시스템 사용시 관련법규에 따라 처벌 받을 수 있습니다.
            </p>
          </div>

          <form className="login-form" onSubmit={handleLogin}>
            {/* 사용자 아이디 */}
            <div className="form-group">
              <label className="form-label">사용자 아이디</label>
              <div className="input-wrapper">
                <span className="input-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="8" r="4" />
                    <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
                  </svg>
                </span>
                <input
                  type="text"
                  placeholder="아이디를 입력하세요"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  autoComplete="username"
                />
              </div>
            </div>

            {/* 비밀번호 */}
            <div className="form-group">
              <div className="form-label-row">
                <label className="form-label">비밀번호</label>
                {/* <a href="#" className="forgot-link">로그인 정보를 잊으셨나요?</a> */}
              </div>
              <div className="input-wrapper">
                <span className="input-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "비밀번호 숨기기" : "비밀번호 보기"}
                >
                  {showPassword ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* 아이디 저장 */}
            <div className="remember-row">
              <input
                type="checkbox"
                id="rememberMe"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <label htmlFor="rememberMe">아이디 저장</label>
            </div>

            {/* 로그인 버튼 */}
            <button type="submit" className="login-button">
              로그인
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </button>
          </form>

          {/* 하단 푸터 */}
          <div className="login-footer">
            <div className="login-footer-dot" />
            <span>보안 엔터프라이즈 환경</span>
            <span className="login-footer-divider">|</span>
            <a href="#">고객지원</a>
            <span className="login-footer-divider">/</span>
            <a href="#">개인정보처리방침</a>
          </div>
        </div>

      </div>
    </div>
  );
}

export default Login;
