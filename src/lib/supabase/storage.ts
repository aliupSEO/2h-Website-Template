export const HUB_PLUGINS_BUCKET = 'hub-plugins';
export const AVATARS_BUCKET = 'avatars';

export const buildPluginStoragePath = (pluginId: string, fileName: string) => {
    const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
    return `${pluginId}/${safeName}`;
};

export const buildAvatarStoragePath = (userId: string, fileName: string) => {
    const ext = fileName.includes('.')
        ? fileName.slice(fileName.lastIndexOf('.')).toLowerCase()
        : '.jpg';
    const safeExt = ext.replace(/[^a-z0-9.]/g, '') || '.jpg';
    return `${userId}/avatar${safeExt}`;
};
