import {
  createProjectMutation,
  listProjectPlantsOptions,
  listProjectSectionsOptions,
} from "@/api/@tanstack/react-query.gen";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
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
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { toSelectItems } from "@/lib/master-data";
import { buildProjectBody } from "@/lib/project-forms";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { ChevronDownIcon } from "lucide-react";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { PROGRESS_STAGES, type StageOption } from "./constants";

const formSchema = z.object({
  name: z.string().trim().min(1, "Nama proyek wajib diisi."),
  section: z.string().min(1, "Pilih bagian proyek."),
  plant: z.string().min(1, "Pilih plant proyek."),
  planDate: z.date().optional(),
  budget: z.string(),
  note: z.string(),
  stages: z.array(z.custom<StageOption>()),
});

type FormValues = z.infer<typeof formSchema>;

export interface AddProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function AddProjectDialog({
  open,
  onOpenChange,
  onSuccess,
}: AddProjectDialogProps) {
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

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      section: "",
      plant: "",
      planDate: undefined,
      budget: "",
      note: "",
      stages: [],
    },
  });

  const {
    control,
    handleSubmit,
    setError,
    reset,
    formState: { errors, isSubmitting },
  } = form;

  const createMut = useMutation(createProjectMutation());
  const isPending = isSubmitting || createMut.isPending;

  useEffect(() => {
    if (open) reset();
  }, [open, reset]);

  const onSubmit = async (values: FormValues) => {
    try {
      await createMut.mutateAsync({
        body: buildProjectBody(
          { ...values, planDate: values.planDate },
          PROGRESS_STAGES
        ),
      });

      await queryClient.invalidateQueries();
      onOpenChange(false);
      onSuccess?.();
    } catch (err: any) {
      setError("root", {
        message: err?.message || "Gagal membuat proyek.",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Tambah Proyek Baru</DialogTitle>
          <DialogDescription>
            Masukkan rincian proyek baru dan tahapan monitoring.
          </DialogDescription>
        </DialogHeader>

        {errors.root?.message && (
          <Alert variant="destructive">
            <AlertDescription>{errors.root.message}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit(onSubmit)}>
          <FieldGroup>
            <Controller
              name="name"
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Nama Proyek</FieldLabel>
                  <Input
                    {...field}
                    id={field.name}
                    aria-invalid={fieldState.invalid}
                    placeholder="Nama Proyek..."
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name="section"
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Bagian</FieldLabel>
                  <Select
                    name={field.name}
                    items={sectionItems}
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger id={field.name} aria-invalid={fieldState.invalid}>
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
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name="plant"
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Plant</FieldLabel>
                  <Select
                    name={field.name}
                    items={plantItems}
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger id={field.name} aria-invalid={fieldState.invalid}>
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
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name="planDate"
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Tanggal Rencana</FieldLabel>
                  <Popover>
                    <PopoverTrigger
                      render={
                        <Button
                          id={field.name}
                          variant="outline"
                          data-empty={!field.value}
                          aria-invalid={fieldState.invalid}
                        >
                          {field.value ? (
                            format(field.value, "PPP", { locale: idLocale })
                          ) : (
                            <span>Pilih tanggal</span>
                          )}
                          <ChevronDownIcon data-icon="inline-end" />
                        </Button>
                      }
                    />
                    <PopoverContent align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        defaultMonth={field.value}
                        locale={idLocale}
                      />
                    </PopoverContent>
                  </Popover>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name="budget"
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Anggaran (Rp)</FieldLabel>
                  <Input
                    {...field}
                    id={field.name}
                    inputMode="numeric"
                    aria-invalid={fieldState.invalid}
                    placeholder="Contoh: 150000000"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name="note"
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Catatan</FieldLabel>
                  <Textarea
                    {...field}
                    id={field.name}
                    aria-invalid={fieldState.invalid}
                    placeholder="Catatan tambahan..."
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name="stages"
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Tahapan Progres</FieldLabel>
                  <Combobox
                    multiple
                    items={PROGRESS_STAGES}
                    value={field.value}
                    onValueChange={field.onChange}
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
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </FieldGroup>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Batal
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Spinner data-icon="inline-start" />}
              Simpan Proyek
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
