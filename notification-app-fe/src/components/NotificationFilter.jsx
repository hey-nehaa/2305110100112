import { ToggleButton, ToggleButtonGroup } from "@mui/material";

const types = ["All", "Placement", "Result", "Event"];

export function NotificationFilter({ value, onChange }) {
  return (
    <ToggleButtonGroup
      value={value}
      exclusive
      onChange={(e, val) => { if (val !== null) onChange(val); }}
      size="small"
      sx={{ flexWrap: "wrap", gap: 0.5 }}
    >
      {types.map((t) => (
        <ToggleButton key={t} value={t} sx={{ textTransform: "none", px: 2 }}>
          {t}
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
  );
}