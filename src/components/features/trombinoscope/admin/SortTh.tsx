import type { NameFormat, SortDir, SortKey } from './membersList';

export function SortTh({
  label,
  col,
  sortKey,
  sortDir,
  onSort,
  nameFormat,
  onToggleNameFormat,
  className,
}: {
  label: string;
  col: SortKey;
  sortKey: SortKey | null;
  sortDir: SortDir;
  onSort: (key: SortKey) => void;
  nameFormat?: NameFormat;
  onToggleNameFormat?: () => void;
  className?: string;
}) {
  const active = sortKey === col && sortDir !== 'default';
  const indicator = active ? (sortDir === 'asc' ? '↑' : '↓') : '↕';
  return (
    <th className={`px-4 py-3 text-left ${className ?? ''}`}>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onSort(col)}
          className={`flex items-center gap-1 text-xs font-medium transition-colors ${
            active ? 'text-primary' : 'text-foreground/50 hover:text-foreground'
          }`}
        >
          {label}
          <span className="text-[10px]">{indicator}</span>
        </button>
        {nameFormat && onToggleNameFormat && (
          <button
            type="button"
            onClick={onToggleNameFormat}
            title={nameFormat === 'first_last' ? 'Afficher Nom Prénom' : 'Afficher Prénom Nom'}
            className="text-[10px] text-foreground/30 hover:text-foreground/70 border border-foreground/20 rounded px-1 transition-colors"
          >
            {nameFormat === 'first_last' ? 'P N' : 'N P'}
          </button>
        )}
      </div>
    </th>
  );
}
