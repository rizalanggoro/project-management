import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  listGroupsOptions,
  createGroupMutation,
  updateGroupMutation,
  deleteGroupMutation,
} from '@/api/@tanstack/react-query.gen'
import { PageHeader } from '@/components/page-header'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { FieldGroup, Field, FieldLabel } from '@/components/ui/field'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Empty, EmptyHeader, EmptyTitle } from '@/components/ui/empty'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/lib/auth'

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
      <PageHeader title="Grup Pekerjaan" onAdd={isAdmin ? openAdd : undefined} addLabel="Grup" />

      <div className="rounded-md border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12 text-center">No</TableHead>
              <TableHead className="w-32">Code</TableHead>
              <TableHead>Nama Grup</TableHead>
              {isAdmin && <TableHead className="w-32 text-center">Action</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={isAdmin ? 4 : 3} className="h-32 text-center text-muted-foreground">
                  Memuat data...
                </TableCell>
              </TableRow>
            ) : groups.length === 0 ? (
              <TableRow>
                <TableCell colSpan={isAdmin ? 4 : 3} className="h-48 text-center">
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
                  <TableCell className="text-center text-muted-foreground">{idx + 1}</TableCell>
                  <TableCell className="font-mono font-semibold">{g.code}</TableCell>
                  <TableCell className="font-medium">{g.name}</TableCell>
                  {isAdmin && (
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Badge variant="outline" className="font-mono">{g.code}</Badge>
                        <Button size="sm" variant="ghost" onClick={() => openEdit(g)}>Ubah</Button>
                        <Button size="sm" variant="ghost" onClick={() => handleDelete(g.id, g.code)}>Hapus</Button>
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
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
                <FieldLabel htmlFor="group-code">Code</FieldLabel>
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
