import * as React from "react";
import { Box, TextField, MenuItem, Button, Stack } from "@mui/material";

export default function FilterBar({
  search,
  onSearch,
  gender,
  onGender,
  city,
  onCity,
  cities = [],
  onReset,
}) {
  return (
    <Box sx={{ p: 2, mb: 2, bgcolor: "rgba(255,255,255,0.06)", borderRadius: 3 }}>
      <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems="center">
        <TextField
          fullWidth
          label="Search patient"
          value={search}
          onChange={(e) => onSearch(e.target.value)}
        />

        <TextField
          select
          label="Gender"
          value={gender}
          onChange={(e) => onGender(e.target.value)}
          sx={{ minWidth: 160 }}
        >
          <MenuItem value="ALL">All</MenuItem>
          <MenuItem value="Male">Male</MenuItem>
          <MenuItem value="Female">Female</MenuItem>
          <MenuItem value="Other">Other</MenuItem>
        </TextField>

        <TextField
          select
          label="City"
          value={city}
          onChange={(e) => onCity(e.target.value)}
          sx={{ minWidth: 180 }}
        >
          <MenuItem value="ALL">All</MenuItem>
          {cities.map((c) => (
            <MenuItem key={c} value={c}>{c}</MenuItem>
          ))}
        </TextField>

        <Button variant="outlined" onClick={onReset} sx={{ whiteSpace: "nowrap" }}>
          Reset
        </Button>
      </Stack>
    </Box>
  );
}
