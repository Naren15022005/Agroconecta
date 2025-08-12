import React from "react";

const colorVars = [
  { var: "--bg", class: "color-bg", hex: "#0f1724", desc: "Fondo general de la página, degradado base del body" },
  { var: "--card", class: "color-card", hex: "#0b1220", desc: "Fondos sólidos de tarjetas, sidebar y modal" },
  { var: "--muted", class: "color-muted", hex: "#98a0b3", desc: "Texto secundario (descripciones, etiquetas pequeñas, subtítulos)" },
  { var: "--accent", class: "color-accent", hex: "#06b6d4", desc: "Color de acento principal: logo, botones primarios, bordes resaltados" },
  { var: "--accent-2", class: "color-accent-2", hex: "#7c3aed", desc: "Acento secundario: degradado junto con el acento principal en logo y botones" },
  { var: "--success", class: "color-success", hex: "#16a34a", desc: "Indicadores de montos positivos (créditos, ingresos)" },
  { var: "--danger", class: "color-danger", hex: "#ef4444", desc: "Indicadores de montos negativos (débitos, egresos)" },
  { var: "--glass", class: "color-glass", hex: "rgba(255,255,255,0.03)", desc: "Fondo semitransparente de paneles principales y tarjetas grandes" },
  { var: "--glass-2", class: "color-glass-2", hex: "rgba(255,255,255,0.02)", desc: "Fondo semitransparente más tenue, usado en degradados y elementos secundarios dentro de paneles" },
];

export default function ColorPaletteTable() {
  return (
    <table className="color-table">
      <thead>
        <tr>
          <th>Variable</th>
          <th>Color</th>
          <th>Uso principal en la vista</th>
        </tr>
      </thead>
      <tbody>
        {colorVars.map((c) => (
          <tr key={c.var}>
            <td>{c.var}</td>
            <td>
              <span className={`color-sample ${c.class}`}></span>
              {c.hex}
            </td>
            <td>{c.desc}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
