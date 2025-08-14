import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import CountryRankingsPage from "./pages/CountryRankingsPage";

const App = () => (
  <>
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/country-rankings" element={<CountryRankingsPage />} />
    </Routes>
  </>
);

export default App;
