import React, { FC } from "react";
import { Grid, Box, Typography } from "@material-ui/core";

const LittleSquare: FC<{ color: string }> = ({ color }) => (
  <Grid item>
    <Box
      style={{
        margin: 3,
        width: 10,
        height: 10,
        backgroundColor: color,
      }}
    />
  </Grid>
);

const Row: FC = ({ children }) => (
  <Grid container direction="row" alignItems="center">
    {children}
  </Grid>
);

const Label: FC = ({ children }) => (
  <Grid item>
    <Typography variant="body2">{children}</Typography>
  </Grid>
);

const ProjectLocationHoursLegend: FC<{
  colors: { event: string; allotment: string; now: string };
}> = ({ colors }) => {
  return (
    <Grid container direction="column">
      <Row>
        <LittleSquare color={colors.event} />
        <Label>Your booked events</Label>
      </Row>
      <Row>
        <LittleSquare color={colors.allotment} />
        <Label>Scheduled time for this project</Label>
      </Row>
      <Row>
        <LittleSquare color={colors.now} />
        <Label>Now</Label>
      </Row>
    </Grid>
  );
};

export default ProjectLocationHoursLegend;
