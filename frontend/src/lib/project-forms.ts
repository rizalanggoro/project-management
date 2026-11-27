import { format } from "date-fns";
import { z } from "zod";

export interface NamedCodeRecord {
  code: string;
  name: string;
}

export interface StageKey {
  key: string;
}

export const masterDataFormSchema = z.object({
  code: z.string().trim().min(1, "Kode wajib diisi."),
  name: z.string().trim().min(1, "Nama wajib diisi."),
});

export type MasterDataFormValues = z.infer<typeof masterDataFormSchema>;

export function toMasterDataFormValues(
  item: NamedCodeRecord | null
): MasterDataFormValues {
  return { code: item?.code ?? "", name: item?.name ?? "" };
}

export function buildProgressPayload(
  stages: readonly StageKey[],
  selected: readonly StageKey[]
): Record<string, string> {
  return Object.fromEntries(
    stages.map((stage) => [
      stage.key,
      selected.some((item) => item.key === stage.key) ? "done" : "pending",
    ])
  );
}

export interface ProjectBodyInput {
  name: string;
  section: string;
  plant: string;
  budget: string;
  note: string;
  planDate?: Date | string;
  stages: StageKey[];
}

export function buildProjectBody(
  values: ProjectBodyInput,
  stages: readonly StageKey[]
) {
  const implementationPlan =
    values.planDate instanceof Date
      ? format(values.planDate, "yyyy-MM-dd")
      : values.planDate || undefined;

  return {
    name: values.name.trim(),
    section: values.section,
    plant: values.plant,
    implementation_plan: implementationPlan,
    budget: values.budget.replace(/\D/g, "") || "0",
    note: values.note.trim(),
    ...buildProgressPayload(stages, values.stages),
  };
}
