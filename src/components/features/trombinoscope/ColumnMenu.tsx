'use client';

import { useState } from 'react';
import type { DragEndEvent } from '@dnd-kit/core';
import { closestCenter, DndContext } from '@dnd-kit/core';
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';

import { useDndSensors } from '@/hooks/useDndSensors';

import { SortableColumnRow } from './SortableColumnRow';
import type { Column, ColumnKey } from './types';
import { DEFAULT_COLUMNS } from './types';

type Props = {
  columns: Column[];
  onColumnsChangeAction: (update: (prev: Column[]) => Column[]) => void;
};

// Menu déroulant : afficher/masquer et réordonner (glisser-déposer) les colonnes
export function ColumnMenu({ columns, onColumnsChangeAction }: Props) {
  const [showColumnMenu, setShowColumnMenu] = useState(false);
  const sensors = useDndSensors();

  const visibleCount = columns.filter((c) => c.visible).length;
  const totalCount = columns.length;

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    onColumnsChangeAction((prev) => {
      const oldIndex = prev.findIndex((c) => c.key === active.id);
      const newIndex = prev.findIndex((c) => c.key === over.id);
      return arrayMove(prev, oldIndex, newIndex);
    });
  }

  function toggleColumnVisible(key: ColumnKey) {
    onColumnsChangeAction((prev) =>
      prev.map((col) => (col.key === key ? { ...col, visible: !col.visible } : col)),
    );
  }

  function resetColumns() {
    onColumnsChangeAction(() => DEFAULT_COLUMNS);
    setShowColumnMenu(false);
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowColumnMenu((v) => !v)}
        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border transition-all text-sm ${showColumnMenu ? 'border-primary bg-primary/10 text-primary' : 'border-border text-foreground/60 hover:text-foreground hover:border-primary'}`}
      >
        <span className="hidden sm:inline">Colonnes</span>
        <span
          className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${visibleCount === totalCount ? 'bg-foreground/10 text-foreground/40' : 'bg-primary text-white'}`}
        >
          {visibleCount}/{totalCount}
        </span>
        <span className="text-xs opacity-60">{showColumnMenu ? '▲' : '▼'}</span>
      </button>

      {showColumnMenu && (
        <div className="absolute right-0 top-11 z-20 bg-background border border-border rounded-xl shadow-xl w-64 overflow-hidden">
          <div className="px-4 py-3 border-b border-border bg-background-secondary flex items-center justify-between">
            <p className="text-xs font-medium text-foreground">Colonnes affichées</p>
            <button
              onClick={resetColumns}
              className="text-xs text-foreground/40 hover:text-primary transition-colors flex items-center gap-1"
            >
              ↺ Réinitialiser
            </button>
          </div>
          <div className="px-4 py-2 bg-background-secondary/50 border-b border-border">
            <p className="text-xs text-foreground/40">
              ⠿ Glisser pour réordonner · toggle pour afficher/masquer
            </p>
          </div>
          <div className="p-2">
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={columns.map((c) => c.key)}
                strategy={verticalListSortingStrategy}
              >
                {columns.map((col, index) => (
                  <SortableColumnRow
                    key={col.key}
                    col={col}
                    index={index}
                    total={columns.length}
                    onToggleAction={toggleColumnVisible}
                  />
                ))}
              </SortableContext>
            </DndContext>
          </div>
        </div>
      )}
    </div>
  );
}
