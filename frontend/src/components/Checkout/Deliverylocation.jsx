import { useEffect, useRef, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMapEvents,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import iconRetinaUrl from "leaflet/dist/images/marker-icon-2x.png";
import iconUrl from "leaflet/dist/images/marker-icon.png";
import shadowUrl from "leaflet/dist/images/marker-shadow.png";
import "leaflet/dist/leaflet.css";
import { locationService } from "../../services/location-service";

const DEFAULT_CENTER = {
  lat: 27.42949558266496,
  lng: 85.03280181607856,
};

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl,
  iconUrl,
  shadowUrl,
});

function useDebounce(value, delay = 600) {
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
      onMapClick({
        lat: e.latlng.lat,
        lng: e.latlng.lng,
      });
    },
  });

  return (
    <Marker
      draggable
      position={position}
      ref={markerRef}
      eventHandlers={{
        dragend() {
          const latlng = markerRef.current.getLatLng();

          onDragEnd({
            lat: latlng.lat,
            lng: latlng.lng,
          });
        },
      }}
    />
  );
}

function RecenterMap({ lat, lng }) {
  const map = useMap();

  useEffect(() => {
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;

    map.invalidateSize();
    map.flyTo([lat, lng], 17, {
      duration: 0.8,
    });
  }, [lat, lng, map]);

  return null;
}

export default function Deliverylocation({ formData, setFormData }) {
  const [search, setSearch] = useState("");
  const [results, setResults] = useState([]);
  const [rateLimited, setRateLimited] = useState(false);

  const debounced = useDebounce(search);
  const mapRef = useRef(null);
  const lastCallRef = useRef(0);

  const latitude =
    Number.isFinite(Number(formData?.lat)) &&
    Math.abs(Number(formData.lat)) > 1
      ? Number(formData.lat)
      : DEFAULT_CENTER.lat;

  const longitude =
    Number.isFinite(Number(formData?.lng)) &&
    Math.abs(Number(formData.lng)) > 1
      ? Number(formData.lng)
      : DEFAULT_CENTER.lng;

  const updateLocation = ({ lat, lng, address = "" }) => {
    const parsedLat = Number(lat);
    const parsedLng = Number(lng);

    if (!Number.isFinite(parsedLat) || !Number.isFinite(parsedLng)) return;

    setFormData((prev) => ({
      ...prev,
      lat: parsedLat,
      lng: parsedLng,
      deliveryAddress: address || prev.deliveryAddress || "",
    }));
  };

  useEffect(() => {
    if (!debounced?.trim()) {
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
      .then((data) => {
        setResults(Array.isArray(data) ? data : []);
      })
      .catch(() => setResults([]));
  }, [debounced]);

  const reverseGeocode = async (lat, lng) => {
    try {
      const data = await locationService.reverseGeocode(lat, lng);

      updateLocation({
        lat,
        lng,
        address: data?.display_name || "",
      });
    } catch {
      updateLocation({ lat, lng });
    }
  };

  const handleMapClick = ({ lat, lng }) => {
    updateLocation({ lat, lng });
    reverseGeocode(lat, lng);
  };

  const handleMarkerDrag = ({ lat, lng }) => {
    updateLocation({ lat, lng });
    reverseGeocode(lat, lng);
  };

  const useCurrentLocation = () => {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const lat = coords.latitude;
        const lng = coords.longitude;

        updateLocation({ lat, lng });

        if (mapRef.current) {
          mapRef.current.setView([lat, lng], 17);
        }

        reverseGeocode(lat, lng);
      },
      console.error,
      {
        enableHighAccuracy: true,
      }
    );
  };

  const handleSelectResult = (r) => {
    const lat = parseFloat(r.lat);
    const lng = parseFloat(r.lon);

    updateLocation({
      lat,
      lng,
      address: r.display_name,
    });

    if (mapRef.current) {
      mapRef.current.setView([lat, lng], 17);
    }

    setResults([]);
    setSearch("");
  };

  return (
    <div className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-900">
          Delivery Location
        </h3>

        <button
          type="button"
          onClick={useCurrentLocation}
          className="text-sm font-semibold text-green-600 hover:text-green-700"
        >
          Use Current Location
        </button>
      </div>

      <div className="relative">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search address..."
          className="w-full rounded-2xl border border-slate-300 px-4 py-3"
        />

        {rateLimited && (
          <div className="mt-1 text-xs text-red-500">
            Too many searches — slow down
          </div>
        )}

        {results.length > 0 && (
          <ul className="absolute z-[1000] mt-2 max-h-48 w-full overflow-auto rounded-xl border bg-white shadow-lg">
            {results.map((r) => (
              <li
                key={r.place_id}
                onClick={() => handleSelectResult(r)}
                className="cursor-pointer px-4 py-3 hover:bg-emerald-50"
              >
                {r.display_name}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="relative h-64 min-h-[250px] overflow-hidden rounded-2xl border">
        <MapContainer
          center={[latitude, longitude]}
          zoom={17}
          ref={mapRef}
          style={{
            height: "100%",
            width: "100%",
          }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <DraggableMarker
            position={[latitude, longitude]}
            onDragEnd={handleMarkerDrag}
            onMapClick={handleMapClick}
          />

          <RecenterMap lat={latitude} lng={longitude} />
        </MapContainer>
      </div>

      <input
        value={formData.landmark || ""}
        onChange={(e) =>
          setFormData((prev) => ({
            ...prev,
            landmark: e.target.value,
          }))
        }
        placeholder="Landmark"
        className="w-full rounded-2xl border px-4 py-3"
      />

      <div className="rounded-2xl border bg-slate-50 px-4 py-3 text-sm">
        {formData.deliveryAddress || "Pin a location on the map"}
      </div>
    </div>
  );
}