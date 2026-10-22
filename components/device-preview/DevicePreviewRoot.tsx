"use client";

import { useEffect, useRef, useState, type PointerEvent, type ReactNode } from "react";

const PREVIEW_PARAM = "hub_preview";
const POS_KEY = "hub-device-bar-pos";
const LIME = "#c6f532";
const SHELL = "#111111";

type Mode = "desktop" | "tablet" | "phone";

const VIEWPORTS: Record<Exclude<Mode, "desktop">, { w: number; h: number }> = {
    phone: { w: 390, h: 844 },
    tablet: { w: 768, h: 1024 },
};

const isPreviewFrame = () => {
    if (typeof window === "undefined") return false;
    return new URLSearchParams(window.location.search).get(PREVIEW_PARAM) === "1";
};

const previewSrc = () => {
    const url = new URL(window.location.href);
    url.searchParams.set(PREVIEW_PARAM, "1");
    return url.toString();
};

const IconMonitor = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden>
        <rect x="3" y="4" width="18" height="13" rx="2" stroke="currentColor" strokeWidth="1.8" />
        <path d="M8 20h8M12 17v3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
);

const IconTablet = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden>
        <rect x="5" y="3" width="14" height="18" rx="2.2" stroke="currentColor" strokeWidth="1.8" />
        <circle cx="12" cy="17.5" r="0.9" fill="currentColor" />
    </svg>
);

const IconPhone = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden>
        <rect x="7" y="3" width="10" height="18" rx="2.2" stroke="currentColor" strokeWidth="1.8" />
        <path d="M10 5.5h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
);

const IconRotate = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
            d="M4 12a8 8 0 0 1 13.7-5.7L20 8"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
        />
        <path d="M20 4v4h-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <path
            d="M20 12a8 8 0 0 1-13.7 5.7L4 16"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
        />
        <path d="M4 20v-4h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
);

const Grip = () => (
    <span
        aria-hidden
        style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 3px)",
            gap: 2,
            marginRight: 4,
            opacity: 0.45,
        }}
    >
        {Array.from({ length: 6 }).map((_, index) => (
            <span
                key={index}
                style={{
                    width: 3,
                    height: 3,
                    borderRadius: 99,
                    background: "#fff",
                }}
            />
        ))}
    </span>
);

type SegProps = {
    active?: boolean;
    disabled?: boolean;
    label: string;
    onClick: () => void;
    children: ReactNode;
};

const Seg = ({ active, disabled, label, onClick, children }: SegProps) => (
    <button
        type="button"
        data-device-action="true"
        aria-label={label}
        aria-pressed={active}
        disabled={disabled}
        onClick={onClick}
        style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            height: 32,
            padding: "0 11px",
            border: 0,
            borderRadius: 999,
            cursor: disabled ? "default" : "pointer",
            background: active ? LIME : "transparent",
            color: active ? "#111" : "rgba(255,255,255,0.78)",
            opacity: disabled ? 0.35 : 1,
            fontSize: 12,
            fontWeight: 600,
            letterSpacing: 0.01,
            lineHeight: 1,
        }}
    >
        {children}
        <span>{label}</span>
    </button>
);

export const DevicePreviewRoot = ({ children }: { children: ReactNode }) => {
    if (process.env.NODE_ENV !== "development") {
        return <>{children}</>;
    }
    return <DevicePreviewDev>{children}</DevicePreviewDev>;
};

const DevicePreviewDev = ({ children }: { children: ReactNode }) => {
    const [ready, setReady] = useState(false);
    const [inFrame, setInFrame] = useState(false);
    const [mode, setMode] = useState<Mode>("desktop");
    const [rotated, setRotated] = useState(false);
    const [pos, setPos] = useState({ left: 16, bottom: 16 });
    const [scale, setScale] = useState(1);
    const posRef = useRef(pos);
    const drag = useRef<{
        pointerId: number;
        px: number;
        py: number;
        left: number;
        bottom: number;
    } | null>(null);

    posRef.current = pos;

    useEffect(() => {
        setInFrame(isPreviewFrame());
        try {
            const raw = sessionStorage.getItem(POS_KEY);
            if (raw) {
                const parsed = JSON.parse(raw) as { left: number; bottom: number };
                if (Number.isFinite(parsed.left) && Number.isFinite(parsed.bottom)) {
                    setPos(parsed);
                }
            }
        } catch {
            // ignore
        }
        setReady(true);
    }, []);

    useEffect(() => {
        if (mode === "desktop") {
            setScale(1);
            return;
        }
        const size = VIEWPORTS[mode];
        const frameW = rotated ? size.h : size.w;
        const frameH = rotated ? size.w : size.h;
        const update = () => {
            const maxW = window.innerWidth - 48;
            const maxH = window.innerHeight - 48;
            setScale(Math.min(1, maxW / frameW, maxH / frameH));
        };
        update();
        window.addEventListener("resize", update);
        return () => window.removeEventListener("resize", update);
    }, [mode, rotated]);

    const persistPos = (next: { left: number; bottom: number }) => {
        try {
            sessionStorage.setItem(POS_KEY, JSON.stringify(next));
        } catch {
            // ignore
        }
    };

    const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
        if ((event.target as HTMLElement).closest("[data-device-action]")) return;
        event.currentTarget.setPointerCapture(event.pointerId);
        drag.current = {
            pointerId: event.pointerId,
            px: event.clientX,
            py: event.clientY,
            left: pos.left,
            bottom: pos.bottom,
        };
    };

    const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
        if (!drag.current || drag.current.pointerId !== event.pointerId) return;
        const dx = event.clientX - drag.current.px;
        const dy = event.clientY - drag.current.py;
        const next = {
            left: Math.max(8, Math.min(window.innerWidth - 72, drag.current.left + dx)),
            bottom: Math.max(8, Math.min(window.innerHeight - 52, drag.current.bottom - dy)),
        };
        setPos(next);
    };

    const onPointerUp = (event: PointerEvent<HTMLDivElement>) => {
        if (!drag.current || drag.current.pointerId !== event.pointerId) return;
        drag.current = null;
        persistPos(posRef.current);
        try {
            event.currentTarget.releasePointerCapture(event.pointerId);
        } catch {
            // ignore
        }
    };

    if (!ready || inFrame) return <>{children}</>;

    const size = mode === "desktop" ? null : VIEWPORTS[mode];
    const frameW = size ? (rotated ? size.h : size.w) : 0;
    const frameH = size ? (rotated ? size.w : size.h) : 0;
    const phone = mode === "phone";

    return (
        <>
            {mode === "desktop" ? (
                children
            ) : (
                <div
                    style={{
                        position: "fixed",
                        inset: 0,
                        zIndex: 80,
                        display: "grid",
                        placeItems: "center",
                        overflow: "auto",
                        background:
                            "radial-gradient(1200px 600px at 50% 0%, #1a1a1a 0%, #050505 55%)",
                    }}
                >
                    <div
                        style={{
                            width: frameW,
                            height: frameH,
                            transform: `scale(${scale})`,
                            transformOrigin: "center center",
                            borderRadius: phone ? 40 : 28,
                            padding: phone ? 11 : 14,
                            background: "#141414",
                            boxShadow:
                                "0 0 0 1px rgba(198,245,50,0.16), 0 28px 80px rgba(0,0,0,0.55)",
                            position: "relative",
                        }}
                    >
                        <span
                            aria-hidden
                            style={{
                                position: "absolute",
                                top: 9,
                                left: "50%",
                                transform: "translateX(-50%)",
                                width: phone ? 78 : 96,
                                height: 6,
                                borderRadius: 99,
                                background: "#2a2a2a",
                            }}
                        />
                        <iframe
                            title={`${mode} preview`}
                            src={previewSrc()}
                            style={{
                                width: "100%",
                                height: "100%",
                                border: 0,
                                borderRadius: phone ? 30 : 18,
                                background: "#fff",
                            }}
                        />
                    </div>
                </div>
            )}

            <div
                role="toolbar"
                aria-label="Device preview"
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
                onPointerCancel={onPointerUp}
                style={{
                    position: "fixed",
                    left: pos.left,
                    bottom: pos.bottom,
                    zIndex: 90,
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                    padding: "6px 7px 6px 10px",
                    borderRadius: 999,
                    background: SHELL,
                    boxShadow:
                        "0 0 0 1px rgba(255,255,255,0.1), 0 12px 36px rgba(0,0,0,0.45)",
                    cursor: "grab",
                    userSelect: "none",
                    touchAction: "none",
                    fontFamily: "Geist, Inter, system-ui, sans-serif",
                    color: "#fff",
                }}
            >
                <Grip />
                <Seg
                    label="Desktop"
                    active={mode === "desktop"}
                    onClick={() => {
                        setMode("desktop");
                        setRotated(false);
                    }}
                >
                    <IconMonitor />
                </Seg>
                <Seg
                    label="Tablet"
                    active={mode === "tablet"}
                    onClick={() => setMode("tablet")}
                >
                    <IconTablet />
                </Seg>
                <Seg
                    label="Smartphone"
                    active={mode === "phone"}
                    onClick={() => setMode("phone")}
                >
                    <IconPhone />
                </Seg>
                <button
                    type="button"
                    data-device-action="true"
                    aria-label="Rotate device"
                    disabled={mode === "desktop"}
                    onClick={() => setRotated((current) => !current)}
                    style={{
                        display: "grid",
                        placeItems: "center",
                        width: 32,
                        height: 32,
                        border: 0,
                        borderRadius: 999,
                        background: rotated ? LIME : "transparent",
                        color: rotated ? "#111" : "rgba(255,255,255,0.78)",
                        opacity: mode === "desktop" ? 0.35 : 1,
                        cursor: mode === "desktop" ? "default" : "pointer",
                    }}
                >
                    <IconRotate />
                </button>
            </div>
        </>
    );
};
