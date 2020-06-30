interface VirtualWeek {
  [k: string]: unknown;
  id: number;
  start: string;
  end: string;
  locationId: number;
  locationHours: number; //! -1 indicates hours calculation was omitted
  projectHours: number; //! -1 indicates hours calculation was omitted
}

class VirtualWeek implements VirtualWeek {
  static url = "/api/virtualweeks";
  static resourceId = "001";
  static hoursRemainingId = "ZZZ";
  constructor(
    virtualWeek = {
      id: -1,
      start: "",
      end: "",
      locationId: -1,
      locationHours: 0,
      projectHours: 0,
    }
  ) {
    Object.assign(this, virtualWeek);
  }
}

export default VirtualWeek;
