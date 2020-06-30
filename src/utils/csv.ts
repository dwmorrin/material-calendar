const parser = ({ recordDelimiter = "\n", fieldDelimiter = "\t" } = {}) => (
  string: string
): string[][] =>
  string.split(recordDelimiter).map((line) => line.split(fieldDelimiter));

export const tsv = parser();

export default parser;
