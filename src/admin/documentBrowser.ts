//! TODO the magic number doesn't work well.
// SHOULD dynamically check record height. Solution TBD.
const RECORD_HEIGHT = 250; // px
export const getRecordsPerPage = (): number =>
  Math.floor(window.innerHeight / RECORD_HEIGHT);
