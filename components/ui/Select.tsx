
import React, { SelectHTMLAttributes } from 'react';
import { twMerge } from 'tailwind-merge';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
    options: string[];
    placeholder?: string;
    error?: boolean;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
    ({ className, options, placeholder = "Choose", error, ...props }, ref) => {
        return (
            <div className="relative w-full group">
                <select
                    ref={ref}
                    className={twMerge(
                        "w-full border py-3 px-4 rounded-md bg-white focus:outline-none transition-colors appearance-none cursor-pointer text-[#202124]",
                        error ? "border-red-500 focus:border-red-500" : "border-gray-200 focus:border-[#673ab7] hover:border-gray-300",
                        className
                    )}
                    {...props}
                >
                    <option value="" disabled hidden>{placeholder}</option>
                    {options.map((option) => (
                        <option key={option} value={option}>
                            {option}
                        </option>
                    ))}
                </select>

                {/* Helper arrow icon */}
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg className="w-5 h-5 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                </div>
            </div>
        );
    }
);

Select.displayName = 'Select';
