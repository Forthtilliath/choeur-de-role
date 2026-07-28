import { getCurrentTimestampString } from '@/lib/utils';
import { uploadImageToR2 } from '@/utils/uploadImageToR2';

export async function uploadEditorImage(file: File): Promise<string | null> {
  try {
    return await uploadImageToR2(file, `editor/${getCurrentTimestampString()}.webp`);
  } catch {
    return null;
  }
}
