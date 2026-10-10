# Handoff

## 프론트엔드 구현 지침

- React 로컬 state보다는 가능한 한 Zustand 상태값을 사용한다.
- 이벤트 handler와 기타 기능 함수는 가능한 한 상태·기능 모듈의 `.tsx` 파일에 구현하여 렌더링 코드와 분리한다.
- 사용자가 언급한 `system/` 역할의 실제 프로젝트 경로는 `frontend/systems/`이다. 기존 구조에 맞춰 이 경로를 사용한다.
- 기능이 기존 모듈의 범주에 속하면 해당 `.tsx`에 구현하고, 적합한 기존 모듈이 없으면 `frontend/systems/` 아래에 새로운 `.tsx`를 만든다.
- 페이지와 UI 컴포넌트는 상태 구독, 기능 연결, 렌더링을 중심으로 구성한다.

- `systems/request.tsx`: 뉴스 원문 URL 검증, 브라우저 열기, 실패 안내, 중복 실행 방지 및 열기 상태를 관리한다.
- `systems/account.tsx`: Google 로그인 설정과 로그인 액션, 피드 저장 및 실패 처리를 담당한다.
- `systems/scroll.tsx`: 페이지 스크롤 위치를 상태로 반영한다.
- `systems/date.tsx`: 날짜 포맷과 Zustand 날짜 상태를 관리한다.
- `systems/navigation.tsx`: 뒤로 가기, 메뉴 이동, 메뉴 액션을 담당한다.
- `systems/persona.tsx`: 토큰 선택·드래그와 드롭 영역 측정을 커스텀 훅으로 제공한다. 네이티브 View ref는 훅에 두며 Zustand에 저장하지 않는다.
