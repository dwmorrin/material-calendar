import React, { FC } from "react";
import { FormLabel, makeStyles } from "@material-ui/core";

const useStyles = makeStyles({
  error: { color: "red" },
});

const ErrorFormLabel: FC = ({ children }) => (
  <FormLabel className={useStyles().error}>{children}</FormLabel>
);

export default ErrorFormLabel;
