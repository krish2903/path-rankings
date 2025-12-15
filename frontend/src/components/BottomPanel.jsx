import { Heart, X } from "lucide-react";
import { motion } from 'framer-motion';
import { useState, useEffect, useContext } from "react";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Link } from "react-router-dom";
import { RankingsContext } from "@/contexts/RankingsContext";

const BottomPanel = ({ category, shortlisted = [] }) => {
    const [isOpen, setIsOpen] = useState(shortlisted.length > 0);
    const {
        shortlistedCountries, setShortlistedCountries,
    } = useContext(RankingsContext);

    useEffect(() => {
        if (shortlisted.length > 0) {
            setIsOpen(true);
        } else {
            setIsOpen(false);
        }
    }, [shortlisted]);

    const handleRemoveShortlist = (item) => {
        const alreadyShortlisted = shortlistedCountries.some(
            (shortlistedItem) => shortlistedItem['country_id'] === item['country_id']
        );

        if (alreadyShortlisted) {
            setShortlistedCountries(prev => prev.filter(shortlistedItem => shortlistedItem['country_id'] !== item['country_id']));
        }
    };

    return (
        <Popover>
            <PopoverTrigger asChild>
                <button className="mr-1 relative flex items-center gap-1.5 bg-black/7 hover:bg-black/5 h-8 px-3 rounded-full cursor-pointer transition-all duration-300 fadeIn">
                    <Heart size={16} strokeWidth={2.5} color="#333" />
                    <p className="font-medium text-sm">Shortlisted</p>
                    <span className="absolute -top-1 -right-1 bg-rose-700/80 text-white text-[10px] font-medium flex items-center justify-center w-4 h-4 rounded-full">{shortlisted.length}</span>
                </button>
            </PopoverTrigger>

            <PopoverContent align="end" className="bg-white shadow-lg rounded-lg max-h-72 overflow-y-auto z-50">
                <div>
                    <h3 className="text-sm font-semibold mb-2 text-center">Shortlisted {category === "Country" ? "Countries" : "Universities"} ({shortlisted.length})</h3>
                    <div className="space-y-1">
                        {shortlisted.map((item, index) => (
                            <div key={index} className="flex px-2 rounded-full py-1 items-center justify-between hover:bg-black/5 transition-colors duration-300">
                                <div className="flex gap-2 items-center text-sm text-black">
                                    <img src={item.flag} className="w-6 h-4 rounded-sm" />
                                    {item.country}
                                </div>
                                <button onClick={(e) => {
                                    handleRemoveShortlist(item);
                                }}
                                    className="flex justify-center items-center w-6 h-6 active:bg-black/10 rounded-full transition-colors duration-300 cursor-pointer"
                                >
                                    <X size={14} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
                <Link to="/university-rankings">
                    <button
                        className="mt-4 text-sm w-full bg-black/80 hover:bg-black/70 py-2 px-4 text-white rounded-full font-medium cursor-pointer"
                    >
                        Search Universities
                    </button>
                </Link>
            </PopoverContent>
        </Popover>
    );
};

export default BottomPanel;