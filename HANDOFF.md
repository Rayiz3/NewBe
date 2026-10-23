# Handoff

## 로그인 유지 (2026-10-16)
- Supabase 클라이언트에 React Native AsyncStorage를 연결하고 persistSession/autoRefreshToken을 활성화했다. 웹은 기본 브라우저 저장소를 사용한다.
- 루트 레이아웃에서 initializeAccountSession을 실행해 저장된 세션으로 계정 상태와 피드를 복원한다. 앱 활성 중 토큰 자동 갱신, 백그라운드에서는 갱신 중지. auth 이벤트 구독과 AppState 리스너는 언마운트 시 정리한다.
- 토큰 갱신 때 편집 중인 피드를 덮어쓰지 않는다. 프로필 조회 실패만으로 로그아웃하지 않으며, 계정 변경 이후 늦게 도착한 프로필 결과는 무시한다.
- 로그아웃 메뉴는 실제 Supabase signOut(scope: local)을 호출해 저장된 세션을 제거하고 계정/피드를 초기화한다. 서버에서 세션이 취소되거나 refresh token이 만료되면 재로그인이 필요할 수 있다.
- @react-native-async-storage/async-storage 네이티브 의존성 추가: 개발용 및 배포용 APK를 한 번 재빌드해야 한다. 이후 로그인하면 앱 종료·재실행 시 복원된다. 백엔드/DB 변경은 없다.
- account-session.test.cjs 3개 및 기존 scrap-status.test.cjs 5개 통과. 실제 APK의 강제 종료·재실행 및 장시간 토큰 갱신 검증은 별도로 필요하다.

## 스크랩 중복 클릭 처리 (2026-10-14 최종 변경)
- 자동 사전 검사와 저장됨 비활성화를 제거했다. 버튼은 항상 '스크랩'이며 요청 진행 중에만 연속 클릭을 막는다.
- 클릭 시 `POST /scraps/status`에 해당 summaryId 하나만 보내 검사한다. 이미 저장됐으면 '이미 스크랩한 뉴스예요.' 토스트만 표시하고 저장 요청은 보내지 않는다.
- 미저장일 때만 기존 POST /scraps로 저장한다. 검사 실패는 토스트로 알리고 다음 클릭으로 재시도한다. 계정 변경 중 이전 요청 결과는 무시한다.
- 상태 조회 API가 포함된 백엔드 배포가 필요하다. DB UNIQUE 제약은 동시 저장의 최종 중복 방지로 유지한다.
- 프론트 회귀 테스트: `cd frontend` 후 `node --test tests/scrap-status.test.cjs`.

## 스크랩 기능 인수인계 (2026-10-13)

### 확정된 동작
- 보고 있는 뉴비의 뉴스 요약을 선택해 로그인한 계정에 보관한다. 더보기 → 스크랩에서 저장한 요약들을 확인하고 원문 링크를 열며, 선택한 항목들을 삭제할 수 있어야 한다.
- 중요한 날짜는 **스크랩한 날짜**다. 기사 발행일이나 실제 요약 생성일을 보관일로 사용하지 않는다. 요약 생성일 컬럼은 이번 기능에 추가하지 않는다.
- 서버가 원본에서 제목·요약 내용·뉴비(personaId)·뉴스 원본 링크·언론사·카테고리를 복사하고, DB가 `saved_at`을 자동 생성한다. 원본이 만료되거나 변경되어도 저장 당시 스크랩은 유지한다.
- 같은 사용자/summaryId 중복 저장은 기존 스크랩과 보관일을 반환한다. 삭제 후 다시 저장하면 새 보관일이 생성된다. 계정(auth.users) 삭제 시 소유 스크랩도 삭제된다.

### 작성된 백엔드와 DB
- `supabase/migrations/202610120001_scraps.sql`: 기존 summaries PK는 유지하고 `summary_id` UUID UNIQUE를 추가한다. 제목·본문 등 요약 데이터 변경 시 트리거가 새 UUID를 부여하고, 동일 내용 upsert에서는 유지한다. scraps는 summaries FK 없이 스냅샷을 보관한다.
- scraps 컬럼: `id`, `user_id`, `summary_id`, `persona_id`, `title`, `content`, `news_url`, `source`, `category`, `saved_at`. `(user_id, summary_id)` 중복 방지 및 사용자별 보관일/ID 내림차순 인덱스가 있다.
- `backend/app/core/auth.py`: Supabase `/auth/v1/user`로 access token을 검증한다. Google idToken/anon key를 사용자 토큰 대신 보내지 않는다. 인증 누락·만료는 401, 인증 서비스 장애·설정 누락은 503.
- `backend/app/db/scraps.py`: 저장·목록·삭제 쿼리 모두 검증된 user_id로 범위를 제한한다. RLS는 authenticated의 본인 SELECT/DELETE만 허용하며 INSERT/UPDATE는 서버 전용이다. 직접 DB 연결은 권한 있는 신뢰된 서버 역할을 전제로 한다.
- `backend/app/routes/scraps.py` 및 `main.py`: 다음 API가 작성·등록되어 있다. 모든 요청에 `Authorization: Bearer <Supabase session access_token>`이 필요하다.

| API | 요청 및 동작 |
| --- | --- |
| `POST /scraps` | `{ "summaryId": "UUID" }`. 서버에서 내용을 복사해 저장. 신규·중복 모두 200. 미저장 원본이 만료/변경됐으면 404이며 뉴스 새로고침이 필요하다. |
| `GET /scraps?limit=20&cursor=...` | `{ items, nextCursor }`. 최신 보관 순, 동일 시각은 ID 내림차순. limit 1~100, 기본 20. nextCursor가 null이면 마지막 페이지. |
| `POST /scraps/batch-delete` | `{ "ids": ["스크랩 UUID"] }`, 1~100개. `{ deletedIds, deletedCount }` 반환. 타인 소유·없는 ID는 무시하고 본인 항목만 삭제한다. |

- 응답 스크랩 객체는 평탄한 구조: `id`, `summaryId`, `personaId`, `title`, `content`, `newsUrl`, `source`, `category`, `savedAt`.
- `GET /news`에 `summaryId`가 추가됐다. 기존 published 조회/TTL 기준은 변경하지 않았다. 저장 액션은 화면에서 받은 summaryId를 사용한다.
- 상세 적용 및 API 문서: `backend/docs/scraps.md`.

### 프론트 연결 시 남은 사항
- 현재 `frontend/app/scrap-page.tsx`와 `frontend/systems/scrap.tsx`에 목록 UI와 Zustand 저장소가 있다. 확인 시점의 저장소는 `items/setItems`만 제공하며 API 연결은 아직 없다.
- 현재 프론트 타입은 `{ id, savedAt, summary }`로 중첩되어 있어 백엔드의 평탄한 응답을 변환하거나 타입을 맞춰야 한다.
- 저장·목록 페이지 이동·선택 삭제 액션 및 Supabase access token 전달을 연결한다. 로그아웃/계정 전환 시 이전 계정의 목록과 선택 상태를 비운다.
- 날짜는 savedAt을 Asia/Seoul 기준으로 표시한다. 현재 formatScrapDate는 기기 로컬 시간대를 사용하므로 한국 시간 고정 표시를 하려면 수정이 필요하다.
- 목록의 `items.length`는 페이지 조회 이후 전체 개수가 아니다. 전체 개수를 표시하려면 별도 count 응답을 추가하거나 문구를 로드한 개수에 맞춘다.
- 원문은 newsUrl을 기존 원문 열기 액션으로 연결하고, 뉴비 이름·이미지는 personaId로 매핑한다.

### 검증 및 배포 상태
- 작성 당시 신규 API 테스트 `backend/tests/test_scraps.py` 6개 통과. 전체 pytest는 기존 `tests/test_collector.py`의 `app.piplines` import 오타로 수집 단계에서 실패했다.
- 실제 Supabase 마이그레이션 실행 및 Fly 배포 완료는 이 대화에서 확인되지 않았다. DB에서 중복 동시 저장·원본 만료 후 보존·소유권/RLS·계정 삭제 cascade는 별도 통합 검증이 필요하다.
- 적용 순서: 마이그레이션 SQL 검토·적용 → Fly 환경변수 설정 → backend에서 `fly deploy` → 프론트 API 연결 및 실제 계정 테스트.
- 필요한 백엔드 설정: 기존 `DATABASE_URL`, `ANTHROPIC_API_KEY`와 신규 `SUPABASE_URL`, `SUPABASE_ANON_KEY`. 값 자체는 문서나 Git에 기록하지 않는다.
- 로컬 저장소에는 GitHub Actions 자동 배포 설정이 없었다. Fly 대시보드 별도 연동 여부는 미확인이다.
- 확인 당시 `backend/.dockerignore`는 `.env`를 제외하지 않았고 Dockerfile은 `COPY . .`, 백엔드는 `load_dotenv()`를 사용했다. 이미지에 .env가 포함되어 Fly Secrets 없이 동작했을 가능성이 높지만 실제 원격 이미지는 확인하지 않았다.
- 환경변수 관리 정리 시 **Fly Secrets 등록을 먼저** 하고 `.dockerignore`에 `.env`, `.env.*` 제외(`!.env.example` 예외)를 추가한 뒤 재빌드·배포한다. 이 정리 작업의 완료 여부도 미확인이다.

## 프론트엔드 구현 지침

- Node 패키지의 설치 위치는 `frontend/node_modules`이다. npm 설치·제거는 `frontend`에서 실행하고, 의존성은 `frontend/package.json`과 `frontend/package-lock.json`에서 관리한다. workspace 루트에 별도의 Node 패키지 설치를 만들지 않는다.

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

## 로그인 후 더보기 화면
- MenuBody 하단에 heroshot.png를 배치하고, 기존 react-native-svg의 LinearGradient로 이미지 상단을 colors.white 배경에 연결한다.
- 로그인 성공 상태에서만 표시하며, 작은 화면에서는 메뉴와 이미지를 함께 스크롤한다. 추가 상태나 기능 로직은 없다.

## 본문 보기 링크 배치
- 기존 Page 하단 버튼을 제거하고 Content 말풍선 하단 중앙에 본문 보기 링크를 배치했다.
- 본문 텍스트 스타일을 공유하고 fontSize.menu만 덮어쓴다. 별도 버튼 배경이나 테두리는 없다.
- Icons.tsx에 제공된 SVG의 LinkOriginIcon을 추가했다. 기존 아이콘 규칙대로 크기는 scale(56), 행 간격은 scale(12), SVG strokeWidth는 3이다.
- 원문 열기는 기존 systems/request.tsx의 Zustand 액션을 사용한다. 타입 검사 및 수정한 본문 컴포넌트 린트 통과.

- 말풍선의 radius와 본문 상하 padding은 bubbleRadius = scale(100)을 공유한다. 본문은 ScrollView의 flexGrow/justifyContent로 중앙 정렬하며 긴 내용은 내부 스크롤한다. 본문 보기 링크는 말풍선을 기준으로 하단 padding 영역에 absolute 배치하여 본문 높이에 영향을 주지 않는다.

- 더보기 hero 이미지 확대 문제: Image의 너비·높이를 부모의 100%로 명시하고 resizeMode를 contain으로 변경했다. 원본 이미지의 고유 크기에 의존하지 않고 정사각형 하단 영역 안에서 전체 이미지를 표시한다. 상단 그라데이션은 유지한다.
