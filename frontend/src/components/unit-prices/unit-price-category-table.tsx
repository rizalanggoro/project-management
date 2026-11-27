import type { UnitPriceCategoryDto } from "@/api/types.gen";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export interface UnitPriceCategoryTableProps {
  items: UnitPriceCategoryDto[];
  isLoading?: boolean;
  isAdmin?: boolean;
  onEdit?: (item: UnitPriceCategoryDto) => void;
  onDelete?: (item: UnitPriceCategoryDto) => void;
}

export function UnitPriceCategoryTable({
  items,
  isLoading = false,
  isAdmin = false,
  onEdit,
  onDelete,
}: UnitPriceCategoryTableProps) {
  const colSpan = isAdmin ? 7 : 6;

  return (
    <div className="rounded-md border bg-card overflow-hidden">
      <Table className="min-w-[600px]">
        <TableHeader>
          <TableRow>
            <TableHead className="w-12 text-center">No</TableHead>
            <TableHead className="w-28">Code</TableHead>
            <TableHead>Nama</TableHead>
            <TableHead className="w-24">Prefix</TableHead>
            <TableHead className="w-20 text-center">Urutan</TableHead>
            <TableHead className="w-24 text-center">Status</TableHead>
            {isAdmin && <TableHead className="w-32 text-center">Action</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={colSpan} className="h-32 text-center text-muted-foreground">
                Memuat data...
              </TableCell>
            </TableRow>
          ) : items.length === 0 ? (
            <TableRow>
              <TableCell colSpan={colSpan} className="h-48 text-center">
                <Empty>
                  <EmptyHeader>
                    <EmptyTitle>Belum ada kategori</EmptyTitle>
                    <EmptyDescription>
                      Tambahkan kategori harga satuan baru.
                    </EmptyDescription>
                  </EmptyHeader>
                </Empty>
              </TableCell>
            </TableRow>
          ) : (
            items.map((item, idx) => (
              <TableRow key={item.id}>
                <TableCell className="text-center text-muted-foreground">
                  {idx + 1}
                </TableCell>
                <TableCell className="font-mono text-xs font-semibold">
                  {item.code}
                </TableCell>
                <TableCell className="font-medium">{item.name}</TableCell>
                <TableCell>
                  <Badge variant="outline" className="font-mono">
                    {item.code_prefix}
                  </Badge>
                </TableCell>
                <TableCell className="text-center text-muted-foreground">
                  {item.sort_order}
                </TableCell>
                <TableCell className="text-center">
                  <Badge variant={item.is_active ? "secondary" : "outline"}>
                    {item.is_active ? "Aktif" : "Nonaktif"}
                  </Badge>
                </TableCell>
                {isAdmin && (
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onEdit?.(item)}
                      >
                        Ubah
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onDelete?.(item)}
                      >
                        Hapus
                      </Button>
                    </div>
                  </TableCell>
                )}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
