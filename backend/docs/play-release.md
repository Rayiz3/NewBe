# Google Play 출시 준비 (2026-10-17)

## 개인정보처리방침 원본과 게시 위치

- 앱에 표시할 원문: `frontend/constants/legal.ts`의 `PRIVACY_POLICY_TEXT`.
- 현재 문구는 요청에 따른 placeholder이며 실제 방침이 아니다. 출시 전 반드시 교체한다.
- 별도로 로그인 없이 누구나 볼 수 있는 공개 HTTPS HTML 페이지를 게시한다. PDF나 편집 권한이 있는 문서 링크 대신 안정적인 공개 URL을 사용한다.
- 게시한 주소를 같은 파일의 `SERVICE_INFO.privacyUrl`과 Play Console 개인정보처리방침 항목에 입력한다. 앱 원문과 웹 원문의 내용/시행일을 함께 갱신한다.
- 공개 웹사이트는 이 작업에서 배포하지 않았다. 도메인과 호스팅은 운영자가 정한다.

### 원문에 넣을 내용

1. 서비스명(뉴비), 실제 운영자/사업자 이름, 개인정보 문의 담당자 및 연락처, 시행일.
2. 실제 수집 데이터와 수집 방법: Google 인증 식별자, 이메일, 이름, 프로필 정보, 맞춤 피드, 스크랩. Google OAuth 요청 범위 및 Supabase에 저장되는 메타데이터를 확인해 누락 없이 기재한다.
3. 각각의 이용 목적: 로그인/계정 유지, 개인화, 스크랩 보관, 문의 대응 등 실제 운영 목적.
4. 서버·SDK에서 추가로 처리하는 접속 로그, IP, 기기 정보 및 수집 여부. 현재 사용하지 않는 광고·분석을 사용한다고 작성하지 않는다.
5. 항목별 보유 기간, 탈퇴 시 삭제 대상과 절차, 백업·로그 삭제 주기, 법정 보관 예외가 있다면 근거와 기간.
6. 위탁/제공/국외 이전: Google, Supabase, Fly.io 등 각 업체 역할·처리 데이터·실제 서버 지역을 확인한다. AI 처리에도 사용자 정보가 전송되는지 별도로 확인한다. 뉴스 요약 API 사용만으로 사용자 정보가 AI 업체에 전송된다고 단정하지 않는다.
7. 열람·정정·삭제 등 이용자 권리와 행사 방법, 앱 내 계정 삭제 경로와 외부 삭제 요청 URL.
8. 보호조치, 대상 연령 및 아동 정보 처리 여부, 방침 변경 고지 방법.

이 목록은 작성 가이드다. 미확인 보유 기간·서버 지역·법적 근거를 임의로 채우지 말고 실제 운영 및 적용 법령에 맞춰 작성한다. Play 데이터 보안 설문도 같은 데이터 흐름을 기준으로 작성한다.

## 계정 삭제 배포 순서

1. 기존 스크랩 마이그레이션 적용 여부를 확인한 뒤 `supabase/migrations/202610170001_account_deletion.sql`을 적용한다.
2. 서버에 `SUPABASE_SECRET_KEY`를 secret으로 설정한다. Supabase Settings → API Keys → Publishable and secret API keys에서 발급한 `sb_secret_...` 값을 사용한다. 서버는 이 키를 `apikey` 헤더로만 전달하며 JWT Bearer 토큰으로 보내지 않는다. 기존 `SUPABASE_URL`, 사용자 토큰 검증용 `SUPABASE_ANON_KEY`도 필요하다. 이 관리자 키는 앱, EXPO_PUBLIC 변수, Git에 절대 넣지 않는다. 이전 `SUPABASE_SERVICE_ROLE_KEY` 환경변수는 회원탈퇴 API에서 더 이상 읽지 않는다.
3. 백엔드를 배포한다. `DELETE /account`는 Supabase에서 검증된 access token 소유자만 삭제한다. 클라이언트 userId는 사용하지 않는다.
4. 테스트 계정으로 프로필/피드/스크랩을 만든 뒤 삭제한다. auth.users, public.users, public.scraps가 함께 삭제되고 재시작·다른 기기의 기존 토큰으로 접근할 수 없는지 확인한다.
5. 삭제 트리거는 Auth 삭제와 같은 DB 트랜잭션에서 프로필과 스크랩을 지운다. 현재 저장소에 없는 사용자 데이터 테이블이나 Storage 파일이 있으면 별도 정리 대상을 추가해야 한다. 실제 원격 DB 스키마 및 마이그레이션 실행은 이 작업에서 확인하지 않았다.
6. 앱 밖에서도 요청할 수 있는 삭제 웹페이지를 별도로 게시하고 `SERVICE_INFO.deletionUrl`과 Console에 등록한다. 앱 재설치를 요구하면 안 된다. 본인 확인 및 실제 처리 경로, 삭제 대상·기간·보관 예외를 안내한다. 안내만 있고 요청할 방법이 없는 페이지는 충분하지 않다.

## 뉴스 앱

- 설정 → 서비스 정보·문의는 비로그인 사용자도 접근할 수 있다.
- `SERVICE_INFO.operator`, `email`, `contactUrl`에 실제 운영자, 이메일, 공개 연락처 페이지 주소를 입력한다. 지금은 미설정 상태가 명시되므로 출시 준비가 끝난 것이 아니다.
- 메인 요약과 스크랩 상세에 출처·AI 요약 표시를 추가했다. 출처 데이터가 없을 때의 ‘출처 미제공’은 오류 대체 표시이며 정책 준수를 대신하지 않는다. 출시 데이터에 원 언론사/작성자와 유효한 원문 링크가 있는지 확인한다.
- 뉴스는 실제로 정기 갱신돼야 한다. 기존 서버 스케줄러의 운영 상태를 확인한다.
- Console에서 뉴스 앱 선언을 완료한다. 기사·이미지 이용 권한은 별도로 확인한다.

## Android

- Expo SDK 54 / React Native 0.81 기반. `expo-build-properties`에 compileSdkVersion 및 targetSdkVersion 36을 명시했다. 최소 설치 OS를 36으로 높이는 설정이 아니다.
- `eas.json` production은 AAB, 자동 versionCode 증가를 사용한다.
- frontend에서 `npx eas-cli build --platform android --profile production`으로 빌드한다. 실제 EAS 빌드·업로드는 수행하지 않았다.
- Play 설치 버전의 앱 서명 인증서 SHA-1을 Google OAuth Android 클라이언트에 등록하고 Google 로그인을 확인한다.
- Play 사전 출시 보고서, API 36 동작, 네이티브 라이브러리 16KB 페이지 크기 지원을 최종 AAB/실기기에서 확인한다.

## 근거

- https://support.google.com/googleplay/android-developer/answer/10144311
- https://support.google.com/googleplay/android-developer/answer/13327111
- https://support.google.com/googleplay/android-developer/answer/9935326
- https://support.google.com/googleplay/android-developer/answer/10523915
- https://support.google.com/googleplay/android-developer/answer/11926878
- https://docs.expo.dev/versions/latest/sdk/build-properties/
