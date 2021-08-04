import { formatSQLDate } from "../utils/date";

interface VirtualWeek {
  [k: string]: unknown;
  id: number;
  start: string;
  end: string;
  locationId: number;
  semesterId: number;
  projectHours: number; //! -1 indicates hours calculation was omitted
}

class VirtualWeek implements VirtualWeek {
  static url = "/api/virtualweeks";
  static resourceId = "001";
  static hoursRemainingId = "ZZZ";
  static eventPrefix = "vw-";
  constructor(
    virtualWeek = {
      id: -1,
      semesterId: -1,
      start: formatSQLDate(),
      end: formatSQLDate(),
      locationId: -1,
      projectHours: 0,
    }
  ) {
    Object.assign(this, virtualWeek);
  }
}

export default VirtualWeek;
