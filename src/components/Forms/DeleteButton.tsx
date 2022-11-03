import React, { FunctionComponent } from "react";
import { IconButton } from "@material-ui/core";
import DeleteIcon from "@material-ui/icons/Delete";

interface DeleteButtonProps {
  handleSubmit: (e?: React.FormEvent<HTMLFormElement> | undefined) => void;
  setFieldValue: (
    field: string,
    value: unknown,
    shouldValidate?: boolean | undefined
  ) => void;
  disabled: boolean;
}

/**
 * Secondary submit button, needs to call handleSubmit
 * psuedo-private field name "__delete__" is checked in handleSubmit.
 */
const DeleteButton: FunctionComponent<DeleteButtonProps> = ({
  handleSubmit,
  setFieldValue,
  disabled,
}) => (
  <IconButton
    aria-label="delete"
    style={{ marginRight: 30 }}
    onClick={(): void => {
      setFieldValue("__delete__", true);
      handleSubmit();
    }}
    disabled={disabled}
  >
    <DeleteIcon />
  </IconButton>
);

export default DeleteButton;
