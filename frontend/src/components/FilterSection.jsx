import { useState, useRef, useEffect } from "react";
import { ChevronDown, ChevronUp, Search, RotateCcw, Check } from "lucide-react";

const FilterDropdown = ({
  label,
  count,
  isOpen,
  onToggle,
  children,
  className = "",
}) => (
  <div className={`relative ${className}`}>
    <button
      onClick={onToggle}
      className="cursor-pointer flex items-center h-8 px-4 rounded-full bg-slate-200 transition-colors text-xs sm:text-sm font-medium text-black/80 hover:bg-orange-200 justify-between w-full sm:w-auto"
      type="button"
    >
      <span>
        {label}
        {typeof count === "number" && (
          <span className="ml-1 text-xs sm:text-sm text-orange-700 font-semibold">
            ({count})
          </span>
        )}
      </span>
      {isOpen ? (
        <ChevronUp className="h-4 w-4 text-orange-700 ml-2" />
      ) : (
        <ChevronDown className="h-4 w-4 text-orange-700 ml-2" />
      )}
    </button>
    {isOpen && (
      <div className="absolute left-0 mt-2 z-20 w-full sm:w-72 max-w-[90vw] bg-white rounded-3xl border border-gray-200 shadow-md p-4">
        {children}
      </div>
    )}
  </div>
);

const FilterSection = ({
  countries,
  selectedCountries,
  onCountryChange,
  disciplines,
  selectedDisciplines,
  onDisciplineChange,
  industries,
  selectedIndustries,
  onIndustryChange,
  onApplyFilters,
}) => {
  const [openDropdown, setOpenDropdown] = useState(null);
  const [countrySearch, setCountrySearch] = useState("");
  const [disciplineSearch, setDisciplineSearch] = useState("");
  const [industrySearch, setIndustrySearch] = useState("");
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredCountries = countries.filter((country) =>
    country.name.toLowerCase().includes(countrySearch.toLowerCase())
  );
  const allFilteredCountriesSelected =
    filteredCountries.length > 0 &&
    filteredCountries.every((c) => selectedCountries.includes(c.id));

  const toggleSelectAllCountries = () => {
    if (allFilteredCountriesSelected) {
      filteredCountries.forEach(
        (c) =>
          selectedCountries.includes(c.id) && onCountryChange(c.id, false)
      );
    } else {
      filteredCountries.forEach(
        (c) =>
          !selectedCountries.includes(c.id) && onCountryChange(c.id, true)
      );
    }
  };

  const filteredDisciplines = disciplines.filter((n) =>
    n.toLowerCase().includes(disciplineSearch.toLowerCase())
  );
  const filteredIndustries = industries.filter((n) =>
    n.toLowerCase().includes(industrySearch.toLowerCase())
  );

  return (
    <div ref={containerRef} className="w-full px-2 mb-6 md:mb-4">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2 w-full sm:w-auto">
          {/* Country Filter */}
          <FilterDropdown
            label="Country"
            count={selectedCountries.length}
            isOpen={openDropdown === "country"}
            onToggle={() =>
              setOpenDropdown(
                openDropdown === "country" ? null : "country"
              )
            }
            className="w-full sm:w-auto"
          >
            <div className="mb-2 relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search countries..."
                value={countrySearch}
                onChange={(e) => setCountrySearch(e.target.value)}
                className="w-full pl-8 pr-2 py-1 text-xs bg-gray-100 rounded-full focus:outline-none"
              />
            </div>
            <button
              type="button"
              onClick={toggleSelectAllCountries}
              className="cursor-pointer w-full text-xs font-medium text-orange-700 bg-orange-100 rounded-full py-1 mb-1 hover:bg-orange-200"
            >
              {allFilteredCountriesSelected
                ? "Deselect All"
                : "Select All"}
            </button>
            <div className="max-h-74 overflow-y-auto">
              {filteredCountries.map((country) => (
                <label
                  key={country.id}
                  className="flex items-center space-x-2 px-2 py-1.5 rounded-full hover:bg-gray-100 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedCountries.includes(country.id)}
                    onChange={(e) =>
                      onCountryChange(country.id, e.target.checked)
                    }
                    className="accent-black cursor-pointer"
                  />
                  <span className="text-xs sm:text-sm text-black/80">
                    {country.name}
                  </span>
                </label>
              ))}
            </div>
          </FilterDropdown>

          {/* Discipline Filter */}
          <FilterDropdown
            label="Discipline"
            count={selectedDisciplines.length}
            isOpen={openDropdown === "discipline"}
            onToggle={() =>
              setOpenDropdown(
                openDropdown === "discipline" ? null : "discipline"
              )
            }
            className="w-full sm:w-auto"
          >
            <div className="mb-2 relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search disciplines..."
                value={disciplineSearch}
                onChange={(e) => setDisciplineSearch(e.target.value)}
                className="w-full pl-8 pr-2 py-1 text-xs bg-gray-100 rounded-full focus:outline-none"
              />
            </div>
            <div className="max-h-74 overflow-y-auto">
              {filteredDisciplines.map((name) => {
                const isSelected = selectedDisciplines.includes(name);
                return (
                  <label
                    key={name}
                    className="flex items-center space-x-2 px-2 py-1.5 rounded-full hover:bg-gray-100 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      disabled={
                        !isSelected && selectedDisciplines.length >= 1
                      }
                      onChange={(e) =>
                        onDisciplineChange(name, e.target.checked)
                      }
                      className="accent-black cursor-pointer"
                    />
                    <span className="text-xs sm:text-sm text-black/80">
                      {name}
                    </span>
                  </label>
                );
              })}
            </div>
          </FilterDropdown>

          {/* Industry Filter */}
          <FilterDropdown
            label="Industry"
            count={selectedIndustries.length}
            isOpen={openDropdown === "industry"}
            onToggle={() =>
              setOpenDropdown(
                openDropdown === "industry" ? null : "industry"
              )
            }
            className="w-full sm:w-auto"
          >
            <div className="mb-2 relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search industries..."
                value={industrySearch}
                onChange={(e) => setIndustrySearch(e.target.value)}
                className="w-full pl-8 pr-2 py-1 text-xs bg-gray-100 rounded-full focus:outline-none"
              />
            </div>
            <div className="max-h-74 overflow-y-auto">
              {filteredIndustries.map((name) => {
                const isSelected = selectedIndustries.includes(name);
                return (
                  <label
                    key={name}
                    className="flex items-center space-x-2 px-2 py-1.5 rounded-full hover:bg-gray-100 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      disabled={
                        !isSelected && selectedIndustries.length >= 1
                      }
                      onChange={(e) =>
                        onIndustryChange(name, e.target.checked)
                      }
                      className="accent-black cursor-pointer"
                    />
                    <span className="text-xs sm:text-sm text-black/80">
                      {name}
                    </span>
                  </label>
                );
              })}
            </div>
          </FilterDropdown>
        </div>

        {/* Apply Button */}
        <div className="flex gap-2 w-full sm:w-auto">
          <button
            onClick={onApplyFilters}
            className="cursor-pointer flex items-center justify-center gap-1 px-4 h-8 text-xs sm:text-sm font-medium text-white bg-[#E97451] hover:bg-orange-600 rounded-full w-full sm:w-auto"
          >
            <Check className="h-4 w-4" />
            <span>Apply</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilterSection;
