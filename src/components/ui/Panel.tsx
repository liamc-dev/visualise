import React from "react";

function cx(...parts: Array<string | false | null | undefined>) {
    return parts.filter(Boolean).join(" ");
}

type PanelTone = "solid" | "soft" | "glass" | "base";
type PanelRadius = "none" | "lg" | "xl" | "2xl";

type PanelProps<T extends React.ElementType> = {
    as?: T;
    tone?: PanelTone;
    radius?: PanelRadius;
    border?: boolean;
    className?: string;
    children?: React.ReactNode;
} & Omit<React.ComponentPropsWithoutRef<T>, "as" | "className" | "children">;

export function Panel<T extends React.ElementType = "div">({
    as,
    tone = "soft",
    radius = "2xl",
    border = true,
    className,
    children,
    ...rest
}: PanelProps<T>) {
    const As = as ?? "div";

    const toneCls =
        tone === "solid"
            ? "bg-tn-surface"
            : tone === "glass"
                ? "bg-tn-surface/85 backdrop-blur-sm"
                : tone === "base"
                    ? "bg-tn-bg backdrop-blur-sm"
                    : "bg-tn-surfaceSoft/45";

    const radiusCls =
        radius === "none"
            ? ""
            : radius === "lg"
                ? "rounded-lg"
                : radius === "xl"
                    ? "rounded-xl"
                    : "rounded-2xl";

    const borderCls = border ? "border border-tn-border" : "";

    return (
        <As className={cx(radiusCls, borderCls, toneCls, className)} {...rest}>
            {children}
        </As>
    );
}
