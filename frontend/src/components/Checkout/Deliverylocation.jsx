import { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import iconRetinaUrl from "leaflet/dist/images/marker-icon-2x.png";
import iconUrl from "leaflet/dist/images/marker-icon.png";
import shadowUrl from "leaflet/dist/images/marker-shadow.png";
import "leaflet/dist/leaflet.css";
import { locationService } from "../../services/location-service";

const DEFAULT_CENTER = { lat: 27.4287, lng: 85.0322 }; // Hetauda, Nepal

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl,
  iconUrl,
  shadowUrl,
});

// Simple debounce
function useDebounce(value, delay) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

function DraggableMarker({ position, onDragEnd, onMapClick }) {
  const markerRef = useRef(null);

  useMapEvents({
    click(e) {
      onMapClick({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });

  useEffect(() => {
    if (markerRef.current) markerRef.current.setLatLng(position);
  }, [position]);

  return (
    <Marker
      draggable
      position={position}
      ref={markerRef}
      eventHandlers={{
        dragend() {
          const latlng = markerRef.current.getLatLng();
          onDragEnd({ lat: latlng.lat, lng: latlng.lng });
        },
      }}
    />
  );
}

export default function Deliverylocation({ formData, setFormData }) {
  const [pos, setPos] = useState({ 
    lat: formData.lat ?? DEFAULT_CENTER.lat, 
    lng: formData.lng ?? DEFAULT_CENTER.lng 
  });
  const [search, setSearch] = useState("");
  const debounced = useDebounce(search, 600);
  const [results, setResults] = useState([]);
  const [rateLimited, setRateLimited] = useState(false);
  const mapRef = useRef(null);

  // simple frontend rate-limit: 1 req / sec
  const lastCallRef = useRef(0);

  useEffect(() => {
    if (!debounced) {
      setResults([]);
      return;
    }

    const now = Date.now();
    if (now - lastCallRef.current < 900) {
      setRateLimited(true);
      return;
    }

    lastCallRef.current = now;
    setRateLimited(false);

    locationService
      .search(debounced)
      .then((data) => setResults(Array.isArray(data) ? data : []))
      .catch(() => setResults([]));
  }, [debounced]);

  const reverseGeocode = async (lat, lng) => {
    try {
      const data = await locationService.reverseGeocode(lat, lng);
      const display = data.display_name || "";
      setFormData((prev) => ({
        ...prev,
        lat: Number(lat.toFixed(6)),
        lng: Number(lng.toFixed(6)),
        deliveryAddress: display,
      }));
    } catch {
      setFormData((prev) => ({
        ...prev,
        lat: Number(lat.toFixed(6)),
        lng: Number(lng.toFixed(6)),
      }));
    }
  };

  const useCurrentLocation = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (p) => {
        const lat = Number(p.coords.latitude.toFixed(6));
        const lng = Number(p.coords.longitude.toFixed(6));
        setPos({ lat, lng });
        if (mapRef.current) {
          mapRef.current.flyTo([lat, lng], 17, { duration: 0.8 });
        }
        reverseGeocode(lat, lng);
      },
      () => {},
      { enableHighAccuracy: true }
    );
  };

  const handleSelectResult = (r) => {
    const lat = Number(parseFloat(r.lat).toFixed(6));
    const lng = Number(parseFloat(r.lon).toFixed(6));
    setPos({ lat, lng });
    if (mapRef.current) {
      mapRef.current.flyTo([lat, lng], 17, { duration: 0.8 });
    }
    setResults([]);
    setSearch("");
    setFormData((prev) => ({
      ...prev,
      lat,
      lng,
      deliveryAddress: r.display_name || r.address || "",
    }));
  };

  const handleMarkerDrag = ({ lat, lng }) => {
    const l = Number(lat.toFixed(6));
    const ln = Number(lng.toFixed(6));
    setPos({ lat: l, lng: ln });
    reverseGeocode(l, ln);
  };

  const handleMapClick = ({ lat, lng }) => {
    const l = Number(lat.toFixed(6));
    const ln = Number(lng.toFixed(6));
    setPos({ lat: l, lng: ln });
    if (mapRef.current) {
      mapRef.current.flyTo([l, ln], 17, { duration: 0.8 });
    }
    reverseGeocode(l, ln);
  };

  useEffect(() => {
    if (formData.lat && formData.lng) setPos({ lat: formData.lat, lng: formData.lng });
  }, [formData.lat, formData.lng]);

  return (
    <div className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-900">Delivery Location</h3>
        <button type="button" onClick={useCurrentLocation} className="text-sm text-green-600">Use Current Location</button>
      </div>

      <div>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search address"
          className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-slate-900"
        />
        {rateLimited && <div className="text-xs text-rose-500 mt-1">Too many searches — slow down</div>}
        {results.length > 0 && (
          <ul className="mt-2 max-h-48 overflow-auto rounded-xl border border-slate-100 bg-white shadow-sm">
            {results.map((r) => (
              <li key={r.place_id} onClick={() => handleSelectResult(r)} className="cursor-pointer px-3 py-2 text-sm hover:bg-emerald-50">{r.display_name}</li>
            ))}
          </ul>
        )}
      </div>

      <div className="relative h-64 rounded-2xl overflow-hidden border border-slate-200">
        <style>{`.leaflet-container { cursor: crosshair; }`}</style>
        <MapContainer 
          ref={mapRef}
          center={[pos.lat || DEFAULT_CENTER.lat, pos.lng || DEFAULT_CENTER.lng]} 
          zoom={14} 
          style={{ height: "100%" }}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <DraggableMarker 
            position={[pos.lat || DEFAULT_CENTER.lat, pos.lng || DEFAULT_CENTER.lng]} 
            onDragEnd={handleMarkerDrag}
            onMapClick={handleMapClick}
          />
        </MapContainer>
        <div className="pointer-events-none absolute left-1/2 top-1/2 z-[999] -translate-x-1/2 -translate-y-1/2">
          <div className="h-4 w-4 rounded-full border-2 border-white bg-emerald-600 shadow-lg" />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Label</label>
        <select value={formData.label || "Home"} onChange={(e) => setFormData((p) => ({ ...p, label: e.target.value }))} className="w-full rounded-2xl border border-slate-300 px-4 py-3">
          <option>Home</option>
          <option>Office</option>
          <option>Other</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Landmark</label>
        <input value={formData.landmark || ""} onChange={(e) => setFormData((p) => ({ ...p, landmark: e.target.value }))} className="w-full rounded-2xl border border-slate-300 px-4 py-3" />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Selected Address</label>
        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">{formData.deliveryAddress || "—"}</div>
      </div>
    </div>
  );
}
