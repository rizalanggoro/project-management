import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  listAhspsOptions,
  deleteAhspMutation,
} from '@/api/@tanstack/react-query.gen'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription } from '@/components/ui/empty'
import { formatRupiah } from '@/lib/utils'
import { useAuth } from '@/lib/auth'
import { MoreHorizontal, Pencil, Plus, Search, Trash2 } from 'lucide-react'

export const Route = createFileRoute('/ahsp/')({
  component: AhspPage,
  validateSearch: (search: Record<string, unknown>): { q?: string } => ({
    q: (search.q as string) || undefined,
  }),
})

function AhspPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { q } = Route.useSearch()
  const { isAdmin, user, openLoginModal } = useAuth()

  const { data: ahsps = [], isLoading } = useQuery({
    ...listAhspsOptions({ query: { q: q || undefined } }),
  })

  const deleteMut = useMutation(deleteAhspMutation())

  const handleOpenAdd = () => {
    if (!user) {
      openLoginModal()
      return
    }
    navigate({ to: '/ahsp/new' })
  }

  const handleDelete = async (id: string, code: string) => {
    if (!confirm(`Hapus AHSP ${code}?`)) return
    try {
      await deleteMut.mutateAsync({ path: { id } })
      await queryClient.invalidateQueries()
    } catch (err: any) {
      alert(err?.message || 'Gagal menghapus AHSP.')
    }
  }

  return (
    <div className="flex flex-col gap-4 min-w-0">
      <div className="flex flex-col gap-4">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          AHSP
        </h1>
        <div className="flex items-center justify-between gap-4">
          <InputGroup className="w-64">
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
            AHSP
          </Button>
        </div>
      </div>

      <div className="rounded-md border bg-card overflow-hidden">
        <Table className="min-w-[700px]">
          <TableHeader>
            <TableRow>
              <TableHead className="w-12 text-center">No</TableHead>
              <TableHead className="w-36">Kode</TableHead>
              <TableHead>Item Pekerjaan</TableHead>
              <TableHead className="w-24 text-center">Satuan</TableHead>
              <TableHead className="w-40 text-right">Harga Satuan</TableHead>
              <TableHead>Catatan</TableHead>
              {isAdmin && <TableHead className="w-20 text-center">Aksi</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={isAdmin ? 7 : 6} className="h-32 text-center text-muted-foreground">
                  Memuat data...
                </TableCell>
              </TableRow>
            ) : ahsps.length === 0 ? (
              <TableRow>
                <TableCell colSpan={isAdmin ? 7 : 6} className="h-48 text-center">
                  <Empty>
                    <EmptyHeader>
                      <EmptyTitle>Belum ada data AHSP</EmptyTitle>
                      <EmptyDescription>
                        {q ? `Tidak ada AHSP yang cocok dengan "${q}".` : 'Mulai menyusun analisa harga satuan pekerjaan baru.'}
                      </EmptyDescription>
                    </EmptyHeader>
                  </Empty>
                </TableCell>
              </TableRow>
            ) : (
              ahsps.map((a, idx) => (
                <TableRow
                  key={a.id}
                  className="cursor-pointer hover:bg-muted/50"
                  tabIndex={0}
                  onClick={() => navigate({ to: '/ahsp/$id', params: { id: a.id } })}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      navigate({ to: '/ahsp/$id', params: { id: a.id } })
                    }
                  }}
                >
                  <TableCell className="text-center text-muted-foreground">{idx + 1}</TableCell>
                  <TableCell className="font-mono text-xs font-semibold">{a.code}</TableCell>
                  <TableCell className="font-medium text-foreground">{a.work_item}</TableCell>
                  <TableCell className="text-center">{a.unit}</TableCell>
                  <TableCell className="text-right font-medium text-foreground">
                    {formatRupiah(a.unit_price_of_work)}
                  </TableCell>
                  <TableCell className="text-muted-foreground">{a.note || '-'}</TableCell>
                  {isAdmin && (
                    <TableCell
                      className="text-center"
                      onClick={(e) => e.stopPropagation()}
                      onKeyDown={(e) => e.stopPropagation()}
                    >
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          render={
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-8 text-muted-foreground hover:text-foreground"
                            />
                          }
                        >
                          <MoreHorizontal className="size-4" />
                          <span className="sr-only">Menu</span>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-32">
                          <DropdownMenuItem
                            onClick={() =>
                              navigate({
                                to: '/ahsp/$id/edit',
                                params: { id: a.id },
                              })
                            }
                          >
                            <Pencil className="size-4 mr-2" />
                            <span>Ubah</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            variant="destructive"
                            onClick={() => handleDelete(a.id, a.code)}
                          >
                            <Trash2 className="size-4 mr-2" />
                            <span>Hapus</span>
                          </DropdownMenuItem>
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
    </div>
  )
}
