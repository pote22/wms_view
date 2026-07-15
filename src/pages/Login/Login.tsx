import { useState, useRef } from "react";
import themeImg from "../../images/theme.png";
import { useNavigate } from 'react-router-dom';
import { loginService } from "../../api/user/loginService.ts";
import { usePopupContext } from "../../components/common/PopupProvider";

const Login: React.FC = () => {
  const [showPassword, setShowPassword]   = useState(false);
  const [regUserId,    setRegUserId]      = useState(false);
  const [userId,       setUserId]         = useState("");
  const [password,     setPassword]       = useState("");

  const userIdRef                         = useRef<HTMLInputElement>(null);
  const passwordRef                       = useRef<HTMLInputElement>(null);

  const navigate                          = useNavigate();
  const { showAlert }                     = usePopupContext();

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();

    if (!userId.trim()) {
      showAlert("아이디를 입력하세요.", () => userIdRef.current?.focus());
      return;
    }

    if (!password.trim()) {
      showAlert("비밀번호를 입력하세요.", () => passwordRef.current?.focus());
      return;
    }

    await loginService(
      { userId, password },
      (res) => {
        sessionStorage.setItem("accessToken", res.accessToken);
        navigate('/main', { replace: true });
      },
      (err) => {
        if (err.response) {
          const resultCode = err.response.data.resultCode;
          const resultMsg  = err.response.data.resultMessage || '오류가 발생했습니다. 담당자에게 문의하여 주십시오.';
          
          if (resultCode === "0002") showAlert(resultMsg);
        } else {
          console.error('네트워크 에러:', err.message);
          showAlert('서버와 통신할 수 없습니다. 담당자에게 문의하여 주십시오.');
        }
      }
    );
  };

  // ── Tailwind 상수 ──────────────────────────────────────────────
  const inputBase   = "block w-full rounded-lg border-0 border-b-2 border-transparent bg-slate-100 "  +
                      "py-3.5 pl-11 text-sm text-slate-900 placeholder:text-slate-400 outline-none " +
                      "transition-all duration-200 focus:border-primary focus:bg-white";

  const inputCls    = inputBase + " pr-4";
  const inputClsPw  = inputBase + " pr-12";
  // ───────────────────────────────────────────────────────────────
  
  return (
    <>
      <div className="flex min-h-screen items-center justify-center bg-[#eceeef] p-4">
        <div className="grid w-full max-w-275 overflow-hidden rounded-xl border border-slate-200/10 bg-white shadow-2xl shadow-slate-900/10 lg:grid-cols-12" style={{ minHeight: '600px' }}>

          {/* ── 왼쪽 파란 패널 ── */}
          <div className="relative hidden overflow-hidden bg-primary p-12 lg:col-span-7 lg:flex lg:flex-col lg:justify-between">
            {/* 배경 장식 원 */}
            <div className="pointer-events-none absolute inset-0 opacity-20">
              <div className="absolute -left-24 -top-24 h-96 w-96 rounded-full bg-primary-hover blur-3xl" />
              <div className="absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-[#004491] blur-3xl" />
            </div>

            {/* 창고 배경 이미지 */}
            <img
              src={themeImg}
              alt=""
              aria-hidden="true"
              className="pointer-events-none absolute bottom-0 right-0 h-1/2 w-2/3 select-none object-cover opacity-10 mix-blend-overlay grayscale"
            />

            <div className="relative z-10">
              {/* 로고 */}
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white">
                  <span
                    className="material-symbols-outlined text-primary text-2xl"
                    style={{ fontVariationSettings: '"FILL" 1' }}
                  >inventory_2</span>
                </div>
                <span className="font-display text-3xl font-extrabold tracking-tighter text-white">
                  WAREHOUSE MANAGEMENT<br/> SYSTEM
                </span>
              </div>

              {/* 태그라인 */}
              <div className="mt-20">
                <h1 className="font-display text-5xl font-extrabold leading-[1.1] tracking-tight text-white">
                  물류의 정밀한 설계자.
                </h1>
                <p className="mt-6 max-w-md text-lg font-medium leading-relaxed text-[#bbd0ff]">
                  기업 수준의 신뢰와 효율적인 관리로<br />창고 운영을 제어하세요.
                </p>
              </div>
            </div>

            {/* 하단 통계 영역 */}
            <div className="relative z-10 flex gap-12 border-t border-white/10 pt-8">
              <div>
                <div className="text-2xl font-bold text-white" />
                <div className="text-xs font-semibold uppercase tracking-widest text-[#bbd0ff]" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white" />
                <div className="text-xs font-semibold uppercase tracking-widest text-[#bbd0ff]" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white" />
                <div className="text-xs font-semibold uppercase tracking-widest text-[#bbd0ff]" />
              </div>
            </div>
          </div>

          {/* ── 오른쪽 흰색 패널 ── */}
          <div className="col-span-12 flex flex-col justify-center bg-white p-8 lg:col-span-5 lg:p-14">
            {/* 모바일 로고 */}
            <div className="mb-12 flex items-center gap-2 lg:hidden">
              <span
                className="material-symbols-outlined text-primary text-3xl"
                style={{ fontVariationSettings: '"FILL" 1' }}
              >inventory_2</span>
              <span className="font-display text-2xl font-black tracking-tight text-primary">CJ WMS</span>
            </div>

            <div className="mx-auto w-full max-w-md">
              <header className="mb-10">
                <h2 className="font-display text-3xl font-extrabold tracking-tight text-[#001a40]">
                  LOGIN WMS
                </h2>
                <p className="mt-2 text-sm font-medium leading-relaxed text-slate-500">
                  본 시스템은 내부고객 및 임직원에 한하여 사용할 수 있습니다.
                  불법적인 접근 및 시스템 사용시 관련법규에 따라 처벌 받을 수 있습니다.
                </p>
              </header>

              <form className="space-y-6" onSubmit={handleSubmit}>
                {/* 사용자 아이디 */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold tracking-wide text-slate-900" htmlFor="userId">
                    사용자 아이디
                  </label>
                  <div className="group relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                      <span className="material-symbols-outlined text-xl text-slate-400 transition-colors group-focus-within:text-primary">
                        account_circle
                      </span>
                    </div>
                    <input
                      id="userId"
                      type="text"
                      placeholder="아이디를 입력하세요"
                      value={userId}
                      onChange={(e) => setUserId(e.target.value)}
                      ref={userIdRef}
                      className={inputCls}
                    />
                  </div>
                </div>

                {/* 비밀번호 */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold tracking-wide text-slate-900" htmlFor="password">
                    비밀번호
                  </label>
                  <div className="group relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                      <span className="material-symbols-outlined text-xl text-slate-400 transition-colors group-focus-within:text-primary">
                        lock
                      </span>
                    </div>
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      ref={passwordRef}
                      className={inputClsPw}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? "비밀번호 숨기기" : "비밀번호 보기"}
                      className="absolute inset-y-0 right-0 flex items-center pr-4 text-slate-400 transition-colors hover:text-slate-700"
                    >
                      <span className="material-symbols-outlined text-xl">
                        {showPassword ? "visibility_off" : "visibility"}
                      </span>
                    </button>
                  </div>
                </div>

                {/* 아이디 저장 */}
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="regUserId"
                    checked={regUserId}
                    onChange={(e) => setRegUserId(e.target.checked)}
                    className="size-4 rounded border-slate-300 text-primary focus:ring-primary/30"
                  />
                  <label htmlFor="regUserId" className="ml-2 block text-sm font-medium text-slate-500">
                    아이디 저장
                  </label>
                </div>

                {/* 로그인 버튼 */}
                <button
                  type="submit"
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-linear-to-r from-primary to-primary-hover px-6 py-4 text-base font-bold text-white shadow-lg shadow-primary/20 transition-all duration-150 hover:shadow-primary/30 active:scale-[0.98]"
                >
                  로그인
                  <span className="material-symbols-outlined text-lg">arrow_forward</span>
                </button>
              </form>

              {/* 하단 푸터 */}
              <footer className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-slate-100 pt-8 sm:flex-row">
                <p className="flex items-center gap-1 text-xs font-medium text-slate-500">
                  <span className="material-symbols-outlined text-sm">shield</span>
                  보안 엔터프라이즈 환경
                </p>
                <div className="flex gap-4">
                  <a href="#" className="text-xs font-bold text-slate-500 transition-colors hover:text-primary">
                    고객지원
                  </a>
                  <span className="text-slate-300">/</span>
                  <a href="#" className="text-xs font-bold text-slate-500 transition-colors hover:text-primary">
                    개인정보처리방침
                  </a>
                </div>
              </footer>
            </div>
          </div>

        </div>
      </div>
    </>
  );
};

export default Login;
