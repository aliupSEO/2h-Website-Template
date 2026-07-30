export const HUB_PLUGINS_BUCKET = 'hub-plugins';

export const buildPluginStoragePath = (pluginId: string, fileName: string) => {
    const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
    return `${pluginId}/${safeName}`;
};
