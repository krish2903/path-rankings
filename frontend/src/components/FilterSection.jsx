import { useState } from "react";
import { Search, Check } from "lucide-react";
import { SheetHeader, SheetTitle, SheetFooter, SheetClose, SheetDescription } from "@/components/ui/sheet";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "./ui/accordion";
import { BUCKETS } from "@/data/Data";

export default function FilterSheetContent({
  category = "Country",
  countries = [],
  universities = [],
  cities = [],
  selectedCountries = [],
  selectedUnis = [],
  selectedCities = [],
  onCountryChange,
  onUniChange,
  onCityChange,
  disciplines = [],
  selectedDisciplines = [],
  onDisciplineChange,
  industries = [],
  selectedIndustries = [],
  onIndustryChange,
  selectedBuckets,
  onBucketsChange,
  onApplyFilters,
  onResetFilters,
}) {
  const [countrySearch, setCountrySearch] = useState("");
  const [uniSearch, setUniSearch] = useState("");
  const [citySearch, setCitySearch] = useState("");
  const [disciplineSearch, setDisciplineSearch] = useState("");
  const [industrySearch, setIndustrySearch] = useState("");

  const isCountry = category.toLowerCase() === "country";

  const filteredCountries = countries.filter((country) =>
    country.name.toLowerCase().includes(countrySearch.toLowerCase())
  );

  const filteredUnis = !isCountry ? universities.filter((uni) =>
    uni.name.toLowerCase().includes(uniSearch.toLowerCase())
  ) : [];

  const filteredCities = !isCountry ? cities.filter((c) =>
    c.city.toLowerCase().includes(citySearch.toLowerCase())
  ) : [];

  const filteredDisciplines = isCountry
    ? disciplines.filter((n) => n.toLowerCase().includes(disciplineSearch.toLowerCase()))
    : [];

  const filteredIndustries = isCountry
    ? industries.filter((n) => n.toLowerCase().includes(industrySearch.toLowerCase()))
    : [];

  const allFilteredCountriesSelected =
    filteredCountries.length > 0 &&
    filteredCountries.every((c) => selectedCountries.includes(c.id));

  const allFilteredUnisSelected =
    filteredUnis.length > 0 &&
    filteredUnis.every((u) => selectedUnis.includes(u.id));

  const allFilteredCitiesSelected =
    filteredCities.length > 0 &&
    filteredCities.every((c) => selectedCities.includes(c.city));

  const toggleSelectAllCountries = () => {
    if (allFilteredCountriesSelected) {
      filteredCountries.forEach(
        (c) => selectedCountries.includes(c.id) && onCountryChange(c.id, false)
      );
    } else {
      filteredCountries.forEach(
        (c) => !selectedCountries.includes(c.id) && onCountryChange(c.id, true)
      );
    }
  };

  const toggleSelectAllUnis = () => {
    if (allFilteredUnisSelected) {
      filteredUnis.forEach(
        (u) => selectedUnis.includes(u.id) && onUniChange(u.id, false)
      );
    } else {
      filteredUnis.forEach(
        (u) => !selectedUnis.includes(u.id) && onUniChange(u.id, true)
      );
    }
  };

  const toggleSelectAllCities = () => {
    if (allFilteredCitiesSelected) {
      filteredCities.forEach(
        (c) => selectedCities.includes(c.city) && onCityChange(c.city, false)
      );
    } else {
      filteredCities.forEach(
        (c) => !selectedCities.includes(c.city) && onCityChange(c.city, true)
      );
    }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Sheet Header */}
      <SheetHeader className="border-b border-black/5 px-2 py-4">
        <SheetTitle>Filters</SheetTitle>
        <SheetDescription className="text-xs text-black/70">Change the filters based on your preferences!</SheetDescription>
        {onResetFilters && (
          <button
            type="button"
            onClick={onResetFilters}
            className="text-xs text-orange-700 underline hover:text-orange-900 transition ml-2"
          >
            Reset All
          </button>
        )}
      </SheetHeader>

      {/* Filters Content */}
      <div className="flex-1 overflow-y-auto px-2 py-2">
        <Accordion type="single" defaultValue={isCountry ? "country" : "university"} collapsible>
          {/* Country Section */}
          <AccordionItem value={isCountry ? "country" : "university"}>
            <AccordionTrigger className="w-full px-2 flex justify-between">
              <p className="w-full">{isCountry ? "By Country" : "By University"}</p>
              <span className="text-xs text-orange-700 font-medium px-8">({isCountry ? selectedCountries.length : selectedUnis.length})</span>
            </AccordionTrigger>
            <AccordionContent>
              <div className="mb-2 bg-black/5 py-2 px-3 rounded-full flex items-center gap-2">
                <Search className="h-4 w-4 text-black/50" />
                <input
                  type="text"
                  placeholder={isCountry ? "Search countries..." : "Search universities..."}
                  value={isCountry ? countrySearch : uniSearch}
                  onChange={isCountry ? (e) => setCountrySearch(e.target.value) : (e) => setUniSearch(e.target.value)}
                  className="w-full text-xs outline-none"
                />
              </div>
              <button
                type="button"
                onClick={isCountry ? toggleSelectAllCountries : toggleSelectAllUnis}
                className={`cursor-pointer w-full text-xs font-semibold text-orange-700 bg-orange-100 rounded-lg py-1 mb-2 hover:bg-orange-200 fadeIn`}
              >
                {isCountry ? allFilteredCountriesSelected ? "Deselect All" : "Select All" : allFilteredUnisSelected ? "Deselect All" : "Select All"}
              </button>
              <div className="max-h-64 overflow-y-auto pr-1 space-y-1">
                {isCountry && filteredCountries.map((country) => (
                  <label
                    key={country.id}
                    className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-black/3 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedCountries.includes(country.id)}
                      onChange={(e) => onCountryChange(country.id, e.target.checked)}
                      className="accent-orange-700 cursor-pointer"
                    />
                    <div className="w-full flex justify-between items-center pr-2">
                      <span className="text-xs tracking-tight">{country.name}</span>
                    </div>
                  </label>
                ))}
                {!isCountry && filteredUnis.map((uni) => (
                  <label
                    key={uni.id}
                    className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-black/3 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedUnis.includes(uni.id)}
                      onChange={(e) => onUniChange(uni.id, e.target.checked)}
                      className="accent-orange-700 cursor-pointer"
                    />
                    <div className="w-full flex justify-between items-center pr-2">
                      <span className="text-xs tracking-tight">{uni.name}</span>
                    </div>
                  </label>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Country Filtering for Universities - only for University */}
          {!isCountry && (
            <AccordionItem value="country">
              <AccordionTrigger className="w-full px-2 flex justify-between">
                <p className="w-full">By Country</p>
                <span className="text-xs text-orange-700 font-medium px-8">({selectedCountries.length})</span>
              </AccordionTrigger>
              <AccordionContent>
                <div className="mb-2 bg-black/5 py-2 px-3 rounded-full flex items-center gap-2">
                  <Search className="h-4 w-4 text-black/50" />
                  <input
                    type="text"
                    placeholder="Search countries..."
                    value={countrySearch}
                    onChange={(e) => setCountrySearch(e.target.value)}
                    className="w-full text-xs outline-none"
                  />
                </div>
                <button
                  type="button"
                  onClick={toggleSelectAllCountries}
                  className={`cursor-pointer w-full text-xs font-semibold text-orange-700 bg-orange-100 rounded-lg py-1 mb-2 hover:bg-orange-200 fadeIn`}
                >
                  {allFilteredCountriesSelected ? "Deselect All" : "Select All"}
                </button>
                <div className="max-h-64 overflow-y-auto pr-1 space-y-1">
                  {filteredCountries.map((country) => (
                    <label
                      key={country.id}
                      className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-black/3 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedCountries.includes(country.id)}
                        onChange={(e) => onCountryChange(country.id, e.target.checked)}
                        className="accent-orange-700 cursor-pointer"
                      />
                      <div className="w-full flex justify-between items-center pr-2">
                        <span className="text-xs tracking-tight">{country.name}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          )}

          {/* City-level Filtering for Universities - only for University */}
          {!isCountry && (
            <AccordionItem value="city">
              <AccordionTrigger disabled={true} className="w-full opacity-35 px-2 flex justify-between">
                <p className="w-full">By City</p>
                {/* <span className="text-xs text-orange-700 font-medium px-8">({selectedCities.length})</span> */}
              </AccordionTrigger>
              <AccordionContent>
                <div className="mb-2 bg-black/5 py-2 px-3 rounded-full flex items-center gap-2">
                  <Search className="h-4 w-4 text-black/50" />
                  <input
                    type="text"
                    placeholder="Search cities..."
                    value={citySearch}
                    onChange={(e) => setCitySearch(e.target.value)}
                    className="w-full text-xs outline-none"
                  />
                </div>
                <button
                  type="button"
                  onClick={toggleSelectAllCities}
                  className={`cursor-pointer w-full text-xs font-semibold text-orange-700 bg-orange-100 rounded-lg py-1 mb-2 hover:bg-orange-200 fadeIn`}
                >
                  {allFilteredCitiesSelected ? "Deselect All" : "Select All"}
                </button>
                <div className="max-h-64 overflow-y-auto pr-1 space-y-1">
                  {filteredCities.map((city, idx) => (
                    <label
                      key={idx}
                      className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-black/3 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedCities.includes(city.city)}
                        onChange={(e) => onCityChange(city.city, e.target.checked)}
                        className="accent-orange-700 cursor-pointer"
                      />
                      <div className="w-full flex justify-between items-center pr-2">
                        <span className="text-xs tracking-tight">{city.city}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          )}

          {/* Discipline Section - only for Country */}
          {isCountry && (
            <AccordionItem value="discipline">
              <AccordionTrigger className="w-full px-2 flex justify-between">
                <p className="w-full">By Discipline</p>
                <span className="text-xs text-orange-700 font-medium px-8">({disciplines.length})</span>
              </AccordionTrigger>
              <AccordionContent>
                <div className="h-full overflow-y-auto pr-1 space-y-1">
                  {filteredDisciplines.map((name) => (
                    <label
                      key={name}
                      className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-black/3 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedDisciplines.includes(name)}
                        disabled={
                          !selectedDisciplines.includes(name) && selectedDisciplines.length >= 1
                        }
                        onChange={(e) => onDisciplineChange(name, e.target.checked)}
                        className="accent-orange-700 cursor-pointer"
                      />
                      <span className="text-xs tracking-tight">{name}</span>
                    </label>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          )}

          {/* Industry Section - only for Country */}
          {isCountry && (
            <AccordionItem value="industry">
              <AccordionTrigger className="w-full px-2 flex justify-between">
                <p className="w-full">By Industry</p>
                <span className="text-xs text-orange-700 font-medium px-8">({industries.length})</span>
              </AccordionTrigger>
              <AccordionContent>
                <div className="h-full overflow-y-auto pr-1 space-y-1">
                  {filteredIndustries.map((name) => (
                    <label
                      key={name}
                      className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-black/3 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedIndustries.includes(name)}
                        disabled={
                          !selectedIndustries.includes(name) && selectedIndustries.length >= 1
                        }
                        onChange={(e) => onIndustryChange(name, e.target.checked)}
                        className="accent-orange-700 cursor-pointer"
                      />
                      <span className="text-xs tracking-tight">{name}</span>
                    </label>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          )}

          {/* Category / Buckets Section */}
          <AccordionItem value="category">
            <AccordionTrigger disabled={true} className="w-full opacity-35 px-2 flex justify-between">
              <p className="w-full">By Category</p>
            </AccordionTrigger>
            <AccordionContent>
              <div className="h-full overflow-y-auto pr-1 space-y-1">
                {BUCKETS.map((b) => (
                  <label
                    key={b}
                    className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-black/3 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedBuckets.includes(b)}
                      onChange={(e) => onBucketsChange(b, e.target.checked)}
                      className="accent-orange-700 cursor-pointer"
                    />
                    <span className="text-sm tracking-tight">{b}</span>
                  </label>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

      {/* Sheet Footer (apply button) */}
      <SheetFooter className="px-4 py-4 shadow-sm">
        <SheetClose
          onClick={onApplyFilters}
          className="w-full flex items-center justify-center gap-2 px-4 h-9 text-sm font-semibold rounded-full text-white bg-[#E97451] hover:bg-orange-600 cursor-pointer transition"
        >
          <Check className="h-5 w-5" />
          Apply Filters
        </SheetClose>
      </SheetFooter>
    </div>
  );
}