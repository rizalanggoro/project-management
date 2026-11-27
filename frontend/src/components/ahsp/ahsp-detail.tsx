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
      <CardHeader>
        <CardTitle>{group.label}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>No</TableHead>
                <TableHead>Uraian</TableHead>
                <TableHead>Kode</TableHead>
                <TableHead>Satuan</TableHead>
                <TableHead>Koefisien</TableHead>
                <TableHead>Harga Satuan</TableHead>
                <TableHead>Jumlah Biaya</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item, idx) => (
                <TableRow key={item.id}>
                  <TableCell>{idx + 1}</TableCell>
                  <TableCell>{item.description}</TableCell>
                  <TableCell>{item.code || '-'}</TableCell>
                  <TableCell>{item.unit}</TableCell>
                  <TableCell>{formatDecimal(item.coefficient, 4)}</TableCell>
                  <TableCell>{formatRupiah(item.unit_price)}</TableCell>
                  <TableCell>{formatRupiah(item.cost)}</TableCell>
                </TableRow>
              ))}
              <TableRow>
                <TableCell colSpan={6}>
                  Jumlah {group.label}
                </TableCell>
                <TableCell>{formatRupiah(group.total)}</TableCell>
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
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <CardTitle>{ahsp.work_item}</CardTitle>
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
          <CardContent>
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
          <CardHeader>
            <CardTitle>Total Biaya Langsung</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-bold font-mono">{formatRupiah(ahsp.total_cost)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>
              Biaya Umum & Keuntungan ({formatDecimal(ahsp.overhead_profit_pct, 2)}%)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-bold font-mono">
              {formatRupiah(String(Number(ahsp.unit_price_of_work) - Number(ahsp.total_cost)))}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Harga Satuan Pekerjaan</CardTitle>
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
