import React, { FunctionComponent } from "react";
import { makeStyles } from "@material-ui/core/styles";
import FormControl from "@material-ui/core/FormControl";
import { NativeSelect } from "@material-ui/core";
import { CalendarUIProps } from "./types";

const useStyles = makeStyles((theme) => ({
  formControl: {
    margin: theme.spacing(1),
    minWidth: 125,
  },
}));

interface SelectProps extends CalendarUIProps {
  selectName: string;
  selectId: string;
  contents: { id: number; title: string }[];
  onChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
  value: number | string;
}

const Select: FunctionComponent<SelectProps> = ({
  selectName,
  selectId,
  contents,
  onChange,
  value,
}) => {
  const classes = useStyles();
  return (
    <FormControl className={classes.formControl}>
      <NativeSelect
        inputProps={{
          name: selectName,
          id: selectId,
        }}
        onChange={onChange}
        value={value}
      >
        {contents.map((choice) => {
          return choice === contents[0] ? (
            <option value={choice.id} selected>
              {choice.title}
            </option>
          ) : (
            <option value={choice.id}>{choice.title}</option>
          );
        })}
      </NativeSelect>
    </FormControl>
  );
};
export default Select;
