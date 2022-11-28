import Reservation from "../../resources/Reservation";
import { ReservationSubmitValues } from "./types";

// reservation is optional when method == "DELETE"
// ID is always required
interface ForwardProps {
  reservation?: ReservationSubmitValues;
  reservationId: number;
  method: string;
  onError: (error: Error) => void;
}

const forward = ({
  reservationId,
  reservation,
  method,
  onError,
}: ForwardProps): void => {
  // require reservation if method != "DELETE"
  if (method !== "DELETE" && !reservation)
    return onError(new Error("Forward without reservation info"));
  if (
    typeof reservationId !== "number" ||
    Number.isNaN(reservationId) ||
    reservationId < 1
  )
    return onError(new Error("Forward without reservation id"));
  // send reservation info to an external service
  fetch(Reservation.forwardUrl, {
    method: method === "DELETE" ? "DELETE" : "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      method,
      reservation: { ...reservation, id: reservationId },
    }),
  })
    .then((res) => {
      if (res.ok) return res.json();
    })
    // ignoring an empty result by assigning an empty object if undefined
    .then(({ error } = {}) => {
      if (error)
        throw new Error(
          process.env.REACT_APP_FORWARD_URL_ERROR_MSG ||
            "Error forwarding reservation to external service"
        );
    })
    .catch(onError);
};

export default forward;
