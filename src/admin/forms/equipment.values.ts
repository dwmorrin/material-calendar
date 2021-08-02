import Equipment from "../../resources/Equipment";
import Category from "../../resources/Category";
import Tag from "../../resources/Tag";
import { AdminState } from "../types";

interface EquipmentValues extends Record<string, unknown> {
  id: number;
  manufacturer: string;
  model: string;
  serial: string;
  description: string;
  sku: string;
  restriction: string;
  quantity: string;
  categoryId: string;
  tags: string[];
  consumable: boolean;
  notes: string;
}

export const values = (state: AdminState): Record<string, unknown> => {
  const equip = state.resourceInstance as Equipment;
  return {
    id: equip.id,
    manufacturer: equip.manufacturer,
    model: equip.model,
    serial: equip.serial,
    description: equip.description,
    sku: equip.sku,
    restriction: String(equip.restriction),
    quantity: String(equip.quantity),
    categoryId: String(equip.category.id),
    tags: equip.tags.map(({ title }) => title),
    consumable: equip.consumable,
    notes: equip.notes,
  } as EquipmentValues;
};

export const update = (state: AdminState, values: unknown): Equipment => {
  const {
    id,
    manufacturer,
    model,
    serial,
    description,
    sku,
    restriction,
    quantity,
    categoryId,
    tags,
    consumable,
    notes,
  } = values as EquipmentValues;
  const e = state.resourceInstance as Equipment;
  return {
    id,
    manufacturer,
    model,
    serial,
    description,
    sku,
    quantity: Number(quantity),
    category: {
      id: Number(categoryId),
    } as Category,
    consumable,
    tags: tags.map((title) => ({ title })) as Tag[],
    reservations: e.reservations,
    restriction: Number(restriction),
    notes,
  };
};
