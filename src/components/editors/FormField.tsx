import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

type Props = Readonly<{
  label: string
  htmlFor?: string
  error?: string
  children: React.ReactNode
  className?: string
}>

export function FormField({ label, htmlFor, error, children, className }: Props) {
  return (
    <div className={cn('space-y-1', className)}>
      <Label htmlFor={htmlFor} className="text-xs text-muted-foreground">
        {label}
      </Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}

type InputProps = React.ComponentProps<'input'> & { error?: boolean }

export function FieldInput({ className, error, ...props }: InputProps) {
  return (
    <input
      className={cn(
        'w-full rounded-md border bg-background px-2 py-1 text-sm transition-colors',
        'focus:outline-none focus:ring-2 focus:ring-ring',
        'aria-invalid:border-destructive aria-invalid:ring-destructive/20',
        error && 'border-destructive',
        className,
      )}
      aria-invalid={error ? 'true' : undefined}
      {...props}
    />
  )
}

type TextareaProps = React.ComponentProps<'textarea'> & { error?: boolean }

export function FieldTextarea({ className, error, ...props }: TextareaProps) {
  return (
    <textarea
      className={cn(
        'w-full resize-y rounded-md border bg-background px-2 py-1 text-sm transition-colors',
        'focus:outline-none focus:ring-2 focus:ring-ring',
        error && 'border-destructive',
        className,
      )}
      aria-invalid={error ? 'true' : undefined}
      rows={3}
      {...props}
    />
  )
}
