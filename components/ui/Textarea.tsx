
import React, { TextareaHTMLAttributes } from 'react';
import { twMerge } from 'tailwind-merge';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
    error?: boolean;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
    ({ className, error, ...props }, ref) => {
        return (
            <div className="relative w-full group">
                <textarea
                    ref={ref}
                    className={twMerge(
                        "w-full border py-3 px-4 rounded-md bg-white focus:outline-none transition-colors resize-y min-h-[100px] placeholder-gray-400 font-normal",
                        error ? "border-red-500 focus:border-red-500" : "border-gray-200 focus:border-[#673ab7] hover:border-gray-300",
                        className
                    )}
                    {...props}
                />
            </div>
        );
    }
);

Textarea.displayName = 'Textarea';
