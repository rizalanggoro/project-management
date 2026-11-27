import type { AhspDetailDto, AhspItemDto } from '@/api/types.gen'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Empty, EmptyHeader, EmptyTitle } from '@/components/ui/empty'
import { formatDecimal, formatRupiah } from '@/lib/utils'

type Group = {
  key: AhspItemDto['category']
  label: string
  total: string
}

function ComponentTable({ group, items }: { group: Group; items: AhspItemDto[] }) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">{group.label}</CardTitle>
      </CardHeader>
      <CardContent className="p-0 sm:p-4">
        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="w-12 text-center">No</TableHead>
                <TableHead>Uraian</TableHead>
                <TableHead className="w-32">Kode</TableHead>
                <TableHead className="w-20 text-center">Satuan</TableHead>
                <TableHead className="w-28 text-right">Koefisien</TableHead>
                <TableHead className="w-36 text-right">Harga Satuan</TableHead>
                <TableHead className="w-36 text-right">Jumlah Biaya</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item, idx) => (
                <TableRow key={item.id} className="text-xs">
                  <TableCell className="text-center text-muted-foreground">{idx + 1}</TableCell>
                  <TableCell className="font-medium">{item.description}</TableCell>
                  <TableCell className="font-mono text-muted-foreground">{item.code || '-'}</TableCell>
                  <TableCell className="text-center">{item.unit}</TableCell>
                  <TableCell className="text-right font-mono">{formatDecimal(item.coefficient, 4)}</TableCell>
                  <TableCell className="text-right font-mono">{formatRupiah(item.unit_price)}</TableCell>
                  <TableCell className="text-right font-mono font-semibold">{formatRupiah(item.cost)}</TableCell>
                </TableRow>
              ))}
              <TableRow className="bg-muted/20 font-medium text-xs">
                <TableCell colSpan={6} className="text-right text-muted-foreground">
                  Jumlah {group.label}
                </TableCell>
                <TableCell className="text-right font-bold">{formatRupiah(group.total)}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}

export function AhspDetail({ ahsp }: { ahsp: AhspDetailDto }) {
  const groups: Group[] = [
    { key: 'LABOR', label: 'Tenaga Kerja', total: ahsp.total_labor },
    { key: 'MATERIALS', label: 'Bahan', total: ahsp.total_material },
    { key: 'EQUIPMENT', label: 'Peralatan', total: ahsp.total_equipment },
  ]

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <CardTitle className="text-base">{ahsp.work_item}</CardTitle>
            <Badge variant={ahsp.status === 'final' ? 'default' : 'secondary'}>
              {ahsp.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 text-sm sm:grid-cols-3">
            <div>
              <p className="text-xs text-muted-foreground">Kode</p>
              <p className="font-mono font-semibold">{ahsp.code}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Satuan</p>
              <p className="font-semibold">{ahsp.unit}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Catatan</p>
              <p className="text-muted-foreground">{ahsp.note || '-'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {ahsp.items.length === 0 ? (
        <Card>
          <CardContent className="py-6">
            <Empty>
              <EmptyHeader>
                <EmptyTitle>Belum ada komponen biaya</EmptyTitle>
              </EmptyHeader>
            </Empty>
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col gap-6">
          {groups.map((group) => {
            const items = ahsp.items.filter((item) => item.category === group.key)
            if (items.length === 0) return null
            return <ComponentTable key={group.key} group={group} items={items} />
          })}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-muted-foreground">Total Biaya Langsung</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-bold font-mono">{formatRupiah(ahsp.total_cost)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-muted-foreground">
              Biaya Umum & Keuntungan ({formatDecimal(ahsp.overhead_profit_pct, 2)}%)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-bold font-mono">
              {formatRupiah(String(Number(ahsp.unit_price_of_work) - Number(ahsp.total_cost)))}
            </p>
          </CardContent>
        </Card>
        <Card className="border-primary/40 bg-primary/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-bold text-primary">Harga Satuan Pekerjaan</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-extrabold font-mono text-primary">
              {formatRupiah(ahsp.unit_price_of_work)}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
