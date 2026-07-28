'use server';

import { getUserQuery } from '@/lib/auth';
import {
  getContactMessagesQuery,
  updateContactMessageRead,
  deleteContactMessageById,
} from './queries';

export type ContactMessage = {
  id: string;
  category: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  message: string;
  read: boolean;
  created_at: string;
};

export async function getContactMessages(): Promise<ContactMessage[]> {
  return getContactMessagesQuery();
}

export async function toggleMessageRead(id: string, read: boolean): Promise<void> {
  const userInfo = await getUserQuery();
  if (!userInfo.isAdmin) return;
  await updateContactMessageRead(id, read);
}

export async function deleteContactMessage(id: string): Promise<void> {
  const userInfo = await getUserQuery();
  if (!userInfo.isAdmin) return;
  await deleteContactMessageById(id);
}
