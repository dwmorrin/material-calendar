import React, { FC } from "react";
import AuthProvider from "./AuthProvider";
import ErrorBoundary from "./ErrorBoundary";
import Landing from "./Landing";
import "typeface-roboto";

const App: FC = () => {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Landing />
      </AuthProvider>
    </ErrorBoundary>
  );
};

export default App;
