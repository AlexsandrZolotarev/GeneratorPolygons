function getRandomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
export function generateSvgPolygons(container) {
  const countPolygons = getRandomNumber(5, 20);
  if(container.children.length > 0) container.replaceChildren();
  console.log(container.children);
  for (let i = 0; i < countPolygons; i++) {
    const svgNS = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(svgNS, "svg");
    svg.setAttribute("viewBox", "0 0 100 100");
    svg.setAttribute("width", `${getRandomNumber(80, 150)}`);
    svg.setAttribute("height", `${getRandomNumber(80, 150)}`);

    const sides = getRandomNumber(3, 8);
    const cx = 50,
      cy = 50,
      baseR = 40;
    const pts = [];
    for (let j = 0; j < sides; j++) {
      const angle = (j / sides) * Math.PI * 2;
      const r = baseR * (0.8 + Math.random() * 0.4);
      pts.push(`${cx + Math.cos(angle) * r},${cy + Math.sin(angle) * r}`);
    }
    const poly = document.createElementNS(svgNS, "polygon");
    poly.setAttribute("points", pts.join(" "));
    poly.setAttribute("fill", "#910023");
    poly.setAttribute("draggable", "true");
    svg.appendChild(poly);

    container.appendChild(svg);
  }
}
