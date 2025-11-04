# Garden Bizarre Adventure

![Version](https://img.shields.io/badge/version-1.12.0-blue.svg)
![Next.js](https://img.shields.io/badge/Next.js-15.5-black)
![React](https://img.shields.io/badge/React-19-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)

소셜 미디어 플랫폼 프로젝트입니다. Next.js 15의 App Router와 React 19를 기반으로 하며, Feature-Sliced Design (FSD) 아키텍처를 따릅니다. Supabase를 백엔드로 사용하고, Firebase Storage로 파일을 관리합니다.

## 목차

- [주요 기능](#주요-기능)
- [기술 스택](#기술-스택)
- [설치 및 실행](#설치-및-실행)
- [개발 도구](#개발-도구)
- [CI/CD 파이프라인](#cicd-파이프라인)
- [커밋 컨벤션](#커밋-컨벤션)
- [프로젝트 구조](#프로젝트-구조)

## 주요 기능

### 이미지 처리

- **HEIC 변환**: heic-to를 사용하여 Apple 기기의 HEIC 포맷을 JPEG/PNG로 자동 변환
- **EXIF 데이터 추출**: exifr로 촬영 정보, GPS 위치, 날짜 등 메타데이터 추출
- **이미지 압축**: browser-image-compression으로 업로드 최적화 및 용량 절감
- **드래그 앤 드롭**: react-dropzone 기반 직관적인 파일 업로드 인터페이스
- **위치 정보 편집**: Kakao Maps API를 사용한 이미지 위치 정보 수정 기능

### 폼 관리

- **React Hook Form**: 효율적인 폼 상태 관리 및 리렌더링 최적화
- **Zod Validation**: 스키마 기반 타입 안전 검증 및 에러 핸들링
- **실시간 검증**: 사용자 입력에 대한 즉각적인 피드백 제공
- **날짜 선택**: react-datepicker를 사용한 날짜/시간 선택 기능

### 데이터베이스 & 인증

- **Supabase PostgreSQL**: 확장 가능한 관계형 데이터베이스
- **실시간 동기화**: Supabase Realtime으로 데이터 실시간 업데이트
- **인증 시스템**: Supabase Auth를 통한 사용자 인증 및 권한 관리
- **Row Level Security**: PostgreSQL RLS 정책으로 데이터 보안 강화

### 스토리지

- **Firebase Storage**: 이미지 및 미디어 파일 저장
- **Supabase Storage**: 추가 파일 저장 옵션
- **병렬 업로드**: 여러 파일 동시 업로드 및 진행률 추적

### UI/UX

- **Material-UI v7**: 일관된 디자인 시스템 및 접근성 지원
- **Tailwind CSS v4**: 유틸리티 우선 스타일링으로 빠른 개발
- **Framer Motion**: 부드럽고 자연스러운 애니메이션 효과
- **반응형 디자인**: 모바일 우선 접근 방식으로 모든 기기 지원
- **Emotion**: CSS-in-JS로 동적 스타일링

## 기술 스택

### Frontend

- **Next.js 15.5** - Turbopack 기반 초고속 빌드 시스템
- **React 19** - 최신 React 기능 및 성능 최적화
- **TypeScript 5** - 타입 안전성 및 개발 생산성 향상

### Backend & Database

- **Supabase** - PostgreSQL, Auth, Storage, Realtime 통합 백엔드
- **Firebase** - Cloud Storage 및 추가 백엔드 서비스

### State Management

- **TanStack Query (React Query) v5** - 서버 상태 관리 및 캐싱
- **React Hook Form v7** - 폼 상태 관리 및 검증

### Validation & Data Processing

- **Zod v4** - TypeScript 우선 스키마 검증
- **Day.js** - 경량 날짜 처리 라이브러리

### UI Libraries

- **@mui/material v7** - React UI 컴포넌트 라이브러리
- **@mui/icons-material** - Material Design 아이콘
- **@emotion/react & @emotion/styled** - CSS-in-JS 스타일링
- **Tailwind CSS v4** - 유틸리티 CSS 프레임워크
- **Motion (Framer Motion) v12** - 애니메이션 라이브러리

### Image Processing

- **heic-to** - HEIC 포맷 변환
- **exifr** - EXIF 메타데이터 읽기 및 파싱
- **browser-image-compression** - 클라이언트 사이드 이미지 압축
- **react-dropzone** - 파일 업로드 및 드래그 앤 드롭

### Development Tools

- **Storybook v9** - 컴포넌트 문서화 및 독립 개발 환경
- **Vitest v3** - 빠른 단위 테스트 프레임워크
- **Playwright** - E2E 테스트 및 브라우저 자동화
- **ESLint v9** - 코드 품질 및 일관성 유지
- **Prettier v3** - 코드 포맷팅 자동화

### CI/CD & Automation

- **Semantic Release** - 자동 버전 관리 및 릴리즈 노트 생성
- **Husky** - Git 훅 관리 및 자동화
- **Commitlint** - 커밋 메시지 규칙 검증 (한글 지원)
- **lint-staged** - 스테이징된 파일만 린팅하여 성능 최적화
- **GitHub Actions** - CI/CD 파이프라인 자동화

### Maps & Location

- **Kakao Maps API** - 지도 표시 및 위치 정보 관리

## 설치 및 실행

### 요구사항

- Node.js 20 이상
- pnpm 8 이상

### 설치

```bash
# 의존성 설치
pnpm install
```

### 환경 변수 설정

`.env.local` 파일을 생성하고 다음 환경 변수를 설정하세요:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=your-firebase-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-firebase-auth-domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-firebase-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-firebase-storage-bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-firebase-app-id
```

### 개발 서버 실행

```bash
# Turbopack으로 개발 서버 시작
pnpm dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인하세요.

### 빌드

```bash
# 프로덕션 빌드
pnpm build

# 프로덕션 서버 실행
pnpm start
```

### Storybook

```bash
# Storybook 개발 서버 시작 (포트 6006)
pnpm storybook

# Storybook 프로덕션 빌드
pnpm build-storybook
```

## 개발 도구

### ESLint 설정

프로젝트는 다음 ESLint 규칙을 사용합니다:

- **Next.js 권장 설정** (`eslint-config-next`)
- **Prettier 통합** (`eslint-config-prettier`, `eslint-plugin-prettier`)
- **Import 정렬** (`eslint-plugin-import`)
  - Built-in → External → Internal → Relative imports 순서
  - Type imports는 `import type` 사용 강제
- **Storybook 지원** (`eslint-plugin-storybook`)

```bash
# ESLint 실행
pnpm lint
```

### Prettier 설정

Tailwind CSS 클래스 자동 정렬 및 일관된 코드 포맷팅:

```bash
# Prettier 적용 (lint-staged로 자동 실행)
prettier --write .
```

### Git Hooks (Husky + lint-staged)

커밋 전 자동으로 실행되는 검증:

1. **Pre-commit Hook**
   - 변경된 파일에 대해 ESLint 실행 및 자동 수정
   - Prettier로 코드 포맷팅
   - TypeScript 타입 체크

2. **Commit Message Hook**
   - Commitlint로 커밋 메시지 검증
   - Conventional Commits 규칙 준수 확인

## CI/CD 파이프라인

### GitHub Actions 워크플로우

#### 1. CI (`.github/workflows/ci.yml`)

Pull Request가 열리거나 업데이트될 때 실행:

- ✅ 커밋 메시지 검증 (Commitlint)
- ✅ ESLint 실행
- ✅ 프로덕션 빌드 테스트

#### 2. Release (`.github/workflows/release.yml`)

`main` 브랜치에 푸시될 때 자동 릴리즈:

- 📝 Semantic Release로 버전 자동 결정
- 📄 CHANGELOG.md 자동 생성 및 업데이트
- 🏷️ Git 태그 생성
- 🚀 GitHub Release 생성
- 📦 package.json 버전 업데이트

#### 3. Storybook (`.github/workflows/storybook.yml`)

Storybook을 GitHub Pages에 자동 배포

### Semantic Release 설정

Conventional Commits 기반 자동 버전 관리:

- **major (x.0.0)**: Breaking changes (`BREAKING CHANGE:` in body or footer)
- **minor (0.x.0)**: 새로운 기능 (`feat:`)
- **patch (0.0.x)**: 버그 수정 (`fix:`)

릴리즈 노트는 한글로 작성됩니다:

- ✨ 새로운 기능 (`feat`)
- 🐛 버그 수정 (`fix`)
- ⚡ 성능 개선 (`perf`)
- 📚 문서 (`docs`)
- 💎 스타일 (`style`)
- 📦 리팩토링 (`refactor`)
- 🚨 테스트 (`test`)
- 🛠 빌드 시스템 (`build`)
- ⚙️ CI/CD (`ci`)

```bash
# 릴리즈 미리보기 (dry-run)
pnpm release:dry

# 실제 릴리즈 (CI에서 자동 실행)
pnpm release
```

## 커밋 컨벤션

### Conventional Commits (한글 지원)

커밋 메시지는 다음 형식을 따릅니다:

```
<type>: <subject>

[optional body]

[optional footer]
```

### Type 종류

| Type       | 설명                          | 예시                                  |
| ---------- | ----------------------------- | ------------------------------------- |
| `feat`     | 새로운 기능 추가              | `feat: 이미지 위치 편집 모달 추가`    |
| `fix`      | 버그 수정                     | `fix: 업로드 진행률 표시 오류 수정`   |
| `docs`     | 문서 변경                     | `docs: README에 설치 가이드 추가`     |
| `style`    | 코드 포맷팅, 세미콜론 누락 등 | `style: Prettier 적용`                |
| `refactor` | 코드 리팩토링                 | `refactor: 이미지 압축 로직 개선`     |
| `test`     | 테스트 추가 또는 수정         | `test: Dropzone 컴포넌트 테스트 추가` |
| `chore`    | 빌드 설정, 패키지 업데이트 등 | `chore: dependencies 업데이트`        |
| `perf`     | 성능 개선                     | `perf: 이미지 로딩 최적화`            |
| `ci`       | CI/CD 설정 변경               | `ci: GitHub Actions 워크플로우 수정`  |
| `build`    | 빌드 시스템 변경              | `build: Webpack 설정 업데이트`        |
| `revert`   | 커밋 되돌리기                 | `revert: feat: 이미지 편집 기능 롤백` |

### 커밋 메시지 규칙

- **제목 (subject)**
  - 최대 100자
  - 한글 사용 가능
  - 마침표 사용 가능
  - 명령형으로 작성 (예: "추가", "수정", "제거")

- **본문 (body)**
  - 선택사항
  - 한 줄 최대 200자
  - 변경 이유와 방법 설명

- **푸터 (footer)**
  - 선택사항
  - Breaking changes: `BREAKING CHANGE: 설명`
  - 이슈 참조: `Closes #123`

### 예시

```bash
# 기본 커밋
feat: 위치 설정 모달에 애니메이션 추가

# 상세 설명 포함
feat: 이미지 EXIF 데이터 추출 기능 추가

이미지 업로드 시 EXIF 정보를 자동으로 추출하여
GPS 위치, 촬영 날짜 등의 메타데이터를 저장합니다.

Closes #42

# Breaking change
feat!: 폼 검증 라이브러리를 Yup에서 Zod로 변경

BREAKING CHANGE: 폼 스키마 정의 방식이 변경되었습니다.
기존 Yup 스키마를 Zod 스키마로 마이그레이션해야 합니다.
```

### CI 스킵

CI 실행을 건너뛰려면 커밋 메시지에 `[skip ci]` 포함:

```bash
git commit -m "docs: README 오타 수정 [skip ci]"
```

## 프로젝트 구조

### Feature-Sliced Design (FSD)

```
src/
├── app/                    # Next.js App Router
│   ├── providers/          # React context providers
│   ├── admin/              # Admin pages
│   └── ...
├── widgets/                # 큰 UI 조합 (header, footer)
├── features/               # 비즈니스 로직 기능
│   ├── admin-post-form/    # Admin 포스트 작성 폼
│   ├── location-setting-modal/  # 위치 설정 모달
│   └── tabs/               # 탭 컴포넌트
├── entities/               # 비즈니스 엔티티
├── shared/                 # 공유 유틸리티 및 컴포넌트
│   ├── ui/                 # 재사용 가능한 UI 컴포넌트
│   │   ├── dropzone/       # 파일 드롭존
│   │   └── container/      # 컨테이너
│   ├── lib/                # 공유 라이브러리
│   │   ├── supabase/       # Supabase 클라이언트
│   │   ├── firbase/        # Firebase 클라이언트 (폴더명 의도적)
│   │   └── utils/          # 유틸리티 함수
│   ├── api/                # API 유틸리티
│   └── config/             # 설정 파일
└── pages/                  # 페이지 조합 (FSD layer)

.github/
├── workflows/              # GitHub Actions
│   ├── ci.yml              # CI 파이프라인
│   ├── release.yml         # 릴리즈 자동화
│   └── storybook.yml       # Storybook 배포
└── actions/                # 재사용 가능한 Actions

supabase/
├── migrations/             # 데이터베이스 마이그레이션
└── schema.sql              # 스키마 참조 (읽기 전용)
```

### 주요 파일

```
📦 garden-bizarre-adventure
├── 📄 .releaserc.json      # Semantic Release 설정
├── 📄 commitlint.config.js # Commitlint 설정 (한글 지원)
├── 📄 next.config.ts       # Next.js 설정
├── 📄 tailwind.config.ts   # Tailwind CSS v4 설정
├── 📄 vitest.config.ts     # Vitest 테스트 설정
├── 📄 CLAUDE.md            # Claude Code 프로젝트 가이드
└── 📄 CHANGELOG.md         # 자동 생성된 변경 로그
```

## 라이선스

MIT

---

**버전**: 1.12.0
**마지막 업데이트**: 2025년 1월
