import { db } from "$lib/db";

export function isValidReservation(date, time) {
  const now = new Date();
  const reservationDate = new Date(`${date}T${time}`);

  if (reservationDate < now) {
    return false;
  }

  const hours = reservationDate.getHours();
  if (hours < 17 || hours >= 22) {
    return false;
  }

  return true;
}

export function isTableAvailable(date, time) {
  const existingReservations = db
    .prepare(
      "SELECT COUNT(*) as count FROM reservations WHERE date = ? AND time = ?"
    )
    .get(date, time);
  return existingReservations.count < 5;
}
