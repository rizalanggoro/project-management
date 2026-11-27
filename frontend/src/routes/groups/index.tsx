import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  listGroupsOptions,
  createGroupMutation,
  updateGroupMutation,
  deleteGroupMutation,
} from '@/api/@tanstack/react-query.gen'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { FieldGroup, Field, FieldLabel } from '@/components/ui/field'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Empty, EmptyHeader, EmptyTitle } from '@/components/ui/empty'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useAuth } from '@/lib/auth'
import { EllipsisVertical, Pencil, Plus, Trash2 } from 'lucide-react'

export const Route = createFileRoute('/groups/')({
  component: GroupsPage,
})

function GroupsPage() {
  const queryClient = useQueryClient()
  const { isAdmin } = useAuth()

  const [isOpen, setIsOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [code, setCode] = useState('')
  const [name, setName] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  const { data: groups = [], isLoading } = useQuery({
    ...listGroupsOptions(),
  })

  const createMut = useMutation(createGroupMutation())
  const updateMut = useMutation(updateGroupMutation())
  const deleteMut = useMutation(deleteGroupMutation())

  const openAdd = () => {
    setEditingId(null)
    setCode('')
    setName('')
    setErrorMessage('')
    setIsOpen(true)
  }

  const openEdit = (group: { id: string; code: string; name: string }) => {
    setEditingId(group.id)
    setCode(group.code)
    setName(group.name)
    setErrorMessage('')
    setIsOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage('')
    try {
      if (editingId) {
        await updateMut.mutateAsync({ path: { id: editingId }, body: { code, name } })
      } else {
        await createMut.mutateAsync({ body: { code, name } })
      }
      await queryClient.invalidateQueries()
      setIsOpen(false)
    } catch (err: any) {
      setErrorMessage(err?.message || 'Gagal menyimpan grup.')
    }
  }

  const handleDelete = async (id: string, groupCode: string) => {
    if (!confirm(`Hapus grup ${groupCode}?`)) return
    try {
      await deleteMut.mutateAsync({ path: { id } })
      await queryClient.invalidateQueries()
    } catch (err: any) {
      alert(err?.message || 'Gagal menghapus grup.')
    }
  }

  return (
    <div className="flex flex-col gap-4 min-w-0">
      <div className="flex flex-col gap-4">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Grup Pekerjaan
        </h1>
        <div className="flex items-center justify-end gap-4">
          {isAdmin && (
            <Button onClick={openAdd}>
              <Plus data-icon="inline-start" />
              Grup
            </Button>
          )}
        </div>
      </div>

      <div className="rounded-md border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>No</TableHead>
              <TableHead>Kode</TableHead>
              <TableHead>Nama Grup</TableHead>
              {isAdmin && <TableHead>Aksi</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={isAdmin ? 4 : 3}>
                  Memuat data...
                </TableCell>
              </TableRow>
            ) : groups.length === 0 ? (
              <TableRow>
                <TableCell colSpan={isAdmin ? 4 : 3}>
                  <Empty>
                    <EmptyHeader>
                      <EmptyTitle>Belum ada grup pekerjaan</EmptyTitle>
                    </EmptyHeader>
                  </Empty>
                </TableCell>
              </TableRow>
            ) : (
              groups.map((g, idx) => (
                <TableRow key={g.id}>
                  <TableCell>{idx + 1}</TableCell>
                  <TableCell>{g.code}</TableCell>
                  <TableCell>{g.name}</TableCell>
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
                            <DropdownMenuItem onClick={() => openEdit(g)}>
                              <Pencil />
                              <span>Ubah</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              variant="destructive"
                              onClick={() => handleDelete(g.id, g.code)}
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

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingId ? 'Ubah Grup' : 'Tambah Grup'}</DialogTitle>
            <DialogDescription>Atur kode dan nama grup pekerjaan.</DialogDescription>
          </DialogHeader>
          {errorMessage && (
            <Alert variant="destructive">
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          )}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="group-code">Kode</FieldLabel>
                <Input
                  id="group-code"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="C"
                  required
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="group-name">Nama Grup</FieldLabel>
                <Input
                  id="group-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Pekerjaan Finishing"
                  required
                />
              </Field>
            </FieldGroup>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Batal</Button>
              <Button type="submit">Simpan</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
