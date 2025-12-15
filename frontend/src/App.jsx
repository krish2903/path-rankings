import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import CountryRankingsPage from "./pages/CountryRankingsPage";
import UniversityRankingsPage from "./pages/UniversityRankingsPage";
import Header from "./components/Header";
import { RankingsProvider } from "./contexts/RankingsContext";
import { Toaster } from "@/components/ui/sonner"

const App = () => (
  <RankingsProvider>
    <div className="max-w-screen">
      <Header />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/country-rankings" element={<CountryRankingsPage />} />
        <Route path="/university-rankings" element={<UniversityRankingsPage />} />
      </Routes>
      <Toaster />
    </div>
  </RankingsProvider>
);

export default App;
