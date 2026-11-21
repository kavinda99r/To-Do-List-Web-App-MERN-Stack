export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        primary: "var(--color-primary)",
        content: "var(--color-text)",
        muted: "var(--color-muted)",
        line: "var(--color-border)",
        surface: "var(--color-surface)",
      },
      fontSize: {
        heading: ["var(--heading-size)", { lineHeight: "1.2" }],
        subheading: ["var(--subheading-size)", { lineHeight: "1.3" }],
        body: ["var(--body-size)", { lineHeight: "1.65" }],
        control: ["var(--control-size)", { lineHeight: "1.5" }],
      },
      spacing: { "control-x": "var(--control-x)", "control-y": "var(--control-y)" },
      borderRadius: { control: "var(--control-radius)" },
      maxWidth: { workspace: "920px", account: "800px", auth: "460px" },
      backgroundImage: {
        home: "linear-gradient(rgba(0,0,0,.18), rgba(0,0,0,.32)), url('/night-workspace.png')",
      },
      fontFamily: { sans: ["Inter", "sans-serif"] },
      keyframes: { "loading-spin": { to: { transform: "rotate(360deg)" } } },
      animation: { "loading-spin": "loading-spin .8s linear infinite" },
    },
  },
  plugins: [],
};
