import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { getAhspOptions } from '@/api/@tanstack/react-query.gen'
import { AhspDetail } from '@/components/ahsp'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import { useAuth } from '@/lib/auth'
import { Pencil } from 'lucide-react'

export const Route = createFileRoute('/ahsp/$id/')({
  component: AhspDetailPage,
})

function AhspDetailPage() {
  const { id } = Route.useParams()
  const navigate = useNavigate()
  const { isAdmin } = useAuth()

  const { data: ahsp, isLoading, isError } = useQuery({
    ...getAhspOptions({ path: { id } }),
  })

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 pb-16">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Detail AHSP
          </h1>
          <p className="text-xs text-muted-foreground">{ahsp?.work_item}</p>
        </div>
        {isAdmin && (
          <Button
            onClick={() => navigate({ to: '/ahsp/$id/edit', params: { id } })}
          >
            <Pencil data-icon="inline-start" />
            Ubah
          </Button>
        )}
      </div>

      {isLoading && (
        <div className="flex flex-col gap-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      )}

      {isError && (
        <Alert variant="destructive">
          <AlertDescription>Gagal memuat detail AHSP.</AlertDescription>
        </Alert>
      )}

      {ahsp && <AhspDetail ahsp={ahsp} />}
    </div>
  )
}
