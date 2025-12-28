'use client';

import { useState, useRef, useCallback, useEffect } from 'react';

interface AnimatedTextProps {
  maxWidth?: number;
  fontSize?: number;
  underlineHeight?: number;
  underlineColor?: string;
  textColor?: string;
}

export function AnimatedText({ maxWidth = 400, fontSize = 24, underlineHeight = 4, underlineColor = '#000000', textColor = '#000000' }: AnimatedTextProps) {
  const [text, setText] = useState('');
  const [lines, setLines] = useState<string[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  // 텍스트를 줄 단위로 분할하는 함수
  const splitTextIntoLines = useCallback(
    (inputText: string): string[] => {
      if (!inputText) return [];

      const result: string[] = [];
      let currentLine = '';
      let currentWidth = 0;

      for (const char of inputText) {
        // 각 글자의 대략적인 너비 계산 (한글은 더 넓음)
        const charWidth = /[가-힣]/.test(char) ? fontSize * 1.2 : fontSize * 0.6;

        if (currentWidth + charWidth > maxWidth && currentLine.length > 0) {
          result.push(currentLine);
          currentLine = char;
          currentWidth = charWidth;
        } else {
          currentLine += char;
          currentWidth += charWidth;
        }
      }

      if (currentLine) {
        result.push(currentLine);
      }

      return result;
    },
    [maxWidth, fontSize],
  );

  useEffect(() => {
    setLines(splitTextIntoLines(text));
  }, [text, splitTextIntoLines]);

  // 각 글자에 랜덤 rotate 값 생성 (-80 ~ 80도)
  const getRandomRotate = useCallback(
    (index: number): number => {
      if (!text || index >= text.length) return 0;
      // 같은 글자에 대해 일관된 rotate 값을 위해 시드 사용
      const seed = index + text.charCodeAt(index);
      return (seed % 161) - 80; // -80 ~ 80도
    },
    [text],
  );

  // 각 글자에 랜덤 scale 값 생성 (0.8 ~ 1.2)
  const getRandomScale = useCallback(
    (index: number): number => {
      if (!text || index >= text.length) return 1;
      const seed = index + text.charCodeAt(index);
      return 0.8 + (seed % 41) / 100; // 0.8 ~ 1.2
    },
    [text],
  );

  // 이미지로 내보내기
  const exportAsImage = useCallback(async () => {
    if (!previewRef.current) return;

    try {
      // html2canvas 동적 import
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(previewRef.current, {
        backgroundColor: null,
        scale: 2,
        logging: false,
        useCORS: true,
        allowTaint: true,
        windowWidth: previewRef.current.scrollWidth,
        windowHeight: previewRef.current.scrollHeight,
      });

      const link = document.createElement('a');
      link.download = `animated-text-${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (error) {
      console.error('이미지 내보내기 실패:', error);
      alert('이미지 내보내기에 실패했습니다. html2canvas 패키지가 필요합니다.');
    }
  }, []);

  return (
    <div className="flex flex-col gap-4 p-6">
      {/* 입력 영역 */}
      <div className="flex flex-col gap-2">
        <label htmlFor="text-input" className="text-sm font-medium text-gray-700">
          텍스트 입력
        </label>
        <input
          id="text-input"
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="텍스트를 입력하세요..."
          className="rounded-md border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none"
        />
      </div>

      {/* 미리보기 영역 */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-700">미리보기</label>
          <button
            onClick={exportAsImage}
            disabled={!text}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            이미지로 내보내기
          </button>
        </div>

        <div ref={containerRef} className="relative min-h-[200px] w-full overflow-hidden rounded-lg border border-gray-200 bg-white p-6">
          <div ref={previewRef} className="relative" style={{ minHeight: '150px', backgroundColor: 'transparent' }}>
            {/* 텍스트 렌더링 */}
            {lines.length > 0 && (
              <div className="relative mx-auto pb-2" style={{ paddingBottom: `${underlineHeight + 24}px`, width: '160px' }}>
                {lines.map((line, lineIndex) => (
                  <div
                    key={lineIndex}
                    className="flex flex-wrap justify-center"
                    style={{
                      marginBottom: lineIndex < lines.length - 1 ? '0.5rem' : '0',
                      gap: '4px',
                    }}
                  >
                    {line.split('').map((char, charIndex) => {
                      const globalIndex = lines.slice(0, lineIndex).join('').length + charIndex;
                      const rotate = getRandomRotate(globalIndex);
                      const scale = getRandomScale(globalIndex);

                      return (
                        <span
                          key={`${lineIndex}-${charIndex}`}
                          className="inline-block origin-center transition-transform duration-300"
                          style={{
                            transform: `rotate(${rotate}deg) scale(${scale})`,
                            fontSize: `${fontSize}px`,
                            color: textColor,
                            fontWeight: 'bold',
                          }}
                        >
                          {char}
                        </span>
                      );
                    })}
                  </div>
                ))}

                {/* 고정된 라운드 밑줄 - 웃는 입술처럼 아래로 볼록한 커브 형태 */}
                <div className="absolute left-1/2 -translate-x-1/2" style={{ bottom: '0', width: '160px', height: `${underlineHeight * 8}px` }}>
                  <svg width="160" height={underlineHeight * 8} viewBox="0 0 160 40" preserveAspectRatio="none" style={{ display: 'block' }}>
                    <path
                      d="M 0,5 Q 80,38 160,5"
                      stroke={underlineColor}
                      strokeWidth={underlineHeight * 2}
                      fill="none"
                      strokeLinecap="round"
                      vectorEffect="non-scaling-stroke"
                    />
                  </svg>
                </div>
              </div>
            )}

            {/* 텍스트가 없을 때 */}
            {lines.length === 0 && <div className="flex h-full items-center justify-center text-gray-400">텍스트를 입력하면 미리보기가 표시됩니다</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
