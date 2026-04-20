import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix default marker icons for Vite/webpack bundlers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

/**
 * Reusable interactive map component.
 * Props:
 *   center: [lat, lng]  — initial center
 *   zoom: number        — initial zoom level
 *   markers: Array<{ id, lat, lng, title, popupContent? }>
 *   style: object       — CSS style for the container div
 *   className: string
 */
const MapView = ({
  center = [20, 0],
  zoom = 2,
  markers = [],
  style = { height: "400px", width: "100%" },
  className = "",
}) => {
  return (
    <MapContainer
      center={center}
      zoom={zoom}
      style={style}
      className={className}
      scrollWheelZoom
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://openstreetmap.org">OpenStreetMap</a> contributors'
      />
      {markers.map((marker) => (
        <Marker key={marker.id} position={[marker.lat, marker.lng]}>
          {(marker.title || marker.popupContent) && (
            <Popup>
              {marker.title && (
                <strong className="block text-sm">{marker.title}</strong>
              )}
              {marker.popupContent}
            </Popup>
          )}
        </Marker>
      ))}
    </MapContainer>
  );
};

export default MapView;
