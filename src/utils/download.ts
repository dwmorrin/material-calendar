/**
 * download a generated file, e.g. something fetched from an API.
 *
 * An temporary <a> is generated and artificially clicked to cause
 * the blob to download.
 *
 * @param blob data
 * @param filename name of file
 */
export const download = (blob: Blob, filename = "download"): void => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url); // url is not garbage collected otherwise
};
