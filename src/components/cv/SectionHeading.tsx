type Props = Readonly<{ title: string; className?: string }>

export function SectionHeading({ title, className }: Props) {
  return (
    <h2 className={className ?? 'mb-2 text-xs font-bold uppercase tracking-widest text-foreground'}>
      {title}
    </h2>
  )
}
