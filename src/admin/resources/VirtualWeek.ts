interface VirtualWeek {
  id: number;
  start: string;
  end: string;
  locationId: number;
  locationHours: number;
  projectHours: number;
}

class VirtualWeek implements VirtualWeek {
  static url = "/api/virtualweeks";
  static resourceId = "001";
  static hoursRemainingId = "ZZZ";
  constructor(
    vw = {
      id: -1,
      start: "",
      end: "",
      locationId: -1,
      locationHours: 0,
      projectHours: 0,
    }
  ) {
    Object.assign(this, vw);
  }
}

export default VirtualWeek;
