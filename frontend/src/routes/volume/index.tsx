import { Fragment } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  listProjectsOptions,
  listGroupsOptions,
  listVolumesOptions,
  deleteVolumeMutation,
  updateVolumeMutation,
} from '@/api/@tanstack/react-query.gen'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button, buttonVariants } from '@/components/ui/button'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription } from '@/components/ui/empty'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { FormulaBadge } from '@/components/formula-badge'
import { renderDimensions } from '@/lib/volume'
import { formatDecimal } from '@/lib/utils'
import { useAuth } from '@/lib/auth'
import { EllipsisVertical, FileSpreadsheet, Plus, Search, Tags, Trash2 } from 'lucide-react'

export const Route = createFileRoute('/volume/')({
  component: VolumePage,
  validateSearch: (search: Record<string, unknown>): { projectId?: string; q?: string } => ({
    projectId: (search.projectId as string) || undefined,
    q: (search.q as string) || undefined,
  }),
})

function VolumePage() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const { projectId, q } = Route.useSearch()
  const { isAdmin, user, openLoginModal } = useAuth()

  // Fetch projects for selector
  const { data: projectsData } = useQuery({
    ...listProjectsOptions({ query: { per_page: 100 } }),
  })
  const { data: groups = [] } = useQuery({
    ...listGroupsOptions(),
  })
  const projects = projectsData?.data ?? []
  const projectItems = projects.map((p) => ({
    value: p.id,
    label: `${p.name} ${p.section ? `(${p.section})` : ''}`,
  }))

  // Default project selection if not set
  const activeProjectId = projectId || (projects.length > 0 ? projects[0].id : '')
  const activeProject = projects.find((p) => p.id === activeProjectId)

  // Fetch volume rows for active project
  const { data: volumeRows = [], isLoading } = useQuery({
    ...listVolumesOptions({
      path: { id: activeProjectId },
      query: { q: q || undefined },
    }),
    enabled: !!activeProjectId,
  })

  const updateMut = useMutation(updateVolumeMutation())
  const deleteMut = useMutation(deleteVolumeMutation())

  const handleOpenAdd = () => {
    if (!user) {
      openLoginModal()
      return
    }
    if (!activeProjectId) {
      alert('Pilih proyek terlebih dahulu.')
      return
    }
    navigate({
      to: '/volume/new',
      search: { projectId: activeProjectId },
    })
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Hapus baris take-off "${name}"?`)) return
    try {
      await deleteMut.mutateAsync({ path: { id } })
      await queryClient.invalidateQueries()
    } catch (err: any) {
      alert(err?.message || 'Gagal menghapus volume.')
    }
  }

  const handleUpdateGroup = async (id: string, nextGroup: string) => {
    try {
      await updateMut.mutateAsync({ path: { id }, body: { group: nextGroup } })
      await queryClient.invalidateQueries()
    } catch (err: any) {
      alert(err?.message || 'Gagal mengubah grup volume.')
    }
  }

  const groupedRows = volumeRows.reduce<Record<string, typeof volumeRows>>((acc, r) => {
    const key = r.group || '-'
    if (!acc[key]) acc[key] = []
    acc[key].push(r)
    return acc
  }, {})
  const groupKeys = Object.keys(groupedRows)
  const groupItems = groups.map((g) => ({ value: g.code, label: `${g.code} — ${g.name}` }))
  const groupLabel = (key: string) =>
    groupItems.find((g) => g.value === key)?.label || key

  return (
    <div className="flex flex-col gap-4 min-w-0">
      <div className="flex flex-col gap-4">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Volume Take-off
        </h1>
        <div className="flex items-center justify-between gap-4">
          <InputGroup>
            <InputGroupAddon>
              <Search data-icon="inline-start" />
            </InputGroupAddon>
            <InputGroupInput
              placeholder="Cari..."
              value={q || ''}
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
          <Button onClick={handleOpenAdd}>
            <Plus data-icon="inline-start" />
            Tambah Take-off
          </Button>
        </div>
      </div>

      {/* Project Selector & Status Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg border bg-card p-3 shadow-xs">
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-foreground whitespace-nowrap">Proyek:</span>
          <div className="w-72">
            <Select
              items={projectItems}
              value={activeProjectId}
              onValueChange={(val) => {
                if (val) {
                  navigate({
                    search: ((prev: any) => ({ ...prev, projectId: val })) as any,
                    replace: true,
                  })
                }
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih Proyek" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {projectItems.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          {activeProject && (
            <div className="hidden sm:flex items-center gap-2">
              <Badge variant="secondary">
                {activeProject.plant}
              </Badge>
              <Badge variant="outline">
                {activeProject.section}
              </Badge>
            </div>
          )}
        </div>

        {/* Action Export */}
        {activeProjectId && (
          <a
            href={`/api/v1/projects/${activeProjectId}/exports/volume.xlsx`}
            download
            className={buttonVariants({
              variant: 'outline',
              size: 'sm',
              className: 'gap-2 text-xs',
            })}
          >
            <FileSpreadsheet className="size-3.5 text-emerald-600" />
            <span>Ekspor Excel</span>
          </a>
        )}
      </div>

      {/* Table Data Take-off */}
      <div className="rounded-md border bg-card overflow-x-auto shadow-xs">
        <div className="w-max">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>No</TableHead>
              <TableHead>Item Pekerjaan</TableHead>
              <TableHead>Metode / Rumus</TableHead>
              <TableHead>Vol Rencana</TableHead>
              <TableHead>Satuan</TableHead>
              <TableHead>Tanggal</TableHead>
              <TableHead>Dimensi Pengukuran</TableHead>
              <TableHead>Kuantitas</TableHead>
              <TableHead>Satuan / Berat</TableHead>
              <TableHead>Total Kuantitas</TableHead>
              <TableHead>Deskripsi</TableHead>
              {isAdmin && <TableHead>Aksi</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={isAdmin ? 12 : 11}>
                  Memuat data volume take-off...
                </TableCell>
              </TableRow>
            ) : volumeRows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={isAdmin ? 12 : 11}>
                  <Empty>
                    <EmptyHeader>
                      <EmptyTitle>Tidak ada data take-off volume</EmptyTitle>
                      <EmptyDescription>
                        {q ? `Tidak ada data cocok dengan "${q}".` : 'Mulai tambahkan perhitungan volume take-off untuk proyek ini.'}
                      </EmptyDescription>
                    </EmptyHeader>
                  </Empty>
                </TableCell>
              </TableRow>
            ) : (
              groupKeys.flatMap((key) => {
                const rows = groupedRows[key]
                const subtotal = rows.reduce((sum, r) => sum + Number(r.total_quantity), 0)
                return [
                  <Fragment key={key}>
                    <TableRow>
                      <TableCell colSpan={isAdmin ? 12 : 11}>
                        {groupLabel(key)}
                      </TableCell>
                    </TableRow>
                    {rows.map((r, idx) => (
                      <TableRow key={r.id}>
                        <TableCell>{idx + 1}</TableCell>
                        <TableCell>{r.work_item}</TableCell>
                        <TableCell>
                          <FormulaBadge formula={r.formula} />
                        </TableCell>
                        <TableCell>{formatDecimal(r.planned_volume)}</TableCell>
                        <TableCell>{r.unit}</TableCell>
                        <TableCell>{r.date || '-'}</TableCell>
                        <TableCell>
                          {renderDimensions(r)}
                        </TableCell>
                        <TableCell>{formatDecimal(r.quantity)}</TableCell>
                        <TableCell>{formatDecimal(r.unit_weight)}</TableCell>
                        <TableCell>
                          {formatDecimal(r.total_quantity)}
                        </TableCell>
                        <TableCell>{r.description || '-'}</TableCell>
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
                                  <DropdownMenuSub>
                                    <DropdownMenuSubTrigger>
                                      <Tags />
                                      <span>Ubah grup</span>
                                    </DropdownMenuSubTrigger>
                                    <DropdownMenuPortal>
                                      <DropdownMenuSubContent>
                                        <DropdownMenuGroup>
                                          <DropdownMenuRadioGroup
                                            value={r.group || undefined}
                                            onValueChange={(value) => {
                                              if (value && value !== r.group) {
                                                handleUpdateGroup(r.id, value)
                                              }
                                            }}
                                          >
                                            {groupItems.map((g) => (
                                              <DropdownMenuRadioItem
                                                key={g.value}
                                                value={g.value}
                                              >
                                                {g.label}
                                              </DropdownMenuRadioItem>
                                            ))}
                                          </DropdownMenuRadioGroup>
                                        </DropdownMenuGroup>
                                      </DropdownMenuSubContent>
                                    </DropdownMenuPortal>
                                  </DropdownMenuSub>
                                  <DropdownMenuItem
                                    variant="destructive"
                                    onClick={() => handleDelete(r.id, r.work_item)}
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
                    ))}
                    <TableRow>
                      <TableCell colSpan={9}>
                        Total {groupLabel(key)}
                      </TableCell>
                      <TableCell>
                        {formatDecimal(String(subtotal))}
                      </TableCell>
                      <TableCell />
                      {isAdmin && <TableCell />}
                    </TableRow>
                  </Fragment>,
                ]
              })
            )}
          </TableBody>
        </Table>
        </div>
      </div>
    </div>
  )
}
