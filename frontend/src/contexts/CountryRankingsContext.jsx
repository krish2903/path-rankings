import { createContext, useState, useMemo } from "react";

export const CountryRankingsContext = createContext();

export function CountryRankingsProvider({ children }) {
  // Data States
  const [rankings, setRankings] = useState([]);
  const [countries, setCountries] = useState([]);
  const [metricGroups, setMetricGroups] = useState([]);
  const [industriesData, setIndustriesData] = useState([]);
  const [disciplinesData, setDisciplinesData] = useState([]);

  // Filter/Selection States
  const [weights, setWeights] = useState({});
  const [pendingWeights, setPendingWeights] = useState({});
  const [pendingRatings, setPendingRatings] = useState({}); 
  const [selectedCountries, setSelectedCountries] = useState([]);
  const [selectedDisciplines, setSelectedDisciplines] = useState([]);
  const [selectedIndustries, setSelectedIndustries] = useState([]);
  const [selectedBuckets, setSelectedBuckets] = useState([]);

  // Loading States
  const [loading, setLoading] = useState(true);
  const [buttonLoading, setButtonLoading] = useState(false);

  // Mobile View
  const [mobileSliderOpen, setMobileSliderOpen] = useState(false);

  // Shared "allWeightsEqual" memo
  const allWeightsEqual = useMemo(() => {
    const values = Object.values(pendingWeights);
    if (values.length === 0) return true;
    return values.every((val) => val === values[0]);
  }, [pendingWeights]);

  const ctx = {
    rankings, setRankings,
    countries, setCountries,
    metricGroups, setMetricGroups,
    industriesData, setIndustriesData,
    disciplinesData, setDisciplinesData,
    weights, setWeights,
    pendingWeights, setPendingWeights,
    pendingRatings, setPendingRatings, 
    selectedCountries, setSelectedCountries,
    selectedDisciplines, setSelectedDisciplines,
    selectedIndustries, setSelectedIndustries,
    selectedBuckets, setSelectedBuckets,
    loading, setLoading,
    buttonLoading, setButtonLoading,
    mobileSliderOpen, setMobileSliderOpen,
    allWeightsEqual,
  };

  return (
    <CountryRankingsContext.Provider value={ctx}>
      {children}
    </CountryRankingsContext.Provider>
  );
}