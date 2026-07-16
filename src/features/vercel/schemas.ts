import { z } from 'zod';

const projectName = z
    .string()
    .min(1, 'Project name is required')
    .max(100, 'Project name is too long')
    .regex(
        /^[a-zA-Z0-9][a-zA-Z0-9._-]*$/,
        'Use letters, numbers, dots, hyphens, and underscores',
    );

/** Vercel create-project `framework` enum (API), plus auto-detect. */
export const VERCEL_FRAMEWORKS = [
    { value: 'auto', label: 'Auto-detect' },
    { value: 'nextjs', label: 'Next.js' },
    { value: 'vite', label: 'Vite' },
    { value: 'create-react-app', label: 'Create React App' },
    { value: 'remix', label: 'Remix' },
    { value: 'react-router', label: 'React Router' },
    { value: 'astro', label: 'Astro' },
    { value: 'gatsby', label: 'Gatsby' },
    { value: 'nuxtjs', label: 'Nuxt.js' },
    { value: 'vue', label: 'Vue' },
    { value: 'svelte', label: 'Svelte' },
    { value: 'sveltekit', label: 'SvelteKit' },
    { value: 'sveltekit-1', label: 'SvelteKit 1' },
    { value: 'solidstart', label: 'SolidStart' },
    { value: 'solidstart-1', label: 'SolidStart 1' },
    { value: 'angular', label: 'Angular' },
    { value: 'ionic-angular', label: 'Ionic Angular' },
    { value: 'ionic-react', label: 'Ionic React' },
    { value: 'blitzjs', label: 'Blitz.js' },
    { value: 'hydrogen', label: 'Hydrogen' },
    { value: 'redwoodjs', label: 'RedwoodJS' },
    { value: 'tanstack-start', label: 'TanStack Start' },
    { value: 'tanstack-start-lovable', label: 'TanStack Start (Lovable)' },
    { value: 'preact', label: 'Preact' },
    { value: 'ember', label: 'Ember' },
    { value: 'dojo', label: 'Dojo' },
    { value: 'polymer', label: 'Polymer' },
    { value: 'stencil', label: 'Stencil' },
    { value: 'scully', label: 'Scully' },
    { value: 'gridsome', label: 'Gridsome' },
    { value: 'umijs', label: 'UmiJS' },
    { value: 'sapper', label: 'Sapper' },
    { value: 'saber', label: 'Saber' },
    { value: 'hexo', label: 'Hexo' },
    { value: 'eleventy', label: 'Eleventy' },
    { value: 'docusaurus', label: 'Docusaurus' },
    { value: 'docusaurus-2', label: 'Docusaurus 2' },
    { value: 'hugo', label: 'Hugo' },
    { value: 'jekyll', label: 'Jekyll' },
    { value: 'brunch', label: 'Brunch' },
    { value: 'middleman', label: 'Middleman' },
    { value: 'zola', label: 'Zola' },
    { value: 'vitepress', label: 'VitePress' },
    { value: 'vuepress', label: 'VuePress' },
    { value: 'parcel', label: 'Parcel' },
    { value: 'storybook', label: 'Storybook' },
    { value: 'sanity', label: 'Sanity' },
    { value: 'sanity-v2', label: 'Sanity v2' },
    { value: 'nitro', label: 'Nitro' },
    { value: 'hono', label: 'Hono' },
    { value: 'express', label: 'Express' },
    { value: 'h3', label: 'H3' },
    { value: 'koa', label: 'Koa' },
    { value: 'nestjs', label: 'NestJS' },
    { value: 'elysia', label: 'Elysia' },
    { value: 'fastify', label: 'Fastify' },
    { value: 'fastapi', label: 'FastAPI' },
    { value: 'flask', label: 'Flask' },
    { value: 'fasthtml', label: 'FastHTML' },
    { value: 'django', label: 'Django' },
    { value: 'ash', label: 'Ash' },
    { value: 'eve', label: 'Eve' },
    { value: 'python', label: 'Python' },
    { value: 'ruby', label: 'Ruby' },
    { value: 'rust', label: 'Rust' },
    { value: 'axum', label: 'Axum' },
    { value: 'actix-web', label: 'Actix Web' },
    { value: 'bun', label: 'Bun' },
    { value: 'node', label: 'Node.js' },
    { value: 'go', label: 'Go' },
    { value: 'container', label: 'Container' },
    { value: 'services', label: 'Services' },
    { value: 'mastra', label: 'Mastra' },
    { value: 'xmcp', label: 'XMCP' },
] as const;

export const VERCEL_FRAMEWORK_VALUES = VERCEL_FRAMEWORKS.map(
    (item) => item.value,
) as unknown as [
    (typeof VERCEL_FRAMEWORKS)[number]['value'],
    ...(typeof VERCEL_FRAMEWORKS)[number]['value'][],
];

export const createProjectSchema = z.object({
    name: projectName,
    framework: z.enum(VERCEL_FRAMEWORK_VALUES),
    gitRepository: z
        .string()
        .min(1, 'Select a GitHub repository')
        .regex(
            /^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/,
            'Repository must be owner/repo',
        ),
});
export type CreateProjectSchema = z.infer<typeof createProjectSchema>;

const envTargets = z
    .array(z.enum(['production', 'preview', 'development']))
    .min(1, 'Select at least one environment');

export const createEnvVarSchema = z.object({
    key: z.string().min(1, 'Key is required').max(256, 'Key is too long'),
    value: z.string().min(1, 'Value is required'),
    targets: envTargets,
});
export type CreateEnvVarSchema = z.infer<typeof createEnvVarSchema>;

export const updateEnvVarSchema = z.object({
    key: z.string().min(1, 'Key is required').max(256, 'Key is too long'),
    value: z.string().optional(),
    targets: envTargets,
});
export type UpdateEnvVarSchema = z.infer<typeof updateEnvVarSchema>;

export const VERCEL_ENV_TARGETS = [
    { value: 'production' as const, label: 'Production' },
    { value: 'preview' as const, label: 'Preview' },
    { value: 'development' as const, label: 'Development' },
];
