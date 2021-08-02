// "CamelCase" to "Camel Case", for displaying resource keys
const splitCamelCase = (s: string): string =>
  s[0] + s.slice(1).replaceAll(/([A-Z])/g, " $1");

export default splitCamelCase;
