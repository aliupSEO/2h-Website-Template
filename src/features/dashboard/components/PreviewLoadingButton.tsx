import { useEffect } from 'react';
import { LoadingScreen } from '@/components/common';
import { Button } from '@/components/ui';
type PreviewLoadingButtonProps = {
    onPreview: () => void;
};
export const PreviewLoadingButton = ({ onPreview }: PreviewLoadingButtonProps) => {
    return (<Button type="button" variant="outline" onClick={onPreview}>
      Preview loading
    </Button>);
};
type DashboardLoadingPreviewProps = {
    onDone: () => void;
};
export const DashboardLoadingPreview = ({ onDone, }: DashboardLoadingPreviewProps) => {
    useEffect(() => {
        const timer = window.setTimeout(onDone, 2500);
        return () => window.clearTimeout(timer);
    }, [onDone]);
    return (<LoadingScreen label="Loading…" size="lg" className="min-h-[calc(100svh-8rem)]"/>);
};
