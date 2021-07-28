import React, {
  FunctionComponent,
  SetStateAction,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import User from "../resources/User";
import { CircularProgress } from "@material-ui/core";
import Login from "./Login";
import LoggedOut from "./LoggedOut";

export enum AuthStatus {
  pending = "pending",
  resolved = "resolved",
  rejected = "rejected",
  loggedOut = "loggedOut",
}

interface AuthContext {
  user: User;
  setUser: React.Dispatch<SetStateAction<User>>;
  status: AuthStatus;
  setStatus: React.Dispatch<SetStateAction<AuthStatus>>;
  isPending: boolean;
  isResolved: boolean;
  isRejected: boolean;
  isLoggedOut: boolean;
}

export const AuthContext = createContext<AuthContext | undefined>(undefined);

export const useAuth = (): AuthContext => {
  const state = useContext(AuthContext);
  if (!state) throw new Error("useAuth called outside AuthProvider");
  return {
    ...state,
    isPending: state?.status === AuthStatus.pending,
    isResolved: state?.status === AuthStatus.resolved,
    isRejected: state?.status === AuthStatus.rejected,
    isLoggedOut: state?.status === AuthStatus.loggedOut,
  };
};

const AuthProvider: FunctionComponent = ({ children }) => {
  const [status, setStatus] = useState<AuthStatus>(AuthStatus.pending);
  const [user, setUser] = useState<User>(new User());
  const value = {
    user,
    setUser,
    status,
    setStatus,
    isPending: status === AuthStatus.pending,
    isResolved: status === AuthStatus.resolved,
    isRejected: status === AuthStatus.rejected,
    isLoggedOut: status === AuthStatus.loggedOut,
  };

  useEffect(() => {
    fetch("/login")
      .then((response) => response.json())
      .then(({ data, error }) => {
        if (error || !data) {
          return setStatus(AuthStatus.rejected);
        }
        const user = new User(data);
        if (user.id && user.username) {
          setUser(user);
          setStatus(AuthStatus.resolved);
        }
      });
  }, []);

  return (
    <AuthContext.Provider value={value}>
      {value.isPending ? (
        <CircularProgress />
      ) : value.isRejected ? (
        <Login />
      ) : value.isLoggedOut ? (
        <LoggedOut />
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
