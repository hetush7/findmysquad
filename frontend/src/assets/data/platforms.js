// Gaming platforms players can add their gamer tags for.
// `key` matches the field name returned by /api/gamer-tags.
const platforms = [
  { key: "psn", label: "PlayStation", short: "PSN", placeholder: "PSN Online ID" },
  { key: "xbox", label: "Xbox", short: "Xbox", placeholder: "Xbox gamertag" },
  { key: "steam", label: "Steam", short: "Steam", placeholder: "Steam name" },
  { key: "riot", label: "Riot ID", short: "Riot", placeholder: "Name#TAG" },
  { key: "ea", label: "EA ID", short: "EA", placeholder: "EA account ID" },
  { key: "activision", label: "Activision ID", short: "Activision", placeholder: "Name#1234567" },
];

export default platforms;
