import { useState } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  listProjectsOptions,
  listSchedulesOptions,
  createScheduleMutation,
  deleteScheduleMutation,
} from '@/api/@tanstack/react-query.gen'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'
import { Input } from '@/components/ui/input'
import { FieldGroup, Field, FieldLabel } from '@/components/ui/field'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription } from '@/components/ui/empty'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useAuth } from '@/lib/auth'
import { EllipsisVertical, Plus, Search, Trash2 } from 'lucide-react'

export const Route = createFileRoute('/schedule/')({
  component: SchedulePage,
  validateSearch: (search: Record<string, unknown>): { projectId?: string; q?: string } => ({
    projectId: (search.projectId as string) || undefined,
    q: (search.q as string) || undefined,
  }),
})

const statusLabels: Record<string, string> = {
  planning: 'Perencanaan',
  on_going: 'Sedang Berjalan',
  done: 'Selesai',
  late: 'Terlambat',
}

function SchedulePage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { projectId, q } = Route.useSearch()
  const { isAdmin, user, openLoginModal } = useAuth()

  const [isAddOpen, setIsAddOpen] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  // Form state
  const [code, setCode] = useState('')
  const [workItem, setWorkItem] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [weight, setWeight] = useState('0')
  const [progress, setProgress] = useState('0')
  const [status, setStatus] = useState<'planning' | 'on_going' | 'done' | 'late'>('planning')

  const { data: projectsData } = useQuery({
    ...listProjectsOptions({ query: { per_page: 100 } }),
  })
  const projects = projectsData?.data ?? []
  const projectItems = projects.map((p) => ({
    value: p.id,
    label: `${p.name} ${p.section ? `(${p.section})` : ''}`,
  }))
  const activeProjectId = projectId || (projects.length > 0 ? projects[0].id : '')

  const { data: schedules = [], isLoading } = useQuery({
    ...listSchedulesOptions({ path: { id: activeProjectId } }),
    enabled: !!activeProjectId,
  })

  const createMut = useMutation(createScheduleMutation())
  const deleteMut = useMutation(deleteScheduleMutation())

  const handleOpenAdd = () => {
    if (!user) {
      openLoginModal()
      return
    }
    if (!activeProjectId) {
      alert('Pilih proyek terlebih dahulu.')
      return
    }
    setCode('')
    setWorkItem('')
    setStartDate(new Date().toISOString().slice(0, 10))
    setEndDate(new Date().toISOString().slice(0, 10))
    setWeight('0')
    setProgress('0')
    setStatus('planning')
    setErrorMessage('')
    setIsAddOpen(true)
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage('')
    if (!workItem.trim() || !startDate || !endDate) {
      setErrorMessage('Item pekerjaan, tanggal mulai, dan tanggal selesai wajib diisi.')
      return
    }

    try {
      await createMut.mutateAsync({
        path: { id: activeProjectId },
        body: {
          code: code.trim(),
          work_item: workItem.trim(),
          start_date: startDate,
          end_date: endDate,
          weight,
          progress,
          status,
        },
      })
      await queryClient.invalidateQueries()
      setIsAddOpen(false)
    } catch (err: any) {
      setErrorMessage(err?.message || 'Gagal menyimpan jadwal.')
    }
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Hapus jadwal "${name}"?`)) return
    try {
      await deleteMut.mutateAsync({ path: { id } })
      await queryClient.invalidateQueries()
    } catch (err: any) {
      alert(err?.message || 'Gagal menghapus jadwal.')
    }
  }

  const searchQuery = (q || '').toLowerCase()
  const filtered = schedules.filter(
    (s) =>
      s.work_item.toLowerCase().includes(searchQuery) ||
      (s.code ? s.code.toLowerCase().includes(searchQuery) : false)
  )

  const getStatusBadgeVariant = (st: string) => {
    switch (st) {
      case 'done':
        return 'default'
      case 'on_going':
        return 'secondary'
      case 'late':
        return 'destructive'
      default:
        return 'outline'
    }
  }

  return (
    <div className="flex flex-col gap-4 min-w-0">
      <div className="flex flex-col gap-4">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Jadwal
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
            Jadwal
          </Button>
        </div>
      </div>

      {/* Project Selector Bar */}
      <div className="flex items-center gap-4 rounded-lg border bg-card p-3">
        <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">Proyek:</span>
        <div className="w-80">
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
                {projectItems.map((p) => (
                  <SelectItem key={p.value} value={p.value}>
                    {p.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="rounded-md border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>No</TableHead>
              <TableHead>Kode</TableHead>
              <TableHead>Item Pekerjaan</TableHead>
              <TableHead>Tanggal Mulai</TableHead>
              <TableHead>Tanggal Selesai</TableHead>
              <TableHead>Durasi</TableHead>
              <TableHead>Bobot (%)</TableHead>
              <TableHead>Progres (%)</TableHead>
              <TableHead>Status</TableHead>
              {isAdmin && <TableHead>Aksi</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={isAdmin ? 10 : 9}>
                  Memuat data...
                </TableCell>
              </TableRow>
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={isAdmin ? 10 : 9}>
                  <Empty>
                    <EmptyHeader>
                      <EmptyTitle>Belum ada jadwal pekerjaan</EmptyTitle>
                      <EmptyDescription>
                        {q ? `Tidak ada item cocok dengan "${q}".` : 'Tambahkan tahapan jadwal baru untuk proyek ini.'}
                      </EmptyDescription>
                    </EmptyHeader>
                  </Empty>
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((s, idx) => (
                <TableRow key={s.id}>
                  <TableCell>{idx + 1}</TableCell>
                  <TableCell>{s.code || '-'}</TableCell>
                  <TableCell>{s.work_item}</TableCell>
                  <TableCell>{s.start_date}</TableCell>
                  <TableCell>{s.end_date}</TableCell>
                  <TableCell>{s.duration} hari</TableCell>
                  <TableCell>{s.weight}%</TableCell>
                  <TableCell>{s.progress}%</TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(s.status)}>
                      {statusLabels[s.status] ?? s.status}
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
                            <DropdownMenuItem
                              variant="destructive"
                              onClick={() => handleDelete(s.id, s.work_item)}
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

      {/* Modal Add Schedule */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tambah Item Jadwal</DialogTitle>
            <DialogDescription>Tambahkan jadwal tahapan pekerjaan proyek.</DialogDescription>
          </DialogHeader>

          {errorMessage && (
            <Alert variant="destructive">
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleCreate} className="flex flex-col gap-4">
            <FieldGroup>
              <div className="grid grid-cols-3 gap-3">
                <Field>
                  <FieldLabel htmlFor="sch-code">Kode</FieldLabel>
                  <Input
                    id="sch-code"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="W-01"
                  />
                </Field>
                <div className="col-span-2">
                  <Field>
                    <FieldLabel htmlFor="sch-workitem">Item Pekerjaan</FieldLabel>
                    <Input
                      id="sch-workitem"
                      value={workItem}
                      onChange={(e) => setWorkItem(e.target.value)}
                      placeholder="Nama Tahapan..."
                      required
                    />
                  </Field>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Field>
                  <FieldLabel htmlFor="sch-start">Tanggal Mulai</FieldLabel>
                  <Input
                    id="sch-start"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    required
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="sch-end">Tanggal Selesai</FieldLabel>
                  <Input
                    id="sch-end"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    required
                  />
                </Field>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <Field>
                  <FieldLabel htmlFor="sch-weight">Bobot (%)</FieldLabel>
                  <Input
                    id="sch-weight"
                    type="number"
                    step="0.01"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="sch-prog">Progres (%)</FieldLabel>
                  <Input
                    id="sch-prog"
                    type="number"
                    step="0.01"
                    value={progress}
                    onChange={(e) => setProgress(e.target.value)}
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="sch-status">Status</FieldLabel>
                  <Select
                    items={[
                      { value: 'planning', label: 'Perencanaan' },
                      { value: 'on_going', label: 'Sedang Berjalan' },
                      { value: 'done', label: 'Selesai' },
                      { value: 'late', label: 'Terlambat' },
                    ]}
                    value={status}
                    onValueChange={(val) => setStatus(val as any)}
                  >
                    <SelectTrigger id="sch-status">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="planning">Perencanaan</SelectItem>
                        <SelectItem value="on_going">Sedang Berjalan</SelectItem>
                        <SelectItem value="done">Selesai</SelectItem>
                        <SelectItem value="late">Terlambat</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </Field>
              </div>
            </FieldGroup>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)}>
                Batal
              </Button>
              <Button type="submit" disabled={createMut.isPending}>
                {createMut.isPending ? 'Menyimpan...' : 'Simpan'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
