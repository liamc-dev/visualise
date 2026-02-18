import React from "react";

function cx(...parts: Array<string | false | null | undefined>) {
    return parts.filter(Boolean).join(" ");
}

type PanelTone = "solid" | "soft" | "glass";
type PanelRadius = "lg" | "xl" | "2xl";

type PanelProps<T extends React.ElementType> = {
    as?: T;
    tone?: PanelTone;
    radius?: PanelRadius;
    className?: string;
    children?: React.ReactNode;
} & Omit<React.ComponentPropsWithoutRef<T>, "as" | "className" | "children">;

export function Panel<T extends React.ElementType = "div">({
    as,
    tone = "soft",
    radius = "2xl",
    className,
    children,
    ...rest
}: PanelProps<T>) {
    const As = as ?? "div";

    const toneCls =
        tone === "solid"
            ? "bg-tn-surface"
            : tone === "glass"
                ? "bg-tn-surface/65 backdrop-blur-sm"
                : "bg-tn-surfaceSoft/45";

    const radiusCls =
        radius === "lg"
            ? "rounded-lg"
            : radius === "xl"
                ? "rounded-xl"
                : "rounded-2xl";

    return (
        <As className={cx(radiusCls, "border border-tn-border", toneCls, className)} {...rest}>
            {children}
        </As>
    );
}
