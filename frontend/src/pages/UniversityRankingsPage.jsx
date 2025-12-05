import { useContext, useEffect, useMemo, useRef } from "react";
import FilterSheetContent from "../components/FilterSection";
import RankingsTable from "../components/RankingsTable";
import { ListFilter, Settings2, Star } from "lucide-react";
import { API_BASE } from "../data/Data";
import LoadingPage from "../pages/LoadingPage";
import { RankingsContext } from "../contexts/RankingsContext";
import PrioritySelector from "@/components/PrioritySelector";
import { Sheet, SheetTrigger, SheetContent } from "@/components/ui/sheet";
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import { ClipLoader } from "react-spinners";
import UniInputs from "@/components/UniInputs";
import RankingsMap from "@/components/RankingsMap";

function areWeightsAdjusted(weights, metricGroups) {
    if (!metricGroups.length || Object.keys(weights).length === 0) return false;
    const values = Object.values(weights);
    if (values.length === 0) return false;
    return values.some((v) => v > 0);
}

const UniRankingsPage = () => {
    const {
        uniRankings, setUniRankings,
        universities, setUniversities,
        countries, setCountries,
        cities, setCities,
        selectedUniCountries, setSelectedUniCountries,
        selectedUniCities, setSelectedUniCities,
        uniMetricGroups, setUniMetricGroups,
        uniWeights, setUniWeights,
        pendingUniWeights, setPendingUniWeights,
        selectedUnis, setSelectedUnis,
        selectedBuckets, setSelectedBuckets,
        loading, setLoading,
        buttonLoading, setButtonLoading,
    } = useContext(RankingsContext);

    const tableRef = useRef(null);
    const containerRef = useRef(null);
    const inputsRef = useRef(null);

    const weightsAdjusted = areWeightsAdjusted(uniWeights, uniMetricGroups);

    useEffect(() => {
        setLoading(true);
        const fetchStart = Date.now();
        Promise.all([
            fetch(`${API_BASE}/get-countries`).then((res) => res.json()),
            fetch(`${API_BASE}/get-cities`).then((res) => res.json()),
            fetch(`${API_BASE}/get-universities`).then((res) => res.json()),
            fetch(`${API_BASE}/get-metric-groups`).then((res) => res.json()),
        ])
            .then(([countryData, cityData, uniData, groupsData]) => {
                setCountries(countryData);
                setCities(cityData);
                setUniversities(uniData);

                const filteredGroups = groupsData.filter(
                    (group) =>
                        group.name !== "Quality of Life & Long-term Settlement" &&
                        group.name !== "Government & Policy Environment"
                );
                setUniMetricGroups(filteredGroups);

                const uniIds = uniData.map((u) => u.id);
                setSelectedUnis((prev) => prev?.length ? prev : uniIds);

                const countryIds = countryData.map((c) => c.id);
                setSelectedUniCountries((prev) => prev?.length ? prev : countryIds);

                const cityNames = cityData.map((c) => c.city);
                setSelectedUniCities((prev) => prev?.length ? prev : cityNames);

                // Only set initial weights if both weights and pendingWeights are empty
                if (Object.keys(uniWeights).length === 0 && Object.keys(pendingUniWeights).length === 0) {
                    const initialWeights = {};
                    filteredGroups.forEach((group) => {
                        initialWeights[group.id] = 0;
                    });
                    setUniWeights(initialWeights);
                    setPendingUniWeights(initialWeights);
                }

                const fetchElapsed = Date.now() - fetchStart;
                const minDelay = 1000;
                const wait = Math.max(0, minDelay - fetchElapsed);

                setTimeout(() => {
                    setLoading(false);
                    // Only fetch rankings if weights have been adjusted
                    if (areWeightsAdjusted(uniWeights, filteredGroups)) {
                        fetchRankings(uniWeights).then(setUniRankings);
                    }
                }, wait);
            })
            .catch((err) => {
                console.error("Failed to fetch data:", err);
                setLoading(false);
            });
    }, []);

    // Fetch rankings API
    const fetchRankings = (currentWeights) => {
        const weightsParam = Object.entries(currentWeights)
            .map(([groupId, weight]) => `group_${groupId}=${weight}`)
            .join("&");

        const queryString = [weightsParam]
            .filter(Boolean)
            .join("&");

        return fetch(`${API_BASE}/university-rankings?${queryString}`).then((res) => res.json());
    };

    const scrollToInputs = () => {
        inputsRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const handleBegin = () => {
        if (!areWeightsAdjusted(pendingUniWeights, uniMetricGroups)) return;
        setButtonLoading(true);
        fetchRankings(pendingUniWeights)
            .then((rankingsData) => {
                setUniRankings(rankingsData);
                setUniWeights(pendingUniWeights);
                setButtonLoading(false);
                tableRef.current?.scrollIntoView({ behavior: "smooth" });
            })
            .catch((err) => {
                console.error("Failed to fetch rankings:", err);
                setButtonLoading(false);
            });
    };

    const handleApplyWeights = () => {
        if (JSON.stringify(uniWeights) === JSON.stringify(pendingUniWeights)) return;
        if (!areWeightsAdjusted(pendingUniWeights, uniMetricGroups)) return;
        setButtonLoading(true);
        setUniWeights(pendingUniWeights);
        fetchRankings(pendingUniWeights)
            .then((rankingsData) => {
                setUniRankings(rankingsData);
                setButtonLoading(false);
                tableRef.current?.scrollIntoView({ behavior: "smooth" });
            })
            .catch((err) => {
                console.error("Failed to fetch rankings:", err);
                setButtonLoading(false);
            });
    };

    const applyAllFilters = () => {
        setButtonLoading(true);
        fetchRankings(pendingUniWeights)
            .then((rankingsData) => {
                setUniRankings(rankingsData);
                setButtonLoading(false);
                tableRef.current?.scrollIntoView({ behavior: "smooth" });
            })
            .catch((err) => {
                console.error("Failed to fetch rankings:", err);
                setButtonLoading(false);
            });
    };

    const handleUniChange = (Id, isChecked) => {
        setSelectedUnis((prev) =>
            isChecked ? [...prev, Id] : prev.filter((id) => id !== Id)
        );
    };

    const handleCountryChange = (countryId, isChecked) => {
        setSelectedUniCountries((prev) =>
            isChecked ? [...prev, countryId] : prev.filter((id) => id !== countryId)
        );
    };

    const handleCityChange = (name, isChecked) => {
        setSelectedUniCities((prev) =>
            isChecked ? [...prev, name] : prev.filter((n) => n !== name)
        );
    };

    const filteredRankings = useMemo(() => {
        if (!uniRankings.length) return [];
        const countryFlagMap = {};
        universities.forEach((u) => {
            countryFlagMap[u.id] = u.country_flag;
        });
        return uniRankings
            .filter((uni) => selectedUnis.includes(uni.university_id))
            .filter((uni) => selectedUniCountries.includes(uni.country_id))
            .filter((uni) => selectedUniCities.includes(uni.city))
            .map((ranking) => ({
                ...ranking,
                flag: countryFlagMap[ranking.university_id] || null,
            }));
    }, [uniRankings, selectedUnis, selectedUniCountries, universities]);

    if (loading) {
        return <LoadingPage />;
    }

    return (
        <div
            ref={containerRef}
            className="min-h-dvh snap-y snap-mandatory overflow-hidden fadeIn"
        >
            {!weightsAdjusted ? (
                <>
                    {/* Initial Weights Section */}
                    <section className="min-h-dvh w-full flex flex-col md:grid md:grid-cols-2 justify-items-center justify-center items-center snap-start px-8 md:px-32 py-8 pt-18 text-center">
                        <header className="flex flex-col items-center text-center">
                            <h1 className="text-4xl lg:text-5xl font-medium tracking-tight mb-2 text-transparent bg-clip-text bg-gradient-to-br from-black to-gray-400 py-2">
                                University Rankings
                            </h1>
                            <div className="text-sm md:text-base mb-2 sm:mb-4 max-w-full sm:max-w-2xl lg:max-w-3xl tracking-tight text-center text-black/60">
                                <p>Explore the rankings of the top universities based on your preferences.</p>
                            </div>
                            <img src="https://illustrations.popsy.co/amber/studying.svg" className="hidden sm:block sm:max-h-96 fadeIn" />
                        </header>
                        <div className="w-full px-2 sm:px-8 flex flex-col items-center gap-6">
                            {uniMetricGroups.length > 0 && (
                                <PrioritySelector
                                    groups={uniMetricGroups}
                                    onWeightChange={setPendingUniWeights}
                                    category="University"
                                />
                            )}
                            <button
                                className={`bg-[#ec5b22] hover:bg-[#df4c12] text-white font-semibold w-full sm:w-40 py-2 sm:py-3 rounded-full text-base sm:text-lg transition flex items-center justify-center ${!areWeightsAdjusted(pendingUniWeights, uniMetricGroups)
                                    ? "opacity-50 cursor-not-allowed"
                                    : "cursor-pointer"
                                    }`}
                                onClick={scrollToInputs}
                                disabled={buttonLoading || loading || !areWeightsAdjusted(pendingUniWeights, uniMetricGroups)}
                            >
                                {buttonLoading ? (
                                    <ClipLoader size={22} color="#eee" />
                                ) : (
                                    "Begin"
                                )}
                            </button>
                        </div>
                    </section>

                    {/* Country Inputs Section */}
                    <section
                        ref={inputsRef}
                        className="min-h-dvh flex flex-col justify-center items-center snap-start px-4 py-8 pt-18 text-center"
                    >
                        <h1 className="w-full text-2xl sm:text-3xl lg:text-4xl font-medium tracking-tight text-black/80 py-1">
                            Want a more <b className="text-orange-700">focussed</b> experience?
                        </h1>
                        <h2 className="text-sm sm:text-base lg:text-lg text-black/80 tracking-tight mt-2 mb-4 md:mb-8">
                            Answer a few questions, and get more personalised results!
                        </h2>
                        <UniInputs
                            onStart={handleBegin}
                            buttonLoading={buttonLoading}
                        />
                    </section>
                </>
            ) : (
                <>
                    {/* Rankings Table Section ONLY */}
                    <section
                        ref={tableRef}
                        className="flex flex-col items-center min-h-dvh snap-start overflow-auto bg-gradient-to-t from-white to-[#fff5f0] px-2 sm:px-6 lg:px-12 py-20 md:py-28"
                    >
                        {uniRankings.length > 0 && (
                            <div className="w-full">
                                <div>
                                    <div className="flex flex-col sm:flex-row justify-between">
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
                                                        className="cursor-pointer flex items-center justify-center gap-1 px-3 h-8 text-xs sm:text-sm text-white bg-[#e07352] hover:bg-[#e07352e6] rounded-full w-full sm:w-auto"
                                                    >
                                                        <Star className="h-4 w-4" />
                                                        <span>Ratings</span>
                                                    </div>
                                                </DrawerTrigger>
                                                <DrawerContent className="px-8 lg:px-64">
                                                    <div className="h-2 w-32 md:w-48 bg-black/5 rounded-full mx-auto mb-4" />
                                                    <DrawerTitle className="text-center py-2">Ratings</DrawerTitle>
                                                    <DrawerDescription className="text-xs text-black/70 text-center pb-4">Adjust the ratings based on your preferences!</DrawerDescription>
                                                    <div className="w-full flex flex-col sm:flex-row items-center justify-center">
                                                        <img src="https://illustrations.popsy.co/amber/studying.svg" className="hidden sm:block sm:max-h-96" />
                                                        {uniMetricGroups.length > 0 ? (
                                                            <PrioritySelector
                                                                groups={uniMetricGroups}
                                                                onWeightChange={setPendingUniWeights}
                                                                category="University"
                                                            />
                                                        ) : "Error"}
                                                    </div>
                                                    <DrawerClose asChild>
                                                        <button
                                                            className={`max-w-sm md:max-w-md bg-[#ec5b22] hover:bg-[#df4c12] text-white font-semibold w-full sm:w-40 mx-auto my-8 py-2 sm:py-3 rounded-full text-base sm:text-lg transition flex items-center justify-center ${!areWeightsAdjusted(pendingUniWeights, uniMetricGroups)
                                                                ? "opacity-50 cursor-not-allowed"
                                                                : "cursor-pointer"
                                                                }`}
                                                            onClick={handleApplyWeights}
                                                            disabled={!areWeightsAdjusted(pendingUniWeights, uniMetricGroups)}
                                                        >
                                                            Confirm
                                                        </button>
                                                    </DrawerClose>
                                                </DrawerContent>
                                            </Drawer>
                                            <Sheet>
                                                <SheetTrigger asChild>
                                                    <button
                                                        className="cursor-pointer flex items-center justify-center gap-1 px-3 h-8 text-xs sm:text-sm font-medium text-white bg-black/80 hover:bg-black/70 rounded-full w-full sm:w-auto"
                                                        type="button"
                                                    >
                                                        <ListFilter className="h-4 w-4" />
                                                        <span>Filters</span>
                                                    </button>
                                                </SheetTrigger>
                                                <SheetContent side="right" className="w-screen md:max-w-sm">
                                                    <FilterSheetContent
                                                        countries={countries}
                                                        universities={universities}
                                                        cities={cities}
                                                        selectedCountries={selectedUniCountries}
                                                        selectedUnis={selectedUnis}
                                                        selectedCities={selectedUniCities}
                                                        onCountryChange={handleCountryChange}
                                                        onUniChange={handleUniChange}
                                                        onCityChange={handleCityChange}
                                                        selectedBuckets={selectedBuckets}
                                                        onBucketsChange={(name, checked) => {
                                                            setSelectedBuckets((prev) =>
                                                                checked
                                                                    ? [...prev, name]
                                                                    : prev.filter((i) => i !== name)
                                                            );
                                                        }}
                                                        onApplyFilters={applyAllFilters}
                                                        category="University"
                                                    />
                                                </SheetContent>
                                            </Sheet>
                                        </div>
                                    </div>
                                    <RankingsTable
                                        rankings={filteredRankings}
                                        loading={loading}
                                        metricGroups={uniMetricGroups}
                                        category="University"
                                    />
                                </div>
                            </div>
                        )}
                    </section>
                </>
            )}
        </div>
    );
};

export default UniRankingsPage;