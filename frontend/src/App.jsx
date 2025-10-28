import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import CountryRankingsPage from "./pages/CountryRankingsPage";
import Header from "./components/Header";
import { CountryRankingsProvider } from "./contexts/CountryRankingsContext";

const App = () => (
  <CountryRankingsProvider>
    <div className="max-w-screen">
      <Header />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/country-rankings" element={<CountryRankingsPage />} />
      </Routes>
    </div>
  </CountryRankingsProvider>
);

export default App;
