import React, {
  createContext,
  FunctionComponent,
  useState,
  SetStateAction,
} from "react";
import User from "../resources/User";

interface AuthContext {
  user: User;
  setUser: React.Dispatch<SetStateAction<User>>;
  loggedOut: boolean;
  setLoggedOut: React.Dispatch<SetStateAction<boolean>>;
}

const initialContext: AuthContext = {
  user: new User(),
  setUser: () => undefined,
  loggedOut: false,
  setLoggedOut: () => undefined,
};

export const AuthContext = createContext(initialContext);

const AuthProvider: FunctionComponent = ({ children }) => {
  const [user, setUser] = useState(new User());
  const [loggedOut, setLoggedOut] = useState(false);
  const value = { user, setUser, loggedOut, setLoggedOut };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;
