import React, { FC, createContext, useContext, useReducer } from "react";
import { io } from "socket.io-client";

// kinds avoid using literal strings directly
export enum SocketMessageKind {
  EventsChanged = "EVENT",
  EventLock = "EVENT_LOCK",
  EventUnlock = "EVENT_UNLOCK",
  Refresh = "REFRESH", // catch-all, warns "app is broken until you refresh"
  Test = "TEST",
}

const socket = io();

// SocketProvider replaces this with a function to update state
let onBroadcast = (_: unknown[]): void => undefined;

const broadcast = (message: string, data?: unknown): void => {
  socket.emit("broadcast", message, data);
};

socket.on("broadcast", (...args) => {
  onBroadcast(args);
});

const listen = (
  setSocketState: (state: Partial<SocketState>) => void
): void => {
  onBroadcast = (arg: unknown[]): void => {
    const [kind, ...data] = arg;
    if (typeof kind === "string") {
      switch (kind) {
        case SocketMessageKind.EventsChanged:
          setSocketState({ eventsChanged: true });
          break;
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
        case SocketMessageKind.Test:
          console.log("Socket test message received");
          break;
      }
    }
  };
};

interface SocketState {
  eventsChanged: boolean;
  eventLocked: boolean;
  eventUnlocked: boolean;
  eventLockId: number;
  refreshRequested: boolean;
}

const defaultState: SocketState = {
  eventsChanged: false,
  eventLocked: false,
  eventUnlocked: false,
  eventLockId: 0,
  refreshRequested: false,
};

const reducer = (
  prevState: SocketState,
  nextState: Partial<SocketState>
): SocketState => {
  return { ...prevState, ...nextState };
};

interface SocketContext extends SocketState {
  broadcast: typeof broadcast;
  setSocketState: (state: Partial<SocketState>) => void;
}

export const SocketContext = createContext<SocketContext>({
  broadcast,
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
      value={{ broadcast, ...socketState, setSocketState }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export default SocketProvider;
