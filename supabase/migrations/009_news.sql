ALTER TABLE public.news ADD COLUMN order_index integer NOT NULL DEFAULT 0;

UPDATE public.news
SET order_index = sub.row_num
FROM (
  SELECT id,
         ROW_NUMBER() OVER (ORDER BY pinned DESC, created_at DESC) - 1 AS row_num
  FROM public.news
) sub
WHERE public.news.id = sub.id;