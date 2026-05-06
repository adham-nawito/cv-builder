import type { CV } from '@/schemas/cv'
import { MinimalTemplate } from './templates/MinimalTemplate'
import { ModernTemplate } from './templates/ModernTemplate'
import { CompactTemplate } from './templates/CompactTemplate'

type Props = Readonly<{ cv: CV }>

export function CVRenderer({ cv }: Props) {
  switch (cv.template) {
    case 'modern':
      return <ModernTemplate cv={cv} />
    case 'compact':
      return <CompactTemplate cv={cv} />
    case 'minimal':
    default:
      return <MinimalTemplate cv={cv} />
  }
}
