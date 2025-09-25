module.exports = {
  extends: ['@commitlint/config-conventional'],
  ignores: [(commit) => commit.includes('[skip ci]')],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat', // 새로운 기능 추가
        'fix', // 버그 수정
        'docs', // 문서 변경
        'style', // 코드 포맷팅, 세미콜론 누락, 코드 변경이 없는 경우
        'refactor', // 코드 리팩토링
        'test', // 테스트 추가, 테스트 리팩토링 (프로덕션 코드 변경 없음)
        'chore', // 빌드 태스크 업데이트, 패키지 매니저 설정 등 (프로덕션 코드 변경 없음)
        'perf', // 성능 개선
        'ci', // CI 관련 설정
        'build', // 빌드 시스템 또는 외부 종속성에 영향을 주는 변경사항
        'revert', // 커밋 되돌리기
      ],
    ],
    // 한글 커밋 메시지를 위해 케이스 규칙 비활성화
    'subject-case': [0],
    // 한글은 영어보다 문자당 정보량이 많아 길이 제한 완화
    'subject-max-length': [2, 'always', 100],
    'body-max-line-length': [2, 'always', 200],
    // 한글에서는 마침표 사용이 자연스러우므로 허용
    'subject-full-stop': [0],
  },
};
