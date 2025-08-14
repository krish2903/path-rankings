import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import DonutProgress from "./DonutProgress";
import { iconMap } from "../data/Data";
import { Globe2 } from "lucide-react";
import { API_BASE } from "../data/Data";

function useNorryInfo(countryName) {
    const [info, setInfo] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!countryName) return;
        setLoading(true);
        setError(null);

        fetch(`${API_BASE}/country-info?country=${encodeURIComponent(countryName)}`)
            .then((res) => res.json())
            .then((data) => {
                if (data.error) {
                    setError(data.error);
                    setInfo("");
                } else {
                    setInfo(data.info);
                }
            })
            .catch(() => {
                setError("Failed to fetch info");
                setInfo("");
            })
            .finally(() => setLoading(false));
    }, [countryName]);

    return { info, loading, error };
}

const CountryDetailsPage = ({
    country: propCountry,
    metricGroups: propMetricGroups,
    industriesData: propIndustriesData,
    disciplinesData: propDisciplinesData,
    isModal = false,
    onClose,
}) => {
    const location = useLocation();
    const navigate = useNavigate();

    const [rawMetrics, setRawMetrics] = useState([]);
    const [metricsLoading, setMetricsLoading] = useState(false);
    const [metricsError, setMetricsError] = useState(null);

    const country = isModal ? propCountry : location.state?.country;
    const metricGroups = isModal ? propMetricGroups : location.state?.metricGroups;
    const industriesData = isModal ? propIndustriesData : location.state?.industriesData;
    const disciplinesData = isModal ? propDisciplinesData : location.state?.disciplinesData;

    if (!country) {
        if (isModal) return null;
        return (
            <div className="p-8">
                <p>No country data available.</p>
                <button
                    onClick={() => navigate(-1)}
                    className="mt-4 px-4 py-2 bg-orange-500 text-white rounded"
                >
                    Go Back
                </button>
            </div>
        );
    }

    useEffect(() => {
        if (!country?.country_name) return;
        const fetchMetrics = async () => {
            setMetricsLoading(true);
            setMetricsError(null);
            try {
                const res = await fetch(
                    `${API_BASE}/country-metrics?country_name=${encodeURIComponent(country.country_name)}`
                );
                if (!res.ok) throw new Error(`Failed to fetch metrics: ${res.status}`);
                const data = await res.json();
                setRawMetrics(data);
            } catch (err) {
                setMetricsError(err.message || "Error fetching metrics");
            } finally {
                setMetricsLoading(false);
            }
        };
        fetchMetrics();
    }, [country?.country_name]);

    const industryInfo = industriesData.find(
        (entry) => entry.country.toLowerCase() === country.country_name.toLowerCase()
    );

    const { info, loading: infoLoading, error } = useNorryInfo(country.country_name);

    return (
        <div className="space-y-8 px-3 sm:px-4">
            {/* Header */}
            <div className="flex flex-col items-center gap-2 text-center">
                {country.flag && (
                    <img
                        src={country.flag}
                        className="h-8 w-12 shadow-sm rounded"
                        alt="flag"
                    />
                )}
                <h1
                    id="country-details-title"
                    className="text-3xl sm:text-4xl lg:text-5xl font-medium tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-black to-gray-300 py-2"
                >
                    {country.country_name}
                </h1>
                <p className="rounded-full py-1 px-4 bg-slate-200">
                    <span className="text-sm font-bold">
                        {country.overall_score.toFixed(2)}%
                    </span>
                </p>
            </div>

            {/* Key Insights Circle Graphs */}
            <section className="w-full flex flex-col items-center">
                <h1 className="w-full text-center text-xs sm:text-sm pb-1 font-medium uppercase text-black/50 mb-1 tracking-wider border-b border-black/10">
                    Key Insights
                </h1>
                {metricGroups && metricGroups.length > 0 ? (
                    <div className="w-full grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 justify-center">
                        {metricGroups.map(({ name }) => {
                            const scoreRaw = country.groups?.[name]?.group_score;
                            const score = scoreRaw != null ? scoreRaw.toFixed(2) : "—";
                            const numericScore = score === "—" ? 0 : parseFloat(score);
                            const IconComponent = iconMap[name] || null;
                            return (
                                <div
                                    key={name}
                                    className="flex flex-col justify-between items-center bg-transparent px-4 py-5 pb-0 rounded-3xl"
                                >
                                    <div className="font-medium text-sm px-3 md:px-6 mb-3 text-black/60 tracking-tight text-center">
                                        {name}
                                    </div>
                                    {score === "—" ? (
                                        <div className="text-md text-orange-600 font-bold">—</div>
                                    ) : (
                                        <DonutProgress
                                            value={numericScore}
                                            size={80}
                                            strokeWidth={6}
                                            Icon={IconComponent}
                                        />
                                    )}
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <p className="text-center text-gray-500 font-medium">
                        No metric group info available.
                    </p>
                )}
            </section>

            {/* Raw Metrics Cards */}
            <section>
                {metricsLoading ? (
                    <p className="text-center text-gray-500">Loading metrics...</p>
                ) : metricsError ? (
                    <p className="text-center text-red-500">{metricsError}</p>
                ) : rawMetrics.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {rawMetrics
                            .filter((m) => m.unit !== null && m.unit !== "")
                            .map((m, idx) => (
                                <div
                                    key={idx}
                                    className="flex flex-col justify-between bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow duration-200"
                                >
                                    <div>
                                        <span className="text-xs font-medium uppercase text-gray-400 tracking-wide mb-2 block">
                                            {m.metric_group}
                                        </span>
                                        <h2 className="text-sm sm:text-base font-semibold text-gray-700 mb-1">
                                            {m.metric_name}
                                        </h2>
                                        <p
                                            className="font-medium text-xs md:text-sm text-black/40 mb-3"
                                            style={{ minHeight: '3.5rem', lineHeight: '1.2rem' }}
                                        >
                                            {m.metric_description}
                                        </p>
                                    </div>

                                    <div className="text-lg sm:text-2xl font-bold text-orange-600 whitespace-nowrap">
                                        {m.raw_value}
                                        <span className="text-xs sm:text-sm font-medium text-gray-500 ml-1">
                                            {m.unit}
                                        </span>
                                    </div>
                                </div>
                            ))}
                    </div>
                ) : (
                    <p className="text-center text-gray-500">
                        No raw metric data available for this country.
                    </p>
                )}
            </section>

            {/* Disciplines Section */}
            <section>
                <h1 className="w-full text-center text-xs sm:text-sm pb-1 font-medium uppercase text-black/50 mb-1 tracking-wider border-b border-black/10">
                    Top Disciplines
                </h1>
                {(() => {
                    const disciplineInfo = disciplinesData.find(
                        (entry) =>
                            entry.country.toLowerCase() ===
                            country.country_name.toLowerCase()
                    );
                    if (!disciplineInfo) {
                        return (
                            <p className="text-center text-gray-500 font-medium">
                                No disciplines information available.
                            </p>
                        );
                    }
                    return (
                        <div className="flex flex-col items-center">
                            {disciplineInfo.comments && (
                                <p className="mt-4 text-black/60 text-center text-sm sm:text-md">
                                    {disciplineInfo.comments}
                                </p>
                            )}
                            {disciplineInfo.top_disciplines.length > 0 ? (
                                <div className="w-full max-w-xl grid grid-cols-3 justify-items-center mt-6 gap-y-4 gap-x-1">
                                    {disciplineInfo.top_disciplines.map((discipline, i) => {
                                        const IconComponent = iconMap[discipline] || null;
                                        return (
                                            <div
                                                key={i}
                                                className="flex flex-col items-center px-1 gap-1 md:gap-2"
                                            >
                                                {IconComponent && (
                                                    <div className="flex items-center justify-center bg-indigo-900 rounded-full p-2 md:p-4">
                                                        <IconComponent className="h-4 w-4 md:h-6 md:w-6 text-white" />
                                                    </div>
                                                )}
                                                <span className="text-xs font-medium tracking-tight text-black/60 text-center">
                                                    {discipline}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <p className="italic text-gray-500">
                                    No top disciplines available.
                                </p>
                            )}
                        </div>
                    );
                })()}
            </section>

            {/* Top Industries Section */}
            <section>
                <h1 className="w-full text-center text-xs sm:text-sm pb-1 font-medium uppercase text-black/50 mb-1 tracking-wider border-b border-black/10">
                    Top Industries
                </h1>
                {industryInfo ? (
                    <div className="flex flex-col items-center gap-4">
                        {industryInfo.comments && (
                            <div className="mt-4">
                                <p className="text-sm sm:text-md text-black/60 tracking-tight text-center">
                                    {industryInfo.comments}
                                </p>
                            </div>
                        )}
                        <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-8 sm:px-8 justify-center">
                            {/* Dominant */}
                            <div className="flex flex-col items-center gap-2">
                                <h3 className="font-medium text-sm sm:text-md mb-2 text-black/80 tracking-tight">
                                    Dominant
                                </h3>
                                {industryInfo.top_dominant_sectors.length > 0 ? (
                                    <div className="grid grid-cols-3 gap-2 justify-center">
                                        {industryInfo.top_dominant_sectors.slice(0, 3).map((sector, i) => {
                                            const IconComponent = iconMap[sector] || Globe2;
                                            return (
                                                <div key={i} className="flex flex-col items-center gap-1 md:gap-2">
                                                    <div className="flex items-center justify-center bg-orange-700 rounded-full p-2 md:p-4">
                                                        <IconComponent className="h-4 w-4 md:h-6 md:w-6 text-white" />
                                                    </div>
                                                    <span className="text-xs font-medium tracking-tight text-black/60 text-center">{sector}</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <p className="text-gray-500 italic">No dominant sectors data.</p>
                                )}
                            </div>
                            {/* Growing */}
                            <div className="flex flex-col items-center gap-2">
                                <h3 className="font-medium text-sm sm:text-md mb-2 text-black/80 tracking-tight">
                                    Growing
                                </h3>
                                {industryInfo.top_growing_sectors.length > 0 ? (
                                    <div className="grid grid-cols-3 gap-2 justify-center">
                                        {industryInfo.top_growing_sectors.slice(0, 3).map((sector, i) => {
                                            const IconComponent = iconMap[sector] || Globe2;
                                            return (
                                                <div key={i} className="flex flex-col items-center gap-1 md:gap-2">
                                                    <div className="flex items-center justify-center bg-teal-600 rounded-full p-2 md:p-4">
                                                        <IconComponent className="h-4 w-4 md:h-6 md:w-6 text-white" />
                                                    </div>
                                                    <span className="text-xs font-medium tracking-tight text-black/60 text-center">{sector}</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <p className="text-gray-500 italic">No growing sectors data.</p>
                                )}
                            </div>
                        </div>
                    </div>
                ) : (
                    <p className="text-center text-gray-500 font-medium">
                        No industry data available.
                    </p>
                )}
            </section>

            {/* Nori Info */}
            <div className="px-2 py-2 text-xs sm:text-sm rounded-md min-h-[80px] text-justify whitespace-pre-wrap">
                <h1 className="w-full text-center text-xs sm:text-sm pb-1 font-medium uppercase text-black/50 mb-1 tracking-wider border-b border-black/10">
                    Here's what Nori, your personal AI companion, says
                </h1>
                <div className="flex flex-col justify-center items-center pt-4 gap-4">
                    <img src="./norry.png" className="h-16 w-16" />
                    {infoLoading && (
                        <p className="text-black/60 tracking-tight font-light">
                            Still thinking...
                        </p>
                    )}
                    {error && (
                        <p className="text-black/60 tracking-tight font-light">
                            Nori is sleeping at the moment. Try Again later!
                        </p>
                    )}
                    {!infoLoading && !error && info && (
                        <p className="text-black/80 tracking-tight font-light fadeIn">
                            {info}
                        </p>
                    )}
                </div>
            </div>

            {/* More Info */}
            <section>
                <h1 className="w-full text-center text-xs sm:text-sm pb-1 font-medium uppercase text-black/50 mb-1 tracking-wider border-b border-black/10">
                    More Information
                </h1>
                <p className="text-sm sm:text-md tracking-tight text-black/60 pt-4 px-2 italic">
                    PATH Rankings are just the beginning!
                </p>
                <p className="text-sm sm:text-md tracking-tight text-black/60 mb-2 px-2 italic">
                    While tailored to what matters most to you, nothing beats hearing directly from someone who has experienced it.
                </p>
                <ul className="list-disc list-inside italic space-y-1">
                    <li className="text-sm sm:text-md tracking-tight text-black/60 px-2">
                        <a
                            href="#"
                            className="font-semibold text-teal-600 underline"
                        >
                            Connect with a mentor
                        </a>{" "}
                        to learn directly from our international community who have studied in these countries.
                    </li>
                    <li className="text-sm sm:text-md tracking-tight text-black/60 px-2">
                        <a
                            href="#"
                            className="font-semibold text-teal-600 underline"
                        >
                            Contact us today
                        </a>{" "}
                        and speak with our experienced advisors who can help guide your international journey!
                    </li>
                </ul>
            </section>
        </div>
    );
};

export default CountryDetailsPage;
