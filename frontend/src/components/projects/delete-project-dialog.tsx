import { deleteProjectMutation } from "@/api/@tanstack/react-query.gen";
import type { Project } from "@/api/types.gen";
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
import { Spinner } from "@/components/ui/spinner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

export interface DeleteProjectDialogProps {
  project: Project | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDeleted?: () => void;
}

export function DeleteProjectDialog({
  project,
  open,
  onOpenChange,
  onDeleted,
}: DeleteProjectDialogProps) {
  const queryClient = useQueryClient();
  const [errorMessage, setErrorMessage] = useState("");
  const deleteMut = useMutation(deleteProjectMutation());

  const handleDelete = async () => {
    if (!project) return;
    setErrorMessage("");
    try {
      await deleteMut.mutateAsync({ path: { id: project.id } });
      await queryClient.invalidateQueries();
      onOpenChange(false);
      onDeleted?.();
    } catch (err: any) {
      setErrorMessage(err?.message || "Gagal menghapus proyek.");
    }
  };

  return (
    <AlertDialog
      open={open}
      onOpenChange={(value) => {
        if (value) setErrorMessage("");
        onOpenChange(value);
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Hapus proyek?</AlertDialogTitle>
          <AlertDialogDescription>
            Proyek &quot;{project?.name ?? ""}&quot; akan dihapus. Tindakan ini tidak
            dapat dibatalkan.
          </AlertDialogDescription>
        </AlertDialogHeader>

        {errorMessage && (
          <Alert variant="destructive">
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel variant="ghost" disabled={deleteMut.isPending}>
            Batal
          </AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            disabled={deleteMut.isPending}
            onClick={() => void handleDelete()}
          >
            {deleteMut.isPending && <Spinner data-icon="inline-start" />}
            Hapus
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
