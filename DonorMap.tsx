import "./DonorMap.css";
import { useEffect, useMemo, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Circle,
  ZoomControl,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// ================================
// TYPES
// ================================

type Donor = {
  id: string;
  name: string;
  lat: number;
  lng: number;
  bloodGroup: string;
  rating: number;
  status: string;
};

type MapStyle = "standard" | "humanitarian";

// ================================
// HOSPITAL LOCATION (DEMO)
// ================================

const HOSPITAL = {
  lat: 19.076,
  lng: 72.8777,
  name: "City Hospital, Mumbai",
};

// ================================
// DEMO DONORS
// ================================

const INITIAL_DONORS: Donor[] = [
  {
    id: "D001",
    name: "Demo Donor A",
    lat: 19.077,
    lng: 72.878,
    bloodGroup: "O-",
    rating: 96,
    status: "Accepted",
  },
  {
    id: "D002",
    name: "Demo Donor B",
    lat: 19.081,
    lng: 72.88,
    bloodGroup: "O-",
    rating: 91,
    status: "Accepted",
  },
  {
    id: "D003",
    name: "Demo Donor C",
    lat: 19.085,
    lng: 72.874,
    bloodGroup: "O-",
    rating: 72,
    status: "Accepted",
  },
];

const SEARCH_RADII = [5, 10, 25, 50, 100];

// ================================
// CUSTOM MAP MARKERS
// ================================

function createMarker(color: string, emoji: string) {
  const element = document.createElement("div");

  element.style.width = "42px";
  element.style.height = "42px";
  element.style.backgroundColor = color;
  element.style.border = "3px solid white";
  element.style.borderRadius = "50%";
  element.style.display = "flex";
  element.style.alignItems = "center";
  element.style.justifyContent = "center";
  element.style.boxShadow = "0 3px 12px rgba(0,0,0,0.35)";
  element.style.fontSize = "20px";
  element.textContent = emoji;

  return L.divIcon({
    className: "bloodbridge-map-marker",
    html: element,
    iconSize: [42, 42],
    iconAnchor: [21, 21],
    popupAnchor: [0, -21],
  });
}

const hospitalIcon = createMarker("#7c3aed", "🏥");
const donorIcon = createMarker("#dc2626", "🩸");

// ================================
// MAP RESIZE HANDLER
// ================================

function MapResizeHandler() {
  const map = useMap();

  useEffect(() => {
    const timer = window.setTimeout(() => {
      map.invalidateSize();
    }, 200);

    return () => window.clearTimeout(timer);
  }, [map]);

  return null;
}

// ================================
// MAP FOCUS HANDLER
// ================================

function MapFocus({
  target,
}: {
  target: { lat: number; lng: number } | null;
}) {
  const map = useMap();

  useEffect(() => {
    if (target) {
      map.flyTo(
        [target.lat, target.lng],
        Math.max(map.getZoom(), 16),
        { duration: 0.8 },
      );
    } else {
      map.flyTo(
        [HOSPITAL.lat, HOSPITAL.lng],
        15,
        { duration: 0.8 },
      );
    }
  }, [map, target]);

  return null;
}

// ================================
// DISTANCE CALCULATION
// ================================

function distanceInMeters(
  pointA: { lat: number; lng: number },
  pointB: { lat: number; lng: number },
): number {
  const toRadians = (degrees: number) =>
    (degrees * Math.PI) / 180;

  const earthRadius = 6371000;

  const dLat = toRadians(pointB.lat - pointA.lat);
  const dLng = toRadians(pointB.lng - pointA.lng);

  const lat1 = toRadians(pointA.lat);
  const lat2 = toRadians(pointB.lat);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) *
      Math.cos(lat2) *
      Math.sin(dLng / 2) ** 2;

  const safeA = Math.min(1, Math.max(0, a));

  return (
    earthRadius *
    2 *
    Math.atan2(
      Math.sqrt(safeA),
      Math.sqrt(1 - safeA),
    )
  );
}

// ================================
// FORMAT DISTANCE
// ================================

function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${Math.round(meters)} m`;
  }

  return `${(meters / 1000).toFixed(1)} km`;
}

// ================================
// MAIN COMPONENT
// ================================

export default function DonorMap() {
  const [donors, setDonors] =
    useState<Donor[]>(INITIAL_DONORS);

  const [selectedDonorId, setSelectedDonorId] =
    useState<string | null>(null);

  const [searchRadius, setSearchRadius] = useState(5);

  const [mapStyle, setMapStyle] =
    useState<MapStyle>("standard");

  const [showDonors, setShowDonors] = useState(true);

  // Calculate distance from hospital to each donor.
  const donorsWithDistance = useMemo(
    () =>
      donors
        .map((donor) => ({
          ...donor,
          distance: distanceInMeters(HOSPITAL, donor),
        }))
        .sort((a, b) => a.distance - b.distance),
    [donors],
  );

  // Filter donors according to selected radius.
  const visibleDonors = donorsWithDistance.filter(
    (donor) => donor.distance <= searchRadius * 1000,
  );

  // Find the selected donor.
  const selectedDonor = donorsWithDistance.find(
    (donor) => donor.id === selectedDonorId,
  );

  // Select a donor and focus the map on them.
  function focusDonor(donor: Donor) {
    setSelectedDonorId(donor.id);
  }

  // Simulate a small donor location update.
  function simulateLocationUpdate(donorId: string) {
    setDonors((current) =>
      current.map((donor) =>
        donor.id === donorId
          ? {
              ...donor,
              lat: donor.lat + 0.0001,
              lng: donor.lng + 0.0001,
            }
          : donor,
      ),
    );
  }

  // Map tile settings.
  const tileUrl =
    mapStyle === "standard"
      ? "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      : "https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png";

  const tileAttribution =
    mapStyle === "standard"
      ? '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      : '&copy; OpenStreetMap contributors, Humanitarian style';

  const focusTarget = selectedDonor
    ? {
        lat: selectedDonor.lat,
        lng: selectedDonor.lng,
      }
    : null;

  return (
    <section className="donor-map-section">
      {/* HEADER */}

      <div className="donor-map-heading">
        <div>
          <p className="bb-eyebrow">
            BLOODBRIDGE EMERGENCY RESPONSE
          </p>

          <h2>Live Donor Map</h2>

          <p>
            Find nearby donors and explore the surrounding
            streets.
          </p>
        </div>

        <span className="map-live-badge">
          ● DEMO MODE
        </span>
      </div>

      {/* STATISTICS */}

      <div className="bb-map-stats">
        <div className="bb-map-stat">
          <span>🏥</span>
          <p>Requesting hospital</p>
          <strong>1</strong>
        </div>

        <div className="bb-map-stat">
          <span>🩸</span>
          <p>Donors in radius</p>
          <strong>{visibleDonors.length}</strong>
        </div>

        <div className="bb-map-stat">
          <span>📍</span>
          <p>Search radius</p>
          <strong>{searchRadius} km</strong>
        </div>

        <div className="bb-map-stat">
          <span>🗺️</span>
          <p>Map location</p>
          <strong>Mumbai</strong>
        </div>
      </div>

      {/* MAP CONTROLS */}

      <div className="bb-map-toolbar">
        <label>
          Map style

          <select
            value={mapStyle}
            onChange={(event) =>
              setMapStyle(
                event.target.value as MapStyle,
              )
            }
          >
            <option value="standard">
              OpenStreetMap streets
            </option>

            <option value="humanitarian">
              Humanitarian map
            </option>
          </select>
        </label>

        <label>
          Search radius

          <select
            value={searchRadius}
            onChange={(event) =>
              setSearchRadius(
                Number(event.target.value),
              )
            }
          >
            {SEARCH_RADII.map((radius) => (
              <option key={radius} value={radius}>
                {radius} km
              </option>
            ))}
          </select>
        </label>

        <label className="bb-map-toggle">
          <input
            type="checkbox"
            checked={showDonors}
            onChange={(event) =>
              setShowDonors(event.target.checked)
            }
          />

          Show donors
        </label>

        <button
          type="button"
          className="bb-map-action"
          onClick={() => setSelectedDonorId(null)}
        >
          📍 Focus hospital
        </button>
      </div>

      {/* MAP AND DONOR LIST */}

      <div className="donor-map-layout">
        {/* INTERACTIVE MAP */}

        <div className="donor-map">
          <MapContainer
            center={[HOSPITAL.lat, HOSPITAL.lng]}
            zoom={15}
            scrollWheelZoom
            zoomControl={false}
            style={{
              height: "560px",
              width: "100%",
              borderRadius: "16px",
            }}
          >
            <MapResizeHandler />

            <MapFocus target={focusTarget} />

            <ZoomControl position="bottomright" />

            <TileLayer
              key={mapStyle}
              attribution={tileAttribution}
              url={tileUrl}
              maxZoom={19}
            />

            {/* SEARCH RADIUS */}

            <Circle
              center={[
                HOSPITAL.lat,
                HOSPITAL.lng,
              ]}
              radius={searchRadius * 1000}
              pathOptions={{
                color: "#7c3aed",
                fillColor: "#7c3aed",
                fillOpacity: 0.08,
              }}
            />

            {/* HOSPITAL MARKER */}

            <Marker
              position={[
                HOSPITAL.lat,
                HOSPITAL.lng,
              ]}
              icon={hospitalIcon}
            >
              <Popup>
                <strong>{HOSPITAL.name}</strong>
                <br />
                Emergency request (demo)
              </Popup>
            </Marker>

            {/* DONOR MARKERS */}

            {showDonors &&
              visibleDonors.map((donor) => (
                <Marker
                  key={donor.id}
                  position={[
                    donor.lat,
                    donor.lng,
                  ]}
                  icon={donorIcon}
                  eventHandlers={{
                    click: () => focusDonor(donor),
                  }}
                >
                  <Popup>
                    <strong>{donor.name}</strong>
                    <br />

                    Blood group: {donor.bloodGroup}
                    <br />

                    Distance:{" "}
                    {formatDistance(donor.distance)}
                    <br />

                    Reliability: {donor.rating}%
                    <br />

                    Status: {donor.status}
                  </Popup>
                </Marker>
              ))}
          </MapContainer>

          {/* MAP LEGEND */}

          <div className="bb-map-legend">
            <span>🟣 Hospital</span>
            <span>🔴 Donor</span>
            <span>🟣 Search radius</span>
          </div>
        </div>

        {/* NEARBY DONORS */}

        <aside className="donor-list">
          <div className="bb-donor-list-header">
            <div>
              <h3>Nearby Donors</h3>

              <p>
                {visibleDonors.length} within{" "}
                {searchRadius} km
              </p>
            </div>
          </div>

          {visibleDonors.length === 0 && (
            <p>
              No demo donors in this radius.
              Try increasing it.
            </p>
          )}

          {visibleDonors.map((donor) => (
            <article
              className={`donor-card ${
                selectedDonorId === donor.id
                  ? "selected-donor"
                  : ""
              }`}
              key={donor.id}
            >
              <div className="donor-card-top">
                <div>
                  <strong>{donor.name}</strong>

                  <p>
                    {donor.bloodGroup} blood group
                  </p>
                </div>

                <span className="donor-distance">
                  {formatDistance(donor.distance)}
                </span>
              </div>

              <p>
                Demo reliability:{" "}
                <strong>{donor.rating}%</strong>
              </p>

              <p>
                Status: <strong>{donor.status}</strong>
              </p>

              <button
                type="button"
                onClick={() => focusDonor(donor)}
              >
                View donor
              </button>

              <button
                type="button"
                onClick={() =>
                  simulateLocationUpdate(donor.id)
                }
              >
                Simulate location update
              </button>
            </article>
          ))}

          {/* SELECTED DONOR DETAILS */}

          {selectedDonor && (
            <div className="selected-donor">
              <h4>Selected donor</h4>

              <p>{selectedDonor.name}</p>

              <p>
                Blood group: {selectedDonor.bloodGroup}
              </p>

              <p>
                {formatDistance(
                  distanceInMeters(
                    HOSPITAL,
                    selectedDonor,
                  ),
                )}{" "}
                straight-line distance from hospital
              </p>

              <p>
                Demo reliability:{" "}
                {selectedDonor.rating}%
              </p>
            </div>
          )}
        </aside>
      </div>

      {/* DEMO NOTICE */}

      <div className="bb-map-notice">
        <strong>Demo data notice:</strong>{" "}
        Hospital and donor coordinates, statuses, and
        reliability scores are simulated. This map does
        not provide real-time tracking or road distance.
        Map detail depends on available OpenStreetMap data.
      </div>
    </section>
  );
}