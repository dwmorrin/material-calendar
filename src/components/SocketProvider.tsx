import React, { FC, createContext, useContext, useReducer } from "react";
import { io } from "socket.io-client";

const socket = io();

// SocketProvider replaces this with a function to update state
let onBroadcast = (): void => undefined;

const broadcast = (message: string): void => {
  socket.emit("broadcast", message);
};

socket.on("broadcast", () => {
  onBroadcast();
});

const listen = (setRefreshRequested: (requested: boolean) => void): void => {
  onBroadcast = (): void => {
    setRefreshRequested(true);
  };
};

const reducer = (_: boolean, nextState: boolean): boolean => nextState;

interface SocketContext {
  refreshRequested: boolean;
  broadcast: typeof broadcast;
}
export const SocketContext = createContext<SocketContext>({
  broadcast,
  refreshRequested: false,
});

export const useSocket = (): SocketContext => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
};

const SocketProvider: FC = ({ children }) => {
  const [refreshRequested, setRefreshRequested] = useReducer(reducer, false);
  listen(setRefreshRequested);
  return (
    <SocketContext.Provider value={{ broadcast, refreshRequested }}>
      {children}
    </SocketContext.Provider>
  );
};

export default SocketProvider;
