"use client"

import { useEffect, useState, useContext } from "react"
import { toast } from "sonner"
import { Star, ThumbsUp, X } from "lucide-react"
import { RankingsContext } from "@/contexts/RankingsContext"

export function FeedbackToast({ onSubmit, delayMs = 10000 }) {
    const {
        feedbackPopup, setFeedbackPopup
    } = useContext(RankingsContext);

    useEffect(() => {
        if (feedbackPopup) return

        const timer = setTimeout(() => {
            toast.custom(
                (t) => <FeedbackToastContent id={t} onSubmit={onSubmit} />,
                { duration: Infinity }
            )
            setFeedbackPopup(true)
        }, delayMs)

        return () => clearTimeout(timer)
    }, [delayMs, onSubmit, feedbackPopup])

    return null
}

function FeedbackToastContent({ id, onSubmit }) {
    const [rating, setRating] = useState(null)
    const [hovered, setHovered] = useState(null)
    const [submitted, setSubmitted] = useState(null)

    const handleSubmit = () => {
        setSubmitted(true);
        if (onSubmit) {
            onSubmit({ rating })
        }

        const timer = setTimeout(() => {
            toast.dismiss(id)
        }, 3000)

        return () => clearTimeout(timer)
    }

    const handleClose = () => {
        toast.dismiss(id)
    }

    const current = hovered ?? rating ?? 0

    return (
        <div className="relative min-h-84 flex flex-col min-w-sm items-center justify-center p-4 backdrop-blur-2xl">
            <div onClick={handleClose} className="absolute top-1 right-1 w-6 h-6 flex items-center justify-center cursor-pointer transition-colors duration-500 active:bg-black/5 rounded-full">
                <X size={14} className="" />
            </div>
            {!submitted ?
                <>
                    <h1 className="font-semibold mb-1">Rate Our Rankings</h1>
                    <p className="text-xs text-black/70 text-justify">Let us know about your experience with our rankings to help us improve and provide more accurate results for your preferences!</p>

                    <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((value) => {
                            const active = value <= current

                            return (
                                <button
                                    key={value}
                                    type="button"
                                    onClick={() => setRating(value)}
                                    onMouseEnter={() => setHovered(value)}
                                    onMouseLeave={() => setHovered(null)}
                                    className="flex h-8 w-8 my-3 items-center justify-center rounded-full transition-colors cursor-pointer"
                                    aria-label={`${value} star${value > 1 ? "s" : ""}`}
                                >
                                    <Star
                                        strokeWidth={1.5}
                                        className={
                                            "h-6 w-6 transition-colors duration-300 " +
                                            (active
                                                ? "fill-yellow-500 stroke-yellow-600"
                                                : "fill-black/5 stroke-black/20")
                                        }
                                    />
                                </button>
                            )
                        })}
                    </div>

                    <h2 className="text-sm font-semibold mb-2">How can we improve?</h2>
                    <textarea
                        className="w-full rounded-xl bg-black/3 outline-none px-3 py-2 text-sm leading-5 resize-none mb-2"
                        rows={3}
                    />

                    <div className="flex justify-center gap-2 my-2">
                        <button
                            type="button"
                            disabled={rating == null}
                            onClick={handleSubmit}
                            className="rounded-full bg-black/80 hover:bg-black/70 transition-colors duration-300 w-36 py-2 text-sm text-white font-medium text-primary-foreground disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
                        >
                            Submit
                        </button>
                    </div>
                </>
                :
                <div className="h-full flex flex-col justify-center items-center gap-1 fadeIn">
                    <ThumbsUp strokeWidth={2} size={24} className="text-black/80 fadeIn my-1" />
                    <h1 className="font-semibold mb-1">Thank you for your feedback!</h1>
                    <p className="text-sm text-black/70 text-center px-8 mb-2">We will try our best to improve our rankings using your suggestions!</p>
                </div>
            }
        </div>
    )
}