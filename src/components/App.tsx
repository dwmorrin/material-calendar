import React, { FC } from "react";
import AuthProvider from "./AuthProvider";
import SocketProvider from "./SocketProvider";
import ErrorBoundary from "./ErrorBoundary";
import Landing from "./Landing";
import "typeface-roboto";

const App: FC = () => {
  return (
    <ErrorBoundary>
      <SocketProvider>
        <AuthProvider>
          <Landing />
        </AuthProvider>
      </SocketProvider>
    </ErrorBoundary>
  );
};

export default App;
