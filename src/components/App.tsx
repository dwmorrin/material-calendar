import React, { FC } from "react";
import AuthProvider from "./AuthProvider";
import Landing from "./Landing";
import "typeface-roboto";

const App: FC = () => {
  return (
    <AuthProvider>
      <Landing />
    </AuthProvider>
  );
};

export default App;
