import { Tables } from '@/types/database';

export type NewsFile = Tables<'news_files'>;
// scheduled_at sera dans Tables<'news'> après le prochain npm run db:types
export type News = Tables<'news'> & { news_files: NewsFile[]; scheduled_at?: string | null };
