"use client";

import * as React from "react";
import { cn } from "@/lib/cn";

type Variants = "primary" | "ghost" | "outline";

type Common = {
    variant?: Variants;
    className?: string;
};

type ButtonAsButton = Common &
    React.ButtonHTMLAttributes<HTMLButtonElement> & { as?: "button" };

type ButtonAsAnchor = Common &
    React.AnchorHTMLAttributes<HTMLAnchorElement> & { as: "a" };

type Props = ButtonAsButton | ButtonAsAnchor;

export function Button(props: Props) {
    const { variant = "primary", className, as, ...rest } = props;

    const styles =
        variant === "primary"
            ? "bg-primary text-white hover:opacity-90"
            : variant === "outline"
                ? "border border-border hover:bg-gray-50"
                : "hover:bg-gray-100";

    const cls = cn(
        "inline-flex items-center justify-center h-11 px-4 rounded-[var(--radius-lg)] text-sm font-medium transition",
        styles,
        className
    );

    if (as === "a") {
        const anchorProps = rest as React.AnchorHTMLAttributes<HTMLAnchorElement>;
        return <a className={cls} {...anchorProps} />;
    }
    const buttonProps = rest as React.ButtonHTMLAttributes<HTMLButtonElement>;
    return <button className={cls} {...buttonProps} />;
}

