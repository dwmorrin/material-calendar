import React, { FunctionComponent } from "react";
import { makeStyles } from "@material-ui/core/styles";
import FormControl from "@material-ui/core/FormControl";
import Select from "@material-ui/core/Select";

const useStyles = makeStyles((theme) => ({
  formControl: {
    margin: theme.spacing(1),
    minWidth: 120
  }
}));

interface DropDownProps {
  selectName: string;
  selectId: string;
  contents: { id: string; title: string }[];
}

const DropDown: FunctionComponent<DropDownProps> = ({
  selectName,
  selectId,
  contents
}) => {
  const classes = useStyles();
  return (
    <FormControl className={classes.formControl}>
      <Select
        native
        inputProps={{
          name: selectName,
          id: selectId
        }}
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
      </Select>
    </FormControl>
  );
};
export default DropDown;
