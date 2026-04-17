# JWT 인터셉터 구현 가이드 (백엔드)

이 문서는 Spring Security 없이 `HandlerInterceptor`를 사용하여 JWT 인증을 처리하는 로직을 설명합니다. 스터디 프로젝트에서 HTTP 요청 흐름을 이해하고 제어하는 실습에 적합한 방식입니다.

## 1. JwtInterceptor 구현 (auth 패키지)

`HandlerInterceptor` 인터페이스를 구현하는 클래스를 생성합니다.

### 핵심 로직: `preHandle` 메소드 오버라이드
- **헤더 추출**: `request.getHeader("Authorization")`를 통해 인증 헤더를 가져옵니다.
- **포맷 검증**: 헤더 값이 존재하고 `"Bearer "`로 시작하는지 확인합니다.
- **토큰 추출**: 문자열에서 "Bearer " 부분을 제외한 순수 토큰 값만 추출합니다.
- **토큰 검증**: 이미 구현된 `JwtProvider.validateToken(token)`을 사용하여 유효성을 검사합니다.
- **결과 처리**:
    - 유효하면 `return true` (컨트롤러로 요청 전달)
    - 유효하지 않거나 헤더가 없으면 `response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "메시지")`를 호출하고 `return false`

---

## 2. WebConfig 인터셉터 등록 (config 패키지)

작성한 인터셉터가 실제로 동작하도록 스프링 설정에 등록합니다.

### 핵심 로직: `WebMvcConfigurer` 인터페이스 활용
- **인터셉터 주입**: 위에서 만든 `JwtInterceptor`를 생성자 또는 세터로 주입받습니다.
- **`addInterceptors` 오버라이드**: 
    - `registry.addInterceptor(jwtInterceptor)` 호출
    - **적용 경로**: `.addPathPatterns("/api/**")`를 설정하여 모든 API 호출을 가로챕니다.
    - **예외 경로**: `.excludePathPatterns("/api/user/login")`을 반드시 추가하여 로그인 자체는 토큰 없이 가능하게 합니다.

---

## 3. 구현 시 주의사항 및 팁

1.  **CORS 관련**: `OPTIONS` 메소드로 들어오는 프리플라이트(Preflight) 요청은 인증 체크에서 제외해야 브라우저 통신이 원활합니다. (`"OPTIONS".equals(request.getMethod())` 체크)
2.  **전역 에러 처리**: 만약 `IllegalStateException` 등을 던지고 싶다면 별도의 `ExceptionController`나 `@RestControllerAdvice`에서 처리하면 더 깔끔합니다. 
3.  **사용자 식별**: 토큰이 유효하다면 `jwtProvider.getUsernameFromToken(token)`으로 사용자 ID를 꺼내서 `request.setAttribute("userId", userId)` 등에 담아두면 컨트롤러에서 편리하게 사용할 수 있습니다.
