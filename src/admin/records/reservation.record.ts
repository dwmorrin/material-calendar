import Reservation from "../../resources/Reservation";

const template = (res: unknown): string[][] =>
  res instanceof Reservation
    ? [
        ["Project", res.projectId.toString()],
        ["Group", res.groupId.toString()],
        ["Guests", res.guests],
        [
          "Cancellation",
          res.cancelation ? JSON.stringify(res.cancelation) : "No",
        ],
      ]
    : [["", JSON.stringify(res)]];

export default template;
