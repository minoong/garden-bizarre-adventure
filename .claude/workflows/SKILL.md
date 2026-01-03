# Git Workflow & Commit Guidelines

이 스킬은 **Garden Bizarre Adventure** 프로젝트의 Git 워크플로우 및 커밋 메시지 규칙을 정의합니다.

## 📝 Commit Message 규칙

### Conventional Commits (한글 지원)

프로젝트는 **Conventional Commits** 형식을 따르며, **한글 커밋 메시지**를 허용합니다.

```
<type>(<scope>): <subject>

[optional body]

[optional footer]
```

### Commit Types

| Type       | 설명                           | 예시                                 |
| ---------- | ------------------------------ | ------------------------------------ |
| `feat`     | 새로운 기능 추가               | `feat: 업비트 차트 무한 스크롤 추가` |
| `fix`      | 버그 수정                      | `fix: 분봉 타임존 변환 오류 수정`    |
| `docs`     | 문서 변경                      | `docs: README에 설치 가이드 추가`    |
| `style`    | 코드 포맷팅 (기능 변경 없음)   | `style: prettier 적용`               |
| `refactor` | 코드 리팩토링 (기능 변경 없음) | `refactor: useCandles 훅 개선`       |
| `test`     | 테스트 추가/수정               | `test: 차트 컴포넌트 테스트 추가`    |
| `chore`    | 빌드, 패키지 등 설정 변경      | `chore: prettier 설정 업데이트`      |
| `perf`     | 성능 개선                      | `perf: 차트 렌더링 최적화`           |
| `ci`       | CI/CD 설정 변경                | `ci: GitHub Actions 워크플로우 추가` |
| `build`    | 빌드 시스템 변경               | `build: Next.js 15 업그레이드`       |
| `revert`   | 커밋 되돌리기                  | `revert: feat: 실험적 기능 제거`     |

### Subject 규칙

- **최대 100자**
- **명령형 현재 시제** 사용 (예: "추가", "수정", "변경")
- 마침표 없이 작성
- 한글 또는 영어 모두 가능

```bash
# ✅ DO: 한글 커밋 메시지
feat: 업비트 차트에 실시간 업데이트 기능 추가
fix: 마켓 선택 시 타입 에러 수정
docs: API 사용 가이드 작성

# ✅ DO: 영어 커밋 메시지
feat: add realtime update to upbit chart
fix: resolve market selection type error
docs: write API usage guide

# ❌ DON'T: 과거형 또는 모호한 메시지
fix: fixed bug  # ❌ 과거형
update: changes  # ❌ 모호함
```

### Body (선택)

- 변경 사항의 **이유**와 **무엇이** 변경되었는지 설명
- 최대 **200자** 줄 길이

```
feat: 차트 무한 스크롤 기능 추가

사용자가 차트를 왼쪽으로 드래그하면 자동으로 과거 데이터를 로드합니다.
lightweight-charts의 subscribeVisibleLogicalRangeChange를 활용했습니다.
```

### Footer (선택)

- 이슈 참조: `Closes #123`, `Fixes #456`
- Breaking changes: `BREAKING CHANGE: ...`

```
feat: API 클라이언트 v2로 업그레이드

BREAKING CHANGE: fetchCandles 함수 시그니처가 변경되었습니다.
기존: fetchCandles(market, unit)
신규: fetchCandles(market, timeframe, options)

Closes #42
```

### Claude Code 자동 생성 Footer

Claude Code로 커밋 생성 시 자동으로 다음 footer가 추가됩니다:

```
🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>
```

## 🔄 Git Workflow

### Branch 전략

- **`main`**: 프로덕션 코드 (자동 배포)
- **`develop`**: 개발 중인 코드 (통합)
- **`feature/[feature-name]`**: 새 기능 개발
- **`fix/[bug-name]`**: 버그 수정
- **`docs/[doc-name]`**: 문서 작업

```bash
# ✅ DO: 기능 브랜치 생성
git checkout -b feature/upbit-chart-infinite-scroll

# ✅ DO: 버그 수정 브랜치
git checkout -b fix/timezone-conversion-error

# ❌ DON'T: 모호한 브랜치명
git checkout -b test  # ❌ 무엇을 테스트?
git checkout -b fix-bug  # ❌ 어떤 버그?
```

### Commit 주기

- **작은 단위로 자주 커밋** (한 번에 하나의 변경 사항)
- 의미 있는 단위로 묶기 (예: 타입 추가 → API 함수 추가 → 훅 추가 → 각각 커밋)

```bash
# ✅ DO: 작은 단위 커밋
git add src/entities/upbit/model/types.ts
git commit -m "feat: CandleTimeframe 타입 추가"

git add src/entities/upbit/api/candles.ts
git commit -m "feat: fetchCandles 통합 API 함수 추가"

git add src/entities/upbit/hooks/use-candles.ts
git commit -m "feat: useCandles 훅 추가"

# ❌ DON'T: 한 번에 모든 변경사항
git add .
git commit -m "feat: 업비트 기능 추가"  # ❌ 너무 포괄적
```

### Pull Request 생성

```bash
# 1. 변경 사항 커밋
git add .
git commit -m "feat: 차트 무한 스크롤 구현"

# 2. 원격 저장소에 푸시
git push -u origin feature/upbit-chart-infinite-scroll

# 3. PR 생성 (gh CLI 사용 시)
gh pr create --title "feat: 차트 무한 스크롤 기능 추가" --body "$(cat <<'EOF'
## Summary
- 차트를 왼쪽으로 드래그하면 과거 데이터 자동 로드
- lightweight-charts subscribeVisibleLogicalRangeChange 활용
- Upbit API의 to parameter로 페이지네이션 구현

## Test plan
- [ ] 분봉에서 무한 스크롤 동작 확인
- [ ] 일봉/주봉/월봉에서도 동작 확인
- [ ] 중복 데이터 로드되지 않는지 확인
- [ ] 네트워크 에러 처리 확인

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

## 🛡️ Pre-commit Hooks

프로젝트는 **Husky**와 **lint-staged**를 사용해 커밋 전 자동 검사를 수행합니다.

### 자동 실행 항목

1. **ESLint**: TypeScript/React 코드 린팅
2. **Prettier**: 코드 포맷팅
3. **Commitlint**: 커밋 메시지 검증

### 커밋 실패 시

```bash
# 에러 예시
✖ subject may not be empty [subject-empty]
✖ type may not be empty [type-empty]

# ✅ 해결: 올바른 형식으로 다시 커밋
git commit -m "feat: 기능 추가"
```

## 🚫 Anti-patterns (금지 사항)

### ❌ WIP 커밋 남기기

```bash
# ❌ DON'T: 작업 중 커밋 그대로 푸시
git commit -m "WIP"
git commit -m "임시 저장"
git commit -m "test"

# ✅ DO: 의미 있는 커밋 또는 squash
git commit -m "feat: 차트 컴포넌트 기본 구조 추가"
# 또는 나중에 squash
```

### ❌ 커밋 메시지 형식 무시

```bash
# ❌ DON'T
git commit -m "updated files"
git commit -m "fix bug"
git commit -m "asdf"

# ✅ DO
git commit -m "fix: 타임존 변환 오류 수정"
git commit -m "refactor: API 클라이언트 코드 정리"
```

### ❌ 거대한 커밋

```bash
# ❌ DON'T: 100개 파일 한 번에 커밋
git add .
git commit -m "feat: 모든 기능 추가"

# ✅ DO: 논리적 단위로 나누기
git add src/entities/upbit/
git commit -m "feat: Upbit API 엔티티 추가"

git add src/features/upbit-chart/
git commit -m "feat: 차트 컴포넌트 추가"
```

### ❌ Merge Commit 남발

```bash
# ❌ DON'T: 불필요한 merge commit
git pull  # merge commit 생성
git push

# ✅ DO: Rebase 사용
git pull --rebase
git push
```

### ❌ Force Push to Main

```bash
# ❌ DON'T: main 브랜치에 force push
git push --force origin main  # 🚨 절대 금지!

# ✅ DO: Feature 브랜치에만 force push (필요 시)
git push --force origin feature/my-feature
```

## ✅ Commitlint 설정

프로젝트는 다음 규칙을 따릅니다:

```javascript
// commitlint.config.js
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'subject-max-length': [2, 'always', 100],
    'body-max-line-length': [2, 'always', 200],
    // 한글 지원
    'subject-case': [0],
    'header-max-length': [0],
  },
};
```

### 커밋 메시지 검증

```bash
# ✅ 통과
feat: 새 기능 추가
fix(upbit): 타입 에러 수정
docs: README 업데이트

# ❌ 실패
Update files  # type 없음
feat:기능추가  # 띄어쓰기 없음
feat: 이것은 매우 긴 제목인데 100자를 넘어가면 커밋이 실패합니다...  # 너무 김
```

## 📚 참고 자료

- [Conventional Commits](https://www.conventionalcommits.org/)
- [Commitlint](https://commitlint.js.org/)
- [Husky](https://typicode.github.io/husky/)

## 💡 Best Practices

1. **커밋 전에 변경사항 확인**: `git status`, `git diff`
2. **작은 단위로 자주 커밋**: 한 번에 하나의 변경사항
3. **의미 있는 메시지 작성**: "왜" 변경했는지 설명
4. **한글 또는 영어 일관성 유지**: 프로젝트 전체에서 하나로 통일
5. **PR 전에 리베이스**: `git pull --rebase`로 히스토리 깔끔하게 유지
