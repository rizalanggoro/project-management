import type { UnitPriceDto } from "@/api/types.gen";
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
import { formatRupiah } from "@/lib/utils";
import { EllipsisVertical, Pencil, Trash2 } from "lucide-react";

export interface UnitPriceTableProps {
  items: UnitPriceDto[];
  isLoading?: boolean;
  isAdmin?: boolean;
  search?: string;
  onEdit?: (item: UnitPriceDto) => void;
  onDelete?: (item: UnitPriceDto) => void;
}

export function UnitPriceTable({
  items,
  isLoading = false,
  isAdmin = false,
  search = "",
  onEdit,
  onDelete,
}: UnitPriceTableProps) {
  const colSpan = isAdmin ? 8 : 7;

  return (
    <div className="rounded-md border bg-card overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>No</TableHead>
            <TableHead>Kode</TableHead>
            <TableHead>Kategori</TableHead>
            <TableHead>Item Pekerjaan</TableHead>
            <TableHead>Satuan</TableHead>
            <TableHead>Harga Satuan</TableHead>
            <TableHead>Catatan</TableHead>
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
                    <EmptyTitle>Tidak ada harga satuan</EmptyTitle>
                    <EmptyDescription>
                      {search
                        ? `Tidak ada item yang cocok dengan "${search}".`
                        : "Mulai tambahkan daftar harga satuan baru."}
                    </EmptyDescription>
                  </EmptyHeader>
                </Empty>
              </TableCell>
            </TableRow>
          ) : (
            items.map((item, idx) => (
              <TableRow key={item.id}>
                <TableCell>{idx + 1}</TableCell>
                <TableCell>{item.code}</TableCell>
                <TableCell>
                  <Badge variant="outline">
                    {item.category}
                  </Badge>
                </TableCell>
                <TableCell>{item.work_item}</TableCell>
                <TableCell>{item.unit}</TableCell>
                <TableCell>{formatRupiah(item.unit_price)}</TableCell>
                <TableCell>{item.note || "-"}</TableCell>
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
                          {onEdit && (
                            <DropdownMenuItem onClick={() => onEdit(item)}>
                              <Pencil />
                              <span>Ubah</span>
                            </DropdownMenuItem>
                          )}
                          {onDelete && (
                            <DropdownMenuItem
                              variant="destructive"
                              onClick={() => onDelete(item)}
                            >
                              <Trash2 />
                              <span>Hapus</span>
                            </DropdownMenuItem>
                          )}
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

