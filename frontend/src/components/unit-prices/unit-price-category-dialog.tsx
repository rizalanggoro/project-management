import {
  createUnitPriceCategoryMutation,
  listUnitPriceCategoriesOptions,
  listUnitPricesOptions,
  updateUnitPriceCategoryMutation,
} from "@/api/@tanstack/react-query.gen";
import type { UnitPriceCategoryDto } from "@/api/types.gen";
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
import { Switch } from "@/components/ui/switch";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";

export interface UpsertUnitPriceCategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item?: UnitPriceCategoryDto | null;
  onSuccess?: () => void;
}

const categorySchema = z.object({
  code: z
    .string()
    .trim()
    .min(1, "Kode wajib diisi.")
    .regex(/^[A-Za-z0-9_-]+$/, "Kode hanya boleh huruf, angka, - dan _."),
  name: z.string().trim().min(1, "Nama wajib diisi."),
  code_prefix: z
    .string()
    .trim()
    .min(1, "Prefix wajib diisi.")
    .regex(/^[A-Za-z0-9_-]+$/, "Prefix hanya boleh huruf, angka, - dan _."),
  sort_order: z.number().int().min(0, "Urutan tidak boleh negatif."),
  is_active: z.boolean(),
});

type CategoryFormValues = z.infer<typeof categorySchema>;

function CategoryForm({
  item,
  onClose,
  onSuccess,
}: {
  item: UnitPriceCategoryDto | null;
  onClose: () => void;
  onSuccess?: () => void;
}) {
  const queryClient = useQueryClient();
  const isEdit = Boolean(item);

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      code: item?.code ?? "",
      name: item?.name ?? "",
      code_prefix: item?.code_prefix ?? "",
      sort_order: item?.sort_order ?? 0,
      is_active: item?.is_active ?? true,
    },
  });

  const {
    control,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = form;

  const createMut = useMutation(createUnitPriceCategoryMutation());
  const updateMut = useMutation(updateUnitPriceCategoryMutation());
  const isPending =
    isSubmitting || (isEdit ? updateMut.isPending : createMut.isPending);

  const onSubmit = async (values: CategoryFormValues) => {
    try {
      const body = {
        code: values.code.toUpperCase(),
        name: values.name,
        code_prefix: values.code_prefix.toUpperCase(),
        sort_order: values.sort_order,
        is_active: values.is_active,
      };

      if (item) {
        await updateMut.mutateAsync({ path: { id: item.id }, body });
      } else {
        await createMut.mutateAsync({ body });
      }

      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: listUnitPriceCategoriesOptions().queryKey,
        }),
        queryClient.invalidateQueries({
          queryKey: listUnitPricesOptions().queryKey,
        }),
      ]);
      onSuccess?.();
      onClose();
    } catch (err: any) {
      setError("root", { message: err?.message || "Gagal menyimpan kategori." });
    }
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>{isEdit ? "Ubah Kategori" : "Tambah Kategori"}</DialogTitle>
        <DialogDescription>
          Atur kode, nama, dan prefix untuk kode harga satuan otomatis.
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
                  <FieldLabel htmlFor="upc-code">Kode</FieldLabel>
                  <Input
                    {...field}
                    id="upc-code"
                    aria-invalid={fieldState.invalid}
                    placeholder="LABOR"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <Controller
              name="code_prefix"
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="upc-prefix">Prefix Kode</FieldLabel>
                  <Input
                    {...field}
                    id="upc-prefix"
                    aria-invalid={fieldState.invalid}
                    placeholder="LBR"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </div>

          <Controller
            name="name"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="upc-name">Nama Kategori</FieldLabel>
                <Input
                  {...field}
                  id="upc-name"
                  aria-invalid={fieldState.invalid}
                  placeholder="Tenaga Kerja"
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <Controller
              name="sort_order"
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="upc-order">Urutan</FieldLabel>
                  <Input
                    id="upc-order"
                    name={field.name}
                    ref={field.ref}
                    type="number"
                    min={0}
                    value={field.value}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value === "" ? 0 : Number(e.target.value)
                      )
                    }
                    onBlur={field.onBlur}
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <Controller
              name="is_active"
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid} orientation="horizontal">
                  <Switch
                    id="upc-active"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    aria-invalid={fieldState.invalid}
                  />
                  <FieldLabel htmlFor="upc-active">
                    Aktif
                  </FieldLabel>
                </Field>
              )}
            />
          </div>
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

export function UpsertUnitPriceCategoryDialog({
  open,
  onOpenChange,
  item,
  onSuccess,
}: UpsertUnitPriceCategoryDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        {open && (
          <CategoryForm
            item={item ?? null}
            onClose={() => onOpenChange(false)}
            onSuccess={onSuccess}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
