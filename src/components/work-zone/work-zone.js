import Sortable from "sortablejs";

const SIZE = 128;
const template = document.createElement("template");
template.innerHTML = `
  <style>
    :host {
      --cell-size: ${SIZE}px;
      --scale-factor: 1;
      --offset-x: 0px;
      --offset-y: 0px;
      --grid-offset-x: 0px;
      --grid-offset-y: 0px;

      display: block;
      position: relative;
      width: 100%;
      height: 400px;
      background: #323232;
      overflow: hidden;
      user-select: none;
      touch-action: none;
    }
    .work-zone{
      background: #2d2d2d;
      min-height: 300px;
      border-radius: 2px;
      position: relative;
      overflow: hidden;
      width: 100%;
      height: 400px;
    }
    .work-zone__content{
      position: absolute;
      left: 36px;
      top: 0;
      width: calc(100% - 36px);
      height: calc(100% - 33px);
      z-index: 2;
    }
    .work-zone__grid {
      position: absolute;
      inset: 0;
      background:
        repeating-linear-gradient(
          to right,
          #444 0 1px,
          transparent 1px calc(var(--cell-size) * var(--scale-factor))
        ),
        repeating-linear-gradient(
          to bottom,
          #444 0 1px,
          transparent 1px calc(var(--cell-size) * var(--scale-factor))
        );
      background-size:
        calc(var(--cell-size) * var(--scale-factor))
        calc(var(--cell-size) * var(--scale-factor));
      background-position: var(--grid-offset-x) var(--grid-offset-y);
    }
    .work-zone__axis-x, .work-zone__axis-y {
      position: absolute;
      pointer-events: none;
      font: 15px sans-serif;
      color: #000;
      background: #595858ff;
    }
    .work-zone__axis-x {
      bottom: 0; left: 0;
      height: 24px;
      width: 100%;
      padding-bottom: 10px;
    }
    .work-zone__axis-x span {
      position: absolute;
      bottom: 5px;
      transform: translateX(-50%);
    }
    .work-zone__axis-y {
      top: 0; left: 0;
      width: 36px;
      height: 100%;
    }
    .work-zone__axis-y span {
      position: absolute;
      left: 33%;
      transform: translateY(-50%);
    }
      .sortable-ghost {
      opacity: 0.6 !important;
      border: 2px dashed lime !important;
      background-color: rgba(0, 255, 0, 0.3) !important;
    }
    .sortable-chosen {
      outline: 2px solid green;
    }
  </style>
  <div class="work-zone">
    <div class="work-zone__grid"></div>
    <div class="work-zone__content"></div>
    <div class="work-zone__axis-x"></div>
    <div class="work-zone__axis-y"></div>
  </div>

`;

export class WorkZone extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" }).appendChild(
      template.content.cloneNode(true)
    );
    this.gridElement = this.shadowRoot.querySelector(".work-zone__grid");
    this.contentElement = this.shadowRoot.querySelector(".work-zone__content");
    this.axisXContainer = this.shadowRoot.querySelector(".work-zone__axis-x");
    this.axisYContainer = this.shadowRoot.querySelector(".work-zone__axis-y");

    this.scaleFactor = 1;
    this.offsetX = 0;
    this.offsetY = 0;

    this.onWheel = this.onWheel.bind(this);
    this.onMouseDown = this.onMouseDown.bind(this);
  }

  connectedCallback() {
    this.addEventListener("wheel", this.onWheel, { passive: false });
    this.addEventListener("mousedown", this.onMouseDown);
    Sortable.create(this.contentElement, {
      group: {
        name: "polygons",
        pull: false,
        put: true,
      },
      animation: 0,
      sort: false,
      filter: ".placed",
      ghostClass: "sortable-ghost",
      chosenClass: "sortable-chosen",
      onAdd: this.handlePolygonDrop.bind(this),

      onChoose: function (/**Event*/ evt) {
        console.log(evt, "onChoose");
      },

      onUnchoose: function (/**Event*/ evt) {
        console.log(evt, "onUnchoose");
      },
    });
    this.loadPolygons();
    this.updateView();
  }
  handlePolygonDrop(event) {
    const polygon = event.item;
    const mouseEvent = event.originalEvent;
    const dropXClient = mouseEvent.clientX;
    const dropYClient = mouseEvent.clientY;
    const contentBounds = this.contentElement.getBoundingClientRect();

    const relativeX = dropXClient - contentBounds.left;
    const relativeY = dropYClient - contentBounds.top;

    const worldX = relativeX / this.scaleFactor - this.offsetX;
    const worldY = relativeY / this.scaleFactor - this.offsetY;

    polygon.dataset.worldX = worldX;
    polygon.dataset.worldY = worldY;

    polygon.style.position = "absolute";
    this.renderSinglePolygon(polygon);
  }

  renderSinglePolygon(svgElement) {
    const worldX = parseFloat(svgElement.dataset.worldX);
    const worldY = parseFloat(svgElement.dataset.worldY);
    const screenX = (worldX + this.offsetX) * this.scaleFactor;
    const screenY = (worldY + this.offsetY) * this.scaleFactor;
    svgElement.classList.add("placed");
    svgElement.style.transform = `translate(${screenX}px, ${screenY}px) scale(${this.scaleFactor})`;
  }
  saveWorkZone() {
    const arr = Array.from(this.contentElement.querySelectorAll("svg")).map(
      (svg) => ({
        svg: svg.outerHTML,
        left: parseFloat(svg.style.left) || 0,
        top: parseFloat(svg.style.top) || 0,
      })
    );
    localStorage.setItem("polygonsWorkZone", JSON.stringify(arr));
  }
  clearWorkZone() {
    this.contentElement.innerHTML = "";
    localStorage.removeItem("polygonsWorkZone");
  }
  disconnectedCallback() {
    this.removeEventListener("wheel", this.onWheel);
    this.removeEventListener("mousedown", this.onMouseDown);
  }
  loadPolygons() {
    const saved = localStorage.getItem("polygonsWorkZone");
    if (!saved) return;
    let items;
    try {
      items = JSON.parse(saved);
    } catch {
      return;
    }

    items.forEach(({ svg: svgString }) => {
      const wrapper = document.createElement("div");
      wrapper.innerHTML = svgString;
      const svg = wrapper.firstElementChild;
      if (!svg || svg.tagName.toLowerCase() !== "svg") return;

      this.contentElement.appendChild(svg);
    });
  }
  updateView() {
    const cellPx = SIZE * this.scaleFactor;
    const gridOffsetX = this.offsetX % cellPx;
    const gridOffsetY = this.offsetY % cellPx;

    const hostStyle = this.shadowRoot.host.style;
    hostStyle.setProperty("--scale-factor", this.scaleFactor);
    hostStyle.setProperty("--offset-x", `${this.offsetX}px`);
    hostStyle.setProperty("--offset-y", `${this.offsetY}px`);
    hostStyle.setProperty("--grid-offset-x", `${gridOffsetX}px`);
    hostStyle.setProperty("--grid-offset-y", `${gridOffsetY}px`);

    this.contentElement
      .querySelectorAll("svg")
      .forEach((svgEl) => this.renderSinglePolygon(svgEl));
    this.renderAxes();
  }

  renderAxes() {
    const cellPx = SIZE * this.scaleFactor;
    const width = this.clientWidth;
    const height = this.clientHeight;

    this.axisXContainer.innerHTML = "";
    for (let x = 0; x <= width + cellPx; x += cellPx) {
      const worldX = Math.round((x - this.offsetX) / cellPx) * 10;
      const labelX = document.createElement("span");
      labelX.textContent = worldX;
      labelX.style.left = `${x}px`;
      this.axisXContainer.appendChild(labelX);
    }

    this.axisYContainer.innerHTML = "";
    for (let y = 0; y <= height + cellPx; y += cellPx) {
      let worldY = Math.round((y + this.offsetY) / cellPx) * 10;
      if (worldY < 0) worldY = 0;
      const labelY = document.createElement("span");
      labelY.textContent = worldY;
      labelY.style.bottom = `${y}px`;
      this.axisYContainer.appendChild(labelY);
    }
  }

  onWheel(event) {
    event.preventDefault();
    const zoomDelta = -event.deltaY * 0.001;
    this.scaleFactor = Math.min(Math.max(this.scaleFactor + zoomDelta, 0.2), 5);
    this.updateView();
  }
  onMouseDown(event) {
    if (event.button !== 0) return;
    event.preventDefault();

    const startX = event.clientX,
      startY = event.clientY;
    const origX = this.offsetX,
      origY = this.offsetY;

    const onMouseMove = (moveEvent) => {
      const newOffsetX = origX + (moveEvent.clientX - startX);
      const newOffsetY = origY + (moveEvent.clientY - startY);

      this.offsetX = Math.min(0, newOffsetX);
      this.offsetY = Math.max(0, newOffsetY);

      this.updateView();
    };

    const onMouseUp = () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      this.style.cursor = "default";
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    this.style.cursor = "grabbing";
  }

  appendToContent(element) {
    this.contentElement.appendChild(element);
  }
}

customElements.define("work-zone", WorkZone);
