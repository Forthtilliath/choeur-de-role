alter table song_file_voice_part drop constraint if exists song_file_voice_part_voice_part_id_fkey;
alter table song_file_voice_part
  add constraint song_file_voice_part_voice_part_id_fkey
  foreign key (voice_part_id)
  references voice_parts(id)
  on delete cascade;