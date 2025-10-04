import React, { useRef, useState } from "react";
import { Flag, GraduationCap, Lock } from "lucide-react";
import { Link } from "react-router-dom";
import Metrics from "../components/Metrics";
import Header from "../components/Header";

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

const showOverlay = true;

const countryFeatures = [
    "Compare 20+ top countries to find your perfect fit",
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
        <main className="w-full min-h-screen bg-white fadeIn">
            <Header />

            {/* RANKINGS SECTION */}
            <section
                className="w-full py-6 sm:py-6 flex flex-col bg-gray-50"
                aria-label="Explore Rankings"
            >
                <div className="flex flex-col items-center justify-center flex-1 w-full px-4 sm:px-8 py-12 sm:py-20">
                    <h1 className="text-2xl md:text-5xl font-medium tracking-tight md:mb-4 text-transparent bg-clip-text bg-gradient-to-br from-black to-gray-400 py-2">
                        PATH Rankings Explorer
                    </h1>
                    <h1 className="w-full text-center text-md md:text-2xl font-medium tracking-tight text-black/80">
                        What would you like to explore today?
                    </h1>
                    <div className="flex flex-col sm:flex-row gap-6 sm:gap-10 mt-4 flex-wrap justify-center w-full">
                        {/* Country Card */}
                        <Link
                            to="/country-rankings"
                            className={`max-w-full sm:max-w-md w-full rounded-3xl drop-shadow-lg hover:shadow-lg hover:scale-103 transition inset-shadow-sm/10 min-h-[320px] md:min-h-96 flex flex-col justify-center gap-2 sm:gap-3 duration-200 cursor-pointer p-6 sm:p-12 focus:outline-none ${selection === "country" ? "bg-orange-50" : "bg-white"
                                }`}
                            aria-label="Dream Country Search"
                        >
                            <header className="flex flex-col items-center gap-2">
                                <Flag width={30} height={30} />
                                <h2 className="text-base sm:text-lg font-medium tracking-tight text-black/60">
                                    Shortlist the <span className="font-medium text-black">right countries</span> for you!
                                </h2>
                            </header>
                            <p className="text-sm md:text-base text-justify text-black/60 leading-tight tracking-tight mb-2">
                                Selecting the right country for your higher education is the single most important decision that helps shape your future. It defines the quality of your education, the opportunities you access, the networks you build, and the life you live.</p>
                            <ul className="space-y-2 sm:space-y-3 w-full list-none">
                                {countryFeatures.map((feature, idx) => (
                                    <li key={idx} className="flex items-start gap-3 text-black/60 text-sm">
                                        <CheckIcon />
                                        <span className="tracking-tight">{feature}</span>
                                    </li>
                                ))}
                            </ul>
                        </Link>

                        {/* University Card */}
                        <article
                            className={`relative max-w-full sm:max-w-md w-full rounded-3xl drop-shadow-lg hover:shadow-lg hover:scale-101 transition inset-shadow-sm/10 min-h-[320px] sm:min-h-96 flex flex-col justify-center gap-2 sm:gap-3 duration-200 pointer-events-none select-none p-6 sm:p-12 focus:outline-none ${selection === "university" ? "bg-orange-50" : "bg-white"
                                }`}
                            aria-label="Dream University Search"
                            onClick={() => setSelection("university")}
                        >
                            {showOverlay && (
                                <div className="absolute inset-0 bg-black/50 rounded-3xl flex flex-col items-center justify-center gap-2 z-20">
                                    <Lock className="w-10 h-10 sm:w-12 sm:h-12 text-white" aria-hidden="true" />
                                    <span className="text-white font-medium text-base sm:text-lg">Coming Soon</span>
                                </div>
                            )}

                            <header className="flex flex-col items-center gap-2 opacity-40">
                                <GraduationCap width={30} height={30} />
                                <h2 className="text-base sm:text-lg font-medium tracking-tight text-black/60">
                                    Shortlist the <span className="font-medium text-black">right universities</span> for you!
                                </h2>
                            </header>
                            <p className="text-sm md:text-base text-justify text-black/60 leading-tight tracking-tight mb-2 blur-xs">
                                Selecting the right country for your higher education is the single most important decision that helps shape your future. It defines the quality of your education, the opportunities you access, the networks you build, and the life you live.</p>
                            <ul className="space-y-2 sm:space-y-3 w-full list-none blur-xs">
                                {countryFeatures.map((feature, idx) => (
                                    <li key={idx} className="flex items-start gap-3 text-black/60 text-sm">
                                        <CheckIcon />
                                        <span className="tracking-tight">{feature}</span>
                                    </li>
                                ))}
                            </ul>
                        </article>
                    </div>
                    <div className="flex flex-col justify-center items-center gap-2 mt-2">
                        <button
                            onClick={scrollToHero}
                            className="bg-gray-200 hover:bg-gray-300 text-black/80 font-medium mt-4 py-1 sm:py-2 px-5 sm:px-6 rounded-full text-base sm:text-md transition cursor-pointer"
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
                className="relative bg-white w-full min-h-screen px-4 sm:px-6 md:px-8 py-10 sm:py-14 md:py-16 flex flex-col items-center justify-center text-center"
                aria-label="PATH Rankings Explorer Introduction"
            >
                <header>
                    <h2 className="text-base sm:text-lg md:text-xl lg:text-3xl font-medium tracking-tight mb-4 text-transparent bg-clip-text bg-gradient-to-br from-gray-900 to-gray-400">
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
                className="w-full min-h-screen sm:min-h-screen flex flex-col justify-center items-center bg-gray-50 px-4 sm:px-8 py-12 sm:py-16"
                aria-label="What are PATH Rankings?"
            >
                <div className="flex flex-col items-center w-full gap-3 sm:gap-4">
                    <h1 className="w-full text-center text-xl sm:text-2xl md:text-3xl lg:text-4xl font-medium tracking-tight text-black/80 py-1">
                        What are PATH Rankings?
                    </h1>
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
                className="w-full flex flex-col justify-center items-center bg-white px-4 sm:px-8 py-16 sm:py-24"
                aria-label="What do we cover?"
            >
                <div className="flex flex-col items-center justify-center w-full gap-4">
                    <h1 className="w-full text-center text-xl sm:text-2xl md:text-3xl lg:text-4xl font-medium tracking-tight text-black/80">
                        What do we cover?
                    </h1>
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
                className="w-full py-16 sm:py-24 flex flex-col justify-center items-center bg-gray-50 px-4 sm:px-8"
                aria-label="What aspects we measure"
            >
                <div className="flex flex-col items-center justify-center w-full gap-4">
                    <h1 className="w-full text-center text-xl sm:text-2xl md:text-3xl lg:text-4xl font-medium tracking-tight text-black/80">
                        What aspects do we take into consideration?
                    </h1>
                    <Metrics />
                </div>
            </section>
        </main >
    );
};

export default LandingPage;
