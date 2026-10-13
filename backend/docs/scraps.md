# 스크랩 API와 DB 적용

## 적용 순서

1. 같은 Supabase 프로젝트에 `public.summaries`와 `auth.users`가 있는지 확인한다.
   기존 summaries에는 persona_id/title/category/published/source/news_url/content 및
   `(published, persona_id)` 유니크 제약이 있어야 한다(기존 백엔드 요구사항).
2. `supabase/migrations/202610120001_scraps.sql`을 검토 후 Supabase SQL Editor에서
   실행하거나, 기존 Supabase CLI 마이그레이션 절차로 적용한다. 한 번만 실행한다.
   기존 summaries PK는 유지하며 별도의 summary_id UUID를 추가한다.
3. 백엔드 환경변수를 설정한 뒤 새 백엔드를 배포한다. 마이그레이션을 먼저 적용해야 한다.

```dotenv
DATABASE_URL=기존_Supabase_Postgres_연결문자열
SUPABASE_URL=https://프로젝트ID.supabase.co
SUPABASE_ANON_KEY=프로젝트의_anon_또는_publishable_key
```

DATABASE_URL은 서버 전용이다. 현재 직접 SQL 방식은 postgres 등 RLS를 우회할 수 있고
해당 테이블에 권한이 있는 신뢰된 서버 역할을 전제로 한다. 모든 스크랩 쿼리는 검증된
user_id로 제한한다. authenticated에는 본인 스크랩 SELECT/DELETE만 허용하며,
직접 INSERT/UPDATE는 허용하지 않는다. 사용자 토큰을 DB 연결 문자열에 넣지 않는다.

## 인증

세 API 모두 `Authorization: Bearer <Supabase session access_token>`이 필요하다.
Google idToken 또는 anon key를 사용자 토큰 대신 보내면 안 된다.
서버는 Supabase `/auth/v1/user`에 토큰을 검증하고 반환된 사용자 UUID를 사용한다.
토큰 누락/만료는 401, 인증 서비스 장애나 서버 설정 누락은 503이다.
공식 설명: https://supabase.com/docs/guides/auth/jwts

## 저장

`GET /news` 각 요약에 추가된 `summaryId`를 보낸다.

```http
POST /scraps
Authorization: Bearer <access_token>
Content-Type: application/json

{"summaryId":"요약의 UUID"}
```

200: 아래 스크랩 객체. 중복 요청도 200이며 기존 id/savedAt/내용을 유지한다.
404: 요약이 삭제되거나 내용이 바뀜. 뉴스를 새로고침하고 다시 선택한다.
이미 저장된 요약이면 원본이 만료됐더라도 기존 스크랩을 반환한다.
사용자 ID, 본문, 날짜 등 추가 필드는 받지 않는다.

```json
{
  "id": "스크랩 UUID",
  "summaryId": "요약 UUID",
  "personaId": "GOO_WORLD_1",
  "title": "제목",
  "content": "저장 당시 요약 내용",
  "newsUrl": "https://example.com/article",
  "source": "언론사",
  "category": "world",
  "savedAt": "2026-10-12T03:00:00Z"
}
```

savedAt은 DB가 생성하는 스크랩 시각이며 실제 요약 생성일이 아니다.
클라이언트에서 Asia/Seoul 날짜로 표시한다. 삭제 후 다시 저장하면 새 시각을 부여한다.
뉴비는 personaId로 식별한다. 이름/아이콘은 앱의 뉴비 사전에서 표시한다.

## 목록

`GET /scraps?limit=20&cursor=...`

응답: `{ "items": [스크랩 객체], "nextCursor": "..." }`
savedAt 내림차순, 동률은 id 내림차순이다. limit은 1~100이며 기본 20.
첫 요청에는 cursor를 생략하고, 다음 요청에는 nextCursor를 그대로 사용한다.
nextCursor가 null이면 마지막 페이지다. 잘못된 cursor/limit은 422.
원본 보기는 newsUrl을 브라우저로 열면 된다.

## 선택 삭제

`POST /scraps/batch-delete`에 `{ "ids": ["스크랩 UUID", "..."] }`를 보낸다.
한 번에 1~100개이며 요약 ID가 아닌 스크랩 ID를 사용한다.
응답은 `{ "deletedIds": ["..."], "deletedCount": 1 }`.
타인 소유/이미 삭제된 ID는 무시하며, 삭제 가능한 본인 항목만 원자적으로 삭제한다.

## 데이터 수명

scraps는 요약 제목/본문/뉴비/원본 링크 등을 복사해 보관한다. summaries에 대한 FK가
없어 기존 TTL 삭제나 요약 변경에 영향받지 않는다. 계정(auth.users) 삭제 시에는 함께 삭제된다.
요약 내용이 바뀌면 DB 트리거가 summaryId를 교체한다. 내용이 동일한 upsert는 유지한다.
요약 생성일을 추가하거나 기존 published 조회/TTL 동작을 변경하지 않는다.

## 검증

`cd backend` 후 `uv run --locked python -m pytest tests/test_scraps.py -q`.
API 테스트는 인증 실패, 소유자 전달, 입력 검증, 페이지 이동, 만료 응답 등을 확인한다.
실제 DB 적용 전에는 별도 테스트 프로젝트에서 마이그레이션과 함께 다음을 검증한다:
동일 요약 동시 저장, 원본 만료 후 스크랩 유지, 타인 조회/삭제 차단,
내용 변경 시 summaryId 교체, 계정 삭제 시 cascade. 운영 DB에는 자동 적용하지 않는다.
