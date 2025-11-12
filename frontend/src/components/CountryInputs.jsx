import React, { useRef } from "react";
import { INDUSTRIES, DISCIPLINES, iconMap } from "../data/Data";
import { Check } from "lucide-react";
import { ClipLoader } from "react-spinners";

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


export default function CountryInputs({
  onStart,
  selectedDisciplines = [],
  setSelectedDisciplines = () => { },
  selectedIndustries = [],
  setSelectedIndustries = () => { },
  buttonLoading,
}) {
  const disciplineRef = useRef(null);
  const industryRef = useRef(null);
  const containerRef = useRef(null);

  const scrollToIndustry = () => {
    if (!containerRef.current || !industryRef.current) return;
    const scrollLeft =
      industryRef.current.offsetLeft - containerRef.current.offsetLeft;
    containerRef.current.scrollTo({ left: scrollLeft, behavior: "smooth" });
  };

  return (
    <div
      ref={containerRef}
      className="flex snap-x snap-mandatory overflow-x-hidden w-screen"
      aria-label="Country and discipline/industry selection"
    >
      {/* Discipline Selection */}
      <section
        ref={disciplineRef}
        className="snap-start snap-always min-w-full flex flex-col justify-center items-center px-3 sm:px-6 md:px-20"
      >
        <h2 className="text-lg sm:text-xl md:text-2xl font-medium tracking-tight text-center text-black/70 md:mb-4 py-1">
          Which discipline are you interested in?
        </h2>
        <ItemSelector
          items={DISCIPLINES}
          selectedItems={selectedDisciplines}
          setSelectedItems={setSelectedDisciplines}
          typeLabel="discipline"
        />
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-6 justify-center w-full max-w-xs sm:max-w-none">
          <button
            className={`bg-black/80 hover:bg-black/75 text-white font-medium py-2 sm:py-3 rounded-full text-sm sm:text-base transition-all duration-300 ease-in-out w-full sm:w-32 cursor-pointer ${selectedDisciplines.length > 0 ? "hidden pointer-events-none" : "block"
              }`}
            onClick={scrollToIndustry}
            aria-hidden={selectedDisciplines.length > 0}
            tabIndex={selectedDisciplines.length > 0 ? -1 : 0}
          >
            Skip
          </button>
          <button
            className={`${selectedDisciplines.length === 0
              ? "bg-black/20 text-black/80 opacity-50 cursor-not-allowed"
              : "bg-[#ec5b22] hover:bg-[#df4c12] text-white cursor-pointer"
              } font-medium py-2 sm:py-3 rounded-full text-sm sm:text-base transition w-full sm:w-32`}
            onClick={scrollToIndustry}
            disabled={selectedDisciplines.length === 0}
          >
            Continue
          </button>
        </div>
      </section>

      {/* Industry Selection */}
      <section
        ref={industryRef}
        className="snap-start snap-always min-w-full flex flex-col justify-center items-center px-3 sm:px-6 md:px-8"
      >
        <h2 className="text-lg sm:text-xl md:text-2xl font-medium tracking-tight text-center text-black/70 py-1">
          Which industry are you looking to enter?
        </h2>
        <ItemSelector
          items={INDUSTRIES}
          selectedItems={selectedIndustries}
          setSelectedItems={setSelectedIndustries}
          typeLabel="industry"
        />
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-6 justify-center w-full max-w-xs sm:max-w-none">
          <button
            className={`bg-black/80 hover:bg-black/75 text-white font-medium py-2 sm:py-3 rounded-full text-sm sm:text-base transition-all duration-300 ease-in-out w-full sm:w-32 cursor-pointer ${selectedIndustries.length > 0 ? "hidden pointer-events-none" : "block"
              } ${buttonLoading ? "hidden" : "block"}`}
            onClick={onStart}
            aria-hidden={selectedIndustries.length > 0}
            tabIndex={selectedIndustries.length > 0 ? -1 : 0}
          >
            Skip
          </button>
          <button
            className={`${selectedIndustries.length === 0 || buttonLoading
              ? "bg-black/20 text-black/80 opacity-50 cursor-not-allowed"
              : "bg-[#ec5b22] hover:bg-[#df4c12] text-white cursor-pointer"
              } flex justify-center items-center font-medium py-2 sm:py-3 rounded-full text-sm sm:text-base transition w-full sm:w-32`}
            onClick={onStart}
            disabled={selectedIndustries.length === 0 || buttonLoading}
          >
            {buttonLoading ? <ClipLoader size={18} color="#666" /> : "Start"}
          </button>
        </div>
      </section>
    </div>
  );
}