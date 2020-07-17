import React, { FC } from "react";
import {
  Button,
  ButtonBase,
  Dialog,
  List,
  ListItem,
  Typography,
  makeStyles,
} from "@material-ui/core";
import AddIcon from "@material-ui/icons/Add";
import { AdminUIProps, AdminAction } from "../../admin/types";
import { ResourceKey } from "../../resources/types";
import Semester from "../../resources/Semester";
import { getFormattedEventInterval } from "../../utils/date";

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

const byId = (id: number) => (semester: Semester): boolean =>
  semester.id === id;

const SemesterDialog: FC<AdminUIProps> = ({ dispatch, state }) => {
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
  const setSemester = (id: number) => (): void =>
    dispatch({
      type: AdminAction.SelectedSemester,
      payload: { selectedSemester: semesters.find(byId(id)) },
    });
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
        {semesters.map(({ id, title, start, end }) => (
          <ListItem key={`semester-${id}`} className={classes.semesterListItem}>
            <ButtonBase onClick={setSemester(id)}>
              <Typography variant="h6">{title}</Typography>
              <Typography variant="subtitle1" style={{ marginLeft: 20 }}>
                {getFormattedEventInterval(
                  start.split("T")[0],
                  end.split("T")[0]
                )}
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
