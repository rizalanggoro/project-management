import { Badge } from '@/components/ui/badge'

interface FormulaBadgeProps {
  formula?: string
}

export function FormulaBadge({ formula }: FormulaBadgeProps) {
  switch (formula) {
    case 'cylinder':
      return (
        <Badge variant="outline">
          Silinder (D² × T)
        </Badge>
      )
    case 'area_circle':
      return (
        <Badge variant="outline">
          Lingkaran (¼πD²)
        </Badge>
      )
    case 'area_pl':
      return (
        <Badge variant="outline">
          Luas (P × L)
        </Badge>
      )
    case 'area_pt':
      return (
        <Badge variant="outline">
          Dinding (P × T)
        </Badge>
      )
    case 'area_lt':
      return (
        <Badge variant="outline">
          Samping (L × T)
        </Badge>
      )
    case 'linear_p':
    case 'linear_t':
      return (
        <Badge variant="outline">
          Meter Lari (m')
        </Badge>
      )
    case 'weight_rebar':
      return (
        <Badge variant="outline">
          Besi (P × BJ)
        </Badge>
      )
    case 'unit_only':
      return (
        <Badge variant="outline">
          Satuan / Lot
        </Badge>
      )
    case 'box':
      return (
        <Badge variant="outline">
          Balok (P × L × T)
        </Badge>
      )
    default:
      return <Badge variant="secondary">Standar</Badge>
  }
}

