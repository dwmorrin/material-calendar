import parser, { tsv } from "../utils/csv";

const tsvString = "i0j0\ti0j1\ni1j0\ti1j1\n";

test("parser without arguments is tsv parser", () => {
  const defaultParser = parser();
  const parsed = defaultParser(tsvString);
  expect(parsed[1][1]).toBe("i1j1");
});

test("tsv string is parsed", () => {
  const parsed = tsv(tsvString);
  expect(parsed[1][1]).toBe("i1j1");
});
