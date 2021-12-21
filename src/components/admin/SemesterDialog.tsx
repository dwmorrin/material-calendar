import React, { FC } from "react";
import {
  Badge,
  Button,
  ButtonBase,
  Dialog,
  List,
  ListItem,
  Typography,
  makeStyles,
} from "@material-ui/core";
import AddIcon from "@material-ui/icons/Add";
import {
  AdminUIProps,
  AdminAction,
  AdminSelectionProps,
} from "../../admin/types";
import { ResourceKey } from "../../resources/types";
import Semester from "../../resources/Semester";
import { parseAndFormatSQLDateInterval } from "../../utils/date";

const useStyles = makeStyles({
  semesterListItem: {
    display: "flex",
    justifyContent: "space-between",
  },
});

const descendingByStart = (
  { start: a }: Semester,
  { start: b }: Semester
): number => new Date(b).valueOf() - new Date(a).valueOf();

const byId =
  (id: number) =>
  (semester: Semester): boolean =>
    semester.id === id;

const SemesterDialog: FC<AdminUIProps & AdminSelectionProps> = ({
  dispatch,
  state,
  selections,
  setSelections,
}) => {
  const classes = useStyles();
  const { resources, semesterDialogIsOpen } = state;
  const semesters = (resources[ResourceKey.Semesters] as Semester[]).slice();
  semesters.sort(descendingByStart);
  const close = (): void => dispatch({ type: AdminAction.CloseSemesterDialog });
  const editSemester = (id?: number) => (): void =>
    dispatch({
      type: AdminAction.SelectedDocument,
      payload: {
        resourceKey: ResourceKey.Semesters,
        resourceInstance: id ? semesters.find(byId(id)) : new Semester(),
        semesterDialogIsOpen: false,
      },
    });
  const setSemester = (id: number) => (): void => {
    setSelections({ ...selections, semesterId: id });
    dispatch({
      type: AdminAction.SelectedSemester,
      payload: { selectedSemester: semesters.find(byId(id)) },
    });
  };
  return (
    <Dialog open={semesterDialogIsOpen}>
      <Button onClick={close}>Close</Button>
      <Button
        variant="contained"
        startIcon={<AddIcon />}
        onClick={editSemester()}
      >
        Create new semester
      </Button>
      <List>
        {semesters.map(({ id, title, start, end, active }) => (
          <ListItem key={`semester-${id}`} className={classes.semesterListItem}>
            <ButtonBase onClick={setSemester(id)}>
              <Badge
                anchorOrigin={{ vertical: "top", horizontal: "left" }}
                color="secondary"
                invisible={!active}
                variant="dot"
              >
                <Typography variant="h6">{title}</Typography>
              </Badge>
              <Typography variant="subtitle1" style={{ marginLeft: 20 }}>
                {parseAndFormatSQLDateInterval({ start, end })}
              </Typography>
            </ButtonBase>
            <Button onClick={editSemester(id)}>Edit</Button>
          </ListItem>
        ))}
      </List>
    </Dialog>
  );
};

export default SemesterDialog;
