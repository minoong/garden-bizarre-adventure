# Claude Code Skills

이 디렉토리는 **Garden Bizarre Adventure** 프로젝트에서 Claude Code가 코드를 작성할 때 참조하는 스킬들을 포함합니다.

## 디렉토리 구조

```
.claude/
├── README.md                    # 이 파일
├── conventions/
│   └── SKILL.md                # 코딩 컨벤션 및 아키텍처 패턴
├── api/
│   └── upbit-SKILL.md          # Upbit API 사용 가이드
├── workflows/
│   └── SKILL.md                # Git 워크플로우 및 커밋 규칙
└── examples/
    └── upbit-chart-component.tsx  # 차트 컴포넌트 예제
```

## 사용 방법

Claude Code는 작업 시작 전 자동으로 `SKILL.md` 파일들을 읽습니다.
팀원들은 이 문서들을 수정하여 프로젝트 규칙을 업데이트할 수 있습니다.

## 스킬 목록

- **`conventions/SKILL.md`** - 필수 코딩 컨벤션, MUI 사용 규칙, FSD 아키텍처 패턴
- **`api/upbit-SKILL.md`** - Upbit API 엔티티 및 차트 컴포넌트 사용 가이드
- **`workflows/SKILL.md`** - Git 커밋 메시지 규칙, PR 프로세스

## CLAUDE.md와의 관계

- **`CLAUDE.md`** (루트): 프로젝트 전체 개요, 기술 스택, 개발 명령어
- **`.claude/conventions/SKILL.md`**: 실제 코드 작성 시 따라야 할 **구체적 규칙과 안티패턴**
- **`.claude/api/upbit-SKILL.md`**: Upbit API 관련 **구현 패턴 및 금지 사항**

Claude Code는 모든 문서를 참조하지만, **구체적인 코딩 패턴은 `.claude/` 스킬들이 우선**됩니다.

## 새 규칙 추가하기

1. 해당 SKILL.md 파일 수정
2. Git commit & push
3. 팀원들과 공유
4. Claude Code가 자동으로 새 규칙 적용

## 문서 작성 원칙

- ✅ DO / ❌ DON'T 형식으로 명확하게 작성
- 실제 코드 예제 포함
- 왜 그렇게 해야 하는지 간단히 설명
- Anti-patterns 섹션에 **절대 금지 사항** 명시
