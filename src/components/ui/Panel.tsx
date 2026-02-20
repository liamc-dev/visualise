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
                ? "bg-tn-surface/80 backdrop-blur-md"
                : tone === "base"
                    ? "bg-tn-bg backdrop-blur-md"
                    : "bg-tn-surfaceSoft/40";

    const radiusCls =
        radius === "none"
            ? ""
            : radius === "lg"
                ? "rounded-xl"
                : radius === "xl"
                    ? "rounded-2xl"
                    : "rounded-3xl";

    const borderCls = border ? "border border-tn-border/60" : "";

    return (
        <As className={cx(radiusCls, borderCls, toneCls, className)} {...rest}>
            {children}
        </As>
    );
}
