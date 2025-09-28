"use client";

import * as React from "react";
import { cn } from "@/lib/cn";

type Props = React.InputHTMLAttributes<HTMLInputElement> & {
    label?: string;
    error?: string;
};

export function Input({ label, error, className, id, ...props }: Props) {
    const inputId = id || React.useId();
    return (
        <div className="w-full">
            {label && (
                <label htmlFor={inputId} className="block text-sm mb-1 text-muted">
                    {label}
                </label>
            )}
            <input
                id={inputId}
                className={cn(
                    "w-full h-11 px-3 rounded-md border border-border bg-white text-fg outline-none",
                    "focus:border-primary focus:ring-2 focus:ring-primary/20",
                    className
                )}
                {...props}
            />
            {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
        </div>
    );
}
