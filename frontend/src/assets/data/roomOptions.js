// Room settings; values match the backend's choices. "any" means no restriction.
export const PLATFORMS = [
  { value: "any", label: "Any platform" },
  { value: "pc", label: "PC" },
  { value: "playstation", label: "PlayStation" },
  { value: "xbox", label: "Xbox" },
  { value: "switch", label: "Switch" },
];

export const REGIONS = [
  { value: "any", label: "Any region" },
  { value: "na", label: "North America" },
  { value: "sa", label: "South America" },
  { value: "eu", label: "Europe" },
  { value: "me", label: "Middle East" },
  { value: "asia", label: "Asia" },
  { value: "oce", label: "Oceania" },
];

export const VOICE = [
  { value: "any", label: "Mic optional" },
  { value: "required", label: "Mic required" },
  { value: "none", label: "No mic" },
];

export function optionLabel(options, value) {
  const option = options.find(o => o.value === value);
  return option ? option.label : value;
}

// Labels for a room's non-"any" settings, e.g. ["PlayStation", "Oceania", "Mic required"]
export function roomOptionLabels(session) {
  return [
    [PLATFORMS, session.platform],
    [REGIONS, session.region],
    [VOICE, session.voice],
  ].filter(([, value]) => value && value !== "any").map(([options, value]) => optionLabel(options, value));
}

// A room set to "any" suits every player; otherwise it must match the filter
export function matchesOption(roomValue, filterValue) {
  return filterValue === "any" || roomValue === "any" || roomValue === filterValue;
}
