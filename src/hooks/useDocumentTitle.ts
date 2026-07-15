import { useEffect } from 'react';
import { formatDocumentTitle } from '@/constants/app';
export const useDocumentTitle = (page?: string) => {
    useEffect(() => {
        const previous = document.title;
        document.title = formatDocumentTitle(page);
        return () => {
            document.title = previous;
        };
    }, [page]);
};
