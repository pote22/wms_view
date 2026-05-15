import { useState, useRef } from "react";
import { useNavigate } from 'react-router-dom';
import { loginService } from "../../api/user/loginService.ts";
// 스타일(css) 추가
import "../../css/Login/Login.css";

const Login: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);  // 비밀번호 표시 여부
  const [regUserId, setRegUserId] = useState(false);  // 아이디 저장 여부
  const [userId, setUserId] = useState("");     // 사용자 아이디
  const [password, setPassword] = useState("");     // 비밀번호
  const [popupMessage, setPopupMessage] = useState("");     // 로그인 실패 메시지 

  const userIdRef = useRef<HTMLInputElement>(null);   // 사용자 아이디 입력 필드 참조
  const passwordRef = useRef<HTMLInputElement>(null);   // 비밀번호 입력 필드 참조
  const focusAfterPopup = useRef<HTMLInputElement | null>(null); // 팝업 닫힌 후 포커스 대상

  const navigate = useNavigate();    // 

  // 로그인
  const handleSubmit = async (e: React.SyntheticEvent) => {
    // 폼 제출 기본 동작 방지
    e.preventDefault();

    if (!userId.trim()) {
      focusAfterPopup.current = userIdRef.current;
      setPopupMessage("아이디를 입력하세요.");
      return;
    }

    if (!password.trim()) {
      focusAfterPopup.current = passwordRef.current;
      setPopupMessage("비밀번호를 입력하세요.");
      return;
    }

    await loginService(
      { userId, password },
      (res) => {
        // 성공 콜백: 토큰 및 사용자 정보 저장
        sessionStorage.setItem("accessToken", res.accessToken);
        navigate('/main', { replace: true });
      },
      (err) => {
        // 1. 서버가 응답을 보냈는지 확인 (401, 500 등)
        if (err.response) {
          console.log('에러 상태 코드:', err.response.status); // 401
          console.log('서버 에러 데이터:', err.response.data); // 여기서 resultCode, resultMessage 확인 가능

          var resultCode = err.response.data.resultCode;
          var resultMsg = err.response.data.resultMessage || '오류가 발생했습니다. 담당자에게 문의하여 주십시오.'

          if (resultCode == "0002") {
            setPopupMessage(resultMsg);
            return;
          }
        } else {
          // 2. 서버 접속 자체가 안 된 경우 (네트워크 에러 등)
          console.error('네트워크 에러:', err.message);
          alert('서버와 통신할 수 없습니다.');
        }
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
            <button className="popup-confirm" onClick={() => { setPopupMessage(""); focusAfterPopup.current?.focus(); }} tabIndex={-1}>확인</button>
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
          <div className="login-right-inner">
            <div className="login-right-header">
              <h1 className="login-title">LOGIN WMS</h1>
              <p className="login-notice">
                본 시스템은 내부고객 및 임직원에 한하여 사용할 수 있습니다.
                불법적인 접근 및 시스템 사용시 관련법규에 따라 처벌 받을 수 있습니다.
              </p>
            </div>

            <form className="login-form" onSubmit={handleSubmit}>
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
                    ref={userIdRef}
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
                    placeholder=""
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    ref={passwordRef}
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
                  id="regUserId"
                  checked={regUserId}
                  onChange={(e) => setRegUserId(e.target.checked)}
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
    </div>
  );
}

export default Login;
