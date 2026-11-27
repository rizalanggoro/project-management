import { useState, useMemo, type ReactNode } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  createAhspMutation,
  updateAhspMutation,
  getAhspOptions,
} from '@/api/@tanstack/react-query.gen'
import type { AhspDetailDto, CreateAhspItemInput, UnitPriceDto } from '@/api/types.gen'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { FieldGroup, Field, FieldLabel } from '@/components/ui/field'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
} from '@/components/ui/empty'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { formatRupiah } from '@/lib/utils'
import { useAuth } from '@/lib/auth'
import { UnitPricePickerDialog } from './unit-price-picker-dialog'
import {
  Plus,
  Trash2,
  Save,
  HardHat,
  Package,
  Wrench,
  Link as LinkIcon,
} from 'lucide-react'

type LocalItem = CreateAhspItemInput & { id: string }
type Category = 'LABOR' | 'MATERIALS' | 'EQUIPMENT'

const statusOptions: { label: string; value: 'draft' | 'final' }[] = [
  { label: 'Draf', value: 'draft' },
  { label: 'Final / Disetujui', value: 'final' },
]

type AhspFormProps = {
  id?: string
}

export function AhspForm({ id }: AhspFormProps) {
  const isEdit = Boolean(id)

  const { data: ahspDetail, isLoading: isLoadingDetail } = useQuery({
    ...getAhspOptions({ path: { id: id! } }),
    enabled: isEdit,
  })

  if (isEdit && isLoadingDetail) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-3">
        <div className="size-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <p className="text-sm text-muted-foreground">Memuat data AHSP...</p>
      </div>
    )
  }

  return <AhspFormContent id={id} initialData={ahspDetail} />
}

function AhspFormContent({ id, initialData }: { id?: string; initialData?: AhspDetailDto }) {
  const isEdit = Boolean(id)
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { user, openLoginModal } = useAuth()

  const [errorMessage, setErrorMessage] = useState('')
  const [pickerCategory, setPickerCategory] = useState<Category | null>(null)

  // Header State
  const [code, setCode] = useState(initialData?.code || '')
  const [workItem, setWorkItem] = useState(initialData?.work_item || '')
  const [unit, setUnit] = useState(initialData?.unit || '')
  const [overheadPct, setOverheadPct] = useState(initialData?.overhead_profit_pct || '10.00')
  const [note, setNote] = useState(initialData?.note || '')
  const [status, setStatus] = useState<'draft' | 'final'>((initialData?.status as any) || 'draft')
  const [items, setItems] = useState<LocalItem[]>(() => {
    if (initialData?.items && initialData.items.length > 0) {
      return initialData.items.map((it) => ({
        id: it.id || crypto.randomUUID(),
        category: (it.category as any) || 'MATERIALS',
        sort: it.sort || 1,
        description: it.description || '',
        code: it.code || '',
        unit: it.unit || '',
        coefficient: it.coefficient || '1.0000',
        unit_price: it.unit_price || '0',
        unit_price_id: it.unit_price_id || undefined,
      }))
    }
    return []
  })

  const createMut = useMutation(createAhspMutation())
  const updateMut = useMutation(updateAhspMutation())
  const isPending = isEdit ? updateMut.isPending : createMut.isPending

  const handleOpenPicker = (category: Category) => {
    setPickerCategory(category)
  }

  const handleAddItemsFromPicker = (selectedUnitPrices: UnitPriceDto[]) => {
    if (!pickerCategory) return

    const newItems: LocalItem[] = selectedUnitPrices.map((p, idx) => ({
      id: crypto.randomUUID(),
      category: pickerCategory,
      sort: items.length + idx + 1,
      description: p.work_item,
      code: p.code,
      unit: p.unit,
      coefficient: '1.0000',
      unit_price: p.unit_price,
      unit_price_id: p.id,
    }))

    setItems((prev) => [...prev, ...newItems])
  }

  const updateCoefficient = (itemId: string, coefficient: string) => {
    setItems((prev) =>
      prev.map((it) => (it.id === itemId ? { ...it, coefficient } : it))
    )
  }

  const removeItem = (itemId: string) => {
    setItems((prev) => prev.filter((it) => it.id !== itemId))
  }

  // Calculations for A, B, C, D, E, F
  const calc = useMemo(() => {
    let labor = 0
    let material = 0
    let equipment = 0

    items.forEach((it) => {
      const coef = parseFloat(it.coefficient || '0')
      const price = parseInt(it.unit_price || '0', 10)
      const cost = Math.round(coef * price)
      if (it.category === 'LABOR') labor += cost
      else if (it.category === 'MATERIALS') material += cost
      else if (it.category === 'EQUIPMENT') equipment += cost
    })

    const d = labor + material + equipment
    const pct = parseFloat(overheadPct || '0')
    const e = Math.round((pct / 100.0) * d)
    const f = d + e

    return { labor, material, equipment, d, e, f }
  }, [items, overheadPct])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage('')

    if (!user) {
      openLoginModal()
      return
    }

    if (!code.trim() || !workItem.trim() || !unit.trim()) {
      setErrorMessage('Kode AHSP, uraian pekerjaan, dan satuan unit wajib diisi.')
      return
    }

    try {
      const payload = {
        code: code.trim(),
        work_item: workItem.trim(),
        unit: unit.trim(),
        overhead_profit_pct: overheadPct,
        status,
        note: note.trim(),
        items: items.map((it, idx) => ({
          unit_price_id: it.unit_price_id || undefined,
          category: it.category,
          sort: idx + 1,
          description: it.description,
          code: it.code,
          unit: it.unit,
          coefficient: it.coefficient,
          unit_price: it.unit_price,
        })),
      }

      if (isEdit && id) {
        await updateMut.mutateAsync({
          path: { id },
          body: payload,
        })
      } else {
        await createMut.mutateAsync({
          body: payload,
        })
      }

      await queryClient.invalidateQueries()
      navigate({ to: '/ahsp' })
    } catch (err: any) {
      setErrorMessage(
        err?.message || (isEdit ? 'Gagal memperbarui data AHSP.' : 'Gagal menyimpan data AHSP baru.')
      )
    }
  }

  const existingUnitPriceIds = useMemo(
    () => items.map((it) => it.unit_price_id).filter(Boolean) as string[],
    [items]
  )

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 pb-16">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          {isEdit ? 'Ubah Analisa Harga Satuan (AHSP)' : 'Tambah AHSP Baru'}
        </h1>
        <p className="text-xs text-muted-foreground">
          {isEdit
            ? `Perbarui rincian item koefisien dan harga untuk ${code || 'AHSP'}`
            : 'Pilih item dari Master Harga Satuan (HSD) lalu tentukan koefisien masing-masing komponen'}
        </p>
      </div>

      {errorMessage && (
        <Alert variant="destructive">
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSave} className="flex flex-col gap-6">
        {/* Section 1: Header AHSP Info */}
        <Card>
          <CardHeader>
            <CardTitle>Informasi Pekerjaan</CardTitle>
            <CardDescription>
              Tentukan kode klasifikasi, uraian pekerjaan, satuan pengukuran, dan catatan spesifikasi.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="ahsp-code">
                  Kode AHSP <span className="text-destructive">*</span>
                </FieldLabel>
                <Input
                  id="ahsp-code"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="mis. AHSP-BETON-01"
                  required
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="ahsp-work-item">
                  Uraian Pekerjaan <span className="text-destructive">*</span>
                </FieldLabel>
                <Input
                  id="ahsp-work-item"
                  value={workItem}
                  onChange={(e) => setWorkItem(e.target.value)}
                  placeholder="mis. Pembuatan 1 m3 Beton Mutu K-225"
                  required
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="ahsp-unit">
                  Satuan <span className="text-destructive">*</span>
                </FieldLabel>
                <Input
                  id="ahsp-unit"
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  placeholder="mis. m3, m2, kg, OH"
                  required
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="ahsp-note">Catatan / Spesifikasi Teknis</FieldLabel>
                <Textarea
                  id="ahsp-note"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Catatan metode kerja, spesifikasi standar, atau referensi SNI..."
                  rows={2}
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="ahsp-status">Status</FieldLabel>
                <Select
                  items={statusOptions}
                  value={status}
                  onValueChange={(value) => {
                    if (value) setStatus(value as 'draft' | 'final')
                  }}
                >
                  <SelectTrigger id="ahsp-status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {statusOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </Field>
            </FieldGroup>
          </CardContent>
        </Card>

        {/* Section 2: Components Table (A, B, C) */}
        <section className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="text-lg font-semibold tracking-tight">
                Rincian Komponen Koefisien & Harga Satuan
              </h2>
              <p className="text-xs text-muted-foreground">
                Item ditautkan langsung dari Master Harga Satuan (HSD). Anda cukup memasukkan koefisien kebutuhan.
              </p>
            </div>
            <Badge variant="outline">
              Total Item: {items.length}
            </Badge>
          </div>

          <div className="flex flex-col gap-6">
            <CategoryCard
              title="Tenaga Kerja (LABOR)"
              icon={<HardHat />}
              category="LABOR"
              items={items}
              total={calc.labor}
              emptyLabel="item tenaga kerja"
              onOpenPicker={handleOpenPicker}
              onUpdateCoefficient={updateCoefficient}
              onRemove={removeItem}
            />
            <CategoryCard
              title="Bahan (MATERIALS)"
              icon={<Package />}
              category="MATERIALS"
              items={items}
              total={calc.material}
              emptyLabel="item bahan"
              onOpenPicker={handleOpenPicker}
              onUpdateCoefficient={updateCoefficient}
              onRemove={removeItem}
            />
            <CategoryCard
              title="Peralatan (EQUIPMENT)"
              icon={<Wrench />}
              category="EQUIPMENT"
              items={items}
              total={calc.equipment}
              emptyLabel="item peralatan"
              onOpenPicker={handleOpenPicker}
              onUpdateCoefficient={updateCoefficient}
              onRemove={removeItem}
            />
          </div>
        </section>

        {/* Section 3: Summary & Overhead */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>
                Total Biaya Langsung
              </CardTitle>
              <CardDescription>Tenaga kerja, bahan, dan peralatan</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-mono text-foreground">
                {formatRupiah(calc.d)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>
                  Biaya Umum & Keuntungan
                </CardTitle>
                <div className="flex items-center gap-1.5">
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={overheadPct}
                    onChange={(e) => setOverheadPct(e.target.value)}
                  />
                  <span className="text-xs font-semibold">%</span>
                </div>
              </div>
              <CardDescription>{overheadPct}% dari biaya langsung</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-mono text-foreground">
                {formatRupiah(calc.e)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>
                Harga Satuan Pekerjaan (AHSP)
              </CardTitle>
              <CardDescription>
                Harga per 1 {unit ? <span className="font-semibold text-foreground">{unit}</span> : 'satuan'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-extrabold font-mono text-primary">
                {formatRupiah(calc.f)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bottom Actions */}
        <div className="flex items-center justify-end gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate({ to: '/ahsp' })}
            disabled={isPending}
          >
            Batal
          </Button>
          <Button type="submit" variant="default" disabled={isPending}>
            <Save data-icon="inline-start" />
            {isPending ? 'Menyimpan...' : isEdit ? 'Simpan Perubahan' : 'Simpan AHSP'}
          </Button>
        </div>
      </form>

      {/* Unit Price Picker Dialog */}
      {pickerCategory && (
        <UnitPricePickerDialog
          open={Boolean(pickerCategory)}
          onOpenChange={(open) => !open && setPickerCategory(null)}
          category={pickerCategory}
          existingUnitPriceIds={existingUnitPriceIds}
          onSelectItems={handleAddItemsFromPicker}
        />
      )}
    </div>
  )
}

function ComponentRow({
  item,
  no,
  onUpdateCoefficient,
  onRemove,
}: {
  item: LocalItem
  no: number
  onUpdateCoefficient: (id: string, coef: string) => void
  onRemove: (id: string) => void
}) {
  const coef = parseFloat(item.coefficient || '0')
  const price = parseInt(item.unit_price || '0', 10)
  const cost = Math.round(coef * price)

  return (
    <TableRow>
      <TableCell>{no}</TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <span title="Terhubung ke Master Harga Satuan">
            <LinkIcon className="size-3.5 text-primary shrink-0" />
          </span>
          <span className="font-medium text-foreground">{item.description}</span>
        </div>
      </TableCell>
      <TableCell>
        {item.code || '-'}
      </TableCell>
      <TableCell>
        {item.unit}
      </TableCell>
      <TableCell>
        <Input
          type="number"
          step="any"
          value={item.coefficient}
          onChange={(e) => onUpdateCoefficient(item.id, e.target.value)}
          placeholder="0.0000"
          required
        />
      </TableCell>
      <TableCell>
        {formatRupiah(item.unit_price)}
      </TableCell>
      <TableCell>
        {formatRupiah(cost)}
      </TableCell>
      <TableCell>
        <Button
          type="button"
          variant="ghost"
          onClick={() => onRemove(item.id)}
          title="Hapus baris"
        >
          <Trash2 />
        </Button>
      </TableCell>
    </TableRow>
  )
}

function CategoryCard({
  title,
  icon,
  category,
  items,
  total,
  emptyLabel,
  onOpenPicker,
  onUpdateCoefficient,
  onRemove,
}: {
  title: string
  icon: ReactNode
  category: Category
  items: LocalItem[]
  total: number
  emptyLabel: string
  onOpenPicker: (category: Category) => void
  onUpdateCoefficient: (id: string, coef: string) => void
  onRemove: (id: string) => void
}) {
  const categoryItems = items.filter((it) => it.category === category)

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <Button type="button" variant="outline" onClick={() => onOpenPicker(category)}>
          <Plus data-icon="inline-start" />
          Pilih dari HSD
        </Button>
      </CardHeader>
      <CardContent>
        <div className="rounded-lg border bg-card overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>No</TableHead>
                <TableHead>Uraian Item (Terhubung ke Master HSD)</TableHead>
                <TableHead>Kode</TableHead>
                <TableHead>Satuan</TableHead>
                <TableHead>Koefisien</TableHead>
                <TableHead>Harga Satuan (Rp)</TableHead>
                <TableHead>Jumlah Biaya (Rp)</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categoryItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8}>
                    <Empty>
                      <EmptyHeader>
                        <EmptyMedia variant="icon">{icon}</EmptyMedia>
                        <EmptyTitle>Belum ada {emptyLabel}</EmptyTitle>
                        <EmptyDescription>
                          Pilih item dari Master Harga Satuan (HSD) untuk menambahkan komponen biaya.
                        </EmptyDescription>
                      </EmptyHeader>
                      <EmptyContent>
                        <Button type="button" variant="outline" onClick={() => onOpenPicker(category)}>
                          <Plus data-icon="inline-start" />
                          Pilih dari Master Harga Satuan
                        </Button>
                      </EmptyContent>
                    </Empty>
                  </TableCell>
                </TableRow>
              ) : (
                categoryItems.map((item, idx) => (
                  <ComponentRow
                    key={item.id}
                    item={item}
                    no={idx + 1}
                    onUpdateCoefficient={onUpdateCoefficient}
                    onRemove={onRemove}
                  />
                ))
              )}
              <TableRow>
                <TableCell colSpan={6}>
                  Jumlah {title}:
                </TableCell>
                <TableCell>
                  {formatRupiah(total)}
                </TableCell>
                <TableCell />
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
