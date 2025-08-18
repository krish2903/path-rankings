import { useState, useEffect, useMemo, useRef } from "react";
import Header from "../components/Header";
import WeightSlider from "../components/WeightSlider";
import FilterSection from "../components/FilterSection";
import RankingsTable from "../components/RankingsTable";
import { ArrowRight } from "lucide-react";
import CountryInputs from "../components/CountryInputs";
import { DISCIPLINES, INDUSTRIES, API_BASE } from "../data/Data";
import LoadingPage from "../pages/LoadingPage";

const RankingsPage = () => {

    // Data States
    const [rankings, setRankings] = useState([]);
    const [countries, setCountries] = useState([]);
    const [metricGroups, setMetricGroups] = useState([]);
    const [industriesData, setIndustriesData] = useState([]);
    const [disciplinesData, setDisciplinesData] = useState([]);

    // Filter/Selection States
    const [weights, setWeights] = useState({});
    const [pendingWeights, setPendingWeights] = useState({});
    const [selectedCountries, setSelectedCountries] = useState([]);
    const [selectedDisciplines, setSelectedDisciplines] = useState([]);
    const [selectedIndustries, setSelectedIndustries] = useState([]);

    // Loading States
    const [loading, setLoading] = useState(true);
    const [buttonLoading, setButtonLoading] = useState(false);

    // Refs
    const inputsRef = useRef(null);
    const tableRef = useRef(null);
    const containerRef = useRef(null);

    // Mobile View
    const [mobileSliderOpen, setMobileSliderOpen] = useState(false);

    //Fetches initial data from the backend
    useEffect(() => {
        setLoading(true);
        const fetchStart = Date.now();
        Promise.all([
            fetch(`${API_BASE}/get-countries`).then((res) => res.json()),
            fetch(`${API_BASE}/get-metric-groups`).then((res) => res.json()),
            fetch(`${API_BASE}/industries`).then((res) => res.json()),
            fetch(`${API_BASE}/disciplines`).then((res) => res.json()),
        ])
            .then(([countriesData, groupsData, industriesData, disciplinesData]) => {
                setCountries(countriesData);

                // These groups are not used for country rankings score calculation
                const filteredGroups = groupsData.filter(
                    (group) =>
                        group.name !== "Academic Excellence & Research" &&
                        group.name !== "Student Experiences & Campus Life"
                );

                setMetricGroups(filteredGroups);

                const countryIds = countriesData.map((c) => c.id);
                setSelectedCountries(countryIds);

                const initialWeights = {};
                filteredGroups.forEach((group, index) => {
                    initialWeights[group.id] =
                        index === filteredGroups.length - 1
                            ? 1 - (filteredGroups.length - 1) * 0.25
                            : 0.25;
                });
                setWeights(initialWeights);
                setPendingWeights(initialWeights);

                setIndustriesData(industriesData);
                setDisciplinesData(disciplinesData);

                const fetchElapsed = Date.now() - fetchStart;
                const minDelay = 1000;
                const wait = Math.max(0, minDelay - fetchElapsed);

                setTimeout(() => {
                    setLoading(false);
                }, wait);
            })
            .catch((err) => {
                console.error("Failed to fetch data:", err);
                setLoading(false);
            });
    }, []);

    // Fetches rankings after all inputs are taken
    const fetchRankings = (currentWeights) => {
        const weightsParam = Object.entries(currentWeights)
            .map(([groupId, weight]) => `group_${groupId}=${weight}`)
            .join("&");

        const disciplinesParam = selectedDisciplines
            .map((d) => `discipline=${encodeURIComponent(d)}`)
            .join("&");

        const industriesParam = selectedIndustries
            .map((i) => `industry=${encodeURIComponent(i)}`)
            .join("&");

        const queryString = [weightsParam, disciplinesParam, industriesParam]
            .filter(Boolean)
            .join("&");

        return fetch(`${API_BASE}/rankings?${queryString}`).then((res) =>
            res.json()
        );
    };

    // Initially, users must adjust weights
    const allWeightsEqual = useMemo(() => {
        const values = Object.values(pendingWeights);
        if (values.length === 0) return true;
        return values.every((val) => val === values[0]);
    }, [pendingWeights]);

    const scrollToInputs = () => {
        inputsRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const handleBegin = () => {
        if (allWeightsEqual) return;
        setButtonLoading(true);
        fetchRankings(pendingWeights)
            .then((rankingsData) => {
                setRankings(rankingsData);
                setWeights(pendingWeights);
                setButtonLoading(false);
                tableRef.current?.scrollIntoView({ behavior: "smooth" });
            })
            .catch((err) => {
                console.error("Failed to fetch rankings:", err);
                setButtonLoading(false);
            });
    };

    const handleApplyWeights = () => {
        if (JSON.stringify(weights) === JSON.stringify(pendingWeights)) return;
        setButtonLoading(true);
        setWeights(pendingWeights);
        fetchRankings(pendingWeights)
            .then((rankingsData) => {
                setRankings(rankingsData);
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
        fetchRankings(pendingWeights)
            .then((rankingsData) => {
                setRankings(rankingsData);
                setButtonLoading(false);
                tableRef.current?.scrollIntoView({ behavior: "smooth" });
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
        if (!rankings.length) return [];
        const countryFlagMap = {};
        countries.forEach((c) => {
            countryFlagMap[c.id] = c.flag;
        });
        return rankings
            .filter((country) => selectedCountries.includes(country.country_id))
            .map((ranking) => ({
                ...ranking,
                flag: countryFlagMap[ranking.country_id] || null,
            }));
    }, [rankings, selectedCountries, countries]);

    if (loading) {
        return <LoadingPage />;
    }

    return (
        <div
            ref={containerRef}
            className="h-screen bg-white snap-y snap-mandatory overflow-hidden fadeIn"
        >
            <Header />

            {/* Initial Weights Section */}
            <section className="h-screen flex flex-col justify-center items-center snap-start px-4 sm:px-8 py-12">
                <header className="text-center">
                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-medium tracking-tight mb-4 text-transparent bg-clip-text bg-gradient-to-br from-black to-gray-400 py-2">
                        Country Rankings
                    </h1>
                </header>
                <div className="text-sm sm:text-base lg:text-lg mb-6 sm:mb-8 max-w-full sm:max-w-2xl lg:max-w-3xl tracking-tight text-center text-black/60">
                    <p>Explore the rankings of countries based on your preferences.</p>
                </div>
                <h1 className="text-black/60 font-medium text-xs sm:text-sm lg:text-md italic mb-3 text-center">
                    Adjust the weights to your needs and obtain the best matches.
                </h1>
                <h2 className="text-black/50 max-w-[90%] sm:max-w-[60%] font-light text-xs sm:text-sm lg:text-md italic mb-6 text-center">
                    Drag the orange sliders to tell us what matters most to you.
                </h2>
                <div className="w-full px-2 sm:px-8 flex flex-col items-center gap-6">
                    {metricGroups.length > 0 && (
                        <WeightSlider
                            groups={metricGroups}
                            weights={pendingWeights}
                            onWeightChange={setPendingWeights}
                        />
                    )}
                    <button
                        className={`bg-[#ec5b22] hover:bg-[#df4c12] text-white font-semibold w-full sm:w-40 py-2 sm:py-3 rounded-full text-base sm:text-lg transition flex items-center justify-center ${allWeightsEqual ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
                            }`}
                        onClick={scrollToInputs}
                        disabled={buttonLoading || loading || allWeightsEqual}
                    >
                        {buttonLoading ? (
                            <div className="w-6 h-6 border-4 border-t-transparent border-white rounded-full animate-spin"></div>
                        ) : (
                            "Begin"
                        )}
                    </button>
                </div>
            </section>

            {/* Country Inputs Section */}
            <section
                ref={inputsRef}
                className="h-screen flex flex-col justify-center items-center snap-start px-4 py-8 pt-18 text-center"
            >
                <h1 className="w-full text-2xl sm:text-3xl lg:text-4xl font-medium tracking-tight text-black/80 py-1">
                    Want a more <b className="text-orange-700">focussed</b> experience?
                </h1>
                <h2 className="text-sm sm:text-base lg:text-lg text-black/80 tracking-tight mt-2 mb-4 md:mb-8">
                    Answer a few questions, and get more personalised results!
                </h2>
                <CountryInputs
                    onStart={handleBegin}
                    selectedDisciplines={selectedDisciplines}
                    setSelectedDisciplines={setSelectedDisciplines}
                    selectedIndustries={selectedIndustries}
                    setSelectedIndustries={setSelectedIndustries}
                />
            </section>

            {/* Rankings Table Section */}
            <section
                ref={tableRef}
                className="flex flex-col items-center h-screen snap-start overflow-auto bg-gradient-to-b from-white to-gray-100 px-2 sm:px-6 lg:px-24 py-20"
            >
                {rankings.length > 0 && (
                    <div className="w-full">
                        <div className="hidden md:flex w-full flex-col lg:flex-row gap-4 justify-center items-center mb-4 md:mb-6">
                            {!loading && metricGroups.length > 0 && (
                                <div className="w-full flex flex-col items-center">
                                    <WeightSlider
                                        groups={metricGroups}
                                        weights={pendingWeights}
                                        onWeightChange={setPendingWeights}
                                    />
                                </div>
                            )}
                            <button
                                className={`flex items-center justify-center gap-2 bg-[#f0632b] hover:bg-[#df4c12]
                      text-white font-semibold h-10 px-6 rounded-full transition 
                      ${JSON.stringify(weights) === JSON.stringify(pendingWeights)
                                        ? "opacity-50 cursor-not-allowed"
                                        : "cursor-pointer"}`}
                                onClick={handleApplyWeights}
                                disabled={JSON.stringify(weights) === JSON.stringify(pendingWeights)}
                            >
                                <ArrowRight className="h-6 w-6" />
                            </button>
                        </div>

                        <div className="flex justify-center md:hidden w-full max-w-md mx-auto mb-4">
                            {!mobileSliderOpen ? (
                                <button
                                    className="w-1/2 bg-gray-100  hover:bg-gray-200 text-black/80 font-medium h-10 rounded-full transition cursor-pointer"
                                    onClick={() => setMobileSliderOpen(true)}
                                >
                                    Adjust Weights
                                </button>
                            ) : (
                                <div className="flex flex-col gap-4 items-center mt-3">
                                    {!loading && metricGroups.length > 0 && (
                                        <div className="w-full flex flex-col items-center">
                                            <WeightSlider
                                                groups={metricGroups}
                                                weights={pendingWeights}
                                                onWeightChange={setPendingWeights}
                                            />
                                        </div>
                                    )}
                                    <button
                                        className={`flex items-center justify-center gap-2 w-full bg-[#f0632b] hover:bg-[#df4c12]
                          text-white font-semibold h-10 rounded-full transition
                          ${JSON.stringify(weights) === JSON.stringify(pendingWeights)
                                                ? "opacity-50 cursor-not-allowed"
                                                : "cursor-pointer"}`}
                                        onClick={handleApplyWeights}
                                        disabled={JSON.stringify(weights) === JSON.stringify(pendingWeights)}
                                    >
                                        <ArrowRight className="h-6 w-6" />
                                    </button>
                                    <button
                                        className="w-full bg-gray-200 hover:bg-gray-300 text-black font-medium h-10 rounded-full transition cursor-pointer"
                                        onClick={() => setMobileSliderOpen(false)}
                                    >
                                        Close Slider
                                    </button>
                                </div>
                            )}
                        </div>
                        <div className="px-2 sm:px-4">
                            <h1 className="px-4 py-1 text-2xl text-center md:text-left font-medium tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-black to-gray-400">
                                Here are your <b className="font-medium text-orange-700">top</b> matches!
                            </h1>
                            <p className="px-4 text-xs mb-1 md:mb-0 text-center md:text-left sm:text-sm tracking-tight text-black/60 italic">
                                Want to hear directly from someone who has experienced it?
                            </p>
                            <p className="px-4 text-center md:text-left text-xs sm:text-sm tracking-tight text-black/60 mb-3 italic">
                                <a
                                    href="#"
                                    className="font-medium text-teal-600 underline"
                                >
                                    Connect with a mentor
                                </a>{" "}
                                to learn directly from our international community or{" "}
                                <a
                                    href="#"
                                    className="font-medium text-teal-600 underline"
                                >
                                    contact us today
                                </a>{" "}
                                to speak with one of our experienced advisors!
                            </p>
                            <p className="px-4 text-center md:text-left text-xs sm:text-sm tracking-tight text-black/60 mb-4 italic"><b>Note:</b> Final rankings are based on 1 year of study, regardless of the study level.</p>
                            <FilterSection
                                countries={countries}
                                selectedCountries={selectedCountries}
                                onCountryChange={handleCountryChange}
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
                            />
                            <RankingsTable
                                rankings={filteredRankings}
                                loading={loading}
                                metricGroups={metricGroups}
                                industriesData={industriesData}
                                disciplinesData={disciplinesData}
                            />
                        </div>
                    </div>
                )}
            </section>
        </div>
    );
};

export default RankingsPage;
