// Browser-safe shared types for the movement map. Do not import leaflet here:
// this module is imported by SSR-rendered routes.
export type MapPoint = {
  id: string;
  label: string;
  detail?: string;
  lat: number;
  lng: number;
  time?: string;
};
