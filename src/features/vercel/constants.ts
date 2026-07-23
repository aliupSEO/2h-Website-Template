export const PROJECTS_PER_PAGE = 50;
/** Max parallel project detail requests while hydrating card summaries. */
export const PROJECT_DETAIL_CONCURRENCY = 12;
/** Deployments fetched for card/list summaries (latest only). */
export const PROJECT_SUMMARY_DEPLOYMENT_LIMIT = 1;
/** How long project list / card summaries stay fresh in memory. */
export const VERCEL_CACHE_TTL_MS = 5 * 60_000;
/** sessionStorage key for instant paint on refresh. */
export const VERCEL_SESSION_CACHE_KEY = '2h-hub:vercel-cache:v1';

/** Shared hover motion for outline project action buttons. */
export const PROJECT_OUTLINE_ACTION_CLASS =
    'h-8 shrink-0 gap-1.5 rounded-md border-0 border-transparent px-2.5 ring-1 ring-inset transition-[background-color,color,box-shadow,ring-color] duration-200 ease-out hover:bg-primary hover:text-black hover:shadow-[0_0_18px_rgba(198,245,50,0.25)] hover:ring-primary active:scale-[0.98]';

/** Deployments outline — solid primary green border + text (default state). */
export const PROJECT_DEPLOYMENTS_ACTION_CLASS =
    'h-8 shrink-0 gap-1.5 rounded-md border-0 border-transparent bg-transparent px-2.5 text-primary ring-1 ring-inset ring-primary transition-[background-color,color,box-shadow,ring-color] duration-200 ease-out hover:bg-primary hover:text-black hover:shadow-[0_0_18px_rgba(198,245,50,0.25)] hover:ring-primary active:scale-[0.98]';

/** Shared hover motion for solid brand project CTAs. */
export const PROJECT_BRAND_ACTION_CLASS =
    'h-10 w-full rounded-md transition-[box-shadow,filter] duration-200 ease-out hover:shadow-[0_0_20px_rgba(198,245,50,0.3)] hover:brightness-110 active:scale-[0.99]';
