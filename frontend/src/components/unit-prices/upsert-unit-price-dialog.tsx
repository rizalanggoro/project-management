import {
  createUnitPriceMutation,
  listUnitPriceCategoriesOptions,
  updateUnitPriceMutation,
} from "@/api/@tanstack/react-query.gen";
import type { UnitPriceDto } from "@/api/types.gen";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
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
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";

export interface UpsertUnitPriceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item?: UnitPriceDto | null;
  onSuccess?: () => void;
}

function UpsertUnitPriceForm({
  item,
  onClose,
  onSuccess,
}: {
  item: UnitPriceDto | null;
  onClose: () => void;
  onSuccess?: () => void;
}) {
  const queryClient = useQueryClient();
  const isEdit = Boolean(item);
  const { data: categories = [] } = useQuery(listUnitPriceCategoriesOptions());

  const categoryItems = categories
    .filter((category) => category.is_active)
    .map((category) => ({ value: category.code, label: category.name }));

  // Keep the current category selectable even if it was deactivated later.
  if (item && !categoryItems.some((category) => category.value === item.category)) {
    categoryItems.push({ value: item.category, label: item.category });
  }

  const schema = useMemo(
    () =>
      z
        .object({
          code: z.string().trim(),
          category: z.string().min(1, "Pilih kategori."),
          work_item: z.string().trim().min(1, "Item pekerjaan wajib diisi."),
          unit: z.string().trim().min(1, "Satuan wajib diisi."),
          unit_price: z
            .string()
            .min(1, "Harga satuan wajib diisi.")
            .refine((value) => /^\d+$/.test(value.replace(/[\s.,]/g, "")), {
              message: "Harga satuan harus berupa angka.",
            }),
          note: z.string().trim(),
        })
        .superRefine((values, ctx) => {
          if (isEdit && !values.code) {
            ctx.addIssue({
              code: "custom",
              path: ["code"],
              message: "Kode wajib diisi.",
            });
          }
        }),
    [isEdit]
  );

  type UpsertUnitPriceFormValues = z.infer<typeof schema>;

  const form = useForm<UpsertUnitPriceFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      code: item?.code ?? "",
      category: item?.category ?? "",
      work_item: item?.work_item ?? "",
      unit: item?.unit ?? "",
      unit_price: item?.unit_price ?? "",
      note: item?.note ?? "",
    },
  });

  const {
    control,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = form;

  const createMut = useMutation(createUnitPriceMutation());
  const updateMut = useMutation(updateUnitPriceMutation());
  const isPending = isSubmitting || (isEdit ? updateMut.isPending : createMut.isPending);

  const onSubmit = async (values: UpsertUnitPriceFormValues) => {
    try {
      const body = {
        code: values.code,
        category: values.category,
        work_item: values.work_item,
        unit: values.unit,
        unit_price: values.unit_price.replace(/\D/g, "") || "0",
        note: values.note,
      };

      if (item) {
        await updateMut.mutateAsync({ path: { id: item.id }, body });
      } else {
        await createMut.mutateAsync({ body });
      }

      await queryClient.invalidateQueries();
      onSuccess?.();
      onClose();
    } catch (err: any) {
      setError("root", {
        message:
          err?.message ||
          (isEdit
            ? "Gagal mengubah harga satuan."
            : "Gagal menyimpan harga satuan."),
      });
    }
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>{isEdit ? "Ubah Harga Satuan" : "Tambah Harga Satuan"}</DialogTitle>
        <DialogDescription>
          {isEdit
            ? "Perbarui data harga satuan."
            : "Tambahkan harga satuan baru ke master database."}
        </DialogDescription>
      </DialogHeader>

      {errors.root?.message && (
        <Alert variant="destructive">
          <AlertDescription>{errors.root.message}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <FieldGroup>
          <div className="grid grid-cols-2 gap-4">
            <Controller
              name="code"
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="up-code">
                    Kode{" "}
                    {!isEdit && (
                      <span className="text-xs font-normal text-muted-foreground">
                        (opsional)
                      </span>
                    )}
                  </FieldLabel>
                  <Input
                    {...field}
                    id="up-code"
                    aria-invalid={fieldState.invalid}
                    placeholder={isEdit ? "MTR-001" : "Otomatis jika kosong"}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <Controller
              name="category"
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="up-category">Kategori</FieldLabel>
                  <Select
                    name={field.name}
                    items={categoryItems}
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger id="up-category" aria-invalid={fieldState.invalid}>
                      <SelectValue placeholder="Pilih Kategori" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {categoryItems.map((category) => (
                          <SelectItem key={category.value} value={category.value}>
                            {category.label}
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
          </div>

          <Controller
            name="work_item"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="up-workitem">Item Pekerjaan</FieldLabel>
                <Input
                  {...field}
                  id="up-workitem"
                  aria-invalid={fieldState.invalid}
                  placeholder="Nama item pekerjaan / material..."
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <Controller
              name="unit"
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="up-unit">Satuan</FieldLabel>
                  <Input
                    {...field}
                    id="up-unit"
                    aria-invalid={fieldState.invalid}
                    placeholder="m3, kg, OH, dll."
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <Controller
              name="unit_price"
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="up-price">Harga Satuan (Rp)</FieldLabel>
                  <Input
                    {...field}
                    id="up-price"
                    inputMode="numeric"
                    aria-invalid={fieldState.invalid}
                    placeholder="150000"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </div>

          <Controller
            name="note"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="up-note">Catatan</FieldLabel>
                <Input
                  {...field}
                  id="up-note"
                  aria-invalid={fieldState.invalid}
                  placeholder="Catatan spesifikasi..."
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
        </FieldGroup>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Batal
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending ? "Menyimpan..." : "Simpan"}
          </Button>
        </DialogFooter>
      </form>
    </>
  );
}

export function UpsertUnitPriceDialog({
  open,
  onOpenChange,
  item,
  onSuccess,
}: UpsertUnitPriceDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        {open && (
          <UpsertUnitPriceForm
            item={item ?? null}
            onClose={() => onOpenChange(false)}
            onSuccess={onSuccess}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
