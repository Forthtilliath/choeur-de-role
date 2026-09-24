'use client';

import { AudioFileRow } from './AudioFileRow';
import { NonAudioFileRow } from './NonAudioFileRow';

type Props = {
  fileUrl: string;
  label: string;
  downloadName: string;
  type: string;
  date: string | null;
  id?: string;
};

export function RepertoireFileLink({ fileUrl, label, downloadName, type, date, id }: Props) {
  if (type === 'audio') {
    return <AudioFileRow fileUrl={fileUrl} label={label} downloadName={downloadName} date={date} />;
  }
  return (
    <NonAudioFileRow
      fileUrl={fileUrl}
      label={label}
      downloadName={downloadName}
      type={type}
      date={date}
      id={id}
    />
  );
}
