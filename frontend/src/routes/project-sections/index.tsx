import {
  createProjectSectionMutation,
  deleteProjectSectionMutation,
  listProjectSectionsOptions,
  updateProjectSectionMutation,
} from "@/api/@tanstack/react-query.gen";
import type { ProjectSectionDto } from "@/api/types.gen";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAuth } from "@/lib/auth";
import {
  masterDataFormSchema,
  toMasterDataFormValues,
  type MasterDataFormValues,
} from "@/lib/project-forms";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { EllipsisVertical, Pencil, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";

export const Route = createFileRoute("/project-sections/")({
  component: ProjectSectionsPage,
});

const queryKey = listProjectSectionsOptions().queryKey;

function ProjectSectionsPage() {
  const queryClient = useQueryClient();
  const { isAdmin } = useAuth();

  const { data: items = [], isLoading } = useQuery({
    ...listProjectSectionsOptions(),
  });

  const createMut = useMutation(createProjectSectionMutation());
  const updateMut = useMutation(updateProjectSectionMutation());
  const deleteMut = useMutation(deleteProjectSectionMutation());

  const [isOpen, setIsOpen] = useState(false);
  const [editing, setEditing] = useState<ProjectSectionDto | null>(null);
  const [deleting, setDeleting] = useState<ProjectSectionDto | null>(null);

  const form = useForm<MasterDataFormValues>({
    resolver: zodResolver(masterDataFormSchema),
    defaultValues: toMasterDataFormValues(null),
  });

  const { control, handleSubmit, reset, setError, formState } = form;
  const isPending =
    formState.isSubmitting || createMut.isPending || updateMut.isPending;

  useEffect(() => {
    if (isOpen) reset(toMasterDataFormValues(editing));
  }, [isOpen, editing, reset]);

  const openCreate = () => {
    setEditing(null);
    setIsOpen(true);
  };

  const openEdit = (item: ProjectSectionDto) => {
    setEditing(item);
    setIsOpen(true);
  };

  const onSubmit = async (values: MasterDataFormValues) => {
    try {
      if (editing) {
        await updateMut.mutateAsync({
          path: { id: editing.id },
          body: values,
        });
      } else {
        await createMut.mutateAsync({ body: values });
      }
      await queryClient.invalidateQueries({ queryKey });
      setIsOpen(false);
    } catch (err: any) {
      setError("root", {
        message: err?.message || "Gagal menyimpan bagian proyek.",
      });
    }
  };

  const onDelete = async () => {
    if (!deleting) return;
    try {
      await deleteMut.mutateAsync({ path: { id: deleting.id } });
      await queryClient.invalidateQueries({ queryKey });
      setDeleting(null);
    } catch (err: any) {
      setError("root", {
        message: err?.message || "Gagal menghapus bagian proyek.",
      });
      setDeleting(null);
    }
  };

  return (
    <div className="flex flex-col gap-4 min-w-0">
      <div className="flex flex-col gap-4">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Bagian Proyek
        </h1>
        <div className="flex items-center justify-end gap-4">
          {isAdmin && (
            <Button onClick={openCreate}>
              <Plus data-icon="inline-start" />
              Bagian Proyek
            </Button>
          )}
        </div>
      </div>

      <div className="rounded-md border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>No</TableHead>
              <TableHead>Kode</TableHead>
              <TableHead>Nama</TableHead>
              {isAdmin && <TableHead>Aksi</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={isAdmin ? 4 : 3}>Memuat data...</TableCell>
              </TableRow>
            ) : items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={isAdmin ? 4 : 3}>
                  <Empty>
                    <EmptyHeader>
                      <EmptyTitle>Belum ada bagian proyek.</EmptyTitle>
                    </EmptyHeader>
                  </Empty>
                </TableCell>
              </TableRow>
            ) : (
              items.map((item, idx) => (
                <TableRow key={item.id}>
                  <TableCell>{idx + 1}</TableCell>
                  <TableCell>{item.code}</TableCell>
                  <TableCell>{item.name}</TableCell>
                  {isAdmin && (
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          render={<Button variant="ghost" size="icon" />}
                        >
                          <EllipsisVertical />
                          <span className="sr-only">Aksi</span>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuGroup>
                            <DropdownMenuItem onClick={() => openEdit(item)}>
                              <Pencil />
                              <span>Ubah</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              variant="destructive"
                              onClick={() => setDeleting(item)}
                            >
                              <Trash2 />
                              <span>Hapus</span>
                            </DropdownMenuItem>
                          </DropdownMenuGroup>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editing ? "Ubah Bagian Proyek" : "Tambah Bagian Proyek"}
            </DialogTitle>
            <DialogDescription>
              Kelola data bagian proyek yang tersedia.
            </DialogDescription>
          </DialogHeader>

          {formState.errors.root?.message && (
            <Alert variant="destructive">
              <AlertDescription>{formState.errors.root.message}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit(onSubmit)}>
            <FieldGroup>
              <Controller
                name="code"
                control={control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>Kode</FieldLabel>
                    <Input
                      {...field}
                      id={field.name}
                      aria-invalid={fieldState.invalid}
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              <Controller
                name="name"
                control={control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>Nama</FieldLabel>
                    <Input
                      {...field}
                      id={field.name}
                      aria-invalid={fieldState.invalid}
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </FieldGroup>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                Batal
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending && <Spinner data-icon="inline-start" />}
                Simpan
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={Boolean(deleting)}
        onOpenChange={(open) => {
          if (!open) setDeleting(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus bagian proyek?</AlertDialogTitle>
            <AlertDialogDescription>
              Bagian &quot;{deleting?.name ?? ""}&quot; akan dihapus.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={() => void onDelete()}>
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
