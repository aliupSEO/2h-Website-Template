import { DocumentTitle } from '@/components/common/DocumentTitle';
type PagePlaceholderProps = {
    title: string;
    description?: string;
    /** Browser tab label; defaults to `title`. */
    documentTitle?: string;
};
export const PagePlaceholder = ({ title, description = 'This page is empty for now.', documentTitle, }: PagePlaceholderProps) => {
    return (<div className="space-y-2">
      <DocumentTitle title={documentTitle ?? title}/>
      <h1 className="font-heading text-2xl font-semibold tracking-tight">
        {title}
      </h1>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>);
};
