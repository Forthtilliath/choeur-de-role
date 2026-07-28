import { AppError } from "@/lib/appError";
import { createServerClient } from "@/lib/supabase.server";
import { HomeBlock } from "./types";

export async function getHomeBlocks(): Promise<HomeBlock[]> {
  const supabase = await createServerClient();
  const { data, error } = await supabase.from('home_blocks').select('*').order('order_index');

  if (error) {
    throw new AppError('DB_ERROR', 'Erreur lors de la récupération du contenu.');
  }

  return data;
}
