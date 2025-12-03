-- ============================================
-- Supabase 실제 적용된 데이터베이스 스키마
-- 생성일: 2025-10-10
-- ============================================

-- ============================================
-- 1. 프로필 테이블 (auth.users 확장)
-- ============================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE,                          -- 사용자 고유 아이디 (예: @johndoe)
  display_name TEXT,                             -- 표시 이름 (예: John Doe)
  avatar_url TEXT,                               -- 프로필 이미지 URL
  bio TEXT,                                      -- 자기소개
  website TEXT,                                  -- 웹사이트 URL
  location TEXT,                                 -- 거주 지역
  birth_date DATE,                               -- 생년월일
  created_at TIMESTAMPTZ DEFAULT NOW(),          -- 프로필 생성일
  updated_at TIMESTAMPTZ DEFAULT NOW()           -- 프로필 수정일
);

COMMENT ON TABLE profiles IS '사용자 프로필 정보 (auth.users 테이블 확장)';
COMMENT ON COLUMN profiles.id IS 'auth.users.id와 동일한 사용자 고유 ID';
COMMENT ON COLUMN profiles.username IS '사용자 고유 아이디 (@username 형식)';
COMMENT ON COLUMN profiles.display_name IS '화면에 표시되는 이름';
COMMENT ON COLUMN profiles.avatar_url IS '프로필 이미지 URL (Firebase Storage)';
COMMENT ON COLUMN profiles.bio IS '사용자 자기소개 (최대 160자 권장)';

-- ============================================
-- 2. 포스트 테이블
-- ============================================
CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), -- 포스트 고유 ID
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE, -- 작성자 ID

  -- 콘텐츠
  title TEXT,                                    -- 포스트 제목
  content TEXT,                                  -- 포스트 내용

  -- 위치 정보
  location_name TEXT,                            -- 장소 이름 (예: "서울 강남구", "제주 우도")
  latitude DECIMAL(10, 8),                       -- 위도 (예: 37.5665)
  longitude DECIMAL(11, 8),                      -- 경도 (예: 126.9780)

  -- 카테고리
  theme TEXT,                                    -- 테마/카테고리 (예: "여행", "음식", "일상")

  -- 날짜
  post_date DATE,                                -- 실제 사진/이벤트 발생 날짜

  -- 통계
  likes_count INTEGER DEFAULT 0,                 -- 좋아요 수
  comments_count INTEGER DEFAULT 0,              -- 댓글 수
  views_count INTEGER DEFAULT 0,                 -- 조회 수
  bookmarks_count INTEGER DEFAULT 0,             -- 북마크 수

  -- 공개 설정
  is_public BOOLEAN DEFAULT true,                -- 공개 여부 (true: 공개, false: 비공개)

  -- 전문 검색
  search_vector tsvector,                        -- 전문 검색 벡터

  -- 메타데이터
  created_at TIMESTAMPTZ DEFAULT NOW(),          -- 포스트 생성일
  updated_at TIMESTAMPTZ DEFAULT NOW()           -- 포스트 수정일
);

COMMENT ON TABLE posts IS '사용자가 작성한 포스트 (인스타그램 게시물과 유사)';
COMMENT ON COLUMN posts.id IS '포스트 고유 식별자';
COMMENT ON COLUMN posts.user_id IS '작성자 ID (auth.users 참조)';
COMMENT ON COLUMN posts.title IS '포스트 제목 (선택사항)';
COMMENT ON COLUMN posts.content IS '포스트 본문 내용';
COMMENT ON COLUMN posts.location_name IS '위치 이름 (사용자가 입력한 장소명)';
COMMENT ON COLUMN posts.latitude IS '위도 좌표 (-90 ~ 90)';
COMMENT ON COLUMN posts.longitude IS '경도 좌표 (-180 ~ 180)';
COMMENT ON COLUMN posts.theme IS '포스트 주제/카테고리';
COMMENT ON COLUMN posts.post_date IS '실제 사진을 찍거나 이벤트가 발생한 날짜';
COMMENT ON COLUMN posts.is_public IS '공개 게시물 여부';

-- ============================================
-- 3. 포스트 이미지 테이블
-- ============================================
CREATE TABLE post_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), -- 이미지 고유 ID
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE, -- 포스트 ID

  -- Firebase Storage URL
  image_url TEXT NOT NULL,                       -- 원본 이미지 URL
  thumbnail_url TEXT,                            -- 썸네일 이미지 URL (성능 최적화용)

  -- 이미지 메타데이터
  width INTEGER,                                 -- 이미지 가로 크기 (px)
  height INTEGER,                                -- 이미지 세로 크기 (px)
  file_size INTEGER,                             -- 파일 크기 (bytes)
  mime_type TEXT,                                -- MIME 타입 (예: "image/jpeg", "image/png")
  alt_text TEXT,                                 -- 대체 텍스트 (접근성)

  -- 위치 정보 (EXIF 메타데이터)
  latitude DECIMAL(10, 8),                       -- 위도 (EXIF에서 추출, 선택사항)
  longitude DECIMAL(11, 8),                      -- 경도 (EXIF에서 추출, 선택사항)

  -- 순서
  display_order INTEGER DEFAULT 0,               -- 표시 순서 (0부터 시작)

  -- 메타데이터
  created_at TIMESTAMPTZ DEFAULT NOW()           -- 이미지 업로드일
);

COMMENT ON TABLE post_images IS '포스트에 첨부된 이미지들 (한 포스트에 여러 이미지 가능)';
COMMENT ON COLUMN post_images.id IS '이미지 고유 식별자';
COMMENT ON COLUMN post_images.post_id IS '이미지가 속한 포스트 ID';
COMMENT ON COLUMN post_images.image_url IS 'Firebase Storage에 저장된 이미지 URL';
COMMENT ON COLUMN post_images.thumbnail_url IS '썸네일 이미지 URL (목록 표시용)';
COMMENT ON COLUMN post_images.latitude IS '이미지의 위도 좌표 (EXIF 메타데이터에서 추출, 선택사항)';
COMMENT ON COLUMN post_images.longitude IS '이미지의 경도 좌표 (EXIF 메타데이터에서 추출, 선택사항)';
COMMENT ON COLUMN post_images.display_order IS '이미지 표시 순서 (작을수록 먼저 표시)';
COMMENT ON COLUMN post_images.alt_text IS '이미지 설명 (시각장애인 접근성)';

-- ============================================
-- 4. 카테고리 테이블
-- ============================================
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), -- 카테고리 고유 ID
  name TEXT UNIQUE NOT NULL,                     -- 카테고리 이름 (예: "여행", "서울")
  slug TEXT UNIQUE NOT NULL,                     -- URL용 슬러그 (예: "여행" → "yeohaeng")
  description TEXT,                              -- 카테고리 설명
  usage_count INTEGER DEFAULT 0,                 -- 사용 횟수 (인기도 측정)
  created_at TIMESTAMPTZ DEFAULT NOW()           -- 카테고리 생성일
);

COMMENT ON TABLE categories IS '포스트 분류를 위한 카테고리 (테마)';
COMMENT ON COLUMN categories.id IS '카테고리 고유 식별자';
COMMENT ON COLUMN categories.name IS '카테고리 표시명 (대소문자 구분 없음)';
COMMENT ON COLUMN categories.slug IS 'URL에 사용되는 카테고리 식별자';
COMMENT ON COLUMN categories.usage_count IS '카테고리가 사용된 총 횟수 (인기 카테고리 판별용)';

-- ============================================
-- 5. 포스트-카테고리 연결 테이블 (다대다 관계)
-- ============================================
CREATE TABLE post_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), -- 연결 고유 ID
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE, -- 포스트 ID
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE, -- 카테고리 ID
  created_at TIMESTAMPTZ DEFAULT NOW(),          -- 카테고리 추가일
  UNIQUE(post_id, category_id)                   -- 중복 방지
);

COMMENT ON TABLE post_categories IS '포스트와 카테고리의 다대다 관계 연결 테이블';
COMMENT ON COLUMN post_categories.post_id IS '카테고리가 붙은 포스트 ID';
COMMENT ON COLUMN post_categories.category_id IS '포스트에 붙은 카테고리 ID';

-- ============================================
-- 6. 태그 테이블 (인스타그램 스타일 해시태그)
-- ============================================
CREATE TABLE tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,                      -- 태그 이름 (예: "여행", "맛집", "일상")
  slug TEXT NOT NULL UNIQUE,                      -- URL-safe slug (예: "여행", "맛집", "일상")
  usage_count INTEGER DEFAULT 0,                  -- 사용 횟수
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE tags IS '해시태그 테이블 (인스타그램 스타일)';
COMMENT ON COLUMN tags.name IS '태그 이름';
COMMENT ON COLUMN tags.slug IS 'URL-safe 슬러그';
COMMENT ON COLUMN tags.usage_count IS '태그 사용 횟수 (인기도)';

-- ============================================
-- 7. 포스트-태그 연결 테이블 (다대다 관계)
-- ============================================
CREATE TABLE post_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(post_id, tag_id)                         -- 중복 방지
);

COMMENT ON TABLE post_tags IS '게시물-태그 연결 테이블';
COMMENT ON COLUMN post_tags.post_id IS '게시물 ID';
COMMENT ON COLUMN post_tags.tag_id IS '태그 ID';

-- ============================================
-- 8. 좋아요 테이블
-- ============================================
CREATE TABLE likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), -- 좋아요 고유 ID
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE, -- 포스트 ID
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE, -- 사용자 ID
  created_at TIMESTAMPTZ DEFAULT NOW(),          -- 좋아요 누른 시간
  UNIQUE(post_id, user_id)                       -- 한 사용자가 같은 포스트에 중복 좋아요 방지
);

COMMENT ON TABLE likes IS '사용자가 포스트에 누른 좋아요';
COMMENT ON COLUMN likes.post_id IS '좋아요를 받은 포스트 ID';
COMMENT ON COLUMN likes.user_id IS '좋아요를 누른 사용자 ID';

-- ============================================
-- 9. 댓글 테이블
-- ============================================
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), -- 댓글 고유 ID
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE, -- 포스트 ID
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE, -- 작성자 ID
  parent_comment_id UUID REFERENCES comments(id) ON DELETE CASCADE, -- 부모 댓글 ID (대댓글용)

  -- 내용
  content TEXT NOT NULL,                         -- 댓글 내용

  -- 통계
  likes_count INTEGER DEFAULT 0,                 -- 댓글 좋아요 수
  replies_count INTEGER DEFAULT 0,               -- 답글 수

  -- 메타데이터
  is_edited BOOLEAN DEFAULT false,               -- 수정 여부
  created_at TIMESTAMPTZ DEFAULT NOW(),          -- 댓글 작성일
  updated_at TIMESTAMPTZ DEFAULT NOW()           -- 댓글 수정일
);

COMMENT ON TABLE comments IS '포스트에 달린 댓글 및 대댓글';
COMMENT ON COLUMN comments.id IS '댓글 고유 식별자';
COMMENT ON COLUMN comments.post_id IS '댓글이 달린 포스트 ID';
COMMENT ON COLUMN comments.user_id IS '댓글 작성자 ID';
COMMENT ON COLUMN comments.parent_comment_id IS '대댓글인 경우 부모 댓글 ID (NULL이면 최상위 댓글)';
COMMENT ON COLUMN comments.content IS '댓글 내용';
COMMENT ON COLUMN comments.is_edited IS '댓글 수정 여부 (수정됨 표시용)';

-- ============================================
-- 10. 댓글 좋아요 테이블
-- ============================================
CREATE TABLE comment_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), -- 좋아요 고유 ID
  comment_id UUID NOT NULL REFERENCES comments(id) ON DELETE CASCADE, -- 댓글 ID
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,  -- 사용자 ID
  created_at TIMESTAMPTZ DEFAULT NOW(),          -- 좋아요 누른 시간
  UNIQUE(comment_id, user_id)                    -- 중복 방지
);

COMMENT ON TABLE comment_likes IS '댓글에 누른 좋아요';
COMMENT ON COLUMN comment_likes.comment_id IS '좋아요를 받은 댓글 ID';
COMMENT ON COLUMN comment_likes.user_id IS '좋아요를 누른 사용자 ID';

-- ============================================
-- 11. 북마크 테이블
-- ============================================
CREATE TABLE bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), -- 북마크 고유 ID
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE, -- 포스트 ID
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE, -- 사용자 ID
  collection_name TEXT DEFAULT 'default',        -- 컬렉션 이름 (북마크 폴더)
  created_at TIMESTAMPTZ DEFAULT NOW(),          -- 북마크 추가일
  UNIQUE(post_id, user_id)                       -- 중복 방지
);

COMMENT ON TABLE bookmarks IS '사용자가 저장한 포스트 (북마크/저장)';
COMMENT ON COLUMN bookmarks.post_id IS '북마크한 포스트 ID';
COMMENT ON COLUMN bookmarks.user_id IS '북마크한 사용자 ID';
COMMENT ON COLUMN bookmarks.collection_name IS '북마크 컬렉션/폴더 이름';

-- ============================================
-- 12. 팔로우 테이블
-- ============================================
CREATE TABLE follows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), -- 팔로우 고유 ID
  follower_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE, -- 팔로워 ID (팔로우하는 사람)
  following_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE, -- 팔로잉 ID (팔로우받는 사람)
  created_at TIMESTAMPTZ DEFAULT NOW(),          -- 팔로우 시작일
  UNIQUE(follower_id, following_id),             -- 중복 방지
  CHECK (follower_id != following_id)            -- 자기 자신 팔로우 방지
);

COMMENT ON TABLE follows IS '사용자 간 팔로우 관계';
COMMENT ON COLUMN follows.follower_id IS '팔로우를 하는 사용자 ID';
COMMENT ON COLUMN follows.following_id IS '팔로우를 받는 사용자 ID';

-- ============================================
-- 인덱스 생성 (성능 최적화)
-- ============================================

-- profiles 테이블
CREATE INDEX idx_profiles_username ON profiles(username);

-- posts 테이블
CREATE INDEX idx_posts_user_id ON posts(user_id);
CREATE INDEX idx_posts_theme ON posts(theme);
CREATE INDEX idx_posts_post_date ON posts(post_date DESC);
CREATE INDEX idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX idx_posts_latitude ON posts(latitude) WHERE latitude IS NOT NULL;
CREATE INDEX idx_posts_longitude ON posts(longitude) WHERE longitude IS NOT NULL;
CREATE INDEX idx_posts_lat_lng ON posts(latitude, longitude) WHERE latitude IS NOT NULL AND longitude IS NOT NULL;
CREATE INDEX idx_posts_public ON posts(is_public) WHERE is_public = true;
CREATE INDEX idx_posts_user_created ON posts(user_id, created_at DESC);
CREATE INDEX idx_posts_search_vector ON posts USING GIN(search_vector);

-- post_images 테이블
CREATE INDEX idx_post_images_post_id ON post_images(post_id, display_order);
CREATE INDEX idx_post_images_lat_lng ON post_images(latitude, longitude) WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

-- categories 테이블
CREATE INDEX idx_categories_name ON categories(name);
CREATE INDEX idx_categories_slug ON categories(slug);
CREATE INDEX idx_categories_usage_count ON categories(usage_count DESC);

-- post_categories 테이블
CREATE INDEX idx_post_categories_post_id ON post_categories(post_id);
CREATE INDEX idx_post_categories_category_id ON post_categories(category_id);

-- tags 테이블
CREATE INDEX idx_tags_name ON tags(name);
CREATE INDEX idx_tags_usage_count ON tags(usage_count DESC);
CREATE INDEX idx_tags_slug ON tags(slug);

-- post_tags 테이블
CREATE INDEX idx_post_tags_post_id ON post_tags(post_id);
CREATE INDEX idx_post_tags_tag_id ON post_tags(tag_id);

-- likes 테이블
CREATE INDEX idx_likes_post_id ON likes(post_id);
CREATE INDEX idx_likes_user_id ON likes(user_id);
CREATE INDEX idx_likes_created_at ON likes(created_at DESC);

-- comments 테이블
CREATE INDEX idx_comments_post_id ON comments(post_id, created_at DESC);
CREATE INDEX idx_comments_user_id ON comments(user_id);
CREATE INDEX idx_comments_parent_id ON comments(parent_comment_id);

-- comment_likes 테이블
CREATE INDEX idx_comment_likes_comment_id ON comment_likes(comment_id);
CREATE INDEX idx_comment_likes_user_id ON comment_likes(user_id);

-- bookmarks 테이블
CREATE INDEX idx_bookmarks_user_id ON bookmarks(user_id, created_at DESC);
CREATE INDEX idx_bookmarks_post_id ON bookmarks(post_id);
CREATE INDEX idx_bookmarks_collection ON bookmarks(user_id, collection_name);

-- follows 테이블
CREATE INDEX idx_follows_follower_id ON follows(follower_id);
CREATE INDEX idx_follows_following_id ON follows(following_id);

-- ============================================
-- Row Level Security (RLS) 정책
-- ============================================

-- profiles 테이블
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "프로필은 누구나 조회 가능"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "사용자는 자신의 프로필 생성 가능"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "사용자는 자신의 프로필만 수정 가능"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- posts 테이블
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "공개 포스트는 누구나 조회 가능"
  ON posts FOR SELECT
  USING (is_public = true);

CREATE POLICY "사용자는 자신의 모든 포스트 조회 가능"
  ON posts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "인증된 사용자는 포스트 작성 가능"
  ON posts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "사용자는 자신의 포스트만 수정 가능"
  ON posts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "사용자는 자신의 포스트만 삭제 가능"
  ON posts FOR DELETE
  USING (auth.uid() = user_id);

-- post_images 테이블
ALTER TABLE post_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "공개 포스트의 이미지는 누구나 조회 가능"
  ON post_images FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM posts
      WHERE posts.id = post_images.post_id
      AND posts.is_public = true
    )
  );

CREATE POLICY "사용자는 자신의 포스트에 이미지 추가 가능"
  ON post_images FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM posts
      WHERE posts.id = post_images.post_id
      AND posts.user_id = auth.uid()
    )
  );

CREATE POLICY "사용자는 자신의 포스트 이미지만 삭제 가능"
  ON post_images FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM posts
      WHERE posts.id = post_images.post_id
      AND posts.user_id = auth.uid()
    )
  );

-- categories 테이블
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "카테고리는 누구나 조회 가능"
  ON categories FOR SELECT
  USING (true);

CREATE POLICY "인증된 사용자는 카테고리 생성 가능"
  ON categories FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- post_categories 테이블
ALTER TABLE post_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "카테고리 연결은 누구나 조회 가능"
  ON post_categories FOR SELECT
  USING (true);

CREATE POLICY "포스트 작성자는 카테고리 추가 가능"
  ON post_categories FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM posts
      WHERE posts.id = post_categories.post_id
      AND posts.user_id = auth.uid()
    )
  );

-- tags 테이블
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "태그는 누구나 조회 가능"
  ON tags FOR SELECT
  USING (true);

CREATE POLICY "인증된 사용자는 태그 생성 가능"
  ON tags FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- post_tags 테이블
ALTER TABLE post_tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "태그 연결은 누구나 조회 가능"
  ON post_tags FOR SELECT
  USING (true);

CREATE POLICY "포스트 작성자는 태그 추가 가능"
  ON post_tags FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM posts
      WHERE posts.id = post_tags.post_id
      AND posts.user_id = auth.uid()
    )
  );

CREATE POLICY "포스트 작성자는 태그 삭제 가능"
  ON post_tags FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM posts
      WHERE posts.id = post_tags.post_id
      AND posts.user_id = auth.uid()
    )
  );

-- likes 테이블
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "좋아요는 누구나 조회 가능"
  ON likes FOR SELECT
  USING (true);

CREATE POLICY "인증된 사용자는 좋아요 추가 가능"
  ON likes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "사용자는 자신의 좋아요만 삭제 가능"
  ON likes FOR DELETE
  USING (auth.uid() = user_id);

-- comments 테이블
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "공개 포스트의 댓글은 누구나 조회 가능"
  ON comments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM posts
      WHERE posts.id = comments.post_id
      AND posts.is_public = true
    )
  );

CREATE POLICY "인증된 사용자는 댓글 작성 가능"
  ON comments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "사용자는 자신의 댓글만 수정 가능"
  ON comments FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "사용자는 자신의 댓글만 삭제 가능"
  ON comments FOR DELETE
  USING (auth.uid() = user_id);

-- comment_likes 테이블
ALTER TABLE comment_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "댓글 좋아요는 누구나 조회 가능"
  ON comment_likes FOR SELECT
  USING (true);

CREATE POLICY "인증된 사용자는 댓글 좋아요 추가 가능"
  ON comment_likes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "사용자는 자신의 댓글 좋아요만 삭제 가능"
  ON comment_likes FOR DELETE
  USING (auth.uid() = user_id);

-- bookmarks 테이블
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "사용자는 자신의 북마크만 조회 가능"
  ON bookmarks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "인증된 사용자는 북마크 추가 가능"
  ON bookmarks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "사용자는 자신의 북마크만 삭제 가능"
  ON bookmarks FOR DELETE
  USING (auth.uid() = user_id);

-- follows 테이블
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "팔로우 관계는 누구나 조회 가능"
  ON follows FOR SELECT
  USING (true);

CREATE POLICY "인증된 사용자는 팔로우 가능"
  ON follows FOR INSERT
  WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "사용자는 자신의 팔로우만 취소 가능"
  ON follows FOR DELETE
  USING (auth.uid() = follower_id);

-- ============================================
-- 트리거 함수
-- ============================================

-- 1. 신규 사용자 프로필 자동 생성
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, display_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'username',
    NEW.raw_user_meta_data->>'display_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.handle_new_user() IS 'auth.users에 신규 사용자 생성 시 profiles 테이블에 자동으로 프로필 생성';

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 2. updated_at 자동 업데이트
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION update_updated_at_column() IS '레코드 수정 시 updated_at 컬럼을 현재 시간으로 자동 업데이트';

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_posts_updated_at
  BEFORE UPDATE ON posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_comments_updated_at
  BEFORE UPDATE ON comments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 3. 좋아요 수 자동 업데이트
CREATE OR REPLACE FUNCTION update_post_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE posts SET likes_count = likes_count + 1 WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE posts SET likes_count = likes_count - 1 WHERE id = OLD.post_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION update_post_likes_count() IS '좋아요 추가/삭제 시 posts.likes_count 자동 업데이트';

CREATE TRIGGER trigger_update_post_likes_count
  AFTER INSERT OR DELETE ON likes
  FOR EACH ROW EXECUTE FUNCTION update_post_likes_count();

-- 4. 댓글 수 자동 업데이트
CREATE OR REPLACE FUNCTION update_comments_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE posts SET comments_count = comments_count + 1 WHERE id = NEW.post_id;
    IF NEW.parent_comment_id IS NOT NULL THEN
      UPDATE comments SET replies_count = replies_count + 1 WHERE id = NEW.parent_comment_id;
    END IF;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE posts SET comments_count = comments_count - 1 WHERE id = OLD.post_id;
    IF OLD.parent_comment_id IS NOT NULL THEN
      UPDATE comments SET replies_count = replies_count - 1 WHERE id = OLD.parent_comment_id;
    END IF;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION update_comments_count() IS '댓글 추가/삭제 시 posts.comments_count와 comments.replies_count 자동 업데이트';

CREATE TRIGGER trigger_update_comments_count
  AFTER INSERT OR DELETE ON comments
  FOR EACH ROW EXECUTE FUNCTION update_comments_count();

-- 5. 댓글 좋아요 수 자동 업데이트
CREATE OR REPLACE FUNCTION update_comment_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE comments SET likes_count = likes_count + 1 WHERE id = NEW.comment_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE comments SET likes_count = likes_count - 1 WHERE id = OLD.comment_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION update_comment_likes_count() IS '댓글 좋아요 추가/삭제 시 comments.likes_count 자동 업데이트';

CREATE TRIGGER trigger_update_comment_likes_count
  AFTER INSERT OR DELETE ON comment_likes
  FOR EACH ROW EXECUTE FUNCTION update_comment_likes_count();

-- 6. 북마크 수 자동 업데이트
CREATE OR REPLACE FUNCTION update_bookmarks_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE posts SET bookmarks_count = bookmarks_count + 1 WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE posts SET bookmarks_count = bookmarks_count - 1 WHERE id = OLD.post_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION update_bookmarks_count() IS '북마크 추가/삭제 시 posts.bookmarks_count 자동 업데이트';

CREATE TRIGGER trigger_update_bookmarks_count
  AFTER INSERT OR DELETE ON bookmarks
  FOR EACH ROW EXECUTE FUNCTION update_bookmarks_count();

-- 7. 카테고리 사용 횟수 자동 업데이트
CREATE OR REPLACE FUNCTION update_category_usage_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE categories SET usage_count = usage_count + 1 WHERE id = NEW.category_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE categories SET usage_count = usage_count - 1 WHERE id = OLD.category_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION update_category_usage_count() IS '포스트에 카테고리가 추가/삭제될 때 categories.usage_count 자동 업데이트';

CREATE TRIGGER trigger_update_category_usage_count
  AFTER INSERT OR DELETE ON post_categories
  FOR EACH ROW EXECUTE FUNCTION update_category_usage_count();

-- 8. 태그 사용 횟수 자동 업데이트
CREATE OR REPLACE FUNCTION update_tag_usage_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE tags
    SET usage_count = usage_count + 1,
        updated_at = NOW()
    WHERE id = NEW.tag_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE tags
    SET usage_count = GREATEST(usage_count - 1, 0),
        updated_at = NOW()
    WHERE id = OLD.tag_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION update_tag_usage_count() IS '포스트에 태그가 추가/삭제될 때 tags.usage_count 자동 업데이트';

CREATE TRIGGER trigger_update_tag_usage_count
  AFTER INSERT OR DELETE ON post_tags
  FOR EACH ROW EXECUTE FUNCTION update_tag_usage_count();

-- 9. 전문 검색 벡터 자동 업데이트
CREATE OR REPLACE FUNCTION posts_search_vector_update()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('simple', COALESCE(NEW.title, '')), 'A') ||
    setweight(to_tsvector('simple', COALESCE(NEW.content, '')), 'B') ||
    setweight(to_tsvector('simple', COALESCE(NEW.location_name, '')), 'C');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION posts_search_vector_update() IS '포스트 전문 검색 벡터 자동 업데이트';

DROP TRIGGER IF EXISTS trigger_posts_search_vector_update ON posts;
CREATE TRIGGER trigger_posts_search_vector_update
  BEFORE INSERT OR UPDATE ON posts
  FOR EACH ROW EXECUTE FUNCTION posts_search_vector_update();

-- ============================================
-- 유틸리티 함수
-- ============================================

-- 1. 좋아요 토글 함수
CREATE OR REPLACE FUNCTION toggle_like(p_post_id UUID, p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_exists BOOLEAN;
BEGIN
  SELECT EXISTS(
    SELECT 1 FROM likes
    WHERE post_id = p_post_id AND user_id = p_user_id
  ) INTO v_exists;

  IF v_exists THEN
    DELETE FROM likes WHERE post_id = p_post_id AND user_id = p_user_id;
    RETURN FALSE;
  ELSE
    INSERT INTO likes (post_id, user_id) VALUES (p_post_id, p_user_id);
    RETURN TRUE;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION toggle_like(UUID, UUID) IS '좋아요 토글 (있으면 제거, 없으면 추가). TRUE: 추가됨, FALSE: 제거됨';

-- 2. 댓글 좋아요 토글 함수
CREATE OR REPLACE FUNCTION toggle_comment_like(p_comment_id UUID, p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_exists BOOLEAN;
BEGIN
  SELECT EXISTS(
    SELECT 1 FROM comment_likes
    WHERE comment_id = p_comment_id AND user_id = p_user_id
  ) INTO v_exists;

  IF v_exists THEN
    DELETE FROM comment_likes WHERE comment_id = p_comment_id AND user_id = p_user_id;
    RETURN FALSE;
  ELSE
    INSERT INTO comment_likes (comment_id, user_id) VALUES (p_comment_id, p_user_id);
    RETURN TRUE;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION toggle_comment_like(UUID, UUID) IS '댓글 좋아요 토글';

-- 3. 북마크 토글 함수
CREATE OR REPLACE FUNCTION toggle_bookmark(p_post_id UUID, p_user_id UUID, p_collection_name TEXT DEFAULT 'default')
RETURNS BOOLEAN AS $$
DECLARE
  v_exists BOOLEAN;
BEGIN
  SELECT EXISTS(
    SELECT 1 FROM bookmarks
    WHERE post_id = p_post_id AND user_id = p_user_id
  ) INTO v_exists;

  IF v_exists THEN
    DELETE FROM bookmarks WHERE post_id = p_post_id AND user_id = p_user_id;
    RETURN FALSE;
  ELSE
    INSERT INTO bookmarks (post_id, user_id, collection_name)
    VALUES (p_post_id, p_user_id, p_collection_name);
    RETURN TRUE;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION toggle_bookmark(UUID, UUID, TEXT) IS '북마크 토글';

-- 4. 팔로우 토글 함수
CREATE OR REPLACE FUNCTION toggle_follow(p_follower_id UUID, p_following_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_exists BOOLEAN;
BEGIN
  IF p_follower_id = p_following_id THEN
    RAISE EXCEPTION '자기 자신을 팔로우할 수 없습니다';
  END IF;

  SELECT EXISTS(
    SELECT 1 FROM follows
    WHERE follower_id = p_follower_id AND following_id = p_following_id
  ) INTO v_exists;

  IF v_exists THEN
    DELETE FROM follows WHERE follower_id = p_follower_id AND following_id = p_following_id;
    RETURN FALSE;
  ELSE
    INSERT INTO follows (follower_id, following_id) VALUES (p_follower_id, p_following_id);
    RETURN TRUE;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION toggle_follow(UUID, UUID) IS '팔로우 토글';

-- 5. 근처 포스트 검색 함수 (Haversine 공식 사용)
CREATE OR REPLACE FUNCTION get_nearby_posts(
  p_latitude DECIMAL,
  p_longitude DECIMAL,
  p_radius_km DECIMAL DEFAULT 10,
  p_limit INTEGER DEFAULT 20
)
RETURNS TABLE (
  post_id UUID,
  distance_km DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id AS post_id,
    ROUND(
      (6371 * acos(
        LEAST(1.0, GREATEST(-1.0,
          cos(radians(p_latitude)) *
          cos(radians(p.latitude)) *
          cos(radians(p.longitude) - radians(p_longitude)) +
          sin(radians(p_latitude)) *
          sin(radians(p.latitude))
        ))
      ))::NUMERIC,
      2
    ) AS distance_km
  FROM posts p
  WHERE p.latitude IS NOT NULL
    AND p.longitude IS NOT NULL
    AND p.is_public = true
    AND (
      6371 * acos(
        LEAST(1.0, GREATEST(-1.0,
          cos(radians(p_latitude)) *
          cos(radians(p.latitude)) *
          cos(radians(p.longitude) - radians(p_longitude)) +
          sin(radians(p_latitude)) *
          sin(radians(p.latitude))
        ))
      )
    ) <= p_radius_km
  ORDER BY distance_km
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_nearby_posts(DECIMAL, DECIMAL, DECIMAL, INTEGER) IS '특정 위치 근처의 포스트 검색 (Haversine 공식)';

-- 6. 인기 카테고리 조회 함수
CREATE OR REPLACE FUNCTION get_popular_categories(p_limit INTEGER DEFAULT 20)
RETURNS TABLE (
  category_id UUID,
  category_name TEXT,
  category_usage_count INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT id, name, usage_count
  FROM categories
  ORDER BY usage_count DESC, name ASC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_popular_categories(INTEGER) IS '사용 횟수 기준 인기 카테고리 조회';

-- 7. 인기 태그 조회 함수
CREATE OR REPLACE FUNCTION get_popular_tags(p_limit INTEGER DEFAULT 20)
RETURNS TABLE (
  tag_id UUID,
  tag_name TEXT,
  tag_usage_count INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT id, name, usage_count
  FROM tags
  ORDER BY usage_count DESC, name ASC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_popular_tags(INTEGER) IS '사용 횟수 기준 인기 태그 조회 (인스타그램 스타일)';

-- 9. 사용자 팔로워 수 조회
CREATE OR REPLACE FUNCTION get_follower_count(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  v_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_count
  FROM follows
  WHERE following_id = p_user_id;

  RETURN v_count;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_follower_count(UUID) IS '특정 사용자의 팔로워 수 반환';

-- 10. 사용자 팔로잉 수 조회
CREATE OR REPLACE FUNCTION get_following_count(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  v_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_count
  FROM follows
  WHERE follower_id = p_user_id;

  RETURN v_count;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_following_count(UUID) IS '특정 사용자가 팔로우하는 수 반환';

-- 11. 피드 조회 함수 (팔로우한 사용자들의 포스트)
CREATE OR REPLACE FUNCTION get_user_feed(
  p_user_id UUID,
  p_limit INTEGER DEFAULT 20,
  p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
  post_id UUID,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT p.id, p.created_at
  FROM posts p
  INNER JOIN follows f ON p.user_id = f.following_id
  WHERE f.follower_id = p_user_id
    AND p.is_public = true
  ORDER BY p.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_user_feed(UUID, INTEGER, INTEGER) IS '사용자가 팔로우한 사람들의 포스트 피드 조회';

-- 12. 포스트 검색 함수
CREATE OR REPLACE FUNCTION search_posts(
  p_query TEXT,
  p_limit INTEGER DEFAULT 20,
  p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
  post_id UUID,
  rank REAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    ts_rank(p.search_vector, plainto_tsquery('simple', p_query)) AS rank
  FROM posts p
  WHERE p.search_vector @@ plainto_tsquery('simple', p_query)
    AND p.is_public = true
  ORDER BY rank DESC, p.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION search_posts(TEXT, INTEGER, INTEGER) IS '키워드로 포스트 전문 검색 (제목, 내용, 위치 검색)';

-- ============================================
-- 뷰 (View) 생성 - 자주 사용하는 조회 쿼리
-- ============================================

-- 1. 포스트 상세 정보 뷰 (프로필, 이미지, 카테고리, 태그 포함)
CREATE OR REPLACE VIEW v_posts_detail AS
SELECT
  p.*,
  pr.username,
  pr.display_name,
  pr.avatar_url,
  ARRAY_AGG(pi.image_url ORDER BY pi.display_order) FILTER (WHERE pi.image_url IS NOT NULL) AS image_urls,
  ARRAY_AGG(DISTINCT c.name) FILTER (WHERE c.name IS NOT NULL) AS category_names,
  ARRAY_AGG(DISTINCT t.name) FILTER (WHERE t.name IS NOT NULL) AS tag_names
FROM posts p
LEFT JOIN profiles pr ON p.user_id = pr.id
LEFT JOIN post_images pi ON p.id = pi.post_id
LEFT JOIN post_categories pc ON p.id = pc.post_id
LEFT JOIN categories c ON pc.category_id = c.id
LEFT JOIN post_tags pt ON p.id = pt.post_id
LEFT JOIN tags t ON pt.tag_id = t.id
GROUP BY p.id, pr.username, pr.display_name, pr.avatar_url;

COMMENT ON VIEW v_posts_detail IS '포스트 상세 정보 (프로필, 이미지, 카테고리, 태그 포함)';

-- 2. 사용자 통계 뷰
CREATE OR REPLACE VIEW v_user_stats AS
SELECT
  u.id AS user_id,
  pr.username,
  pr.display_name,
  pr.avatar_url,
  COUNT(DISTINCT p.id) AS posts_count,
  COALESCE(SUM(p.likes_count), 0) AS total_likes_received,
  COUNT(DISTINCT f1.follower_id) AS followers_count,
  COUNT(DISTINCT f2.following_id) AS following_count
FROM auth.users u
LEFT JOIN profiles pr ON u.id = pr.id
LEFT JOIN posts p ON u.id = p.user_id
LEFT JOIN follows f1 ON u.id = f1.following_id
LEFT JOIN follows f2 ON u.id = f2.follower_id
GROUP BY u.id, pr.username, pr.display_name, pr.avatar_url;

COMMENT ON VIEW v_user_stats IS '사용자별 통계 (포스트 수, 좋아요 수, 팔로워/팔로잉 수)';

-- 3. 트렌딩 포스트 뷰 (최근 24시간)
CREATE OR REPLACE VIEW v_trending_posts AS
SELECT
  p.*,
  (p.likes_count * 2 + p.comments_count * 3 + p.views_count * 0.1) AS trending_score
FROM posts p
WHERE p.is_public = true
  AND p.created_at >= NOW() - INTERVAL '24 hours'
ORDER BY trending_score DESC;

COMMENT ON VIEW v_trending_posts IS '트렌딩 포스트 (최근 24시간 기준, 좋아요/댓글/조회수 기반 점수)';

-- ============================================
-- 샘플 데이터 삽입 (개발/테스트용)
-- ============================================

INSERT INTO categories (name, slug, usage_count) VALUES
  ('여행', 'travel', 150),
  ('음식', 'food', 230),
  ('카페', 'cafe', 180),
  ('자연', 'nature', 120),
  ('일상', 'daily', 340),
  ('운동', 'workout', 95),
  ('패션', 'fashion', 110),
  ('예술', 'art', 75),
  ('서울', 'seoul', 200),
  ('제주', 'jeju', 180),
  ('부산', 'busan', 140),
  ('강릉', 'gangneung', 90),
  ('전주', 'jeonju', 85),
  ('경주', 'gyeongju', 78),
  ('인천', 'incheon', 95)
ON CONFLICT (name) DO NOTHING;

COMMENT ON TABLE categories IS '샘플 카테고리 데이터 삽입됨';
