type PagePlaceholderProps = {
  title: string
  description?: string
}

export function PagePlaceholder({
  title,
  description = 'This page is empty for now.',
}: PagePlaceholderProps) {
  return (
    <div className="space-y-2">
      <h1 className="font-heading text-2xl font-semibold tracking-tight">
        {title}
      </h1>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  )
}
