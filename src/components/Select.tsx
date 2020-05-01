import React, { FunctionComponent, ChangeEvent } from "react";
import { makeStyles } from "@material-ui/core/styles";
import FormControl from "@material-ui/core/FormControl";
import { NativeSelect } from "@material-ui/core";
import { CalendarUIProps } from "../calendar/types";
import Location from "../calendar/Location";
import Project from "../calendar/Project";
import UserGroup from "../user/UserGroup";

const useStyles = makeStyles((theme) => ({
  formControl: {
    margin: theme.spacing(1),
    minWidth: 120,
  },
}));

interface SelectProps {
  selectName: string;
  selectId: string;
  contents: (Location | Project | UserGroup)[];
  selected: Location | Project | UserGroup;
  onChange: () => void;
  state: { curProject: Project };
  setState: { curProject: Project };
}

const Select: FunctionComponent<SelectProps> = ({
  setState,
  state,
  selectName,
  selectId,
  contents,
  onChange,
  selected,
}) => {
  const handleChange = (event: React.ChangeEvent<{ curProject?: unknown }>) => {
    const curProject = event.target.curProject as keyof typeof state;
    setState({
      ...state,
      [curProject]: event.target.curProject,
    });
  };

  const classes = useStyles();
  return (
    <FormControl className={classes.formControl}>
      <NativeSelect
        inputProps={{
          name: selectName,
          id: selectId,
        }}
        onChange={handleChange}
        value={selected}
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
