import { AdminAction } from "../types";
import Equipment from "../../resources/Equipment";
import { BulkImporter } from "./router";
import { ResourceKey } from "../../resources/types";

const headings = [
  "Category",
  "Manufacturer",
  "Model",
  "Description",
  "SKU",
  "Serial",
  "Barcode",
  "Quantity",
  "Notes",
  "Restriction",
];

const bulkImport: BulkImporter = (dispatch, events) => {
  const dispatchError = (error: Error): void =>
    dispatch({ type: AdminAction.Error, payload: { error } });
  if (!Array.isArray(events))
    return dispatchError(
      new Error(
        "Event import failed: could not parse file (records not an array)"
      )
    );
  fetch(`${Equipment.url}/bulk`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(
      events.map(
        ({
          Category,
          Manufacturer,
          Model,
          Description,
          SKU,
          Serial,
          Barcode,
          Quantity,
          Notes,
          Restriction,
        }) => ({
          category: Category,
          manufacturer: Manufacturer,
          model: Model,
          description: Description,
          sku: SKU,
          serial: Serial,
          barcode: Barcode,
          quantity: Quantity,
          notes: Notes,
          restriction: Restriction,
        })
      )
    ),
  })
    .then((response) => response.json())
    .then(({ data, error }) => {
      if (error) return dispatchError(error);
      dispatch({
        type: AdminAction.FileImportSuccess,
        payload: {
          resources: {
            [ResourceKey.Equipment]: (data as Equipment[]).map(
              (e) => new Equipment(e)
            ),
          },
        },
      });
    })
    .catch(dispatchError);
};

export default [headings, bulkImport] as [string[], BulkImporter];
