/** Product name for tab titles and brand chrome. */
export const APP_NAME = '2H Central Hub' as const;
export const formatDocumentTitle = (page?: string) => {
    const label = page?.trim();
    return label ? `${label} · ${APP_NAME}` : APP_NAME;
};
