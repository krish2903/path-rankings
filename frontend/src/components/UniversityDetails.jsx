import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import DonutProgress from "./DonutProgress";
import { Sparkle, ExternalLink } from "lucide-react";
import { API_BASE, iconMap } from "../data/Data";
import { ClipLoader } from "react-spinners";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";

function useNorryInfo(uniName) {
  const [cards, setCards] = useState([]);
  const [sources, setSources] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!uniName) return;
    setLoading(true);
    setError(null);
    fetch(`${API_BASE}/uni-info?uni=${encodeURIComponent(uniName)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
          setCards([]);
          setSources([]);
        } else {
          setCards(data.cards || []);
          setSources(data.citations || []);
        }
      })
      .catch(() => {
        setError("Failed to fetch info");
        setCards([]);
        setSources([]);
      })
      .finally(() => setLoading(false));
  }, [uniName]);

  useEffect(() => {
    console.log(sources);
  }, [sources]);

  return { cards, sources, loading, error };
}

const extractCitationIndices = (description) => {
  if (!description) return [];
  const regex = /\[(\d+)\]/g;
  const indices = [];
  let match;
  while ((match = regex.exec(description)) !== null) {
    const oneBased = parseInt(match[1], 10);
    if (!Number.isNaN(oneBased)) {
      indices.push(oneBased - 1);
    }
  }
  return Array.from(new Set(indices)).filter((i) => i >= 0);
};

const stripCitationMarkers = (description) => {
  if (!description) return "";
  return description.replace(/\[\d+\]/g, "").trim();
};

const formatDate = (dateStr) => {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  if (isNaN(d)) return dateStr;

  const day = String(d.getDate()).padStart(2, "0");
  const month = d.toLocaleString("en-US", { month: "short" });
  const year = d.getFullYear();

  return `${day}, ${month}, ${year}`;
};

const UniDetailsPage = ({
  uni: propUni,
  metricGroups: propMetricGroups,
  disciplinesData: propDisciplinesData,
  isModal = false,
}) => {
  const location = useLocation();
  const navigate = useNavigate();

  const [rawMetrics, setRawMetrics] = useState([]);
  const [metricsLoading, setMetricsLoading] = useState(false);
  const [metricsError, setMetricsError] = useState(null);

  const uni = isModal ? propUni : location.state?.uni;
  const metricGroups = isModal ? propMetricGroups : location.state?.metricGroups;
  const disciplinesData = isModal ? propDisciplinesData : location.state?.disciplinesData;

  useEffect(() => {
    if (!uni?.university_name) return;
    const fetchMetrics = async () => {
      setMetricsLoading(true);
      setMetricsError(null);
      try {
        const res = await fetch(
          `${API_BASE}/uni-metrics?uni_name=${encodeURIComponent(
            uni.university_name
          )}`
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
  }, [uni?.university_name]);

  const getIcon = (name) => {
    for (const key in iconMap) {
      if (name.toLowerCase().includes(key.toLowerCase())) {
        return iconMap[key];
      }
    }
    return Sparkle;
  };

  const disciplineInfo = disciplinesData?.find(
    (entry) => entry.uni.toLowerCase() === uni.university_name.toLowerCase()
  );

  const {
    cards,
    sources,
    loading: norryLoading,
    error: norryError,
  } = useNorryInfo(uni?.university_name);

  if (!uni) {
    if (isModal) return null;
    return (
      <div className="p-8">
        <p>No university data available.</p>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 px-4 py-2 bg-orange-500 text-white rounded"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 px-3 sm:px-4">
      {/* Header */}
      <div className="flex flex-col items-center gap-2 text-center">
        {uni.flag && (
          <img src={uni.flag} className="h-8 w-12 shadow-sm rounded" alt="flag" />
        )}
        <h1
          id="uni-details-title"
          className="text-3xl sm:text-4xl lg:text-5xl font-medium tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-black to-gray-300 py-2"
        >
          {uni.university_name}
        </h1>
        <h2
          id="uni-details-subtitile"
          className="text-base font-medium tracking-tight text-black/40 pb-2"
        >
          {uni.city}, {uni.country_name}
        </h2>
        {uni.bucket && uni.classes && uni.grade && (
          <div
            className={`flex items-center gap-1.5 rounded-full py-1 px-4 bg-black/5 ring-2 ring-black/10`}
            title={`${uni.bucket} (${uni.grade}) (${Number(uni.score).toFixed(
              2
            )}%)`}
            aria-label={`${uni.bucket} (${uni.grade})`}
          >
            <div className="flex justify-center items-center w-6 h-6 font-semibold text-xs">
              {uni.grade}
            </div>
          </div>
        )}
      </div>

      {/* Key Insights */}
      <section className="w-full flex flex-col items-center">
        <h1 className="w-full text-center text-xs sm:text-sm pb-1 font-medium uppercase text-black/50 mb-1 tracking-wider border-b border-black/10">
          Key Insights
        </h1>
        {metricGroups && metricGroups.length > 0 ? (
          <div className="w-full grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 justify-center">
            {metricGroups.map(({ name }) => {
              const scoreRaw = uni.groups?.[name]?.group_score;
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

      {/* Metrics Cards */}
      <section>
        {metricsLoading ? (
          <ClipLoader size={18} color="#666" />
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
                    <h2 className="text-sm font-medium text-gray-700 mb-1">
                      {m.metric_name}
                    </h2>
                    <p className="font-medium text-xs md:text-sm text-black/40 mb-3">
                      {m.metric_description}
                    </p>
                  </div>
                  {m.raw_value != 0 ? (
                    <div className="text-lg sm:text-2xl font-bold text-orange-600 whitespace-nowrap">
                      {m.raw_value}
                      <span className="text-xs sm:text-sm font-medium text-gray-500 ml-1">
                        {m.unit}
                      </span>
                    </div>
                  ) : (
                    <p className="italic font-medium text-xs md:text-sm text-black/60">
                      Unfortunately, this data is unavailable at the moment, however, you can{" "}
                      <a
                        href="https://www.inforens.com/contact-us"
                        target="_blank"
                        className="underline text-orange-700"
                      >
                        contact our experts
                      </a>{" "}
                      to obtain the latest information on <b>{uni.university_name}</b>.
                    </p>
                  )}
                </div>
              ))}
          </div>
        ) : (
          <p className="text-center text-gray-500">
            No raw metric data available for this university.
          </p>
        )}
      </section>

      {/* Top Disciplines Section */}
      <section>
        <h1 className="w-full text-center text-xs sm:text-sm pb-1 font-medium uppercase text-black/50 mb-1 tracking-wider border-b border-black/10">
          Top Disciplines
        </h1>
        {disciplineInfo ? (
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
        ) : (
          <p className="text-center text-gray-500 font-medium">
            No disciplines information available.
          </p>
        )}
      </section>

      {/* Nori Info Cards */}
      <section className="flex flex-col items-center">
        <h1 className="w-full text-center text-xs sm:text-sm pb-1 font-medium uppercase text-black/50 mb-1 tracking-wider border-b border-black/10">
          Top News with Nori
        </h1>
        {norryLoading ? (
          <div className="w-full flex justify-center py-6">
            <ClipLoader size={22} color="#666" />
          </div>
        ) : norryError ? (
          <p className="text-red-500 text-center font-medium">{norryError}</p>
        ) : cards.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-2 py-4">
            {cards.map((card, idx) => {
              const Icon = getIcon(card.category);
              const citationIndices = extractCitationIndices(card.description);
              const cardSources = citationIndices
                .map((i) => sources[i])
                .filter(Boolean);

              return (
                <div
                  key={idx}
                  className="flex flex-col justify-top bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow duration-200 fadeIn"
                >
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <div className="flex items-center gap-1.5 text-xs font-medium uppercase text-gray-400 tracking-wide">
                        <Icon className="w-4 h-4 text-[#ec5b22]" />
                        {card.category}
                      </div>
                      <Popover>
                        <PopoverTrigger className="group flex justify-center items-center h-6 w-6 bg-black/5 hover:bg-black/10 rounded-full cursor-pointer">
                          <ExternalLink size={12} className="text-black/80" />
                        </PopoverTrigger>
                        <PopoverContent
                          align="end"
                          className="max-w-64 border-black/5 rounded-2xl"
                        >
                          {cardSources.length === 0 ? (
                            <p className="text-xs text-center text-black/60">
                              No sources used for this information.
                            </p>
                          ) : (
                            <div className="space-y-2">
                              <p className="text-xs font-medium text-center text-black/60">
                                Sources
                              </p>
                              {cardSources.map((src, i) => (
                                <div key={i} className="space-y-2">
                                  <Link
                                    to={src.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  >
                                    <div className="group flex flex-col text-xs">
                                      <h1 className="group-hover:underline text-orange-700/90">
                                        {src.title || src.url}
                                      </h1>
                                      {src.date && (
                                        <span className="text-xs text-black/50">
                                          ({formatDate(src.date)})
                                        </span>
                                      )}
                                    </div>
                                  </Link>
                                </div>
                              ))}
                            </div>
                          )}
                        </PopoverContent>
                      </Popover>
                    </div>
                    <h2 className="text-sm font-medium text-gray-700 mb-1">
                      {card.headline}
                    </h2>
                  </div>
                  <p className="font-medium text-xs md:text-sm text-black/40 mb-3">
                    {stripCitationMarkers(card.description)}
                  </p>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="mt-4 max-w-sm text-center text-sm text-black/60">
            No trending news available for this university currently. Try contacting us for more detailed information!
          </p>
        )}
      </section>

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
              href="https://www.inforens.com/guides"
              target="_blank"
              className="font-medium text-orange-700 underline"
            >
              Connect with a mentor
            </a>{" "}
            to learn directly from our international community who have studied in these universities.
          </li>
          <li className="text-sm sm:text-md tracking-tight text-black/60 px-2">
            <a
              href="https://www.inforens.com/contact-us"
              target="_blank"
              className="font-medium text-orange-700 underline"
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

export default UniDetailsPage;