import React, { FC, createContext, useContext, useReducer } from "react";
import { io } from "socket.io-client";

// kinds avoid using literal strings directly
export enum SocketMessageKind {
  EventsChanged = "EVENT",
  EventLock = "EVENT_LOCK",
  EventUnlock = "EVENT_UNLOCK",
  Refresh = "REFRESH", // catch-all, warns "app is broken until you refresh"
  ReservationChanged = "RESERVATION",
  Test = "TEST",
}

export type ReservationChangePayload = {
  eventIds: number[];
  groupId: number;
  projectId: number;
  reservationId: number;
};

const socket = io();

// SocketProvider replaces these with functions to update state
let onBroadcast = (_: unknown[]): void => undefined;
let onError = (_: Error): void => undefined;
let onConnect = (): void => undefined;

const broadcast = (message: string, data?: unknown): void => {
  socket.emit("broadcast", message, data);
};

const getClientCount = (): void => {
  socket.emit("get-client-count");
};

socket.on("broadcast", (...args) => {
  onBroadcast(args);
});

socket.on("client-count", (count: number) => {
  console.log(`${count} client(s) connected`);
});

// connect clears the error state
socket.on("connect", () => onConnect());
socket.on("connect_error", (error) => onError(error));
socket.io.on("error", (error) => onError(error));

const listen = (
  setSocketState: (state: Partial<SocketState>) => void
): void => {
  onConnect = (): void => {
    setSocketState({ error: undefined });
  };

  onError = (error: Error): void => {
    console.error("socket error", error);
    setSocketState({ error });
  };

  onBroadcast = (arg: unknown[]): void => {
    const [kind, ...data] = arg;
    if (typeof kind === "string") {
      switch (kind) {
        case SocketMessageKind.EventsChanged: {
          const eventsChangedIds = data[0];
          if (Array.isArray(eventsChangedIds))
            setSocketState({ eventsChanged: true, eventsChangedIds });
          else return console.error("events changed message without IDs");
          break;
        }
        case SocketMessageKind.EventLock: {
          const [eventLockId] = data;
          if (typeof eventLockId !== "number") {
            return console.error("invalid event lock message", arg);
          }
          setSocketState({ eventLocked: true, eventLockId });
          break;
        }
        case SocketMessageKind.EventUnlock: {
          const [eventLockId] = data;
          if (typeof eventLockId !== "number") {
            return console.error("invalid event unlock message", arg);
          }
          setSocketState({ eventUnlocked: true, eventLockId });
          break;
        }
        case SocketMessageKind.Refresh:
          setSocketState({ refreshRequested: true });
          break;
        case SocketMessageKind.ReservationChanged: {
          const { eventIds, groupId, projectId, reservationId } =
            data[0] as ReservationChangePayload;
          if (!Array.isArray(eventIds) || !groupId || !projectId) {
            return console.error("invalid reservation change message", arg);
          }
          setSocketState({
            reservationChanged: true,
            reservationChangePayload: {
              eventIds,
              groupId,
              projectId,
              reservationId,
            },
          });
          break;
        }
        case SocketMessageKind.Test:
          console.log("Socket test message received");
          break;
      }
    }
  };
};

export interface SocketState {
  error?: Error;
  eventsChanged: boolean;
  eventsChangedIds: number[];
  eventLocked: boolean;
  eventUnlocked: boolean;
  eventLockId: number;
  refreshRequested: boolean;
  reservationChanged: boolean;
  reservationChangePayload: ReservationChangePayload;
}

const defaultState: SocketState = {
  eventsChanged: false,
  eventsChangedIds: [],
  eventLocked: false,
  eventUnlocked: false,
  eventLockId: 0,
  refreshRequested: false,
  reservationChanged: false,
  reservationChangePayload: {
    eventIds: [],
    groupId: 0,
    projectId: 0,
    reservationId: 0,
  },
};

const reducer = (
  prevState: SocketState,
  nextState: Partial<SocketState>
): SocketState => {
  return { ...prevState, ...nextState };
};

interface SocketContext extends SocketState {
  broadcast: typeof broadcast;
  getClientCount: typeof getClientCount;
  setSocketState: (state: Partial<SocketState>) => void;
}

export const SocketContext = createContext<SocketContext>({
  broadcast,
  getClientCount,
  setSocketState: (): void => undefined,
  ...defaultState,
});

export const useSocket = (): SocketContext => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
};

const SocketProvider: FC = ({ children }) => {
  const [socketState, setSocketState] = useReducer(reducer, defaultState);
  listen(setSocketState);
  return (
    <SocketContext.Provider
      value={{ broadcast, getClientCount, ...socketState, setSocketState }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export default SocketProvider;
