import { AdminAction } from "../../../admin/types";
import Equipment from "../../../resources/Equipment";
import Category from "../../../resources/Category";
import { BulkImporter } from "./router";
import { ResourceKey } from "../../../resources/types";

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

const bulkImport: BulkImporter = (setSubmitting, dispatch, events) => {
  const dispatchError = (error: Error): void => {
    setSubmitting(false);
    dispatch({ type: AdminAction.Error, payload: { error } });
  };
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
      setSubmitting(false);
      const { equipment, categories } = data;
      dispatch({
        type: AdminAction.FileImportSuccess,
        payload: {
          resources: {
            [ResourceKey.Equipment]: (equipment as Equipment[]).map(
              (e) => new Equipment(e)
            ),
            [ResourceKey.Categories]: (categories as Category[]).map(
              (c) => new Category(c)
            ),
          },
        },
      });
    })
    .catch(dispatchError);
};

export default [headings, bulkImport] as [string[], BulkImporter];
