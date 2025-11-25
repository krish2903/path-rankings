import { useState, useMemo, useEffect } from "react";
import { Star, X } from "lucide-react";
import { iconMap } from "../data/Data";
import DonutProgress from "./DonutProgress";
import CountryDetailsPage from "./CountryDetails";
import { getBuckets } from "../lib/utils";

function getValue(row, key, groupNames) {
  if (key === "rank") return row.rank;
  if (key === "final_score" || key === "score") return row.final_score ?? row.score;
  if (key === "overall_score") return row.overall_score;
  if (key === "discipline_score") return row.discipline_score;
  if (key === "industry_score") return row.industry_score;
  if (key.startsWith("group_")) {
    const groupName = key.slice(6);
    return row.groups?.[groupName]?.group_score ?? null;
  }
  if (key.endsWith("_name")) return row[key];
  return null;
}

const RankingsTable = ({
  rankings,
  loading,
  metricGroups,
  industriesData = [],
  disciplinesData = [],
  category = "Country",
}) => {
  const isCountry = category.toLowerCase() === "country";

  // Keys differ between Country and University
  const idKey = isCountry ? "country_id" : "university_id";
  const nameKey = isCountry ? "country_name" : "university_name";

  const groupNames = metricGroups.map(g => g.name);

  // Compose columns dynamically
  const columns = [
    { key: "rank", label: "No.", numeric: true },
    { key: nameKey, label: "Name", numeric: false },
    { key: "final_score", label: "Final Score", numeric: true },
    // Only show these for countries
    ...(isCountry
      ? [
        { key: "overall_score", label: "Overall Score", numeric: true },
        { key: "discipline_score", label: "Discipline Score", numeric: true },
        { key: "industry_score", label: "Industry Score", numeric: true },
      ]
      : []),
    ...groupNames.map((name) => ({ key: `group_${name}`, label: name, numeric: true })),
  ];

  // Bucket and rank the data (currently only for country; for university you can adjust/remove bucket logic if needed)
  const [bucketedData, setBucketedData] = useState([]);

  useEffect(() => {
    if (!rankings.length) {
      setBucketedData([]);
      return;
    }

    const scored = getBuckets(
      rankings.map((row) => ({
        country: row[nameKey],
        score: row.final_score,
        ...row,
      }))
    );
    setBucketedData(scored);
  }, [rankings, nameKey]);

  // Add rank index
  const dataWithRank = bucketedData.map((row, idx) => ({
    ...row,
    rank: idx + 1,
  }));

  // Sorting state
  const [sortConfig, setSortConfig] = useState({ key: "final_score", direction: "desc" });

  // Sorting logic
  const sortedData = useMemo(() => {
    if (!columns.length) return dataWithRank;
    return [...dataWithRank].sort((a, b) => {
      const { key } = columns.find((c) => c.key === sortConfig.key) || {};
      if (!key) return 0;
      const aValue = getValue(a, key, groupNames);
      const bValue = getValue(b, key, groupNames);

      if (aValue == null && bValue == null) return 0;
      if (aValue == null) return 1;
      if (bValue == null) return -1;

      if (columns.find((c) => c.key === key)?.numeric) {
        return sortConfig.direction === "asc"
          ? Number(aValue) - Number(bValue)
          : Number(bValue) - Number(aValue);
      } else {
        return sortConfig.direction === "asc"
          ? String(aValue).localeCompare(String(bValue))
          : String(bValue).localeCompare(String(aValue));
      }
    });
  }, [dataWithRank, sortConfig, columns, groupNames]);

  // Lookup maps for industries and disciplines (only used for countries)
  const industriesByCountry = useMemo(() => {
    if (!isCountry) return {};
    const map = {};
    industriesData.forEach((entry) => {
      if (entry.country) {
        map[entry.country.toLowerCase()] = entry;
      }
    });
    return map;
  }, [industriesData, isCountry]);

  const disciplinesByCountry = useMemo(() => {
    if (!isCountry) return {};
    const map = {};
    disciplinesData.forEach((entry) => {
      if (entry.country) {
        map[entry.country.toLowerCase()] = entry;
      }
    });
    return map;
  }, [disciplinesData, isCountry]);

  // Handlers
  const [selectedCountry, setSelectedCountry] = useState(null);
  const closeModal = () => setSelectedCountry(null);

  if (loading) {
    return (
      <div className="flex flex-col py-16 items-center justify-center bg-white rounded-2xl overflow-hidden">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-500 mx-auto mb-4"></div>
        <p className="text-md font-light tracking-tight text-black/80">Loading rankings...</p>
      </div>
    );
  }

  if (!rankings.length) {
    return (
      <div className="flex flex-col py-16 gap-2 items-center justify-center overflow-hidden">
        <img src="https://illustrations.popsy.co/amber/question-mark.svg" className="max-h-64" />
        <p className="text-md font-medium tracking-tight text-black/80">No rankings found.</p>
        <p className="text-sm font-light tracking-tight text-black/80">Please try changing your filtering options!</p>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col w-full fadeIn">
        <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-6">
          {sortedData.map((item) => {
            const nameLower = item[nameKey]?.toLowerCase();
            const industryInfo = isCountry ? industriesByCountry[nameLower] ?? null : null;
            const disciplineInfo = isCountry ? disciplinesByCountry[nameLower] ?? null : null;

            return (
              <div
                key={item[idKey]}
                onClick={() => isCountry && setSelectedCountry(item)}
                className="flex flex-col p-4 space-y-4 rounded-4xl inset-shadow-sm shadow-md border border-black/5 bg-white/50 cursor-pointer transform transition-transform duration-200 hover:scale-102"
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") isCountry && setSelectedCountry(item);
                }}
                aria-label={`View details for ${item[nameKey]}`}
              >
                <div className="flex justify-between">
                  <div className="rounded-full py-0.5 px-2.5 bg-black/80">
                    <span className="text-sm font-bold text-white">{item.rank}</span>
                  </div>
                  <div className="flex gap-2 flex-wrap justify-end">
                    <div
                      className={`flex items-center gap-1.5 rounded-full py-0.5 px-2.5 ${item.classes}`}
                      title={`${item.label} (${item.grade}) (${Number(item.score ?? item.final_score).toFixed(2)}%)`}
                      aria-label={`${item.label} (${item.grade})`}
                    >
                      <span className="text-sm font-medium">{item.bucket}</span>
                      <div className="flex justify-center items-center w-6 h-6 bg-white/50 ring ring-white/30 rounded-full font-semibold text-xs">{item.grade}</div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2 px-1">
                  <div className="flex items-center gap-2">
                    {item.flag && (
                      <img
                        src={item.flag}
                        alt={`${item[nameKey]} flag`}
                        className="w-6 h-4 object-cover rounded shadow-sm"
                      />
                    )}
                    <div className="text-lg sm:text-xl font-medium text-black/90">{item[nameKey]}</div>
                  </div>

                  {isCountry && disciplineInfo?.comments && (
                    <p className="text-xs md:text-sm text-gray-600">{disciplineInfo.comments}</p>
                  )}

                  <div className="grid grid-cols-2 md:flex md:px-12 justify-between">
                    {groupNames.map((groupName) => {
                      const scoreRaw = item.groups?.[groupName]?.group_score;
                      const score = scoreRaw != null ? scoreRaw.toFixed(2) : "—";
                      const numericScore = score === "—" ? 0 : parseFloat(score);
                      const IconComponent = iconMap[groupName] || Star;
                      return (
                        <div
                          key={groupName}
                          className="flex flex-col items-center justify-center py-2 text-black/80"
                          title={`${groupName}: ${score === "—" ? "No data" : score}`}
                        >
                          {score === "—" ? (
                            <div className="text-sm text-orange-600 font-bold">—</div>
                          ) : (
                            <DonutProgress
                              value={numericScore}
                              size={85}
                              strokeWidth={5}
                              Icon={IconComponent}
                              tooltip={groupName}
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {isCountry && industryInfo && (
                    <div className="text-sm">
                      <h1 className="px-1 text-xs font-medium uppercase text-black/40 mb-1 tracking-wider">Key Industries</h1>
                      <div className="h-0.5 w-full border-t-1 border-black/15 mb-3"></div>
                      <div className="flex flex-col sm:flex-row gap-4 sm:gap-8">
                        <div className="px-1">
                          <strong className="text-xs md:text-sm text-orange-700">Dominant</strong>
                          <ol className="list-decimal text-xs md:text-sm list-inside text-black/80 mt-1">
                            {industryInfo.top_dominant_sectors.slice(0, 3).map((sector, i) => (
                              <li key={i}>{sector}</li>
                            ))}
                          </ol>
                        </div>
                        <div>
                          <strong className="text-xs md:text-sm text-orange-700">Growing</strong>
                          <ol className="list-decimal text-xs md:text-sm list-inside text-black/80 mt-1">
                            {industryInfo.top_growing_sectors.slice(0, 3).map((sector, i) => (
                              <li key={i}>{sector}</li>
                            ))}
                          </ol>
                        </div>
                      </div>
                    </div>
                  )}

                  {isCountry && disciplineInfo && (
                    <div className="text-sm mt-2">
                      <h1 className="px-1 text-xs font-medium uppercase text-black/40 mb-1 tracking-wider">Key Disciplines</h1>
                      <div className="h-0.5 w-full border-t-1 border-black/15 mb-3"></div>
                      <ol className="list-decimal text-xs md:text-sm list-inside text-black/80 mt-1">
                        {disciplineInfo.top_disciplines.slice(0, 3).map((discipline, i) => (
                          <li key={i}>{discipline}</li>
                        ))}
                      </ol>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal details only for countries */}
      {isCountry && selectedCountry && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-2 sm:p-6"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-gradient-to-t from-white to-slate-100 rounded-3xl w-[95%] sm:max-w-[90%] lg:max-w-[75%] max-h-[90vh] overflow-auto scrollbar-hide px-4 sm:px-8 py-8 sm:py-14 relative shadow-lg fadeIn">
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 text-xs md:text-sm p-2.5 bg-black/5 text-gray-600 hover:bg-black/7 rounded-full cursor-pointer"
            >
              <X size={16} />
            </button>
            <CountryDetailsPage
              country={selectedCountry}
              metricGroups={metricGroups}
              industriesData={industriesData}
              disciplinesData={disciplinesData}
              isModal={true}
              onClose={closeModal}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default RankingsTable;