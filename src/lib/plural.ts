/** Выбирает форму слова для числа: 1 пункт, 2 пункта, 5 пунктов. */
export function pluralize(count: number, forms: [one: string, few: string, many: string]): string {
  const abs = Math.abs(count) % 100;
  const lastDigit = abs % 10;

  if (abs > 10 && abs < 20) {
    return forms[2];
  }
  if (lastDigit > 1 && lastDigit < 5) {
    return forms[1];
  }
  if (lastDigit === 1) {
    return forms[0];
  }
  return forms[2];
}
