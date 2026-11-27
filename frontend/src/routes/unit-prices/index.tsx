import {
  deleteUnitPriceMutation,
  listUnitPriceCategoriesOptions,
  listUnitPricesOptions,
} from "@/api/@tanstack/react-query.gen";
import type { UnitPriceDto } from "@/api/types.gen";
import {
  UnitPriceTable,
  UpsertUnitPriceDialog,
} from "@/components/unit-prices";
import { ALL_UNIT_PRICE_CATEGORY } from "@/components/unit-prices/constants";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Filter, Plus, Search } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/unit-prices/")({
  component: UnitPricesPage,
  validateSearch: (search: Record<string, unknown>): { q?: string; category?: string } => ({
    q: (search.q as string) || undefined,
    category: (search.category as string) || undefined,
  }),
});

function UnitPricesPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { q, category } = Route.useSearch();
  const { isAdmin, user, openLoginModal } = useAuth();

  const currentCategory = category || ALL_UNIT_PRICE_CATEGORY;
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<UnitPriceDto | null>(null);

  const { data: items = [], isLoading } = useQuery({
    ...listUnitPricesOptions({
      query: {
        q: q || undefined,
        category:
          currentCategory === ALL_UNIT_PRICE_CATEGORY
            ? undefined
            : currentCategory,
      },
    }),
  });

  const { data: categories = [] } = useQuery(listUnitPriceCategoriesOptions());
  const filterCategories = [
    ALL_UNIT_PRICE_CATEGORY,
    ...categories.filter((c) => c.is_active).map((c) => c.code),
  ];

  const deleteMut = useMutation(deleteUnitPriceMutation());

  const handleOpenAdd = () => {
    if (!user) {
      openLoginModal();
      return;
    }
    setEditingItem(null);
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (item: UnitPriceDto) => {
    if (!user) {
      openLoginModal();
      return;
    }
    setEditingItem(item);
    setIsDialogOpen(true);
  };

  const handleDelete = async (item: UnitPriceDto) => {
    if (!confirm(`Hapus harga satuan ${item.code}?`)) return;
    try {
      await deleteMut.mutateAsync({ path: { id: item.id } });
      await queryClient.invalidateQueries();
    } catch (err: any) {
      alert(
        err?.message ||
          "Gagal menghapus: Item mungkin sedang digunakan pada AHSP."
      );
    }
  };

  return (
    <div className="flex flex-col gap-4 min-w-0">
      <div className="flex flex-col gap-4">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Harga Satuan
        </h1>
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <InputGroup>
              <InputGroupAddon>
                <Search data-icon="inline-start" />
              </InputGroupAddon>
              <InputGroupInput
                placeholder="Cari..."
                value={q || ""}
                onChange={(e) =>
                  navigate({
                    search: ((prev: any) => ({
                      ...prev,
                      q: e.target.value || undefined,
                    })) as any,
                    replace: true,
                  })
                }
              />
            </InputGroup>
            <DropdownMenu>
              <DropdownMenuTrigger render={<Button variant="outline" size="icon" />}>
                <Filter data-icon="inline-start" />
                <span className="sr-only">Filter Kategori</span>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuGroup>
                  <DropdownMenuLabel>Kategori</DropdownMenuLabel>
                  <DropdownMenuRadioGroup
                    value={currentCategory}
                    onValueChange={(val) =>
                      navigate({
                        search: ((prev: any) => ({
                          ...prev,
                          category:
                        val === ALL_UNIT_PRICE_CATEGORY ? undefined : val,
                        })) as any,
                        replace: true,
                      })
                    }
                  >
                    {filterCategories.map((cat) => (
                      <DropdownMenuRadioItem key={cat} value={cat}>
                        {cat}
                      </DropdownMenuRadioItem>
                    ))}
                  </DropdownMenuRadioGroup>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="flex items-center gap-2">
            {isAdmin && (
              <Button
                variant="outline"
                onClick={() => navigate({ to: "/unit-prices/categories" })}
              >
                Kategori
              </Button>
            )}
            <Button onClick={handleOpenAdd}>
              <Plus data-icon="inline-start" />
              Tambah Harga Satuan
            </Button>
          </div>
        </div>
      </div>

      <UnitPriceTable
        items={items}
        isLoading={isLoading}
        isAdmin={isAdmin}
        search={q || ""}
        onEdit={handleOpenEdit}
        onDelete={handleDelete}
      />

      <UpsertUnitPriceDialog
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
