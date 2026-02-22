
import React, { InputHTMLAttributes } from 'react';
import { twMerge } from 'tailwind-merge';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    error?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, error, ...props }, ref) => {
        return (
            <div className="relative w-full group">
                <input
                    ref={ref}
                    className={twMerge(
                        "w-full border py-3 px-4 rounded-md bg-white focus:outline-none transition-colors placeholder-gray-400 font-normal",
                        error ? "border-red-500 focus:border-red-500" : "border-gray-200 focus:border-[#673ab7] hover:border-gray-300",
                        className
                    )}
                    {...props}
                />
            </div>
        );
    }
);

Input.displayName = 'Input';
