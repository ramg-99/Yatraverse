import { MapContainer, TileLayer, CircleMarker, Polyline, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

/**
 * @param {{ points: {lat:number,lng:number,name:string}[], className?: string }} props
 */
export function TripMap({ points = [], className = 'h-64 w-full rounded-2xl overflow-hidden' }) {
  const center = points[0] ? [points[0].lat, points[0].lng] : [20, 20];
  const path = points.map((p) => [p.lat, p.lng]);
  return (
    <div className={className}>
      <MapContainer center={center} zoom={points.length > 1 ? 3 : 4} style={{ height: '100%', width: '100%' }} scrollWheelZoom={false}>
        <TileLayer attribution="&copy; OpenStreetMap" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {path.length > 1 ? <Polyline positions={path} pathOptions={{ color: '#2DD4BF', weight: 3 }} /> : null}
        {points.map((p) => (
          <CircleMarker key={p.name} center={[p.lat, p.lng]} radius={8} pathOptions={{ color: '#FFB02E', fillOpacity: 0.9 }}>
            <Popup>{p.name}</Popup>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  );
}
