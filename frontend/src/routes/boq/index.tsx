import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { listBoqProjectsOptions } from '@/api/@tanstack/react-query.gen'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription } from '@/components/ui/empty'
import { Badge } from '@/components/ui/badge'
import { Download, Search } from 'lucide-react'

export const Route = createFileRoute('/boq/')({
  component: BoqPage,
  validateSearch: (search: Record<string, unknown>): { q?: string } => ({
    q: (search.q as string) || undefined,
  }),
})

function BoqPage() {
  const navigate = useNavigate()
  const { q } = Route.useSearch()

  const { data: projects = [], isLoading } = useQuery({
    ...listBoqProjectsOptions({ query: { q: q || undefined } }),
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'complete':
        return <Badge variant="default">Lengkap</Badge>
      case 'partial':
        return <Badge variant="secondary">Sebagian</Badge>
      default:
        return <Badge variant="outline">Kosong</Badge>
    }
  }

  return (
    <div className="flex flex-col gap-4 min-w-0">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          BOQ (Bill of Quantities)
        </h1>
        <div className="flex items-center justify-between gap-4">
          <InputGroup>
            <InputGroupAddon>
              <Search data-icon="inline-start" />
            </InputGroupAddon>
            <InputGroupInput
              placeholder="Cari proyek..."
              value={q || ''}
              onChange={(e) => {
                const val = e.target.value
                navigate({
                  search: ((prev: any) => ({ ...prev, q: val || undefined })) as any,
                  replace: true,
                })
              }}
            />
          </InputGroup>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate({ to: '/volume' })}
            >
              Volume Take-off
            </Button>
            <Button
              size="sm"
              onClick={() => navigate({ to: '/rab' })}
            >
              RAB
            </Button>
          </div>
        </div>
      </div>

      <div className="rounded-md border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead rowSpan={2}>No</TableHead>
              <TableHead rowSpan={2}>Proyek</TableHead>
              <TableHead colSpan={2}>Volume</TableHead>
              <TableHead colSpan={2}>RAB</TableHead>
            </TableRow>
            <TableRow>
              <TableHead>Status</TableHead>
              <TableHead>Ekspor</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Ekspor</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6}>
                  Memuat data...
                </TableCell>
              </TableRow>
            ) : projects.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6}>
                  <Empty>
                    <EmptyHeader>
                      <EmptyTitle>Belum ada proyek BOQ</EmptyTitle>
                      <EmptyDescription>
                        {q ? `Tidak ada proyek yang cocok dengan "${q}".` : 'Belum ada data proyek.'}
                      </EmptyDescription>
                    </EmptyHeader>
                  </Empty>
                </TableCell>
              </TableRow>
            ) : (
              projects.map((p, idx) => (
                <TableRow key={p.id}>
                  <TableCell>{idx + 1}</TableCell>
                  <TableCell>
                    <button
                      type="button"
                      onClick={() => navigate({ to: `/projects` })}
                      className="text-left hover:underline"
                    >
                      {p.name}
                    </button>
                    <div className="text-xs text-muted-foreground">
                      {p.section || 'Umum'} · {p.plant || 'Lokasi'}
                    </div>
                  </TableCell>

                  {/* Volume Status & Export */}
                  <TableCell>{getStatusBadge(p.volume_status)}</TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      variant="outline"
                      render={<a href={`/api/v1/projects/${p.id}/exports/volume.xlsx`} download />}
                      nativeButton={false}
                    >
                      <Download data-icon="inline-start" />
                      Excel
                    </Button>
                  </TableCell>

                  {/* RAB Status & Export */}
                  <TableCell>{getStatusBadge(p.rab_status)}</TableCell>
                  <TableCell>
                    <div className="flex items-center justify-center gap-1.5">
                      <Button
                        size="sm"
                        variant="outline"
                        render={<a href={`/api/v1/projects/${p.id}/exports/rab.xlsx`} download />}
                        nativeButton={false}
                      >
                        <Download data-icon="inline-start" />
                        Excel
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        render={<a href={`/api/v1/projects/${p.id}/exports/rab.pdf`} target="_blank" rel="noreferrer" />}
                        nativeButton={false}
                      >
                        <Download data-icon="inline-start" />
                        PDF
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
