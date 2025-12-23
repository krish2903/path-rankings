import { useRef, useState, useContext, useEffect } from "react";
import { Check, Search } from "lucide-react";
import { ClipLoader } from "react-spinners";
import { RankingsContext } from "@/contexts/RankingsContext";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Link } from "react-router-dom";
import { DISCIPLINES, iconMap } from "@/data/Data";

const MultiSelect = ({ countries, selectedCountries, setSelectedCountries }) => {
    const [search, setSearch] = useState('');
    const [open, setOpen] = useState(false);
    const inputRef = useRef(null);
    const toggle = (country) => {
        setSelectedCountries(selectedCountries.some(c => c.id === country.id)
            ? selectedCountries.filter(c => c.id !== country.id)
            : [...selectedCountries, country]);
    };

    const filtered = countries.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase())
    )

    return (
        <div className="flex flex-col items-center gap-4 my-4">
            <div className="w-80">
                <Popover>
                    <PopoverTrigger onClick={() => inputRef.current?.focus()} asChild>
                        <div className="bg-black/5 flex items-center text-black/80 font-medium px-3 py-3 rounded-full text-sm sm:text-base transition-all duration-300 ease-in-out w-full cursor-text">
                            <Search size={18} color="#666" />
                            <input
                                ref={inputRef}
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                onFocus={() => setOpen(true)}
                                className="flex-1 min-w-[60px] bg-transparent outline-none text-sm px-1"
                                placeholder="Select countries..."
                            />
                        </div>
                    </PopoverTrigger>
                    <PopoverContent
                        className="max-w-sm p-0 border-black/10 rounded-2xl shadow-lg max-h-48 overflow-auto w-[320px]"
                        onOpenAutoFocus={(e) => e.preventDefault()}
                    >
                        <div className="py-1">
                            {filtered.map(c => (
                                <button
                                    key={c.id}
                                    onMouseDown={(e) => {
                                        e.preventDefault();
                                        toggle(c);
                                    }}
                                    className={`w-full flex items-center gap-2 text-left px-3 py-2 text-sm transition-colors ${selectedCountries.some(country => country.id === c.id) ? 'bg-orange-600/5 font-medium' : 'hover:bg-black/5'}`}
                                >
                                    <img src={c.flag} className="h-3.5 w-5 ring-1 ring-black/10 rounded-sm" />
                                    {c.name}
                                </button>
                            ))}
                        </div>
                    </PopoverContent>
                </Popover>
            </div>
            <div className="max-w-xl flex items-center justify-center flex-wrap gap-2">
                {selectedCountries.map(c => (
                    <div key={c.id} className="bg-orange-700/80 text-white px-3 py-1 rounded-full text-xs flex items-center gap-1">
                        {c.name}
                        <button
                            onClick={e => { e.stopPropagation(); toggle(c) }}
                            className="text-white/80 hover:text-white font-bold text-sm cursor-pointer"
                        >
                            ×
                        </button>
                    </div>
                ))}
            </div>
        </div>
    )
}

const ItemSelector = ({
    items = [],
    selectedItems = [],
    setSelectedItems = () => { },
    typeLabel,
}) => {
    const maxSelection = 1;

    const toggleItem = (name) => {
        if (selectedItems.includes(name)) {
            setSelectedItems([]);
        } else {
            setSelectedItems([name]);
        }
    };

    return (
        <div className="flex flex-col w-full md:max-w-[90%] px-4">
            <h2 className="text-md sm:text-lg font-medium text-black/50 mb-4 md:mb-10 text-center">
                Select {maxSelection} {typeLabel}
            </h2>

            <div
                className="grid gap-6 sm:gap-8 justify-center grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-[repeat(auto-fit,minmax(6rem,1fr))]"
            >
                {items.map((name) => {
                    const Icon = iconMap[name];
                    const selected = selectedItems.includes(name);
                    return (
                        <button
                            key={name}
                            type="button"
                            onClick={() => toggleItem(name)}
                            className={`relative cursor-pointer flex flex-col items-center focus:outline-none transition-colors ${selected
                                ? "border-orange-500"
                                : "border-transparent hover:border-orange-300"
                                }`}
                            aria-pressed={selected}
                            aria-label={`${name} ${selected ? "selected" : "not selected"}`}
                            title={name}
                        >
                            <div
                                className={`relative flex items-center justify-center h-16 w-16 md:h-22 md:w-22 rounded-full ring-3 bg-black/3 ${selected ? "ring-orange-500 bg-orange-300/20" : "ring-black/5 hover:bg-orange-400/5 hover:ring-orange-400/20"
                                    } transition-colors`}
                            >
                                {Icon && (
                                    <Icon
                                        className="text-black/60 stroke-[2px]"
                                        size={28}
                                    />
                                )}
                            </div>

                            {selected && (
                                <span className="absolute -top-0.5 right-5 h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7 bg-orange-500 rounded-full flex items-center justify-center">
                                    <Check className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4 stroke-[3px] text-white" />
                                </span>
                            )}

                            <span className="mt-2 text-xs md:text-sm text-center text-black/80">
                                {name}
                            </span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default function UniInputs({
    onStart,
}) {
    const containerRef = useRef(null);
    const countryRef = useRef(null);
    const disciplineRef = useRef(null);

    const {
        countries,
        setSelectedUniCountries,
        buttonLoading,
        shortlistedCountries,
        selectedUniDisciplines, setSelectedUniDisciplines,
    } = useContext(RankingsContext);

    const [selectedCountries, setSelectedCountries] = useState([]);

    useEffect(() => {
        if (shortlistedCountries.length > 0) {
            const transformedCountries = shortlistedCountries.map((country) => ({
                flag: country.flag,
                id: country.country_id,
                name: country.country_name
            }));
            setSelectedCountries(transformedCountries);
        }
    }, [shortlistedCountries]);

    useEffect(() => {
        if (selectedCountries.length > 0) {
            setSelectedUniCountries(selectedCountries.map(c => c.id));
        } else {
            setSelectedUniCountries(countries.map(c => c.id));
        }
    }, [selectedCountries]);

    const scrollToDisciplines = () => {
        if (!containerRef.current || !disciplineRef.current) return;
        const scrollLeft =
            disciplineRef.current.offsetLeft - containerRef.current.offsetLeft;
        containerRef.current.scrollTo({ left: scrollLeft, behavior: "smooth" });
    };

    return (
        <div
            ref={containerRef}
            className="flex snap-x snap-mandatory overflow-x-hidden w-screen"
            aria-label="Country and discipline/industry selection"
        >
            {/* Country Selection */}
            <section
                ref={countryRef}
                className="snap-start snap-always min-w-full flex flex-col justify-center items-center px-3 sm:px-6 md:px-20"
            >
                <h2 className="text-lg sm:text-xl md:text-2xl font-medium tracking-tight text-center text-black/70 py-1">
                    Which countries have you shortlisted?
                </h2>
                <h3 className="text-xs sm:text-sm font-medium tracking-tight text-center text-black/50 mb-2 md:mb-4 py-1">
                    Haven't shortlisted any countries yet? Check our <Link to="/country-rankings" className="text-orange-700 underline">country rankings</Link> to find the right country for your preferences!
                </h3>
                <MultiSelect
                    countries={countries}
                    selectedCountries={selectedCountries}
                    setSelectedCountries={setSelectedCountries}
                />
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-6 justify-center w-full max-w-xs sm:max-w-none">
                    <button
                        className={`bg-black/80 hover:bg-black/75 text-white font-medium py-2 sm:py-3 rounded-full text-sm sm:text-base transition-all duration-300 ease-in-out w-full sm:w-32 cursor-pointer ${selectedCountries.length > 0 || buttonLoading ? "hidden pointer-events-none" : "block"
                            }`}
                        onClick={scrollToDisciplines}
                        aria-hidden={selectedCountries.length > 0}
                        tabIndex={selectedCountries.length > 0 ? -1 : 0}
                    >
                        Skip
                    </button>
                    <button
                        className={`${selectedCountries.length === 0 || buttonLoading
                            ? "bg-black/20 text-black/80 opacity-50 cursor-not-allowed"
                            : "bg-[#ec5b22] hover:bg-[#df4c12] text-white cursor-pointer"
                            } flex justify-center items-center font-medium py-2 sm:py-3 rounded-full text-sm sm:text-base transition w-full sm:w-32`}
                        onClick={scrollToDisciplines}
                        disabled={selectedCountries.length === 0 || buttonLoading}
                    >
                        {buttonLoading ? <ClipLoader size={18} color="#333" /> : "Continue"}
                    </button>
                </div>
            </section>

            <section
                ref={disciplineRef}
                className="snap-start snap-always min-w-full flex flex-col justify-center items-center px-3 sm:px-6 md:px-20"
            >
                <h2 className="text-lg sm:text-xl md:text-2xl font-medium tracking-tight text-center text-black/70 md:mb-4 py-1">
                    Which discipline are you interested in?
                </h2>
                <ItemSelector
                    items={DISCIPLINES}
                    selectedItems={selectedUniDisciplines}
                    setSelectedItems={setSelectedUniDisciplines}
                    typeLabel="discipline"
                />
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-6 justify-center w-full max-w-xs sm:max-w-none">
                    <button
                        className={`bg-black/80 hover:bg-black/75 text-white font-medium py-2 sm:py-3 rounded-full text-sm sm:text-base transition-all duration-300 ease-in-out w-full sm:w-32 cursor-pointer ${selectedUniDisciplines.length > 0 ? "hidden pointer-events-none" : "block"
                            }`}
                        onClick={onStart}
                        aria-hidden={selectedUniDisciplines.length > 0}
                        tabIndex={selectedUniDisciplines.length > 0 ? -1 : 0}
                    >
                        Skip
                    </button>
                    <button
                        className={`${selectedUniDisciplines.length === 0 || buttonLoading
                            ? "bg-black/20 text-black/80 opacity-50 cursor-not-allowed"
                            : "bg-[#ec5b22] hover:bg-[#df4c12] text-white cursor-pointer"
                            } font-medium py-2 sm:py-3 rounded-full text-sm sm:text-base transition w-full sm:w-32`}
                        onClick={onStart}
                        disabled={selectedUniDisciplines.length === 0 || buttonLoading}
                    >
                        {buttonLoading ? <ClipLoader size={18} color="#333" /> : "Start"}
                    </button>
                </div>
            </section>
        </div>
    );
}