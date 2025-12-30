import { useState, useMemo, useEffect, useContext, useRef, useCallback } from "react";
import { ArrowRight, Heart, Star, X } from "lucide-react";
import { iconMap } from "../data/Data";
import DonutProgress from "./DonutProgress";
import CountryDetailsPage from "./CountryDetails";
import { getCountryBuckets, getUniBuckets, bucketHeaderStyles } from "../lib/utils";
import { RankingsContext } from "@/contexts/RankingsContext";
import UniDetailsPage from "./UniversityDetails";
import { Skeleton } from "./ui/skeleton";
import { Link } from "react-router-dom";

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
  const {
    shortlistedCountries, setShortlistedCountries,
    shortlistedUnis, setShortlistedUnis,
  } = useContext(RankingsContext);

  const isCountry = category.toLowerCase() === "country";

  // Keys differ between Country and University
  const idKey = isCountry ? "country_id" : "university_id";
  const nameKey = isCountry ? "country_name" : "university_name";
  let shortlistedItem = isCountry ? shortlistedCountries : shortlistedUnis
  let setShortlistedItem = isCountry ? setShortlistedCountries : setShortlistedUnis

  const groupNames = metricGroups.map(g => g.name);

  // Load more state
  const [visibleGroupsCount, setVisibleGroupsCount] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Refs for infinite scroll
  const observerTarget = useRef(null);
  const containerRef = useRef(null);

  // Compose columns dynamically
  const columns = [
    { key: "rank", label: "No.", numeric: true },
    { key: nameKey, label: "Name", numeric: false },
    { key: "final_score", label: "Final Score", numeric: true },
    ...(isCountry
      ? [
        { key: "overall_score", label: "Overall Score", numeric: true },
        { key: "discipline_score", label: "Discipline Score", numeric: true },
        { key: "industry_score", label: "Industry Score", numeric: true },
      ]
      : []),
    ...groupNames.map((name) => ({ key: `group_${name}`, label: name, numeric: true })),
  ];

  // Bucket and rank the data
  const [bucketedData, setBucketedData] = useState([]);

  useEffect(() => {
    shortlistedItem = isCountry ? shortlistedCountries : shortlistedUnis
    setShortlistedItem = isCountry ? setShortlistedCountries : setShortlistedUnis
  }, [isCountry]);

  useEffect(() => {
    if (!rankings.length) {
      setBucketedData([]);
      return;
    }

    let scored;

    if (isCountry) {
      scored = getCountryBuckets(
        rankings.map((row) => ({
          country: row[nameKey],
          score: row.final_score,
          ...row,
        }))
      );
    } else {
      scored = getUniBuckets(
        rankings.map((row) => ({
          country: row[nameKey],
          score: row.final_score,
          ...row,
        }))
      );
    }

    setBucketedData(scored);
  }, [rankings, nameKey]);

  // Add rank index
  const dataWithRank = bucketedData.map((row, idx) => ({
    ...row,
    rank: idx + 1,
  }));

  // Sorting state (sort within groups, not across groups)
  const [sortConfig, setSortConfig] = useState({ key: "final_score", direction: "desc" });

  // Sorting logic for individual items within groups
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

  // Group data by bucket (countries) or grade (universities)
  const groupedData = useMemo(() => {
    const groups = {};

    sortedData.forEach((item) => {
      const groupKey = item.bucket;

      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(item);
    });

    const order = ["Best Match", "Good Match", "Fair Match", "Rest"];

    return order
      .map(key => ({ key, items: groups[key] || [] }))
      .filter(group => group.items.length > 0);
  }, [sortedData, isCountry]);

  // Visible groups (limited by visibleGroupsCount)
  const visibleGroupedData = useMemo(() => {
    return groupedData.slice(0, visibleGroupsCount);
  }, [groupedData, visibleGroupsCount]);

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

  const disciplinesInformation = useMemo(() => {
    const map = {};
    disciplinesData.forEach((entry) => {
      if (entry.country) {
        map[entry.country.toLowerCase()] = entry;
      } else if (entry.uni) {
        map[entry.uni.toLowerCase()] = entry;
      }
    });
    return map;
  }, [disciplinesData]);

  // Handlers
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [selectedUni, setSelectedUni] = useState(null);
  const closeCountryModal = () => setSelectedCountry(null);
  const closeUniModal = () => setSelectedUni(null);

  const handleShortlist = (item) => {
    const alreadyShortlisted = shortlistedItem.some(
      (i) => i[idKey] === item[idKey]
    );

    if (alreadyShortlisted) {
      setShortlistedItem(prev => prev.filter(shortlistedItem => shortlistedItem[idKey] !== item[idKey]));
    } else {
      setShortlistedItem(prev => [...prev, item]);
    }
  };

  const handleLoadMore = useCallback(() => {
    if (isLoadingMore || visibleGroupsCount >= groupedData.length) return;

    setIsLoadingMore(true);
    setTimeout(() => {
      setVisibleGroupsCount(prev => Math.min(prev + 1, groupedData.length));
      setIsLoadingMore(false);
    }, 300);
  }, [isLoadingMore, visibleGroupsCount, groupedData.length]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isLoadingMore && visibleGroupsCount < groupedData.length) {
          handleLoadMore();
        }
      },
      {
        root: null,
        rootMargin: '200px',
        threshold: 0.1,
      }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [handleLoadMore, isLoadingMore, visibleGroupsCount, groupedData.length]);

  useEffect(() => {
    setVisibleGroupsCount(1);
  }, [rankings]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-4 fadeIn">
        <div className="flex justify-center md:col-span-2">
          <Skeleton className="h-12 w-xs rounded-full" />
        </div>
        <div className="flex flex-col space-y-3 px-2">
          <Skeleton className="h-[250px] w-full rounded-3xl" />
          <div className="space-y-3">
            <Skeleton className="h-6 w-9/10 rounded-full" />
            <Skeleton className="h-6 w-3/4 rounded-full" />
          </div>
        </div>
        <div className="flex flex-col space-y-3 px-2">
          <Skeleton className="h-[250px] w-full rounded-3xl" />
          <div className="space-y-3">
            <Skeleton className="h-6 w-9/10 rounded-full" />
            <Skeleton className="h-6 w-3/4 rounded-full" />
          </div>
        </div>
        <div className="flex flex-col space-y-3 px-2">
          <Skeleton className="h-[250px] w-full rounded-3xl" />
          <div className="space-y-3">
            <Skeleton className="h-6 w-9/10 rounded-full" />
            <Skeleton className="h-6 w-3/4 rounded-full" />
          </div>
        </div>
        <div className="flex flex-col space-y-3 px-2">
          <Skeleton className="h-[250px] w-full rounded-3xl" />
          <div className="space-y-3">
            <Skeleton className="h-6 w-9/10 rounded-full" />
            <Skeleton className="h-6 w-3/4 rounded-full" />
          </div>
        </div>
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

  const hasMoreGroups = visibleGroupsCount < groupedData.length;

  return (
    <>
      <div ref={containerRef} className="flex flex-col w-full fadeIn space-y-8">
        {visibleGroupedData.map(({ key: groupKey, items }, groupIndex) => (
          <div key={groupKey} className="fadeIn">
            {/* Group Header */}
            <div className={`relative max-w-48 sm:max-w-xs flex items-center rounded-full justify-center my-4 mx-auto py-2 ${bucketHeaderStyles[groupKey]}`}>
              <h2 className="text-sm md:text-lg font-semibold tracking-tight">
                {groupKey} ({items.length})
              </h2>
              {/* Shortlist all button */}
              {isCountry &&
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    const bestMatchIds = items.map(item => item[idKey]);
                    const allShortlisted = items.every(item =>
                      shortlistedItem.some(shortlisted => shortlisted[idKey] === item[idKey])
                    );

                    if (allShortlisted) {
                      // Remove all Best Match items from shortlist
                      setShortlistedItem(prev =>
                        prev.filter(shortlisted => !bestMatchIds.includes(shortlisted[idKey]))
                      );
                    } else {
                      // Add missing Best Match items to shortlist
                      const missingItems = items.filter(item =>
                        !shortlistedItem.some(shortlisted => shortlisted[idKey] === item[idKey])
                      );
                      setShortlistedItem(prev => [
                        ...prev,
                        ...missingItems
                      ]);
                    }
                  }}
                  className="absolute right-2 md:right-3 flex items-center justify-center rounded-full w-6 md:w-7 h-6 md:h-7 z-1 cursor-pointer group ring-2 ring-orange-700/10"
                >
                  <Heart
                    fill={items.every(item =>
                      shortlistedItem.some(shortlisted => shortlisted[idKey] === item[idKey])
                    ) ? "rgba(225, 29, 72, 0.8)" : "transparent"}
                    className={`w-4 h-4 transition-all duration-300 group-active:scale-120 ${items.every(item =>
                      shortlistedItem.some(shortlisted => shortlisted[idKey] === item[idKey])
                    )
                      ? "text-rose-600/80"
                      : "text-orange-800"
                      }`}
                  />
                </button>
              }
            </div>

            {/* Group Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8 last:mb-0">
              {items.map((item) => {
                const nameLower = item[nameKey]?.toLowerCase();
                const industryInfo = isCountry ? industriesByCountry[nameLower] ?? null : null;
                const disciplineInfo = disciplinesInformation[nameLower] ?? null;

                return (
                  <div
                    key={item[idKey]}
                    onClick={() => isCountry ? setSelectedCountry(item) : setSelectedUni(item)}
                    className={`p-4 space-y-4 rounded-4xl inset-shadow-sm shadow-md border border-black/5 bg-white/50 cursor-pointer transform transition-transform duration-200 hover:scale-[1.02] flex flex-col`}
                    role="button"
                    tabIndex={0}
                    aria-label={`View details for ${item[nameKey]}`}
                  >
                    <div className="flex justify-between">
                      <div className="flex items-center justify-center rounded-full w-7 h-7 bg-black/80">
                        <span className="text-sm font-semibold text-white">{item.rank}</span>
                      </div>
                      <div className="flex gap-2 flex-wrap justify-end">
                        {isCountry &&
                          <button onClick={(e) => {
                            e.stopPropagation();
                            handleShortlist(item);
                          }}
                            className="flex items-center ring-2 ring-black/10 justify-center rounded-full w-7 h-7 bg-black/5 z-1 cursor-pointer group"
                          >
                            <Heart
                              fill={shortlistedItem.some(
                                (i) => i[idKey] === item[idKey]
                              )
                                ? "rgba(225, 29, 72, 0.8)"
                                : "transparent"}
                              className={`w-4 h-4 transition-all duration-300 group-active:scale-120 ${shortlistedItem.some(
                                (i) => i[idKey] === item[idKey]
                              )
                                ? "text-rose-600/80"
                                : "text-black/80"
                                }`}
                            />
                          </button>
                        }
                        {!isCountry &&
                          <Link
                            to="https://www.inforens.com/guides"
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => {
                              e.stopPropagation();
                            }}
                            className="flex text-sm gap-1 px-2 ring-2 ring-orange-700/80 items-center text-white font-medium justify-center rounded-full bg-orange-700/75 z-1 cursor-pointer group"
                          >
                            Apply with Inforens
                            <ArrowRight size={18} />
                          </Link>
                        }
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 px-1 flex-1">
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

                      {disciplineInfo?.comments && (
                        <p className="text-xs md:text-sm text-gray-600">{disciplineInfo.comments}</p>
                      )}

                      <div className="grid grid-cols-2 lg:flex lg:px-12 justify-between">
                        {groupNames.map((groupName) => {
                          const scoreRaw = item.groups?.[groupName]?.group_score;
                          const score = scoreRaw != null ? scoreRaw.toFixed(2) : "—";
                          const numericScore = score === "—" ? 0 : parseFloat(score);
                          const IconComponent = iconMap[groupName] || Star;
                          return (
                            <div
                              key={groupName}
                              className="flex flex-col items-center justify-center py-2 text-black/80"
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

                      {disciplineInfo && (
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
        ))}

        {/* Infinite Scroll Trigger Point */}
        {hasMoreGroups && (
          <div ref={observerTarget} className="w-full flex justify-center py-4">
            {isLoadingMore && (
              <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-8 py-4 fadeIn">
                <div className="flex justify-center md:col-span-2">
                  <Skeleton className="h-12 w-xs rounded-full" />
                </div>
                <div className="flex flex-col space-y-3 px-2">
                  <Skeleton className="h-[250px] w-full rounded-3xl" />
                  <div className="space-y-3">
                    <Skeleton className="h-6 w-9/10 rounded-full" />
                    <Skeleton className="h-6 w-3/4 rounded-full" />
                  </div>
                </div>
                <div className="flex flex-col space-y-3 px-2">
                  <Skeleton className="h-[250px] w-full rounded-3xl" />
                  <div className="space-y-3">
                    <Skeleton className="h-6 w-9/10 rounded-full" />
                    <Skeleton className="h-6 w-3/4 rounded-full" />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal details for countries */}
      {isCountry && selectedCountry && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-2 sm:p-6"
          role="dialog"
          aria-modal="true"
          tabIndex={-1}
          onKeyDown={(e) => {
            if (e.key === "Escape") closeCountryModal();
          }}
          onClick={closeCountryModal}
        >
          <div
            className="bg-gradient-to-t from-white to-slate-100 rounded-3xl w-[95%] sm:max-w-[90%] lg:max-w-[75%] max-h-[90vh] overflow-auto scrollbar-hide px-4 sm:px-8 py-8 sm:py-14 relative shadow-lg fadeIn"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={closeCountryModal}
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
            />
          </div>
        </div>
      )}

      {/* Modal details for universities */}
      {!isCountry && selectedUni && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-2 sm:p-6"
          role="dialog"
          aria-modal="true"
          tabIndex={-1}
          onKeyDown={(e) => {
            if (e.key === "Escape") closeUniModal();
          }}
          onClick={closeUniModal}
        >
          <div
            className="bg-gradient-to-t from-white to-slate-100 rounded-3xl w-[95%] sm:max-w-[90%] lg:max-w-[75%] max-h-[90vh] overflow-auto scrollbar-hide px-4 sm:px-8 py-8 sm:py-14 relative shadow-lg fadeIn"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={closeUniModal}
              className="absolute top-4 right-4 text-xs md:text-sm p-2.5 bg-black/5 text-gray-600 hover:bg-black/7 rounded-full cursor-pointer"
            >
              <X size={16} />
            </button>
            <UniDetailsPage
              uni={selectedUni}
              metricGroups={metricGroups}
              disciplinesData={disciplinesData}
              isModal={true}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default RankingsTable;