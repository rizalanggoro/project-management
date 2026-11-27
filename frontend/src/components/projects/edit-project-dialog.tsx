import {
  listProjectPlantsOptions,
  listProjectSectionsOptions,
  updateProjectMutation,
} from "@/api/@tanstack/react-query.gen";
import type { Project } from "@/api/types.gen";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxItem,
  ComboboxList,
  ComboboxValue,
  useComboboxAnchor,
} from "@/components/ui/combobox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toSelectItems } from "@/lib/master-data";
import { buildProjectBody } from "@/lib/project-forms";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { PROGRESS_STAGES, type StageOption } from "./constants";

export interface EditProjectDialogProps {
  project: Project | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

function EditProjectForm({
  project,
  onClose,
  onSuccess,
}: {
  project: Project;
  onClose: () => void;
  onSuccess?: () => void;
}) {
  const queryClient = useQueryClient();
  const anchor = useComboboxAnchor();

  const { data: sections = [] } = useQuery({
    ...listProjectSectionsOptions(),
  });
  const { data: plants = [] } = useQuery({
    ...listProjectPlantsOptions(),
  });
  const sectionItems = toSelectItems(sections);
  const plantItems = toSelectItems(plants);

  const [name, setName] = useState(project.name || "");
  const [section, setSection] = useState(project.section || "");
  const [plant, setPlant] = useState(project.plant || "");
  const [planDate, setPlanDate] = useState(project.implementation_plan || "");
  const [budget, setBudget] = useState(project.budget || "");
  const [note, setNote] = useState(project.note || "");
  const [stages, setStages] = useState<StageOption[]>(() =>
    PROGRESS_STAGES.filter((s) => (project as any)[s.key] === "done")
  );
  const [formError, setFormError] = useState("");

  const updateMut = useMutation(updateProjectMutation());

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    if (!name.trim()) {
      setFormError("Nama proyek wajib diisi.");
      return;
    }
    if (!section) {
      setFormError("Pilih bagian proyek.");
      return;
    }
    if (!plant) {
      setFormError("Pilih plant proyek.");
      return;
    }

    try {
      await updateMut.mutateAsync({
        path: { id: project.id },
        body: buildProjectBody(
          { name, section, plant, planDate, budget, note, stages },
          PROGRESS_STAGES
        ),
      });

      await queryClient.invalidateQueries();
      onClose();
      onSuccess?.();
    } catch (err: any) {
      setFormError(err?.message || "Gagal mengubah proyek.");
    }
  };

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Ubah Proyek</DialogTitle>
        <DialogDescription>
          Ubah data proyek dan perbarui tahapan progres.
        </DialogDescription>
      </DialogHeader>

      {formError && (
        <Alert variant="destructive">
          <AlertDescription>{formError}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="edit-proj-name">Nama Proyek</FieldLabel>
            <Input
              id="edit-proj-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nama Proyek..."
              required
            />
          </Field>

          <Field>
            <FieldLabel htmlFor="edit-proj-section">Bagian</FieldLabel>
            <Select
              items={sectionItems}
              value={section}
              onValueChange={(val) => {
                if (val) setSection(val);
              }}
            >
              <SelectTrigger id="edit-proj-section">
                <SelectValue placeholder="Pilih Bagian..." />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {sectionItems.map((sec) => (
                    <SelectItem key={sec.value} value={sec.value}>
                      {sec.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </Field>

          <Field>
            <FieldLabel htmlFor="edit-proj-plant">Plant</FieldLabel>
            <Select
              items={plantItems}
              value={plant}
              onValueChange={(val) => {
                if (val) setPlant(val);
              }}
            >
              <SelectTrigger id="edit-proj-plant">
                <SelectValue placeholder="Pilih Plant..." />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {plantItems.map((pl) => (
                    <SelectItem key={pl.value} value={pl.value}>
                      {pl.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </Field>

          <Field>
            <FieldLabel htmlFor="edit-proj-plan">Tanggal Rencana</FieldLabel>
            <Input
              id="edit-proj-plan"
              type="date"
              value={planDate}
              onChange={(e) => setPlanDate(e.target.value)}
            />
          </Field>

          <Field>
            <FieldLabel htmlFor="edit-proj-budget">Anggaran (Rp)</FieldLabel>
            <Input
              id="edit-proj-budget"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              placeholder="Contoh: 150000000"
            />
          </Field>

          <Field>
            <FieldLabel htmlFor="edit-proj-note">Catatan</FieldLabel>
            <Input
              id="edit-proj-note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Catatan tambahan..."
            />
          </Field>

          <Field>
            <FieldLabel>Tahapan Progres</FieldLabel>
            <Combobox
              multiple
              items={PROGRESS_STAGES}
              value={stages}
              onValueChange={(val: StageOption[]) => setStages(val)}
              isItemEqualToValue={(a, b) => a.key === b.key}
            >
              <ComboboxValue>
                {(values: StageOption[]) => (
                  <ComboboxChips ref={anchor}>
                    {values?.map((stage) => (
                      <ComboboxChip key={stage.key}>
                        {stage.label}
                      </ComboboxChip>
                    ))}
                    <ComboboxChipsInput
                      placeholder={
                        !values || values.length === 0
                          ? "Pilih tahapan progres..."
                          : ""
                      }
                    />
                  </ComboboxChips>
                )}
              </ComboboxValue>
              <ComboboxContent anchor={anchor}>
                <ComboboxEmpty>Tahapan tidak ditemukan</ComboboxEmpty>
                <ComboboxList>
                  {(stage: StageOption) => (
                    <ComboboxItem key={stage.key} value={stage}>
                      {stage.label}
                    </ComboboxItem>
                  )}
                </ComboboxList>
              </ComboboxContent>
            </Combobox>
          </Field>
        </FieldGroup>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
          >
            Batal
          </Button>
          <Button type="submit" disabled={updateMut.isPending}>
            {updateMut.isPending ? "Menyimpan..." : "Simpan Perubahan"}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}

export function EditProjectDialog({
  project,
  open,
  onOpenChange,
  onSuccess,
}: EditProjectDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {open && project && (
        <EditProjectForm
          key={project.id}
          project={project}
          onClose={() => onOpenChange(false)}
          onSuccess={onSuccess}
        />
      )}
    </Dialog>
  );
}
