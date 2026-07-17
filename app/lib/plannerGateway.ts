import { LocalPlannerRepository } from "./repositories/local";
import {
  saveRecord,
  type PlannerRecord,
  type PlannerRepository,
  type PlannerTable,
} from "./repositories/types";
import type { AppSettings, PlannerState } from "./types";

let activeRepository: PlannerRepository = new LocalPlannerRepository();

export const configurePlannerRepository = (repository: PlannerRepository): void => {
  activeRepository = repository;
};

export const readPlannerState = (): Promise<PlannerState> =>
  activeRepository.readState();
export const putRecord = (table: PlannerTable, record: PlannerRecord): Promise<void> =>
  saveRecord(activeRepository, table, record);
export const removeRecord = (table: PlannerTable, id: string): Promise<void> =>
  activeRepository.removeRecord(table, id);
export const saveSettings = (settings: AppSettings): Promise<void> =>
  activeRepository.saveSettings(settings);
export const replacePlannerState = (state: PlannerState): Promise<void> =>
  activeRepository.replaceState(state);
export const clearPlannerData = (): Promise<void> => activeRepository.clear();
