import { MapContainer, TileLayer, Marker, Popup, Tooltip } from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-markercluster";
import L from "leaflet";
import { useState } from "react";

function createCustomClusterIcon(cluster) {
    const children = cluster.getAllChildMarkers();
    const totalCount = cluster.getChildCount();

    const firstFlag = children[0]?.options?.icon?.options?.iconUrl || "";
    const secondFlag = children[1]?.options?.icon?.options?.iconUrl || "";

    const extraCountBadge = totalCount - 2 > 0
        ? `<div class="w-8 h-5 px-2 rounded-full bg-gray-800 text-white text-2xs flex items-center justify-center font-semibold border-2 border-white shadow-sm">
         +${totalCount - 2}
       </div>`
        : "";

    const html = `
    <div class="flex items-center space-x-[-8px]">
      <img src="${firstFlag}" class="w-8 h-5 rounded-md border-2 border-white shadow-sm" />
      <img src="${secondFlag}" class="w-8 h-5 rounded-md border-2 border-white shadow-sm" />
      ${extraCountBadge}
    </div>
  `;

    return L.divIcon({
        html,
        className: "custom-cluster-icon",
        iconSize: L.point(28, 28, true),
        iconAnchor: [14, 14],
    });
}

const createCountryIcon = (flagUrl) =>
    L.icon({
        iconUrl: flagUrl || "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png",
        iconSize: [32, 20],
        iconAnchor: [16, 21],
        popupAnchor: [0, -18],
        tooltipAnchor: [10, -10],
        className: "rounded-md border-2 border-white shadow-sm",
    });

const countryCoordinates = {
    Australia: { lat: -25.274398, lng: 133.775136 },
    Austria: { lat: 47.516231, lng: 14.550072 },
    Belgium: { lat: 50.503887, lng: 4.469936 },
    Canada: { lat: 56.130366, lng: -106.346771 },
    China: { lat: 35.86166, lng: 104.195397 },
    Denmark: { lat: 56.26392, lng: 9.501785 },
    Finland: { lat: 61.92411, lng: 25.748151 },
    France: { lat: 46.227638, lng: 2.213749 },
    Germany: { lat: 51.165691, lng: 10.451526 },
    Ireland: { lat: 53.41291, lng: -8.24389 },
    Italy: { lat: 41.87194, lng: 12.56738 },
    Japan: { lat: 36.204824, lng: 138.252924 },
    Luxembourg: { lat: 49.815273, lng: 6.129583 },
    Malaysia: { lat: 4.210484, lng: 101.975766 },
    Netherlands: { lat: 52.132633, lng: 5.291266 },
    "New Zealand": { lat: -40.900557, lng: 174.885971 },
    Norway: { lat: 60.472024, lng: 8.468946 },
    Poland: { lat: 51.919438, lng: 19.145136 },
    Portugal: { lat: 39.399872, lng: -8.224454 },
    Singapore: { lat: 1.352083, lng: 103.819839 },
    "South Korea": { lat: 35.907757, lng: 127.766922 },
    Spain: { lat: 40.463667, lng: -3.74922 },
    Sweden: { lat: 60.128161, lng: 18.643501 },
    Switzerland: { lat: 46.818188, lng: 8.227512 },
    "United Kingdom": { lat: 55.378051, lng: -3.435973 },
    "United States": { lat: 37.09024, lng: -95.712891 },
};

export default function RankingsMap({ rankings, metricGroups, loading }) {
    const [selectedCountry, setSelectedCountry] = useState(null);

    const center = [20, 0];
    const zoom = 2;

    const getMetricStats = (country) =>
        metricGroups.map((name) => {
            const score = country.groups?.[name]?.group_score ?? null;
            return { name, score };
        });

    if (loading)
        return (
            <div className="w-full flex justify-center items-center py-20">
                Loading world map...
            </div>
        );

    rankings.forEach((country) => {
        const coords = countryCoordinates[country.country_name];
        if (coords) {
            country.lat = coords.lat;
            country.lng = coords.lng;
        }
    });

    return (
        <MapContainer
            center={center}
            zoom={zoom}
            zoomControl={false}
            scrollWheelZoom={true}
            className="w-full min-h-[90vh] rounded-2xl shadow-md fadeIn"
            worldCopyJump={false}
            minZoom={2}
            attributionControl={false}
        >
            <TileLayer
                url="https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png"
                attribution='&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>'
            />

            <MarkerClusterGroup chunkedLoading showCoverageOnHover={false} iconCreateFunction={createCustomClusterIcon}>
                {rankings.map((country) =>
                    country.lat && country.lng ? (
                        <Marker
                            key={country.country_id}
                            position={[country.lat, country.lng]}
                            icon={createCountryIcon(country.flag)}
                            eventHandlers={{
                                click: () => setSelectedCountry(country),
                            }}
                        >
                            <Tooltip direction="bottom" offset={[0, 0]} opacity={0.95} permanent={false}>
                                <div style={{ minWidth: 120 }}>
                                    <strong>{country.country_name}</strong>
                                    <ul style={{ margin: 0, padding: 0 }}>
                                        {getMetricStats(country).map(({ name, score }, i) => (
                                            <li
                                                key={i}
                                                style={{ fontSize: 11, color: "#434", lineHeight: "17px" }}
                                            >
                                                {String(name)}:{" "}
                                                <span style={{ fontWeight: "bold" }}>
                                                    {score !== null && score !== undefined
                                                        ? Number(score).toFixed(2)
                                                        : "—"}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </Tooltip>
                            <Popup>
                                <div style={{ minWidth: 220 }}>
                                    <div style={{ display: "flex", alignItems: "center" }}>
                                        {country.flag && (
                                            <img
                                                src={country.flag}
                                                alt="flag"
                                                style={{ width: 40, marginRight: 8, borderRadius: 4 }}
                                            />
                                        )}
                                        <div style={{ fontWeight: "bold", fontSize: 17 }}>
                                            {country.country_name}
                                        </div>
                                        <span
                                            style={{
                                                marginLeft: "auto",
                                                fontSize: 13,
                                                color: "#E97451",
                                                fontWeight: "bold",
                                            }}
                                        >
                                            {country.final_score?.toFixed(2)}%
                                        </span>
                                    </div>
                                    <hr />
                                    <p style={{ fontSize: 13 }}>
                                        <strong>Metric Groups:</strong>
                                    </p>
                                    <ul>
                                        {getMetricStats(country).map(({ name, score }, i) => (
                                            <li key={i}>
                                                {String(name)}:{" "}
                                                <b>
                                                    {score !== null && score !== undefined
                                                        ? Number(score).toFixed(2)
                                                        : "—"}
                                                </b>
                                            </li>
                                        ))}
                                    </ul>
                                    <button
                                        className="mt-2 px-3 py-2 rounded bg-orange-100 text-orange-900"
                                        onClick={() => setSelectedCountry(null)}
                                    >
                                        Close
                                    </button>
                                </div>
                            </Popup>
                        </Marker>
                    ) : null
                )}
            </MarkerClusterGroup>
        </MapContainer>
    );
}
