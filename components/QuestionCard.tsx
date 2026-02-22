
import React from 'react';
import { twMerge } from 'tailwind-merge';

interface QuestionCardProps {
    title: string;
    description?: string;
    required?: boolean;
    children: React.ReactNode;
    error?: string;
    className?: string; // Allow custom classes
}

export default function QuestionCard({
    title,
    description,
    required,
    children,
    error,
    className
}: QuestionCardProps) {
    return (
        <div
            className={twMerge(
                "max-w-[770px] mx-auto bg-white rounded-lg border border-gray-200 shadow-sm mb-4 px-6 py-6 transition-all duration-200",
                error ? "border-l-4 border-l-[#d93025]" : "hover:shadow-md",
                className
            )}
        >
            <div className="mb-4">
                <label className="text-base text-[#202124] block mb-1 font-medium whitespace-pre-line">
                    {title} {required && <span className="text-[#d93025]">*</span>}
                </label>
                {description && (
                    <p className="text-xs text-[#5f6368] mb-2 whitespace-pre-line leading-relaxed">
                        {description}
                    </p>
                )}
            </div>

            <div className="mt-2">
                {children}
            </div>

            {error && (
                <div className="flex items-center mt-2 text-[#d93025] text-xs">
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                    </svg>
                    {error}
                </div>
            )}
        </div>
    );
}
