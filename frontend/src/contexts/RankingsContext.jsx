import { createContext, useState, useMemo } from "react";

export const RankingsContext = createContext();

export function RankingsProvider({ children }) {
  // Data States
  const [countryRankings, setCountryRankings] = useState([]);
  const [uniRankings, setUniRankings] = useState([]);
  const [countries, setCountries] = useState([]);
  const [regions, setRegions] = useState([]);
  const [universities, setUniversities] = useState([]);
  const [countryMetricGroups, setCountryMetricGroups] = useState([]);
  const [uniMetricGroups, setUniMetricGroups] = useState([]);
  const [industriesData, setIndustriesData] = useState([]);
  const [disciplinesData, setDisciplinesData] = useState([]);
  const [uniDisciplinesData, setUniDisciplinesData] = useState([]);

  // Filter/Selection States
  const [countryWeights, setCountryWeights] = useState({});
  const [uniWeights, setUniWeights] = useState({});
  const [pendingCountryWeights, setPendingCountryWeights] = useState({});
  const [pendingUniWeights, setPendingUniWeights] = useState({});
  const [pendingCountryRatings, setPendingCountryRatings] = useState({}); 
  const [pendingUniRatings, setPendingUniRatings] = useState({}); 
  const [selectedCountries, setSelectedCountries] = useState([]);
  const [selectedRegions, setSelectedRegions] = useState([]);
  const [selectedUnis, setSelectedUnis] = useState([]);
  const [selectedUniCountries, setSelectedUniCountries] = useState([]);
  const [selectedUniRegions, setSelectedUniRegions] = useState([]);
  const [selectedDisciplines, setSelectedDisciplines] = useState([]);
  const [selectedUniDisciplines, setSelectedUniDisciplines] = useState([]);
  const [selectedIndustries, setSelectedIndustries] = useState([]);
  const [shortlistedCountries, setShortlistedCountries] = useState([]);
  const [shortlistedUnis, setShortlistedUnis] = useState([]);
  const [recentCountryRatingsHistory, setRecentCountryRatingsHistory] = useState([]);
  const [recentUniRatingsHistory, setRecentUniRatingsHistory] = useState([]);

  // Loading States
  const [loading, setLoading] = useState(true);
  const [feedbackPopup, setFeedbackPopup] = useState(false);
  const [buttonLoading, setButtonLoading] = useState(false);

  const ctx = {
    countryRankings, setCountryRankings,
    uniRankings, setUniRankings,
    countries, setCountries,
    regions, setRegions,
    universities, setUniversities,
    countryMetricGroups, setCountryMetricGroups,
    uniMetricGroups, setUniMetricGroups,
    industriesData, setIndustriesData,
    disciplinesData, setDisciplinesData,
    uniDisciplinesData, setUniDisciplinesData,
    countryWeights, setCountryWeights,
    uniWeights, setUniWeights,
    pendingCountryWeights, setPendingCountryWeights,
    pendingUniWeights, setPendingUniWeights,
    pendingCountryRatings, setPendingCountryRatings, 
    pendingUniRatings, setPendingUniRatings,
    selectedCountries, setSelectedCountries,
    selectedRegions, setSelectedRegions,
    selectedUnis, setSelectedUnis,
    selectedUniCountries, setSelectedUniCountries,
    selectedUniRegions, setSelectedUniRegions,
    selectedDisciplines, setSelectedDisciplines,
    selectedUniDisciplines, setSelectedUniDisciplines,
    selectedIndustries, setSelectedIndustries,
    shortlistedCountries, setShortlistedCountries,
    shortlistedUnis, setShortlistedUnis,
    recentCountryRatingsHistory, setRecentCountryRatingsHistory,
    recentUniRatingsHistory, setRecentUniRatingsHistory,
    loading, setLoading,
    buttonLoading, setButtonLoading,
    feedbackPopup, setFeedbackPopup,
  };

  return (
    <RankingsContext.Provider value={ctx}>
      {children}
    </RankingsContext.Provider>
  );
}