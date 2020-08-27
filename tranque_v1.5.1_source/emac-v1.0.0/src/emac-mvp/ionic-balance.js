const values = await series.query([
  {head: "*.ca"},
  {head: "*.na"},
  {head: "*.k"},
  {head: "*.mg"},
  {head: "*.sulfates"},
  {head: "*.chloride"},
  {head: "*.bicarbonates"},
  {head: "*.carbonates"},
]);
// cationes: Ca^{2+}, Na^{+}, K^{+}, Mg^{2+}
// aniones: SO_{4}^{2-}, Cl^{-}, HCO_{3}^{-}, CO_{3}^{2-}
const molValence = [
  [40.078, 2], // Ca
  [22.99, 1],  // Na
  [39.098, 1], // K
  [24.305, 2], // Mg
  [96.056, 2], // SO_{4}^{2-}
  [35.45, 1],  // Cl^{-}
  [61.016, 1], // HCO_{3}^{-}
  [60.008, 2], // CO_{3}^{2-}
];
const [ca, na, k, mg, sulfates, chloride, bicarbonates, carbonates] = values
      .map((event, index) => event.value * molValence[index][1] / molValence[index][0]);
const catSum = ca + na + k + mg;
const anSum = sulfates + chloride + bicarbonates + carbonates;
series.save(Math.abs(100 * (catSum - anSum) / (catSum + anSum)));
