export const DEFAULT_RECORD_HEIGHT = 250; // px

const WINDOW_CONTAINER_RATIO = 0.8; //! TODO get actual container size
export const getRecordsPerPage = (recordHeight: number): number =>
  Math.floor((WINDOW_CONTAINER_RATIO * window.innerHeight) / recordHeight);
