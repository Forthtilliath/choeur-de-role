import type { ProfileFormValues } from './profileForm';

const INPUT_CLASS = 'border border-border rounded-lg px-4 py-2 text-sm bg-background';

export type GeoStatus = 'confirmed' | 'existing' | 'none';

type Props = {
  values: ProfileFormValues;
  onAddressChangeAction: (patch: Partial<ProfileFormValues>) => void;
  geoStatus: GeoStatus;
  geocoding: boolean;
  onGeocodeAction: () => void;
};

// Adresse postale + vérification de la position sur la carte
export function ProfileAddressSection({
  values,
  onAddressChangeAction,
  geoStatus,
  geocoding,
  onGeocodeAction,
}: Props) {
  const hasAddress = !!(values.address || values.zipCode || values.city);

  return (
    <div className="flex flex-col gap-4 p-6 rounded-2xl border border-border bg-background">
      <h2 className="text-sm font-medium text-foreground">Adresse</h2>
      <div className="flex flex-col gap-1">
        <label htmlFor="profile-address" className="text-xs text-foreground/50">
          Rue
        </label>
        <input
          id="profile-address"
          value={values.address}
          onChange={(e) => onAddressChangeAction({ address: e.target.value })}
          className={INPUT_CLASS}
          placeholder="12 rue de la Paix"
        />
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div className="flex flex-col gap-1">
          <label htmlFor="profile-zip" className="text-xs text-foreground/50">
            Code postal
          </label>
          <input
            id="profile-zip"
            value={values.zipCode}
            onChange={(e) => onAddressChangeAction({ zipCode: e.target.value })}
            className={INPUT_CLASS}
            placeholder="49000"
          />
        </div>
        <div className="col-span-2 flex flex-col gap-1">
          <label htmlFor="profile-city" className="text-xs text-foreground/50">
            Ville
          </label>
          <input
            id="profile-city"
            value={values.city}
            onChange={(e) => onAddressChangeAction({ city: e.target.value })}
            className={INPUT_CLASS}
            placeholder="Angers"
          />
        </div>
      </div>

      {hasAddress && (
        <div className="flex flex-col gap-1.5 pt-2 border-t border-border">
          <div className="flex items-center justify-between gap-3">
            <div>
              {geoStatus === 'confirmed' ? (
                <p className="text-xs text-primary">✓ Position confirmée sur la carte</p>
              ) : geoStatus === 'existing' ? (
                <p className="text-xs text-foreground/50">
                  📍 Position existante — vérifiez si l&apos;adresse a changé
                </p>
              ) : (
                <p className="text-xs text-foreground/40">
                  📍 Aucune position — géocodez pour apparaître sur la carte
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={onGeocodeAction}
              disabled={geocoding}
              className={`shrink-0 text-xs px-3 py-1.5 rounded-lg border transition-all flex items-center gap-1.5 ${
                geoStatus === 'confirmed'
                  ? 'border-primary/30 text-primary hover:bg-primary/10'
                  : 'border-border text-foreground/60 hover:border-primary hover:text-primary'
              } disabled:opacity-50`}
            >
              {geocoding ? (
                <>
                  <span className="w-3 h-3 rounded-full border-2 border-current border-t-transparent animate-spin" />
                  Localisation...
                </>
              ) : geoStatus === 'confirmed' ? (
                '📍 Modifier la position'
              ) : (
                '📍 Vérifier la position'
              )}
            </button>
          </div>
          {!values.visibilityAddress && (
            <p className="text-xs text-foreground/40">
              Votre adresse reste masquée des choristes, mais le CA peut voir votre position.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
