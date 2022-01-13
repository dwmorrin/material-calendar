const pluralCheck = (n: number): string => (n === 1 ? "" : "s");

const pluralize = (n: number, word: string): string =>
  `${n} ${word}${pluralCheck(n)}`;

export default pluralize;
