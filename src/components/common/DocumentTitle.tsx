import { useDocumentTitle } from '@/hooks';
type DocumentTitleProps = {
    title: string;
};
export const DocumentTitle = ({ title }: DocumentTitleProps) => {
    useDocumentTitle(title);
    return null;
};
