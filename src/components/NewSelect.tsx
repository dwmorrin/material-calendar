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

interface NewSelectProps extends CalendarUIProps {
  selectName: string;
  selectId: string;
  contents: (Location | Project | UserGroup)[];
  selected: Location | Project | UserGroup;
  onChange: () => void;
}

const NewSelect: FunctionComponent<NewSelectProps> = ({
  // dispatch,
  // state,
  selectName,
  selectId,
  contents,
  onChange,
  selected,
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
export default NewSelect;
