export const UI_THEME = Object.freeze({
  canvas: "#080914",
  background: "#080914",
  backgroundDeep: "#050611",
  surface: "#161824",
  surfaceMuted: "#202436",
  surfaceStrong: "#2e3652",
  text: "#f7f9ff",
  textMuted: "#aeb7d8",
  textOnDark: "#f7f9ff",
  border: "#445070",
  borderStrong: "#7f8eb8",
  primary: "#e85d8f",
  primaryHover: "#ff79a8",
  primaryPressed: "#c84574",
  secondary: "#3c8dde",
  secondaryHover: "#5da5f0",
  secondaryPressed: "#276eb6",
  disabled: "#62687a",
  disabledHover: "#62687a",
  disabledPressed: "#515667",
  danger: "#ff5b5b",
  overlay: "rgba(8, 9, 20, 0.64)",
  overlayStrong: "rgba(8, 9, 20, 0.82)",
});

export const UI_BUTTON_COLORS = Object.freeze({
  primary: Object.freeze({
    normal: UI_THEME.primary,
    hover: UI_THEME.primaryHover,
    pressed: UI_THEME.primaryPressed,
  }),
  secondary: Object.freeze({
    normal: UI_THEME.secondary,
    hover: UI_THEME.secondaryHover,
    pressed: UI_THEME.secondaryPressed,
  }),
  disabled: Object.freeze({
    normal: UI_THEME.disabled,
    hover: UI_THEME.disabledHover,
    pressed: UI_THEME.disabledPressed,
  }),
});
