import { createContext, useState, useMemo } from "react";

export const RankingsContext = createContext();

export function RankingsProvider({ children }) {
  // Data States
  const [countryRankings, setCountryRankings] = useState([]);
  const [uniRankings, setUniRankings] = useState([]);
  const [countries, setCountries] = useState([]);
  const [cities, setCities] = useState([]);
  const [universities, setUniversities] = useState([]);
  const [countryMetricGroups, setCountryMetricGroups] = useState([]);
  const [uniMetricGroups, setUniMetricGroups] = useState([]);
  const [industriesData, setIndustriesData] = useState([]);
  const [disciplinesData, setDisciplinesData] = useState([]);

  // Filter/Selection States
  const [countryWeights, setCountryWeights] = useState({});
  const [uniWeights, setUniWeights] = useState({});
  const [pendingCountryWeights, setPendingCountryWeights] = useState({});
  const [pendingUniWeights, setPendingUniWeights] = useState({});
  const [pendingCountryRatings, setPendingCountryRatings] = useState({}); 
  const [pendingUniRatings, setPendingUniRatings] = useState({}); 
  const [selectedCountries, setSelectedCountries] = useState([]);
  const [selectedUnis, setSelectedUnis] = useState([]);
  const [selectedUniCountries, setSelectedUniCountries] = useState([]);
  const [selectedUniCities, setSelectedUniCities] = useState([]);
  const [selectedDisciplines, setSelectedDisciplines] = useState([]);
  const [selectedIndustries, setSelectedIndustries] = useState([]);
  const [selectedBuckets, setSelectedBuckets] = useState([]);
  const [shortlistedCountries, setShortlistedCountries] = useState([]);

  // Loading States
  const [loading, setLoading] = useState(true);
  const [buttonLoading, setButtonLoading] = useState(false);

  const ctx = {
    countryRankings, setCountryRankings,
    uniRankings, setUniRankings,
    countries, setCountries,
    cities, setCities,
    universities, setUniversities,
    countryMetricGroups, setCountryMetricGroups,
    uniMetricGroups, setUniMetricGroups,
    industriesData, setIndustriesData,
    disciplinesData, setDisciplinesData,
    countryWeights, setCountryWeights,
    uniWeights, setUniWeights,
    pendingCountryWeights, setPendingCountryWeights,
    pendingUniWeights, setPendingUniWeights,
    pendingCountryRatings, setPendingCountryRatings, 
    pendingUniRatings, setPendingUniRatings,
    selectedCountries, setSelectedCountries,
    selectedUnis, setSelectedUnis,
    selectedUniCountries, setSelectedUniCountries,
    selectedUniCities, setSelectedUniCities,
    selectedDisciplines, setSelectedDisciplines,
    selectedIndustries, setSelectedIndustries,
    selectedBuckets, setSelectedBuckets,
    shortlistedCountries, setShortlistedCountries,
    loading, setLoading,
    buttonLoading, setButtonLoading,
  };

  return (
    <RankingsContext.Provider value={ctx}>
      {children}
    </RankingsContext.Provider>
  );
}