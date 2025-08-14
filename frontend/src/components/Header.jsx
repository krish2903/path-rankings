import { Link } from "react-router-dom";

const Header = () => {
  return (
    <header className="fixed flex h-[4rem] px-16 w-screen justify-center items-center z-99 backdrop-blur-md shadow-sm bg-white/70">
      <Link to="/">
        <img src="/logo.png" alt="Logo" className="max-h-8 cursor-pointer" />
      </Link>
      {/* <div className="flex space-x-8">
        <Link
          to="/country-rankings"
          className="text-sm font-medium text-black/80 hover:text-orange-700 hover:underline transition-colors"
        >
          Country Rankings
        </Link>
        <Link
          to="/"
          className="text-sm font-medium text-black/80 hover:text-orange-700 hover:underline transition-colors"
        >
          University Rankings
        </Link>
      </div> */}
    </header>
  );
};

export default Header;
