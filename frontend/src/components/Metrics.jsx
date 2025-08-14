import { useState, useEffect } from "react";
import { Sparkle } from "lucide-react";
import { API_BASE, iconMap } from "../data/Data";

const getIcon = (name) => {
    for (const key in iconMap) {
        if (name.toLowerCase().includes(key.toLowerCase())) {
            return iconMap[key];
        }
    }
    return Sparkle;
};

const MINIMAL_GRADIENT =
    "bg-gradient-to-br from-white to-gray-100";

export default function Metrics() {
    const [metricGroups, setMetricGroups] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        fetch(`${API_BASE}/get-metric-groups`)
            .then(res => res.json())
            .then(groupsData => {
                setMetricGroups(groupsData);
                setLoading(false);
            })
            .catch(err => {
                console.error("Failed to fetch metric groups:", err);
                setLoading(false);
            });
    }, []);

    return (
        <div className="w-full flex flex-col items-center">
            {loading ? (
                <div className="w-full text-center text-black/40">Loading metric groups...</div>
            ) : metricGroups.length > 0 ? (
                <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl">
                    {metricGroups.map((group) => {
                        const Icon = getIcon(group.name);
                        return (
                            <div
                                key={group.id}
                                className={`relative rounded-2xl shadow-md border border-black/5 flex flex-col items-center justify-between px-5 py-8 min-h-[205px] transition group overflow-hidden ${MINIMAL_GRADIENT}`}
                            >
                                <div className="mb-4 flex items-center justify-center w-16 h-16 rounded-full bg-white/60 shadow group-hover:scale-105 transition">
                                    <Icon className="w-8 h-8 text-[#ec5b22] drop-shadow-md" />
                                </div>
                                <div className="flex flex-col items-center text-center gap-2 flex-1">
                                    <span className="text-lg font-semibold text-black/80 tracking-tight">
                                        {group.name}
                                    </span>
                                    <span className="text-sm text-black/60 tracking-tight leading-snug">
                                        {group.description || <span className="italic text-black/40">No description.</span>}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="text-black/40 py-24 text-center">No metric groups found.</div>
            )}
        </div>
    );
}
