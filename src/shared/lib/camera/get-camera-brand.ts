/**
 * 카메라 제조사(make) 정보에서 브랜드명을 추출합니다.
 * @param make - 카메라 제조사 문자열
 * @returns 브랜드명 또는 null
 */
export const getCameraBrand = (make?: string): string | null => {
  if (!make || typeof make !== 'string') return null;

  const makeLower = make.toLowerCase();

  if (/apple|iphone|ipad/i.test(makeLower)) return 'apple';
  if (/canon/i.test(makeLower)) return 'canon';
  if (/fuji|fujifilm/i.test(makeLower)) return 'fuji';
  if (/nikon/i.test(makeLower)) return 'nikon';
  if (/ricoh|pentax/i.test(makeLower)) return 'ricoh';
  if (/samsung/i.test(makeLower)) return 'samsung';
  if (/sony/i.test(makeLower)) return 'sony';

  return null;
};
