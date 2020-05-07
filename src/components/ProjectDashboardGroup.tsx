import React, { FunctionComponent, useEffect, useContext } from "react";
import { CalendarUIProps, CalendarAction } from "../calendar/types";
import {
  CircularProgress,
  Typography,
  Avatar,
  Button,
  LinearProgress,
} from "@material-ui/core";
import { AuthContext } from "./AuthContext";

const ProjectDashboardGroup: FunctionComponent<CalendarUIProps> = ({
  dispatch,
  state,
}) => {
  const { user } = useContext(AuthContext);
  const currentGroup = state.groups?.find((group) =>
    user?.groupIds.includes(group.id)
  );
  useEffect(() => {
    if (currentGroup) {
      dispatch({
        type: CalendarAction.SelectedGroup,
        payload: { currentGroup },
      });
    }
  }, [currentGroup, dispatch]);

  if (
    !state.groups ||
    !currentGroup ||
    !Array.isArray(currentGroup.memberNames)
  ) {
    return <CircularProgress />;
  }

  const memberNames = currentGroup.memberNames.map((name) => {
    const [first, last] = name.split(" ");
    return { first, last };
  });
  return (
    <section>
      <Typography variant="body2">Group Hours</Typography>
      <LinearProgress // TODO remove hardcoded mock
        style={{ height: 10 }}
        variant="determinate"
        value={20}
      />
      <Typography variant="body2">Members</Typography>
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
        }}
      >
        {memberNames.map(({ first, last }, index) => (
          <Avatar
            key={`avatar_${index}`}
            style={{ backgroundColor: "purple", marginLeft: 10 }} // TODO no inline
          >
            {`${first[0]}${last[0]}`}
          </Avatar>
        ))}
      </div>
      {/* <Typography>{group?.title}</Typography> */}
      <Button
        size="small"
        variant="contained"
        color="inherit"
        onClick={(): void =>
          dispatch({ type: CalendarAction.OpenGroupDashboard })
        }
      >
        Manage group
      </Button>
    </section>
  );
};

export default ProjectDashboardGroup;
