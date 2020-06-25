import { prettyPrintFilename } from "../admin/backups";

test("prettyPrintFilename returns formatted string", () => {
  const filename = "db_backup_2020-06-25_13:50:07.sql";
  const prettyPrinted = "6/25/2020, 1:50:07 PM";
  expect(prettyPrintFilename(filename)).toBe(prettyPrinted);
});
