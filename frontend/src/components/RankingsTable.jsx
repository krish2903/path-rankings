import { useState, useMemo } from "react";
import { Star } from "lucide-react";
import { iconMap } from "../data/Data";
import DonutProgress from "./DonutProgress";
import CountryDetailsPage from "./CountryDetails";

function getValue(row, key, groupNames) {
  if (key === "rank") return row.rank;
  if (key === "country_name") return row.country_name;
  if (key === "final_score") return row.final_score;
  if (key === "overall_score") return row.overall_score;
  if (key === "discipline_score") return row.discipline_score;
  if (key === "industry_score") return row.industry_score;
  if (key.startsWith("group_")) {
    const groupName = key.slice(6);
    return row.groups?.[groupName]?.group_score ?? null;
  }
  return null;
}

const RankingsTable = ({
  rankings,
  loading,
  metricGroups,
  industriesData = [],
  disciplinesData = [],
}) => {
  const [sortConfig, setSortConfig] = useState({ key: "final_score", direction: "desc" });
  const [selectedCountry, setSelectedCountry] = useState(null);

  let groupNames = [];
  if (metricGroups && metricGroups.length) {
    groupNames = metricGroups.map((g) => g.name);
  } else if (rankings.length) {
    groupNames = Object.keys(rankings[0].groups);
  }

  const columns = [
    { key: "rank", label: "No.", numeric: true },
    { key: "country_name", label: "Name", numeric: false },
    { key: "final_score", label: "Final Score", numeric: true },
    { key: "overall_score", label: "Overall Score", numeric: true },
    { key: "discipline_score", label: "Discipline Score", numeric: true },
    { key: "industry_score", label: "Industry Score", numeric: true },
    ...groupNames.map((name) => ({
      key: `group_${name}`,
      label: name,
      numeric: true,
    })),
  ];

  const dataWithRank = rankings.map((row, idx) => ({
    ...row,
    rank: idx + 1,
  }));

  const sortedData = useMemo(() => {
    if (!sortConfig.key) return dataWithRank;
    const col = columns.find((c) => c.key === sortConfig.key);
    if (!col) return dataWithRank;
    return [...dataWithRank].sort((a, b) => {
      const aValue = getValue(a, sortConfig.key, groupNames);
      const bValue = getValue(b, sortConfig.key, groupNames);

      if (aValue == null && bValue == null) return 0;
      if (aValue == null) return 1;
      if (bValue == null) return -1;

      if (col.numeric) {
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

  const industriesByCountry = useMemo(() => {
    const map = {};
    industriesData.forEach((entry) => {
      if (entry.country) {
        map[entry.country.toLowerCase()] = entry;
      }
    });
    return map;
  }, [industriesData]);

  const disciplinesByCountry = useMemo(() => {
    const map = {};
    disciplinesData.forEach((entry) => {
      if (entry.country) {
        map[entry.country.toLowerCase()] = entry;
      }
    });
    return map;
  }, [disciplinesData]);

  const handleCardClick = (country) => setSelectedCountry(country);
  const closeModal = () => setSelectedCountry(null);

  if (loading) {
    return (
      <div className="flex flex-col py-16 items-center justify-center bg-white rounded-2xl overflow-hidden">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-500 mx-auto mb-4"></div>
        <p className="text-md font-light tracking-tight text-black/80">
          Loading rankings...
        </p>
      </div>
    );
  }

  if (!rankings.length) {
    return (
      <div className="flex flex-col py-16 items-center justify-center bg-white rounded-2xl overflow-hidden">
        <p className="text-md font-light tracking-tight text-black/80">
          No rankings data available
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col w-full fadeIn">
        <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-6">
          {sortedData.map((country) => {
            const industryInfo =
              industriesByCountry[country.country_name.toLowerCase()] ?? null;
            const disciplineInfo =
              disciplinesByCountry[country.country_name.toLowerCase()] ?? null;

            return (
              <div
                key={country.country_id}
                onClick={() => handleCardClick(country)}
                className="flex flex-col p-4 space-y-4 rounded-4xl inset-shadow-sm shadow-md border border-gray-100 bg-gradient-to-t from-white to-gray-50 cursor-pointer transform transition-transform duration-200 hover:scale-102"
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    handleCardClick(country);
                  }
                }}
                aria-label={`View details for ${country.country_name}`}
              >
                <div className="flex justify-between">
                  <div className="rounded-full py-0.5 px-2.5 bg-black/80">
                    <span className="text-sm font-bold text-white">{country.rank}</span>
                  </div>
                  <div className="flex gap-2 flex-wrap justify-end">
                    {country.rank === 1 && (
                      <div className="flex items-center rounded-full py-0.5 px-3 bg-[#E97451]">
                        <span className="text-sm font-medium text-white">Top Choice</span>
                      </div>
                    )}
                    <div className="rounded-full py-0.5 px-2.5 bg-slate-200">
                      <span className="text-sm font-bold">
                        {country.final_score.toFixed(2)}%
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2 px-1">
                  <div className="flex items-center gap-2">
                    {country.flag && (
                      <img
                        src={country.flag}
                        alt={`${country.country_name} flag`}
                        className="w-6 h-4 object-cover rounded shadow-sm"
                      />
                    )}
                    <div className="text-lg sm:text-xl font-medium text-black/90">
                      {country.country_name}
                    </div>
                  </div>

                  <div className="min-h-10">
                    {disciplineInfo?.comments && (
                      <p className="text-xs md:text-sm text-gray-600">{disciplineInfo.comments}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 md:flex md:px-12 justify-between">
                    {groupNames.map((groupName) => {
                      const scoreRaw = country.groups?.[groupName]?.group_score;
                      const score = scoreRaw != null ? scoreRaw.toFixed(2) : "—";
                      const numericScore = score === "—" ? 0 : parseFloat(score);
                      const IconComponent = iconMap[groupName] || Star;

                      return (
                        <div
                          key={groupName}
                          className="flex flex-col items-center justify-center py-2 text-black/80"
                          title={`${groupName}: ${score === "—" ? "No data" : score + "%"
                            }`}
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

                  {industryInfo && (
                    <div className="text-sm">
                      <h1 className="px-1 text-xs font-medium uppercase text-black/40 mb-1 tracking-wider">
                        Key Industries
                      </h1>
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

                  {disciplineInfo && (
                    <div className="text-sm mt-2">
                      <h1 className="px-1 text-xs font-medium uppercase text-black/40 mb-1 tracking-wider">
                        Key Disciplines
                      </h1>
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

      {selectedCountry && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-2 sm:p-6"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-gradient-to-t from-white to-slate-100 rounded-3xl w-[95%] sm:max-w-[90%] lg:max-w-[75%] max-h-[90vh] overflow-auto scrollbar-hide px-4 sm:px-8 py-8 sm:py-14 relative shadow-lg fadeIn">
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 text-xs md:text-sm px-3 py-2 bg-slate-200 text-gray-600 hover:bg-slate-300 rounded-full cursor-pointer"
            >
              ✕
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
