export enum TicketType {
  SingleDay = "single_day",
  MultiDay = "multi_day"
}

export interface User {
  user_id: string;
  email: string;
  name: string;
  role: string;
}

export interface EventDateTime {
  _id: string;
  EventStartDateTime: string;
  EventEndDateTime: string;
  Event_id: string;
  status: number;
}

export interface TicketData {
  _id: string;
  Name: string;
  Description: string | null;
  Price: number;
  EventStartDateTime: string;
  EventEndDateTime: string;
  MaxQuantityAllowedPerOrder: number;
  AvailableQuantity: number;
  BookingMaxLimit?: number;
}
