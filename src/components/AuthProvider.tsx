import React, {
  FunctionComponent,
  SetStateAction,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import useLocalStorage from "../utils/useLocalStorage";
import User from "../resources/User";
import { CircularProgress } from "@material-ui/core";
import Login from "./Login";
import LoggedOut from "./LoggedOut";
import ErrorPage from "./ErrorPage";

export enum AuthStatus {
  pending = "pending",
  authenticated = "authenticated",
  notAuthenticated = "notAuthenticated",
  loggedOut = "loggedOut",
  serverError = "serverError",
}

interface AuthContext {
  user: User;
  setUser: React.Dispatch<SetStateAction<User>>;
  status: AuthStatus;
  setStatus: React.Dispatch<SetStateAction<AuthStatus>>;
  lastLocation: string;
  setLastLocation: React.Dispatch<SetStateAction<string>>;
  isAdmin: boolean;
  isStaff: boolean;
  isPending: boolean;
  isAuthenticated: boolean;
  isNotAuthenticated: boolean;
  isLoggedOut: boolean;
  isBroken: boolean;
}

export const AuthContext = createContext<AuthContext | undefined>(undefined);

export const useAuth = (): AuthContext => {
  const state = useContext(AuthContext);
  if (!state) throw new Error("useAuth called outside AuthProvider");
  return {
    ...state,
    isAdmin: state.user?.roles.includes("admin"),
    isStaff: state.user?.roles.includes("staff"),
    isPending: state?.status === AuthStatus.pending,
    isAuthenticated: state?.status === AuthStatus.authenticated,
    isNotAuthenticated: state?.status === AuthStatus.notAuthenticated,
    isLoggedOut: state?.status === AuthStatus.loggedOut,
    isBroken: state?.status === AuthStatus.serverError,
  };
};

const AuthProvider: FunctionComponent = ({ children }) => {
  const [status, setStatus] = useState<AuthStatus>(AuthStatus.pending);
  const [user, setUser] = useState<User>(new User());
  const [lastLocation, setLastLocation] = useLocalStorage("lastLocation", "/");
  const value: AuthContext = {
    user,
    setUser,
    status,
    setStatus,
    lastLocation,
    setLastLocation,
    isAdmin: false,
    isStaff: false,
    isPending: status === AuthStatus.pending,
    isAuthenticated: status === AuthStatus.authenticated,
    isNotAuthenticated: status === AuthStatus.notAuthenticated,
    isLoggedOut: status === AuthStatus.loggedOut,
    isBroken: status === AuthStatus.serverError,
  };

  useEffect(() => {
    fetch("/login")
      .then((response) => {
        if (response.ok) return response.json();
        throw response.status;
      })
      .then(({ data, error }) => {
        if (error || !data) throw 500;
        const user = new User(data);
        if (user.id && user.username) {
          setUser(user);
          setStatus(AuthStatus.authenticated);
        } else throw 500;
      })
      .catch((err) => {
        if ([401, 403].includes(err)) setStatus(AuthStatus.notAuthenticated);
        else setStatus(AuthStatus.serverError);
      });
  }, []);

  return (
    <AuthContext.Provider value={value}>
      {value.isPending ? (
        <CircularProgress />
      ) : value.isNotAuthenticated ? (
        <Login />
      ) : value.isLoggedOut ? (
        <LoggedOut />
      ) : value.isAuthenticated ? (
        children
      ) : (
        <ErrorPage
          open
          error={new Error("No response from server (are you logged in?)")}
        />
      )}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
