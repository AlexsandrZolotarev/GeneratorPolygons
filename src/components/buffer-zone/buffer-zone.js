import { getRandomNumber } from "../../utils/random";

const template = document.createElement("template");
template.innerHTML = `
<style>
      .buffer-zone__controls { 
        display: flex;
        flex-direction: row;
        padding-block: 1em;
        padding-inline: 2em;
        list-style: none;
      }
      .buffer-zone  {
       background-color: #c8c8c8;
      }
     .buffer-zone__button{
        padding: 15px 50px;
        border: none;
        border-radius: 5px;
        background-color: #969696;
      }
      .buffer-zone__button--save{
        margin-right: 10px;
      }
      .buffer-zone__controls{
        background-color: #323232;
      }
      .left
      {
        margin-left: auto;
      }
      .section__area-buffer{
        height: 400px;
      }
      .buffer-zone__body{
        display: flex;
        flex-wrap: wrap;
        overflow: auto;
        background-color: #323232;
        margin-top:15px;
        height: 400px;
      }
      .buffer-zone__button:hover {
       background-color: #5c5c5cff;
      }
      .buffer-zone__button:active {
       background-color: #01820eff;
      }
  </style>
<div class="buffer-zone">
  <ul class="buffer-zone__controls">
    <li class="buffer-zone__controls-item">
      <button class="buffer-zone__button buffer-zone__button--create">
        Create
      </button>
    </li>
    <li class="buffer-zone__controls-item left">
      <button class="buffer-zone__button buffer-zone__button--save">
        Save
      </button>
    </li>
    <li class="buffer-zone__controls-item">
      <button class="buffer-zone__button buffer-zone__button--reset">
        Reset
      </button>
    </li>
  </ul>
  <div class="buffer-zone__body">
  </div>
</div>
`;

class BufferZone extends HTMLElement {
  constructor() {
    super();
    const shadow = this.attachShadow({ mode: "open" });
    shadow.appendChild(template.content.cloneNode(true));
  }
  connectedCallback() {
    this.bufferZone = this.shadowRoot.querySelector(".buffer-zone__body");
    this.btnCreate = this.shadowRoot.querySelector(".buffer-zone__button--create");
    this.btnCreate.addEventListener("click", () => this.generatePolygons());

    this.btnReset = this.shadowRoot.querySelector(".buffer-zone__button--reset");
    this.btnReset.addEventListener("click", () => this.deletePolygons());

    this.btnSave = this.shadowRoot.querySelector(".buffer-zone__button--save");
    this.btnSave.addEventListener("click", () => this.savePolygons());
    this.loadPolygons();
  }
  disconnectedCallback() {
    this.btnCreate.removeEventListener("click", this.generatePolygons);
    this.btnReset.removeEventListener("click", this.deletePolygons);
    this.btnSave.removeEventListener("click", this.savePolygons);
  }
  loadPolygons() {
    const saved = localStorage.getItem("polygons");
    if (!saved) return;
    let htmlArray;
    try {
      htmlArray = JSON.parse(saved);
    } catch {
      return;
    }
    htmlArray.forEach((svgString) => {
      const wrapper = document.createElement("div");
      wrapper.innerHTML = svgString;
      const svg = wrapper.firstElementChild;
      if (svg && svg.tagName.toLowerCase() === "svg") {
        this.bufferZone.appendChild(svg);
      }
    });
  }

  savePolygons() {
    if (this.bufferZone.children.length) {
      const arraySvg = Array.from(this.bufferZone.querySelectorAll("svg")).map(
        (svg) => svg.outerHTML
      );
      localStorage.setItem("polygons", JSON.stringify(arraySvg));
    }
  }
  deletePolygons() {
    this.bufferZone.innerHTML = "";
    localStorage.removeItem("polygons");
  }
  generatePolygons() {
    const svgNS = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(svgNS, "svg");
    svg.setAttribute("draggable", "true");
    svg.setAttribute("viewBox", "0 0 100 100");
    svg.setAttribute("width", `${getRandomNumber(80, 200)}`);
    svg.setAttribute("height", `${getRandomNumber(80, 200)}`);

    const sides = getRandomNumber(3, 8);
    const cx = 50,
      cy = 50;
    const baseR = 40;
    const pts = [];

    for (let j = 0; j < sides; j++) {
      const angle = (j / sides) * Math.PI * 2;
      const r = baseR * (0.8 + Math.random() * 0.4);
      const x = cx + Math.cos(angle) * r;
      const y = cy + Math.sin(angle) * r;
      pts.push(`${x},${y}`);
    }

    const poly = document.createElementNS(svgNS, "polygon");
    poly.setAttribute("points", pts.join(" "));
    poly.setAttribute("fill", "#910023");
    svg.appendChild(poly);

    this.bufferZone.appendChild(svg);
  }
}
customElements.define("buffer-zone", BufferZone);
