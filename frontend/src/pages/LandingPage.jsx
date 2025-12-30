import React, { useRef, useState } from "react";
import { Flag, GraduationCap, Lock } from "lucide-react";
import { Link } from "react-router-dom";
import Metrics from "../components/Metrics";

const CheckIcon = () => (
    <svg
        className="w-5 h-5 text-[#ec5b22] flex-shrink-0"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        viewBox="0 0 24 24"
        aria-hidden="true"
    >
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
);

const showOverlay = false;

const countryFeatures = [
    "Compare 20+ countries to find your perfect fit",
    "Find study destinations that match your preferences",
    "Access the latest news & info to stay updated",
    "Learn directly from 10,000+ international students’ real experiences",
];

const uniFeatures = [
    "Discover & compare 500+ universities worldwide",
    "Analyze academic performance and more",
    "Assess student satisfaction and graduate outcomes",
    "Access first-hand experiences of 100+ international students who have studied at the top institutions",
];

const LandingPage = () => {
    const aboutRef = useRef(null);
    const heroRef = useRef(null);
    const [selection, setSelection] = useState(null);

    const scrollToHero = () => {
        if (heroRef.current) {
            heroRef.current.scrollIntoView({ behavior: "smooth" });
        }
    };

    return (
        <main className="min-h-screen bg-gradient-to-b from-[#fff5f0] to-white fadeIn">
            {/* RANKINGS SECTION */}
            <section
                className="w-full flex flex-col"
                aria-label="Explore Rankings"
            >
                <div className="rounded-3xl flex flex-col items-center justify-center flex-1 w-full px-4 sm:px-8 py-20 md:py-32">
                    <h1 className="text-3xl md:text-5xl font-medium tracking-tight md:mb-4 text-transparent bg-clip-text bg-gradient-to-b from-black to-black/40 py-2">
                        PATH Rankings Explorer
                    </h1>
                    <h1 className="w-full text-center text-md md:text-2xl font-medium tracking-tight text-black/80">
                        What would you like to explore today?
                    </h1>
                    <div className="flex flex-col sm:flex-row gap-6 sm:gap-8 mt-4 flex-wrap justify-center w-full">
                        {/* Country Card */}
                        <div
                            className={`max-w-full sm:max-w-md w-full drop-shadow-lg inset-shadow-xs rounded-3xl transition flex flex-col duration-200 overflow-hidden focus:outline-none bg-white`}
                            aria-label="Dream Country Search"
                        >
                            <header className="flex flex-col justify-start px-3 pt-5 pb-2 items-center gap-2">
                                <div className="w-8 h-8 flex justify-center items-center bg-black/90 rounded-full"><Flag color="white" strokeWidth={3} width={16} height={16} /></div>
                                <h2 className="w-full text-center text-base font-medium tracking-tight text-black/60">
                                    Shortlist the <span className="font-medium text-black">right countries</span> for you!
                                </h2>
                                <Link
                                    to="/country-rankings"
                                    className="bg-orange-700/80 hover:bg-orange-700/75 text-white transition-all duration-300 text-xs px-3 font-medium py-2 rounded-full hover:scale-105 cursor-pointer"
                                >
                                    View Country Rankings
                                </Link>
                            </header>
                            <p className="px-4 py-2 text-xs text-justify text-black/60 leading-tight tracking-tight mb-2">
                                Selecting the right country for your higher education is the single most important decision that helps shape your future. It defines the quality of your education, the opportunities you access, the networks you build, and the life you live.
                            </p>
                            <div>
                                <ul className="bg-black/5 backdrop-blur-sm px-4 py-6 space-y-2 sm:space-y-3 w-full list-none">
                                    {countryFeatures.map((feature, idx) => (
                                        <li key={idx} className="flex items-start gap-3 text-sm">
                                            <CheckIcon />
                                            <span className="tracking-tight">{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        {/* University Card */}
                        <div
                            className={`max-w-full sm:max-w-md w-full drop-shadow-lg inset-shadow-xs rounded-3xl transition flex flex-col duration-200 overflow-hidden focus:outline-none bg-white`}
                            aria-label="Dream University Search"
                        >
                            <header className="flex flex-col justify-start px-3 pt-5 pb-2 items-center gap-2">
                                <div className="w-8 h-8 flex justify-center items-center bg-black/90 rounded-full"><GraduationCap color="white" strokeWidth={2} width={20} height={20} /></div>
                                <h2 className="w-full text-center text-base font-medium tracking-tight text-black/60">
                                    Shortlist the <span className="font-medium text-black">right universities</span> for you!
                                </h2>
                                <Link
                                    to="/university-rankings"
                                    className="bg-orange-700/80 hover:bg-orange-700/75 text-white transition-all duration-300 text-xs px-3 font-medium py-2 rounded-full hover:scale-105 cursor-pointer"
                                >
                                    View University Rankings
                                </Link>
                            </header>
                            <p className="px-4 py-2 text-xs text-justify text-black/60 leading-tight tracking-tight mb-2">
                                **NEEDS EDITING** Selecting the right university for your higher education is the single most important decision that helps shape your future. It defines the quality of your education, the opportunities you access, the networks you build, and the life you live.
                            </p>
                            <div>
                                <ul className="bg-black/5 backdrop-blur-sm px-4 py-6 space-y-2 sm:space-y-3 w-full list-none">
                                    {uniFeatures.map((feature, idx) => (
                                        <li key={idx} className="flex items-start gap-3 text-sm">
                                            <CheckIcon />
                                            <span className="tracking-tight">{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col justify-center items-center gap-2 mt-4">
                        <button
                            onClick={scrollToHero}
                            className="bg-orange-700/80 hover:bg-orange-700/75 text-white font-medium mt-4 py-2 sm:py-4 px-5 sm:px-8 rounded-full text-base transition cursor-pointer"
                            aria-label="Continue to Rankings Section"
                        >
                            Learn More
                        </button>
                    </div>
                </div>
            </section>

            {/* HERO SECTION */}
            <section
                ref={heroRef}
                className="relative w-full px-4 sm:px-6 md:px-8 py-24 md:py-36 flex flex-col items-center justify-center text-center"
                aria-label="PATH Rankings Explorer Introduction"
            >
                <header>
                    <h2 className="text-2xl lg:text-4xl font-medium tracking-tight mb-4 text-transparent bg-clip-text bg-gradient-to-br from-gray-900 to-gray-400">
                        By International <span className="text-orange-700">Students</span>. For International <span className="text-orange-700">Students</span>.
                    </h2>
                </header>
                <div className="text-sm sm:text-base md:text-lg mb-6 sm:mb-8 max-w-full sm:max-w-2xl md:max-w-5xl tracking-tight text-black/60">
                    <p>
                        The <strong className="font-semibold">only</strong> platform that helps you identify the best countries & universities based on <strong className="font-semibold">your</strong> preferences.
                    </p>
                    <p>
                        Not just another <i>"one size fits all"</i> global rankings table.
                    </p>
                    <p className="mt-2">
                        Adjust, filter, and discover the best institutions and destinations
                        tailored to your preferences!
                    </p>
                </div>
                <div className="flex flex-col justify-center items-center">
                    <svg
                        className="w-8 h-8 text-gray-700 animate-bounce"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                        viewBox="0 0 24 24"
                    >
                        {/* First chevron */}
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M19 8.5l-7 7-7-7"
                        />
                        {/* Second chevron, lower */}
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M19 14.5l-7 7-7-7"
                        />
                    </svg>
                </div>
            </section>

            {/* ABOUT SECTION */}
            <section
                ref={aboutRef}
                className="w-full flex flex-col justify-center items-center px-4 sm:px-8 py-12 sm:py-16"
                aria-label="What are PATH Rankings?"
            >
                <div className="flex flex-col items-center w-full gap-3 sm:gap-4">
                    <h1 className="w-full bg-clip-text text-transparent bg-gradient-to-b from-black to-black/40 text-center text-3xl lg:text-4xl font-medium tracking-tight py-1">
                        What are PATH Rankings?
                    </h1>
                    <img src="https://illustrations.popsy.co/amber/engineer.svg" className="max-h-48" />
                    <p className="text-sm sm:text-base text-black/60 tracking-tight">
                        PATH stands for:
                    </p>
                    <p className="text-lg sm:text-xl md:text-2xl text-black/60 text-center font-medium tracking-tight">
                        <b className="font-bold text-orange-700">P</b>ersonal{" "}
                        <b className="font-bold text-orange-700">A</b>cademics and{" "}
                        <b className="font-bold text-orange-700">T</b>raining{" "}
                        <b className="font-bold text-orange-700">H</b>ub
                    </p>
                    <p className="text-sm sm:text-base md:text-lg text-black/60 max-w-full sm:max-w-[85%] md:max-w-[70%] tracking-tight mt-3 sm:mt-4 text-justify">
                        Unlike traditional university rankings that offer a generic list based on broad metrics, PATH provides personalised rankings tailored to{" "}
                        <b className="font-medium text-black/80">international students</b>. Most rankings simply tell you how a university is ranked overall, often overlooking the factors that truly matter to students coming from abroad. The PATH framework addresses this gap by prioritising what’s{" "}
                        <b className="font-medium text-black/80">most relevant</b> to your individual goals and circumstances.
                    </p>
                    <p className="text-base sm:text-lg text-black/60 max-w-full sm:max-w-[85%] md:max-w-[70%] tracking-tight mt-3 sm:mt-4 italic text-center">
                        We help you find the <b className="text-orange-700">best-fit</b> study destination, not just the{" "}
                        <b className="font-medium text-black/80">"top-ranked"</b> one.
                    </p>
                </div>
            </section>

            {/* ABOUT SECTION CONTINUED */}
            <section
                className="w-full flex flex-col justify-center items-center px-4 sm:px-8 py-12 sm:py-16"
                aria-label="What do we cover?"
            >
                <div className="flex flex-col items-center justify-center w-full gap-4">
                    <h1 className="w-full bg-clip-text text-transparent bg-gradient-to-b from-black to-black/40 text-center text-3xl lg:text-4xl font-medium tracking-tight py-1">
                        What do we cover?
                    </h1>
                    <img src="https://illustrations.popsy.co/amber/woman-with-a-laptop.svg" className="max-h-48" />
                    <p className="text-sm sm:text-base text-black/60 tracking-tight mb-4 text-center">
                        Our rankings cover the factors that matter most to international students, including:
                    </p>
                    <div className="flex flex-col gap-4 text-left w-full sm:w-[80%] md:w-[60%]">
                        {[
                            { title: "Permanent Residency", desc: "Opportunities for long-term stay and immigration pathways after graduation." },
                            { title: "Affordability & Academic Value", desc: "Cost of tuition and living, and the overall value of your education investment." },
                            { title: "Talent (Employment)", desc: "Job opportunities during and after your studies, internships, and career support." },
                            { title: "Health & Safety", desc: "Access to healthcare, overall safety, and well-being support systems at your study destination." },
                        ].map((item, i) => (
                            <div key={i}>
                                <p className="text-lg sm:text-xl font-medium text-black/60 tracking-tight">
                                    <b className="text-2xl text-orange-700 tracking-wider">{item.title.charAt(0)}</b>
                                    {item.title.slice(1)}
                                </p>
                                <p className="text-sm sm:text-base text-black/60 tracking-tight">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                    <p className="text-sm sm:text-base md:text-lg text-black/60 w-full sm:w-[80%] md:w-[60%] tracking-tight mt-4 text-justify">
                        Every data point we use is <b className="font-medium text-black/80">curated</b> with the <b className="font-medium text-black/80">international student experience</b> in mind. With PATH, you get <b className="font-medium text-black/80">relevant, actionable and personalised insights</b> to help you choose the right path for your academic and professional journey abroad.
                    </p>
                </div>
            </section>

            {/* METRICS SECTION */}
            <section
                className="w-full flex flex-col justify-center items-center px-4 sm:px-8 py-12 sm:py-16"
                aria-label="What aspects we measure"
            >
                <div className="flex flex-col items-center justify-center w-full gap-4">
                    <h1 className="w-full bg-clip-text text-transparent bg-gradient-to-b from-black to-black/40 text-center text-3xl lg:text-4xl font-medium tracking-tight py-1">
                        What aspects do we take into consideration?
                    </h1>
                    <Metrics />
                </div>
            </section>
        </main >
    );
};

export default LandingPage;