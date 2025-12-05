import { useRef, useState, useContext, useEffect } from "react";
import { Search } from "lucide-react";
import { ClipLoader } from "react-spinners";
import { RankingsContext } from "@/contexts/RankingsContext";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

const MultiSelect = ({ countries, selectedCountries, setSelectedCountries }) => {
    const [search, setSearch] = useState('');
    const [open, setOpen] = useState(false);
    const inputRef = useRef(null);
    const toggle = (country) => {
        setSelectedCountries(selectedCountries.includes(country)
            ? selectedCountries.filter(c => c.name !== country.name)
            : [...selectedCountries, country])
    }

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
                                    className={`w-full flex items-center gap-2 text-left px-3 py-2 text-sm transition-colors ${selectedCountries.includes(c) ? 'bg-orange-600/5 font-medium' : 'hover:bg-black/5'}`}
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

export default function UniInputs({
    onStart,
}) {
    const containerRef = useRef(null);
    const countryRef = useRef(null);

    const [selectedCountries, setSelectedCountries] = useState([]);

    const {
        countries,
        setSelectedUniCountries,
        buttonLoading,
    } = useContext(RankingsContext);

    useEffect(() => {
        setSelectedUniCountries(selectedCountries.map(c => c.id));
    }, [selectedCountries]);

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
                    Haven't shortlisted any countries yet? Check our <a href="/country-rankings" className="text-orange-700 underline">country rankings</a> to find the right country for your preferences!
                </h3>
                <MultiSelect
                    countries={countries}
                    selectedCountries={selectedCountries}
                    setSelectedCountries={setSelectedCountries}
                />
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-6 justify-center w-full max-w-xs sm:max-w-none">
                    <button
                        className={`bg-black/80 hover:bg-black/75 text-white font-medium py-2 sm:py-3 rounded-full text-sm sm:text-base transition-all duration-300 ease-in-out w-full sm:w-32 cursor-pointer ${selectedCountries.length > 0 ? "hidden pointer-events-none" : "block"
                            }`}
                        onClick={onStart}
                        aria-hidden={selectedCountries.length > 0}
                        tabIndex={selectedCountries.length > 0 ? -1 : 0}
                    >
                        Skip
                    </button>
                    <button
                        className={`${selectedCountries.length === 0
                            ? "bg-black/20 text-black/80 opacity-50 cursor-not-allowed"
                            : "bg-[#ec5b22] hover:bg-[#df4c12] text-white cursor-pointer"
                            } flex justify-center items-center font-medium py-2 sm:py-3 rounded-full text-sm sm:text-base transition w-full sm:w-32`}
                        onClick={onStart}
                        disabled={selectedCountries.length === 0}
                    >
                        {buttonLoading ? <ClipLoader size={18} color="white" /> : "Start"}
                    </button>
                </div>
            </section>
        </div>
    );
}