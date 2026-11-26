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
  { label: 'Draft', value: 'draft' },
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
          {isEdit ? 'Edit Analisa Harga Satuan (AHSP)' : 'Tambah AHSP Baru'}
        </h1>
        <p className="text-xs text-muted-foreground">
          {isEdit
            ? `Perbarui rincian item koefisien dan harga untuk ${code || 'AHSP'}`
            : 'Pilih item dari Master Unit Price (HSD) lalu tentukan koefisien masing-masing komponen'}
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
            <CardTitle>Informasi Pekerjaan (Header)</CardTitle>
            <CardDescription>
              Tentukan kode klasifikasi, uraian pekerjaan, satuan pengukuran, dan catatan spesifikasi.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FieldGroup className="flex flex-col gap-4">
              <Field>
                <FieldLabel htmlFor="ahsp-code">
                  Kode AHSP <span className="text-destructive">*</span>
                </FieldLabel>
                <Input
                  id="ahsp-code"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="e.g. AHSP-BETON-01"
                  className="font-mono bg-card"
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
                  placeholder="e.g. Pembuatan 1 m3 Beton Mutu K-225"
                  className="bg-card"
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
                  placeholder="e.g. m3, m2, kg, OH"
                  className="bg-card"
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
                  className="bg-card"
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
                Item ditautkan langsung dari Master Unit Price (HSD). Anda cukup memasukkan koefisien kebutuhan.
              </p>
            </div>
            <Badge variant="outline" className="gap-1 font-mono text-xs">
              Total Items: {items.length}
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
          <Card className="md:col-span-1 border-muted">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-muted-foreground">
                Total Biaya Langsung
              </CardTitle>
              <CardDescription className="text-xs">Tenaga kerja, bahan, dan peralatan</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-mono text-foreground">
                {formatRupiah(calc.d)}
              </div>
            </CardContent>
          </Card>

          <Card className="md:col-span-1 border-muted">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold text-muted-foreground">
                  Overhead & Keuntungan
                </CardTitle>
                <div className="flex items-center gap-1.5">
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={overheadPct}
                    onChange={(e) => setOverheadPct(e.target.value)}
                    className="h-7 w-16 text-center font-bold text-xs bg-card"
                  />
                  <span className="text-xs font-semibold">%</span>
                </div>
              </div>
              <CardDescription className="text-xs">{overheadPct}% dari biaya langsung</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-mono text-foreground">
                {formatRupiah(calc.e)}
              </div>
            </CardContent>
          </Card>

          <Card className="md:col-span-1 border-primary/40 bg-primary/5">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold text-primary">
                Harga Satuan Pekerjaan (AHSP)
              </CardTitle>
              <CardDescription className="text-xs">
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
    <TableRow className="text-xs hover:bg-muted/30">
      <TableCell className="text-center text-muted-foreground font-mono">{no}</TableCell>
      <TableCell className="p-2">
        <div className="flex items-center gap-2">
          <span title="Terhubung ke Master Unit Price">
            <LinkIcon className="size-3.5 text-primary shrink-0" />
          </span>
          <span className="font-medium text-foreground">{item.description}</span>
        </div>
      </TableCell>
      <TableCell className="p-2 font-mono text-xs text-muted-foreground">
        {item.code || '-'}
      </TableCell>
      <TableCell className="p-2 text-center font-mono text-xs text-foreground">
        {item.unit}
      </TableCell>
      <TableCell className="p-2 text-right">
        <Input
          type="number"
          step="any"
          value={item.coefficient}
          onChange={(e) => onUpdateCoefficient(item.id, e.target.value)}
          placeholder="0.0000"
          className="h-8 text-xs text-right font-mono bg-card w-28 ml-auto"
          required
        />
      </TableCell>
      <TableCell className="p-2 text-right font-mono text-xs text-muted-foreground">
        {formatRupiah(item.unit_price)}
      </TableCell>
      <TableCell className="text-right font-mono font-semibold text-foreground p-2">
        {formatRupiah(cost)}
      </TableCell>
      <TableCell className="p-2 text-center">
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
      <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2 pb-3">
        <CardTitle className="text-base">{title}</CardTitle>
        <Button type="button" variant="outline" onClick={() => onOpenPicker(category)}>
          <Plus data-icon="inline-start" />
          Pilih dari HSD
        </Button>
      </CardHeader>
      <CardContent className="p-0 sm:p-4">
        <div className="rounded-lg border bg-card overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="w-12 text-center">No</TableHead>
                <TableHead className="min-w-[280px]">Uraian Item (Terhubung ke Master HSD)</TableHead>
                <TableHead className="w-32">Kode</TableHead>
                <TableHead className="w-20 text-center">Satuan</TableHead>
                <TableHead className="w-36 text-right">Koefisien</TableHead>
                <TableHead className="w-36 text-right">Harga Satuan (Rp)</TableHead>
                <TableHead className="w-36 text-right">Jumlah Biaya (Rp)</TableHead>
                <TableHead className="w-12 text-center"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categoryItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="p-0">
                    <Empty>
                      <EmptyHeader>
                        <EmptyMedia variant="icon">{icon}</EmptyMedia>
                        <EmptyTitle>Belum ada {emptyLabel}</EmptyTitle>
                        <EmptyDescription>
                          Pilih item dari Master Unit Price (HSD) untuk menambahkan komponen biaya.
                        </EmptyDescription>
                      </EmptyHeader>
                      <EmptyContent>
                        <Button type="button" variant="outline" onClick={() => onOpenPicker(category)}>
                          <Plus data-icon="inline-start" />
                          Pilih dari Master Unit Price
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
              <TableRow className="border-t bg-muted/20 font-medium text-xs">
                <TableCell colSpan={6} className="text-right font-semibold text-muted-foreground">
                  Jumlah {title}:
                </TableCell>
                <TableCell className="text-right font-bold text-foreground">
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
