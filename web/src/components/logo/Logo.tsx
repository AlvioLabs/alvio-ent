"use client";

import { useContext } from "react";
import { SettingsContext } from "../settings/SettingsProvider";

export function Logo({
  height,
  width,
  className,
  size = "default",
}: {
  height?: number;
  width?: number;
  className?: string;
  size?: "small" | "default" | "large";
}) {
  const settings = useContext(SettingsContext);

  const sizeMap = {
    small: { height: 24, width: 22 },
    default: { height: 32, width: 30 },
    large: { height: 48, width: 45 },
  };

  const { height: defaultHeight, width: defaultWidth } = sizeMap[size];
  height = height || defaultHeight;
  width = width || defaultWidth;

  // Use custom uploaded logo if enabled, otherwise use default Alvio logo
  const logoSrc = 
    settings?.enterpriseSettings?.use_custom_logo
      ? "/api/enterprise-settings/logo"
      : "/logo.png";

  return (
    <div
      style={{ height, width }}
      className={`flex-none relative ${className}`}
    >
      <img
        src={logoSrc}
        alt="Logo"
        style={{ objectFit: "contain", height, width }}
      />
    </div>
  );
}

export function LogoType({
  size = "default",
}: {
  size?: "small" | "default" | "large";
}) {
  const settings = useContext(SettingsContext);

  // Use custom uploaded logotype if enabled, otherwise use default Alvio logotype
  const logotypeSrc =
    settings?.enterpriseSettings?.use_custom_logotype
      ? "/api/enterprise-settings/logotype"
      : "/logotype.png";

  return (
    <div className="flex items-center w-full">
      <img
        src={logotypeSrc}
        alt="Logotype"
        style={{ objectFit: "contain", height: "32px" }}
        className="w-auto h-8"
      />
    </div>
  );
}
