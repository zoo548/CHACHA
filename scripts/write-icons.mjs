import { mkdirSync, writeFileSync } from "node:fs"

const wrap = (inner) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round">${inner}</svg>\n`

const icons = {
  rain_heavy:
    '<path d="M10 28c0-10 8-16 18-14 4-8 18-8 22 2 8 0 14 8 12 16H10Z"/><path d="m18 48-4 10m16-10-4 10m16-10-4 10"/>',
  typhoon:
    '<circle cx="32" cy="32" r="6"/><path d="M32 14c14 0 22 10 18 20M32 50C18 50 10 40 14 30M14 24c8-12 22-14 30-6M50 40c-8 12-22 14-30 6"/>',
  sun_hot:
    '<circle cx="32" cy="32" r="10"/><path d="M32 8v8m0 32v8M8 32h8m32 0h8M14 14l6 6m24 24 6 6m0-36-6 6M20 44l-6 6"/>',
  wildfire:
    '<path d="M20 54c0-16 8-22 8-34 8 8 8 16 16 16 0 10-2 18-12 18Z"/><path d="M28 54c2-8 8-10 10-18"/>',
  fire: '<path d="M22 54c-2-14 8-18 8-30 10 6 10 16 16 16-2 12-8 14-16 14Z"/>',
  snow_cold:
    '<path d="M32 10v44M12 21l40 22M12 43l40-22"/><path d="m32 10-6 6m6-6 6 6M32 54l-6-6m6 6 6-6"/>',
  snow_heavy:
    '<circle cx="20" cy="20" r="3"/><circle cx="36" cy="16" r="3"/><circle cx="48" cy="26" r="3"/><circle cx="16" cy="34" r="3"/><circle cx="30" cy="32" r="3"/><circle cx="44" cy="40" r="3"/><circle cx="24" cy="48" r="3"/><circle cx="40" cy="52" r="3"/>',
  wind: '<path d="M8 24h32c6 0 8-8 2-8M8 34h40c6 0 8 8 2 8M8 44h28c5 0 7 7 1 7"/>',
  earthquake:
    '<path d="M8 46 20 18l8 16 8-22 8 20 12 14"/><path d="M6 52h52"/>',
  tsunami:
    '<path d="M8 46c8-12 16-4 24-16 8 12 16 4 24 16"/><path d="M8 54c8-8 16-2 24-10 8 8 16 2 24 10"/>',
  landslide:
    '<path d="M8 50 28 18l28 32H8Z"/><path d="m22 50 10-14 8 8 8-12"/>',
  dust: '<circle cx="20" cy="28" r="8"/><circle cx="36" cy="24" r="10"/><circle cx="48" cy="34" r="7"/><path d="M10 50h44"/>',
  lightning: '<path d="M36 8 20 34h14L24 56l24-30H34Z"/>',
  drought:
    '<circle cx="32" cy="22" r="10"/><path d="M12 50c6-10 14-8 20 0 6-10 14-8 20 0"/>',
  dam: '<path d="M10 16h44v8H10Z"/><path d="M16 24v28m32-28v28M10 52h44"/><path d="M22 36h8m4 0h8"/>',
  ice: '<path d="M12 40 32 12l20 28-20 12Z"/><path d="M32 12v40"/>',
  wave: '<path d="M8 40c8-14 16 0 24-14 8 14 16 0 24 14"/><path d="M8 50h48"/>',
  chemical:
    '<path d="M24 12h16v12l10 24H14L24 24Z"/><path d="M20 12h24"/><circle cx="28" cy="40" r="2"/><circle cx="36" cy="44" r="2"/>',
  gas: '<path d="M20 56V28a12 12 0 0 1 24 0v28Z"/><path d="M32 16V8m-6 4 6-4 6 4"/>',
  power: '<path d="M28 8 16 36h14L24 56l24-32H34L40 8H28Z"/>',
  water_off:
    '<path d="M32 8c12 16 16 24 16 32a16 16 0 0 1-32 0c0-8 4-16 16-32Z"/><path d="m16 16 32 32"/>',
  virus:
    '<circle cx="32" cy="32" r="10"/><path d="M32 12v6m0 28v6M12 32h6m28 0h6M18 18l4 4m20 20 4 4m0-28-4 4M22 42l-4 4"/>',
  siren:
    '<path d="M20 36a12 12 0 0 1 24 0v12H20Z"/><path d="M16 48h32M32 12v8m-16 4 6 6m26-6-6 6"/>',
  radiation:
    '<circle cx="32" cy="32" r="4"/><path d="M32 16a16 16 0 0 1 14 8l-10 6a6 6 0 0 0-4-2Z"/><path d="M46 40a16 16 0 0 1-14 16v-12a6 6 0 0 0 4-2Z"/><path d="M18 40a16 16 0 0 1 0-16l10 6a6 6 0 0 0 0 4Z"/>',
  collapse: '<path d="M12 52 24 20l8 12 8-16 12 36H12Z"/><path d="M8 56h48"/>',
  crowd:
    '<circle cx="20" cy="22" r="6"/><circle cx="44" cy="22" r="6"/><path d="M8 50c2-10 6-14 12-14s10 4 12 14m12 0c2-10 6-14 12-14s10 4 12 14"/>',
  road_closed: '<path d="M18 8h28l-8 48H26Z"/><path d="M22 24h20M20 40h24"/>',
  search: '<circle cx="28" cy="28" r="12"/><path d="m38 38 12 12"/>',
  stay_home:
    '<path d="m8 30 24-18 24 18"/><path d="M14 28v26h36V28M26 54V38h12v16"/>',
  no_river:
    '<path d="M8 28c10 8 12-8 24 0s14-8 24 0M8 40c10 8 12-8 24 0s14-8 24 0"/><path d="m14 14 36 36"/>',
  phone_119:
    '<path d="M20 10H14a4 4 0 0 0-4 4c0 22 18 40 40 40a4 4 0 0 0 4-4v-6l-12-5-3 7c-8-4-14-10-18-18l7-3Z"/><path d="M40 12h12M46 8v12"/>',
  exit_basement: '<path d="M12 56V20h16v12h16V8h8"/><path d="m44 16 8-8 8 8"/>',
  phone_guardian:
    '<circle cx="26" cy="20" r="8"/><path d="M12 54c2-14 8-20 14-20s12 6 14 20"/><path d="M46 36v16m-6-6 6 6 6-6"/>',
  close_window:
    '<rect x="12" y="12" width="40" height="40" rx="3"/><path d="M12 32h40M32 12v40"/>',
  away_window:
    '<rect x="8" y="16" width="28" height="32" rx="2"/><path d="M8 32h28M22 16v32"/><path d="M44 24v16m-6-6 6 6 6-6"/>',
  drink_water: '<path d="M20 16h24l-4 40H24Z"/><path d="M24 36c6-4 10 4 16 0"/>',
  cool_place:
    '<path d="M8 34c8-20 40-20 48 0Z"/><path d="M32 34v22"/><circle cx="24" cy="44" r="3"/>',
  no_mountain:
    '<path d="m8 48 16-24 8 10 8-16 16 30H8Z"/><path d="m14 14 36 36"/>',
  bag_ready:
    '<path d="M16 24h32v28H16Z"/><path d="M24 24V18a8 8 0 0 1 16 0v6"/>',
  wet_towel: '<path d="M12 20h40v16c-8 8-16 4-20 12-4-8-12-4-20-12Z"/>',
  follow_guide:
    '<circle cx="24" cy="18" r="6"/><path d="M12 54c2-12 6-18 12-18s10 6 12 18"/><path d="M42 30v22m-7-7 7 7 7-7"/>',
  under_desk:
    '<path d="M8 22h48M12 22v28m40-28v28"/><circle cx="32" cy="36" r="5"/>',
  away_sea:
    '<path d="M8 42c8-10 16 2 24-10 8 12 16 0 24 10"/><path d="M32 12v18m-7-7 7 7 7-7"/>',
  away_mountain:
    '<path d="m8 50 16-26 8 12 8-18 16 32H8Z"/><path d="M46 18v16m-7-7 7 7 7-7"/>',
  go_underground:
    '<path d="M12 12h40v12H12Z"/><path d="M32 24v28m-8-8 8 8 8-8"/>',
}

mkdirSync("src/assets/icons", { recursive: true })
for (const [name, inner] of Object.entries(icons)) {
  writeFileSync(`src/assets/icons/${name}.svg`, wrap(inner))
}
console.log(`wrote ${Object.keys(icons).length} icons`)
