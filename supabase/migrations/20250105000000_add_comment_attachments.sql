-- ============================================
-- 댓글 첨부파일 컬럼 추가
-- ============================================

-- comments 테이블에 attachments 컬럼 추가 (이미지, GIF, 비디오 URL 배열)
ALTER TABLE comments ADD COLUMN IF NOT EXISTS attachments TEXT[] DEFAULT '{}';

COMMENT ON COLUMN comments.attachments IS '댓글에 첨부된 파일 URL 배열 (이미지, GIF, 비디오)';

-- 댓글 첨부파일 인덱스 생성 (검색 성능 최적화)
CREATE INDEX IF NOT EXISTS idx_comments_attachments ON comments USING GIN(attachments);
