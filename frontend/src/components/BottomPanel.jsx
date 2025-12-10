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
        <motion.div
            className="flex fixed bottom-0 gap-6 py-2 md:py-4 w-full justify-center items-center z-98 bg-[#fff5f0] border border-black/10"
            initial={{ y: '100%' }}
            animate={{ y: isOpen ? '0%' : '100%' }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        >
            <Popover>
                <PopoverTrigger asChild>
                    <button className="flex items-center gap-1.5 bg-[#e07352] hover:bg-[#e07352e6] py-2.5 px-3 rounded-full cursor-pointer">
                        <Heart size={18} fill="white" strokeWidth={2.5} color="white" />
                        <p className="text-sm font-medium text-white">
                            Shortlisted {category === "Country" ? "countries" : "universities"} ({shortlisted.length})
                        </p>
                    </button>
                </PopoverTrigger>

                <PopoverContent className="absolute bottom-16 md:bottom-20 left-1/2 transform -translate-x-1/2 p-4 bg-white shadow-lg rounded-lg w-72 max-h-60 overflow-y-auto z-50">
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
        </motion.div>
    );
};

export default BottomPanel;