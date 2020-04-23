import React, {
  createContext,
  FunctionComponent,
  useState,
  SetStateAction,
} from "react";
import User from "../user/User";

interface AuthContext {
  user?: User;
  setUser?: React.Dispatch<SetStateAction<User>>;
}
const initialContext: AuthContext = {};
export const AuthContext = createContext(initialContext);
const AuthProvider: FunctionComponent = ({ children }) => {
  const [user, setUser] = useState(
    new User({
      id: "",
      firstName: "",
      lastName: "",
      role: -1,
      groupIds: [],
      projectIds: [],
    })
  );
  const value = { user, setUser };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;
