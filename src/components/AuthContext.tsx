import React, { createContext, FunctionComponent } from "react";
import User from "../user";

const user: User = {};
export const AuthContext = createContext(user);
const AuthProvider: FunctionComponent = ({ children }) => {
  return <AuthContext.Provider value={user}>{children}</AuthContext.Provider>;
};

export default AuthProvider;
