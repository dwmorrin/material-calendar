import React, { FunctionComponent, useState } from "react";
import { CalendarUIProps, CalendarAction } from "../calendar/types";
import {
  Button,
  Dialog,
  DialogContent,
  FormControl,
  FormControlLabel,
  FormLabel,
  IconButton,
  MenuItem,
  Radio,
  Toolbar,
  Typography,
} from "@material-ui/core";
import { RadioGroup, Select, TextField } from "formik-material-ui";
import CloseIcon from "@material-ui/icons/Close";
import UserGroup from "../resources/UserGroup";
import { Field, Form, Formik } from "formik";
import EquipmentForm from "./EquipmentForm";
import QuantityList from "./QuantityList";
import { ResourceKey } from "../resources/types";
import Project from "../resources/Project";
import {
  validationSchema,
  makeInitialValues,
  useStyles,
  submitHandler,
  transition,
} from "../calendar/reservationForm";

const ReservationForm: FunctionComponent<CalendarUIProps> = ({
  dispatch,
  state,
}) => {
  const [equipmentFormIsOpen, setEquipmentFormIsOpen] = useState(false);
  const groups = state.resources[ResourceKey.Groups] as UserGroup[];
  const projects = state.resources[ResourceKey.Projects] as Project[];
  const classes = useStyles();

  return (
    <Dialog
      fullScreen
      open={state.reservationFormIsOpen}
      TransitionComponent={transition}
    >
      <Toolbar>
        <IconButton
          edge="start"
          color="inherit"
          aria-label="close"
          onClick={(): void =>
            dispatch({ type: CalendarAction.CloseReservationForm })
          }
        >
          <CloseIcon />
        </IconButton>
        <Typography variant="h6">Make Reservation</Typography>
      </Toolbar>

      <DialogContent>
        <Formik
          initialValues={makeInitialValues(state)}
          onSubmit={submitHandler}
          validationSchema={validationSchema}
        >
          {({
            values,
            touched,
            errors,
            isSubmitting,
            setFieldValue,
            handleSubmit,
          }): unknown => (
            <Form onSubmit={handleSubmit}>
              <div className={classes.list}>
                <div className={classes.paddingLeftSixteen}>Project:</div>
                <div className={classes.paddingLeftFive}>
                  <Field component={Select} name="project">
                    {projects.map((p) => (
                      <MenuItem key={p.id} value={p.id}>
                        {p.title}
                      </MenuItem>
                    ))}
                  </Field>
                </div>
              </div>
              <div className={classes.list}>
                {"Group: "}
                <div className={classes.paddingLeftTen}>
                  {(
                    groups.find(
                      (group) => group.projectId === values.project
                    ) || new UserGroup()
                  ).members.map(({ username, name }) => (
                    <span key={username}>
                      {`${name.first} ${name.last}`}
                      <br />
                    </span>
                  ))}
                </div>
              </div>
              <br />
              <Field
                component={TextField}
                label="Brief Description of what you will be doing"
                name="description"
                helperText={
                  errors.description &&
                  touched.description &&
                  errors.description
                }
                fullWidth
                variant="filled"
              />
              <br />
              <br />
              <FormLabel component="legend">
                Do you need to use the Live Room?
              </FormLabel>
              <Field component={RadioGroup} name="liveRoom">
                <FormControlLabel value="yes" control={<Radio />} label="Yes" />
                <FormControlLabel value="no" control={<Radio />} label="No" />
              </Field>
              <br />
              <Field
                component={TextField}
                label="Phone Number"
                name="phone"
                helperText={errors.phone && touched.phone && errors.phone}
                fullWidth
                variant="filled"
              />
              <br />
              <br />
              <FormControl component="fieldset">
                <FormLabel component="legend">Do you have guests?</FormLabel>
                <Field
                  component={RadioGroup}
                  aria-label="guestsToggle"
                  name="hasGuests"
                >
                  <FormControlLabel
                    value="yes"
                    control={<Radio />}
                    label="Yes"
                  />
                  <FormControlLabel value="no" control={<Radio />} label="No" />
                </Field>
              </FormControl>
              <br />
              {values.hasGuests === "yes" && (
                <Field
                  component={TextField}
                  label="Guest Names"
                  name="guests"
                  helperText={errors.guests && touched.guests && errors.guests}
                  fullWidth
                  variant="filled"
                />
              )}
              <br />
              <FormControl component="fieldset">
                <FormLabel component="legend">
                  Do you have any notes about your reservation for the Tech
                  Staff?
                </FormLabel>
                <Field component={RadioGroup} name="hasNotes">
                  <FormControlLabel
                    value="yes"
                    control={<Radio />}
                    label="Yes"
                  />
                  <FormControlLabel value="no" control={<Radio />} label="No" />
                </Field>
              </FormControl>
              {values.hasNotes === "yes" && (
                <Field
                  component={TextField}
                  id="notes"
                  label="Notes"
                  fullWidth
                  multiline
                  rows={8}
                  variant="filled"
                />
              )}
              <br />
              <FormControl component="fieldset">
                <FormLabel component="legend">
                  Would you like to reserve any equipment now?
                </FormLabel>
                <Field
                  component={RadioGroup}
                  aria-label="equipment"
                  name="hasEquipment"
                >
                  <FormControlLabel
                    value="yes"
                    control={<Radio />}
                    label="Yes"
                  />
                  <FormControlLabel value="no" control={<Radio />} label="No" />
                </Field>
              </FormControl>
              {values.hasEquipment === "yes" && (
                <div>
                  <br />
                  <QuantityList
                    selectedEquipment={
                      values.equipment as { [k: string]: number }
                    }
                  />
                  <Button
                    size="small"
                    variant="contained"
                    disableElevation
                    style={{ backgroundColor: "Yellow", color: "black" }}
                    disabled={isSubmitting}
                    onClick={(): void => setEquipmentFormIsOpen(true)}
                  >
                    Add Equipment
                  </Button>
                </div>
              )}
              <br />
              <br />
              <Button
                type="submit"
                size="small"
                variant="contained"
                disableElevation
                style={{ backgroundColor: "Green", color: "white" }}
                disabled={isSubmitting}
              >
                Confirm Reservation
              </Button>
              <EquipmentForm
                open={equipmentFormIsOpen}
                setOpen={setEquipmentFormIsOpen}
                selectedEquipment={values.equipment as { [k: string]: number }}
                setFieldValue={setFieldValue}
              />
              <pre>{JSON.stringify(values, null, 2)}</pre>
            </Form>
          )}
        </Formik>
      </DialogContent>
    </Dialog>
  );
};

export default ReservationForm;
