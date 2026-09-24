'use client';

import { Button } from '@/components/ui/Button';

import { downloadImportTemplate } from './csvImport';

type Props = {
  onFileAction: (file: File) => void;
  onCloseAction: () => void;
};

export function CsvImportUpload({ onFileAction, onCloseAction }: Props) {
  return (
    <div className="border border-border rounded-2xl p-6 bg-background-secondary flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-medium text-foreground">Importer des membres via CSV</h2>
        <button
          onClick={onCloseAction}
          className="text-foreground/40 hover:text-foreground text-lg"
        >
          ✕
        </button>
      </div>

      <div className="flex flex-col gap-2 text-xs text-foreground/60 bg-background border border-border rounded-xl p-4">
        <p className="font-medium text-foreground/80">Format attendu</p>
        <code className="font-mono text-foreground/50">
          prénom,nom,email,pupitre,saison,téléphone,adresse,code_postal,ville,date_de_naissance
        </code>
        <p>
          Colonnes <span className="font-medium text-foreground/70">obligatoires</span> : prénom,
          nom, email. <span className="font-medium text-foreground/70">Optionnelles</span> :
          pupitre, saison, téléphone, adresse, code postal, ville, date de naissance{' '}
          <span className="text-foreground/40">(AAAA-MM-JJ)</span>.
        </p>
        <button
          onClick={downloadImportTemplate}
          className="self-start text-primary hover:opacity-70 transition-opacity underline underline-offset-2"
        >
          Télécharger le modèle .csv
        </button>
      </div>

      <label
        aria-label="Importer un fichier CSV"
        className="border-2 border-dashed border-border rounded-xl p-8 flex flex-col items-center gap-3 cursor-pointer hover:border-primary/40 hover:bg-primary/5 transition-all"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          const file = e.dataTransfer.files[0];
          if (file) onFileAction(file);
        }}
      >
        <svg
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-foreground/30"
        >
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="17 8 12 3 7 8" />
          <line x1="12" y1="3" x2="12" y2="15" />
        </svg>
        <div className="text-center">
          <p className="text-sm text-foreground/60">Glisser-déposer un fichier CSV</p>
          <p className="text-xs text-foreground/40">ou cliquer pour parcourir</p>
        </div>
        <input
          type="file"
          accept=".csv,text/csv"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onFileAction(file);
          }}
        />
      </label>

      <div className="flex justify-end">
        <Button variant="ghost" onClick={onCloseAction}>
          Annuler
        </Button>
      </div>
    </div>
  );
}
