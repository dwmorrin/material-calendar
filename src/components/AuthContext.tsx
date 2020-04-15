import React, {
  createContext,
  FunctionComponent,
  useState,
  SetStateAction,
} from "react";
import User from "../user";

interface AuthContext {
  user?: User;
  setUser?: React.Dispatch<SetStateAction<User>>;
}
const initialContext: AuthContext = {};
export const AuthContext = createContext(initialContext);
const nullUser: User = {};
const AuthProvider: FunctionComponent = ({ children }) => {
  const [user, setUser] = useState(nullUser);
  const value = { user, setUser };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;
