import {
  deleteUnitPriceCategoryMutation,
  listUnitPriceCategoriesOptions,
  listUnitPricesOptions,
} from "@/api/@tanstack/react-query.gen";
import type { UnitPriceCategoryDto } from "@/api/types.gen";
import {
  UnitPriceCategoryTable,
  UpsertUnitPriceCategoryDialog,
} from "@/components/unit-prices";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/unit-prices/categories/")({
  component: UnitPriceCategoriesPage,
});

function UnitPriceCategoriesPage() {
  const queryClient = useQueryClient();
  const { isAdmin } = useAuth();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<UnitPriceCategoryDto | null>(null);

  const { data: categories = [], isLoading } = useQuery(
    listUnitPriceCategoriesOptions()
  );
  const deleteMut = useMutation(deleteUnitPriceCategoryMutation());

  const handleOpenAdd = () => {
    setEditingItem(null);
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (item: UnitPriceCategoryDto) => {
    setEditingItem(item);
    setIsDialogOpen(true);
  };

  const handleDelete = async (item: UnitPriceCategoryDto) => {
    if (!confirm(`Hapus kategori ${item.code}?`)) return;
    try {
      await deleteMut.mutateAsync({ path: { id: item.id } });
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: listUnitPriceCategoriesOptions().queryKey,
        }),
        queryClient.invalidateQueries({
          queryKey: listUnitPricesOptions().queryKey,
        }),
      ]);
    } catch (err: any) {
      alert(err?.message || "Gagal menghapus kategori.");
    }
  };

  return (
    <div className="flex flex-col gap-4 min-w-0">
      <div className="flex flex-col gap-4">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Kategori Harga Satuan
        </h1>
        <div className="flex items-center justify-end gap-4">
          {isAdmin && (
            <Button onClick={handleOpenAdd}>
              <Plus data-icon="inline-start" />
              Kategori
            </Button>
          )}
        </div>
      </div>

      <UnitPriceCategoryTable
        items={categories}
        isLoading={isLoading}
        isAdmin={isAdmin}
        onEdit={handleOpenEdit}
        onDelete={handleDelete}
      />

      <UpsertUnitPriceCategoryDialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) setEditingItem(null);
        }}
        item={editingItem}
      />
    </div>
  );
}
