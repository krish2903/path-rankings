import { useContext, useEffect, useState, useMemo, useRef } from "react";
import FilterSheetContent from "../components/FilterSection";
import RankingsTable from "../components/RankingsTable";
import { History, ListFilter, RefreshCcw, Star } from "lucide-react";
import CountryInputs from "../components/CountryInputs";
import { DISCIPLINES, INDUSTRIES, API_BASE, iconMap } from "../data/Data";
import LoadingPage from "../pages/LoadingPage";
import { RankingsContext } from "../contexts/RankingsContext";
import PrioritySelector from "@/components/PrioritySelector";
import { Sheet, SheetTrigger, SheetContent } from "@/components/ui/sheet";
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import BottomPanel from "@/components/BottomPanel";
import { FeedbackToast } from "@/components/Feedback";
import { DialogDescription, DialogTitle } from "@radix-ui/react-dialog";
import { getGroupById } from "@/lib/utils";
import { toast } from "sonner";

function areWeightsAdjusted(pendingWeights, currentWeights, metricGroups) {
    if (!metricGroups.length || Object.keys(pendingWeights).length === 0) return false;
    const values = Object.values(pendingWeights);
    if (values.length === 0) return false;
    // if (JSON.stringify(pendingWeights) === JSON.stringify(currentWeights)) {
    //     return false;
    // }
    return values.some((v) => v > 0);
}

const RankingsPage = () => {
    const {
        countryRankings, setCountryRankings,
        countries, setCountries,
        regions, setRegions,
        countryMetricGroups, setCountryMetricGroups,
        industriesData, setIndustriesData,
        disciplinesData, setDisciplinesData,
        countryWeights, setCountryWeights,
        pendingCountryWeights, setPendingCountryWeights,
        pendingCountryRatings, setPendingCountryRatings,
        recentCountryRatingsHistory, setRecentCountryRatingsHistory,
        selectedCountries, setSelectedCountries,
        selectedRegions, setSelectedRegions,
        selectedDisciplines, setSelectedDisciplines,
        selectedIndustries, setSelectedIndustries,
        loading, setLoading,
        buttonLoading, setButtonLoading,
        shortlistedCountries,
    } = useContext(RankingsContext);

    const inputsRef = useRef(null);
    const tableRef = useRef(null);
    const containerRef = useRef(null);

    const [openPrevSearches, setOpenPrevSearches] = useState(false)

    useEffect(() => {
        setLoading(true);
        Promise.all([
            fetch(`${API_BASE}/get-countries`).then((res) => res.json()),
            fetch(`${API_BASE}/get-regions`).then((res) => res.json()),
            fetch(`${API_BASE}/get-metric-groups`).then((res) => res.json()),
            fetch(`${API_BASE}/industries`).then((res) => res.json()),
            fetch(`${API_BASE}/country-disciplines`).then((res) => res.json()),
        ])
            .then(([countriesData, regionData, groupsData, industriesDataResult, disciplinesDataResult]) => {
                setCountries(countriesData);
                setRegions(regionData);

                const filteredGroups = groupsData.filter(
                    (group) => group.category !== "uni"
                );
                setCountryMetricGroups(filteredGroups);

                const countryIds = countriesData.map((c) => c.id);
                setSelectedCountries((prev) => prev?.length ? prev : countryIds);

                const regionNames = regionData.map((r) => r.region);
                setSelectedRegions((prev) => prev?.length ? prev : regionNames);

                // Only set initial weights if both weights and pendingWeights are empty
                if (Object.keys(countryWeights).length === 0 && Object.keys(pendingCountryWeights).length === 0) {
                    const initialWeights = {};
                    filteredGroups.forEach((group) => {
                        initialWeights[group.id] = 0;
                    });
                    setCountryWeights(initialWeights);
                    setPendingCountryWeights(initialWeights);
                }

                setIndustriesData(industriesDataResult);
                setDisciplinesData(disciplinesDataResult);

                setLoading(false);
            })
            .catch((err) => {
                console.error("Failed to fetch data:", err);
                setLoading(false);
            });
    }, []);

    useEffect(() => {
        console.log(recentCountryRatingsHistory);
    }, [recentCountryRatingsHistory]);

    // Fetch rankings API
    const fetchRankings = (currentWeights, disciplines = [], industries = []) => {
        const weightsParam = Object.entries(currentWeights)
            .map(([groupId, weight]) => `group_${groupId}=${weight}`)
            .join("&");

        const disciplinesParam = disciplines
            .map((d) => `discipline=${encodeURIComponent(d)}`)
            .join("&");

        const industriesParam = industries
            .map((i) => `industry=${encodeURIComponent(i)}`)
            .join("&");

        const queryString = [weightsParam, disciplinesParam, industriesParam]
            .filter(Boolean)
            .join("&");

        return fetch(`${API_BASE}/country-rankings?${queryString}`).then((res) => res.json());
    };

    const applyWeightsAndFetch = () => {
        if (!areWeightsAdjusted(pendingCountryWeights, countryWeights, countryMetricGroups)) return;

        const currentRatings = { ...pendingCountryRatings };
        const historyEntry = {
            rating: currentRatings,
            disciplineId: selectedDisciplines,
            industryId: selectedIndustries
        };

        setRecentCountryRatingsHistory((prev) => {
            const newHistory = [historyEntry, ...prev.slice(0, 2)];
            return newHistory;
        });

        setButtonLoading(true);
        setCountryWeights(pendingCountryWeights);
        fetchRankings(pendingCountryWeights, selectedDisciplines, selectedIndustries)
            .then((rankingsData) => {
                setCountryRankings(rankingsData);
                setButtonLoading(false);
                tableRef.current?.scrollIntoView({ behavior: "smooth" });
            })
            .catch((err) => {
                console.error("Failed to fetch rankings:", err);
                setButtonLoading(false);
            });
    };

    // UI Handlers
    const scrollToInputs = () => {
        inputsRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const handleBegin = () => {
        if (!areWeightsAdjusted(pendingCountryWeights, countryWeights, countryMetricGroups)) return;
        scrollToInputs();
    };

    const handlePreviousSearchClick = (searchIndex) => {
        setButtonLoading(true);
        setOpenPrevSearches(false);

        setPendingCountryRatings(recentCountryRatingsHistory[searchIndex]["rating"]);
        setSelectedDisciplines(recentCountryRatingsHistory[searchIndex]["disciplineId"]);
        setSelectedIndustries(recentCountryRatingsHistory[searchIndex]["industryId"]);

        toast.success("Search inputs have been applied!");

        setButtonLoading(false);
    };

    const applyAllFilters = () => {
        setButtonLoading(true);

        const currentRatings = { ...pendingCountryRatings };
        const historyEntry = {
            rating: currentRatings,
            disciplineId: selectedDisciplines.join(','),
            industryId: selectedIndustries.join(',')
        };

        setRecentCountryRatingsHistory((prev) => {
            const newHistory = [historyEntry, ...prev.slice(0, 2)];
            return newHistory;
        });

        fetchRankings(pendingCountryWeights, selectedDisciplines, selectedIndustries)
            .then((rankingsData) => {
                setCountryRankings(rankingsData);
                setButtonLoading(false);
                tableRef.current?.scrollIntoView({ behavior: "smooth" });
            })
            .catch((err) => {
                console.error("Failed to fetch rankings:", err);
                setButtonLoading(false);
            });
    };

    const resetFilters = () => {
        setButtonLoading(true);

        const countryIds = countries.map((c) => c.id);
        setSelectedCountries([]);
        setSelectedCountries((prev) => prev?.length ? prev : countryIds);

        const regionNames = regions.map((r) => r.region);
        setSelectedRegions([]);
        setSelectedRegions((prev) => prev?.length ? prev : regionNames);

        setSelectedDisciplines([]);
        setSelectedIndustries([]);

        fetchRankings(pendingCountryWeights, [], [])
            .then((rankingsData) => {
                setCountryRankings(rankingsData);
                setButtonLoading(false);
            })
            .catch((err) => {
                console.error("Failed to fetch rankings:", err);
                setButtonLoading(false);
            });
    };

    const handleCountryChange = (countryId, isChecked) => {
        setSelectedCountries((prev) =>
            isChecked ? [...prev, countryId] : prev.filter((id) => id !== countryId)
        );
    };

    const filteredRankings = useMemo(() => {
        if (!countryRankings.length) return [];
        const countryFlagMap = {};
        countries.forEach((c) => {
            countryFlagMap[c.id] = c.flag;
        });
        return countryRankings
            .filter((country) => selectedCountries.includes(country.country_id))
            .filter((country) => selectedRegions.includes(country.region))
            .map((ranking) => ({
                ...ranking,
                flag: countryFlagMap[ranking.country_id] || null,
            }));
    }, [countryRankings, selectedCountries, selectedRegions, countries]);

    if (loading) {
        return <LoadingPage />;
    }

    return (
        <div
            ref={containerRef}
            className="h-dvh snap-y snap-mandatory overflow-hidden fadeIn"
        >
            {/* Initial Weights Section */}
            <section className="h-dvh w-full flex flex-col md:grid md:grid-cols-2 justify-items-center justify-center items-center snap-start px-8 md:px-32 py-8 pt-18 text-center">
                <header className="flex flex-col items-center text-center">
                    <h1 className="text-4xl lg:text-5xl font-medium tracking-tight mb-2 text-transparent bg-clip-text bg-gradient-to-br from-black to-gray-400 py-2">
                        Country Rankings
                    </h1>
                    <div className="text-sm md:text-base mb-2 sm:mb-4 max-w-full sm:max-w-2xl lg:max-w-3xl tracking-tight text-center text-black/60">
                        <p>Explore the rankings of countries based on your preferences.</p>
                    </div>
                    <img src="https://illustrations.popsy.co/amber/student-going-to-school.svg" className="hidden sm:block sm:max-h-96 fadeIn" />
                </header>
                <div className="w-full px-2 sm:px-8 flex flex-col items-center gap-6">
                    {countryMetricGroups.length > 0 && (
                        <PrioritySelector
                            groups={countryMetricGroups}
                            onWeightChange={setPendingCountryWeights}
                            category="Country"
                        />
                    )}
                    <div className="w-full flex flex-col justify-center items-center gap-1">
                        <button
                            className={`bg-[#ec5b22] hover:bg-[#df4c12] text-white font-semibold w-full sm:w-40 py-2 sm:py-3 mb-2 rounded-full text-base sm:text-lg transition flex items-center justify-center ${!areWeightsAdjusted(pendingCountryWeights, countryWeights, countryMetricGroups)
                                ? "opacity-50 cursor-not-allowed"
                                : "cursor-pointer"
                                }`}
                            onClick={handleBegin}
                            disabled={buttonLoading || loading || !areWeightsAdjusted(pendingCountryWeights, countryWeights, countryMetricGroups)}
                        >
                            {buttonLoading ? (
                                <div className="w-6 h-6 border-4 border-t-transparent border-white rounded-full animate-spin"></div>
                            ) : (
                                "Begin"
                            )}
                        </button>
                        <Drawer open={openPrevSearches} onOpenChange={setOpenPrevSearches}>
                            <DrawerTrigger asChild>
                                <button
                                    className={`text-orange-700/80 font-medium uppercase text-sm flex items-center justify-center gap-1 cursor-pointer hover:underline outline-none`}
                                >
                                    <History className="w-4 h-4 text-orange-700/80" />
                                    View Past Searches
                                </button>
                            </DrawerTrigger>
                            <DrawerContent className="px-8">
                                <div className="h-2 w-32 md:w-48 bg-black/5 rounded-full mx-auto mb-4" />
                                <DialogTitle className="text-lg md:text-xl font-semibold text-center py-1">
                                    Recent Searches
                                </DialogTitle>
                                <DialogDescription className="text-sm text-black/60 text-center py-1">
                                    View and select any of your previous 3 searches or select our carefully curated Inforens ranking!
                                </DialogDescription>
                                {recentCountryRatingsHistory.length > 0 ?
                                    <div className="py-4 pb-12 grid grid-cols-1 md:grid-cols-3 gap-4">
                                        {recentCountryRatingsHistory.map((search, idx) => {
                                            const DisciplineIcon = iconMap[search.disciplineId];
                                            const IndustryIcon = iconMap[search.industryId];

                                            return (
                                                <button key={idx} onClick={() => { handlePreviousSearchClick(idx) }} className="w-full flex flex-col items-center gap-2 bg-black/3 p-6 rounded-3xl transition hover:scale-105 cursor-pointer">
                                                    <h1>{ idx === 0 ? "Latest Search" : `Previous Search (${idx})`}</h1>
                                                    <div className="w-full flex justify-center items-center gap-6">
                                                        {Object.entries(search.rating || {}).map(([ratingKey, count]) => {
                                                            const GroupIcon = iconMap[getGroupById(ratingKey)];

                                                            return (
                                                                <div key={ratingKey} className="flex flex-col justify-center items-center gap-1">
                                                                    {GroupIcon && <GroupIcon className="w-5 h-5" />}
                                                                    <span className="text-sm font-medium">{count}/5</span>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                    <div className="flex flex-col items-start mt-2 max-w-xs text-sm text-black/60 space-y-1">
                                                        <div className="flex gap-2">
                                                            {DisciplineIcon &&
                                                                <div className="flex justify-center items-center w-6 h-6 rounded-full bg-teal-600">
                                                                    <DisciplineIcon className="w-3 h-3 text-white" />
                                                                </div>
                                                            }
                                                            {search.disciplineId || 'No Discipline Selected'}
                                                        </div>
                                                        <div className="flex gap-2">
                                                            {IndustryIcon &&
                                                                <div className="flex justify-center items-center w-6 h-6 rounded-full bg-orange-600">
                                                                    <IndustryIcon className="w-3 h-3 text-white" />
                                                                </div>
                                                            }
                                                            {search.industryId || 'No Industry Selected'}
                                                        </div>
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div> :
                                    <div className="py-4 pb-12 w-full flex flex-col items-center justify-center gap-2">
                                        <img src="https://illustrations.popsy.co/amber/question-mark.svg" className="max-h-64" />
                                        <p className="text-black/60 text-center">No Recent Searches Found!</p>
                                    </div>
                                }
                            </DrawerContent>
                        </Drawer>
                        <button
                            disabled={true}
                            className={`grayscale-50 opacity-50 text-orange-700/80 font-medium uppercase text-sm flex items-center justify-center gap-1 outline-none`}
                        >
                            <RefreshCcw className="w-4 h-4 text-orange-700/80" />
                            Reset to Default
                        </button>
                    </div>
                </div>
            </section >

            {/* Country Inputs Section */}
            < section
                ref={inputsRef}
                className="h-dvh flex flex-col justify-center items-center snap-start px-4 py-8 pt-18 text-center"
            >
                <h1 className="w-full text-2xl sm:text-3xl lg:text-4xl font-medium tracking-tight text-black/80 py-1">
                    Want a more <b className="text-orange-700">focussed</b> experience?
                </h1>
                <h2 className="text-sm sm:text-base lg:text-lg text-black/80 tracking-tight mt-2 mb-4 md:mb-8">
                    Answer a few questions, and get more personalised results!
                </h2>
                <CountryInputs
                    onStart={applyWeightsAndFetch}
                    selectedDisciplines={selectedDisciplines}
                    setSelectedDisciplines={setSelectedDisciplines}
                    selectedIndustries={selectedIndustries}
                    setSelectedIndustries={setSelectedIndustries}
                    buttonLoading={buttonLoading}
                />
            </section >

            {/* Rankings Table Section */}
            < section
                ref={tableRef}
                className="relative flex flex-col items-center h-dvh snap-start overflow-auto bg-gradient-to-t from-white to-[#fff5f0] px-2 sm:px-6 lg:px-12 py-20 md:py-28"
            >
                {
                    countryRankings.length > 0 && (
                        <div className="w-full">
                            <div>
                                <div className="flex flex-col items-start justify-center">
                                    <div className="w-full flex flex-col sm:flex-row justify-between">
                                        <div className="sm:max-w-1/2">
                                            <h1 className="px-4 py-1 text-2xl text-center md:text-left font-medium tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-black to-gray-400">
                                                Here are your <b className="font-medium text-orange-700">top</b> matches!
                                            </h1>
                                            <p className="px-4 text-xs mb-1 md:mb-0 text-center md:text-left sm:text-sm tracking-tight text-black/60 italic">
                                                Want to hear directly from someone who has experienced it?
                                            </p>
                                            <p className="px-4 text-center md:text-left text-xs sm:text-sm tracking-tight text-black/60 mb-3 italic">
                                                <a
                                                    href="https://www.inforens.com/guides"
                                                    target="_blank"
                                                    className="font-medium text-orange-700 underline"
                                                >
                                                    Connect with a mentor
                                                </a>{" "}
                                                to learn directly from our international community or{" "}
                                                <a
                                                    href="https://www.inforens.com/contact-us"
                                                    target="_blank"
                                                    className="font-medium text-orange-700 underline"
                                                >
                                                    contact us today
                                                </a>{" "}
                                                to speak with one of our experienced advisors!
                                            </p>
                                            <p className="px-4 text-center md:text-left text-xs sm:text-sm tracking-tight text-black/60 md:mb-4 italic"><b>Note:</b> Final rankings are based on 1 year of study, regardless of the study level.</p>
                                        </div>
                                        <div className="flex px-2 items-end gap-3 py-4">
                                            <Drawer>
                                                <DrawerTrigger asChild className="w-full">
                                                    <div
                                                        className="cursor-pointer flex items-center justify-center gap-1 px-3 h-8 text-xs sm:text-sm text-white font-medium bg-[#e07352] hover:bg-[#e07352e6] rounded-full w-full sm:w-auto"
                                                    >
                                                        <Star strokeWidth={2.5} className="h-4 w-4" />
                                                        <span>Ratings</span>
                                                    </div>
                                                </DrawerTrigger>
                                                <DrawerContent className="px-8 lg:px-64">
                                                    <div className="h-2 w-32 md:w-48 bg-black/5 rounded-full mx-auto mb-4" />
                                                    <DrawerTitle className="text-center py-2">Ratings</DrawerTitle>
                                                    <DrawerDescription className="text-xs text-black/70 text-center pb-4">Adjust the ratings based on your preferences!</DrawerDescription>
                                                    <div className="flex flex-col sm:flex-row justify-center items-center">
                                                        <img src="https://illustrations.popsy.co/amber/student-going-to-school.svg" className="hidden sm:block sm:max-h-96 fadeIn" />
                                                        {countryMetricGroups.length > 0 ? (
                                                            <PrioritySelector
                                                                groups={countryMetricGroups}
                                                                onWeightChange={setPendingCountryWeights}
                                                                category="Country"
                                                            />
                                                        ) : "Error"}
                                                    </div>
                                                    <DrawerClose asChild>
                                                        <button
                                                            className={`max-w-sm md:max-w-md bg-[#ec5b22] hover:bg-[#df4c12] text-white font-semibold w-full sm:w-40 mx-auto my-8 py-2 sm:py-3 rounded-full text-base sm:text-lg transition flex items-center justify-center ${!areWeightsAdjusted(pendingCountryWeights, countryWeights, countryMetricGroups)
                                                                ? "opacity-50 cursor-not-allowed"
                                                                : "cursor-pointer"
                                                                }`}
                                                            onClick={applyWeightsAndFetch}
                                                            disabled={!areWeightsAdjusted(pendingCountryWeights, countryWeights, countryMetricGroups)}
                                                        >
                                                            Confirm
                                                        </button>
                                                    </DrawerClose>
                                                </DrawerContent>
                                            </Drawer>
                                            <Sheet>
                                                <SheetTrigger asChild>
                                                    <button
                                                        className="cursor-pointer flex items-center justify-center gap-1 px-3 h-8 text-xs sm:text-sm font-medium text-white bg-black/80 hover:bg.black/70 rounded-full w-full sm:w-auto"
                                                        type="button"
                                                    >
                                                        <ListFilter strokeWidth={2.5} className="text-white h-4 w-4" />
                                                        <span>Filters</span>
                                                    </button>
                                                </SheetTrigger>
                                                <SheetContent side="right" className="w-screen md:max-w-sm">
                                                    <FilterSheetContent
                                                        countries={countries}
                                                        regions={regions}
                                                        selectedCountries={selectedCountries}
                                                        selectedRegions={selectedRegions}
                                                        onCountryChange={handleCountryChange}
                                                        onRegionChange={(name, checked) => {
                                                            setSelectedRegions((prev) =>
                                                                checked
                                                                    ? [...prev, name]
                                                                    : prev.filter((r) => r !== name)
                                                            );
                                                        }}
                                                        disciplines={DISCIPLINES}
                                                        selectedDisciplines={selectedDisciplines}
                                                        onDisciplineChange={(name, checked) => {
                                                            setSelectedDisciplines((prev) =>
                                                                checked
                                                                    ? [...prev, name]
                                                                    : prev.filter((d) => d !== name)
                                                            );
                                                        }}
                                                        industries={INDUSTRIES}
                                                        selectedIndustries={selectedIndustries}
                                                        onIndustryChange={(name, checked) => {
                                                            setSelectedIndustries((prev) =>
                                                                checked
                                                                    ? [...prev, name]
                                                                    : prev.filter((i) => i !== name)
                                                            );
                                                        }}
                                                        onApplyFilters={applyAllFilters}
                                                        onResetFilters={resetFilters}
                                                        category="Country"
                                                    />
                                                </SheetContent>
                                            </Sheet>
                                            {shortlistedCountries.length > 0 && <BottomPanel category="Country" shortlisted={shortlistedCountries} />}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <RankingsTable
                                rankings={filteredRankings}
                                loading={buttonLoading}
                                metricGroups={countryMetricGroups}
                                industriesData={industriesData}
                                disciplinesData={disciplinesData}
                                category="Country"
                            />
                            <FeedbackToast
                                onSubmit={(data) => {
                                    console.log("Feedback:", data);
                                }}
                            />
                        </div>
                    )
                }
            </section >
        </div >
    );
};

export default RankingsPage;