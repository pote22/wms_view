# 로그인 기능 개선 및 빌드 오류 해결 결과 보고 (2026-04-17)

WMS 빌드 실패 원인을 해결하고, 신규 DB 스키마에 맞춘 로그인 고도화 작업을 완료했습니다.

## 주요 작업 내용

### 1. 빌드 오류 해결 (WMS API)
- **`UserMapper.xml` 수정**: XML 문법 오류를 일으키던 `<>` 연산자를 `!=`로 변경하여 MyBatis 파싱 에러를 해결했습니다.
- **빌드 성공 확인**: `.\gradlew.bat clean build`를 실행하여 모든 테스트가 통과하고 빌드가 성공함을 확인했습니다.

### 2. 백엔드 로그인 로직 수정
- **`UserService.kt` 필드 매핑**: 쿼리에서 별칭(Alias)이 제거됨에 따라, 반환된 Map에서 사용자 이름을 가져올 때 `USER_NM` 및 `userNm` 키를 모두 지원하도록 안전하게 수정했습니다.

### 3. 프론트엔드 로그인 기능 고도화 (WMS View)
- **공통 API 통신 레이어 (`trasaction.ts`)**: `request` 함수가 응답 DTO 전체를 반환하도록 수정하여 로그인 시 필요한 `accessToken` 등에 접근할 수 있도록 개선했습니다.
- **API 인터페이스 (`loginService.ts`)**: 신규 `TB_USER` 스키마 컬럼들(`adminYn`, `role`, `profileImgUrl` 등)을 모두 포함하도록 `LoginResponse` 인터페이스를 업데이트했습니다.
- **로그인 세션 관리 (`Login.tsx`)**: 로그인 성공 시 `accessToken`과 사용자 상세 정보(`userInfo`)를 브라우저의 `localStorage`에 자동 저장하도록 구현했습니다.

## 테스트 결과

| 항목 | 결과 | 비고 |
| :--- | :---: | :--- |
| Gradle 전체 빌드 | **PASS** | `BUILD SUCCESSFUL` 확인 |
| MyBatis XML 파싱 | **OK** | `WmsApplicationTests` 통과 |
| 로그인 응답 구조화 | **OK** | DTO 전체 필드 노출 확인 |
| 로컬 세션 저장 | **OK** | `accessToken`, `userInfo` 저장 로직 추가 |

## 향후 작업 제안
- 현재 `Container.tsx`에서 하드코딩된 사용자 이름과 프로필 이미지를 `localStorage`에 저장된 `userInfo` 값과 연동하는 작업을 진행할 수 있습니다.
