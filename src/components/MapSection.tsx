import { ClientOnly } from '@tanstack/react-router';
import { lazy, Suspense, useMemo, useState } from 'react';
import { Crosshair } from 'lucide-react';
import { Button } from './Button';
import { Field } from './CaseWorkspace';
import type { MapPoint } from './map-types';

const MovementMap = lazy(() => import('./MovementMap'));

function parseCoordinate(value: string, min: number, max: number) {
  const parsed = Number(value.trim());
  return Number.isFinite(parsed) && parsed >= min && parsed <= max ? parsed : null;
}

export function MapSection({ points }: { points: MapPoint[] }) {
  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');
  const [locate, setLocate] = useState<{ lat: number; lng: number } | null>(null);
  const [error, setError] = useState('');
  const sorted = useMemo(() => points, [points]);

  function locatePosition() {
    const latitude = parseCoordinate(lat, -90, 90);
    const longitude = parseCoordinate(lng, -180, 180);
    if (latitude === null || longitude === null) {
      setError('Enter a valid latitude (-90 to 90) and longitude (-180 to 180).');
      return;
    }
    setError('');
    setLocate({ lat: latitude, lng: longitude });
  }

  return (
    <section className="map-section">
      <form className="locate-form" onSubmit={(e) => { e.preventDefault(); locatePosition(); }}>
        <Field label="Latitude"><input inputMode="decimal" placeholder="e.g. 9.9312" value={lat} onChange={(e) => setLat(e.target.value)} /></Field>
        <Field label="Longitude"><input inputMode="decimal" placeholder="e.g. 76.2673" value={lng} onChange={(e) => setLng(e.target.value)} /></Field>
        <Button type="submit" variant="secondary"><Crosshair size={15} /> Locate position</Button>
      </form>
      {error && <p className="error-message" role="alert">{error}</p>}
      <ClientOnly fallback={<div className="movement-map map-loading" role="status">Loading map…</div>}>
        <Suspense fallback={<div className="movement-map map-loading" role="status">Loading map…</div>}>
          <MovementMap points={sorted} locate={locate} />
        </Suspense>
      </ClientOnly>
      {points.length > 1 && <p className="map-caption">Numbered markers show detections in time order; the dashed line is the movement path between camera locations.</p>}
      {points.length === 0 && <p className="map-caption">Add latitude and longitude to uploaded evidence to plot camera positions and the movement path.</p>}
    </section>
  );
}
