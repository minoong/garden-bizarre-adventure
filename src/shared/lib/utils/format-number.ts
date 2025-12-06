export function formatCount(count: number): string {
  const compactFormatter = new Intl.NumberFormat('ko-KR', {
    notation: 'compact',
    compactDisplay: 'short',
  });

  return compactFormatter.format(count);
}

export function formatCountWithComma(count: number): string {
  if (count === 0) {
    return '';
  }

  const formatted = formatCount(count);
  const match = formatted.match(/^([\d.]+)(.*)$/);

  if (!match) {
    return formatted;
  }

  const [, numberPart, unit] = match;

  if (numberPart.includes('.')) {
    return formatted;
  }

  const numberWithComma = new Intl.NumberFormat('ko-KR').format(Number(numberPart));

  return numberWithComma + unit;
}
