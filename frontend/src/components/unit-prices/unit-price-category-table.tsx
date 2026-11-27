import type { UnitPriceCategoryDto } from "@/api/types.gen";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { EllipsisVertical, Pencil, Trash2 } from "lucide-react";

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
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>No</TableHead>
            <TableHead>Kode</TableHead>
            <TableHead>Nama</TableHead>
            <TableHead>Prefix</TableHead>
            <TableHead>Urutan</TableHead>
            <TableHead>Status</TableHead>
            {isAdmin && <TableHead>Aksi</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={colSpan}>
                Memuat data...
              </TableCell>
            </TableRow>
          ) : items.length === 0 ? (
            <TableRow>
              <TableCell colSpan={colSpan}>
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
                <TableCell>
                  {idx + 1}
                </TableCell>
                <TableCell>
                  {item.code}
                </TableCell>
                <TableCell>{item.name}</TableCell>
                <TableCell>
                  <Badge variant="outline">
                    {item.code_prefix}
                  </Badge>
                </TableCell>
                <TableCell>
                  {item.sort_order}
                </TableCell>
                <TableCell>
                  <Badge variant={item.is_active ? "secondary" : "outline"}>
                    {item.is_active ? "Aktif" : "Nonaktif"}
                  </Badge>
                </TableCell>
                {isAdmin && (
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        render={
                          <Button
                            variant="ghost"
                            size="icon"
                          />
                        }
                      >
                        <EllipsisVertical />
                        <span className="sr-only">Aksi</span>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuGroup>
                          <DropdownMenuItem onClick={() => onEdit?.(item)}>
                            <Pencil />
                            <span>Ubah</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            variant="destructive"
                            onClick={() => onDelete?.(item)}
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
  );
}
