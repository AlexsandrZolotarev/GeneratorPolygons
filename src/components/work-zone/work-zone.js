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
    .grid {
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
    .content {
      position: absolute;
      inset: 0;
      transform: translate(var(--offset-x), var(--offset-y)) scale(var(--scale-factor));
      transform-origin: 0 0;
    }
    .axis-x, .axis-y {
      position: absolute;
      pointer-events: none;
      font: 15px sans-serif;
      color: #000;
      background: #595858ff;
    }
    .axis-x {
      bottom: 0; left: 0;
      height: 24px;
      width: 100%;
      padding-bottom: 10px;
    }
    .axis-x span {
      position: absolute;
      bottom: 5px;
      transform: translateX(-50%);
    }
    .axis-y {
      top: 0; left: 0;
      width: 36px;
      height: 100%;
    }
    .axis-y span {
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

  <div class="grid"></div>
  <div class="content"></div>
  <div class="axis-x"></div>
  <div class="axis-y"></div>
`;

export class WorkZone extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" }).appendChild(
      template.content.cloneNode(true)
    );
    this.gridElement = this.shadowRoot.querySelector(".grid");
    this.contentElement = this.shadowRoot.querySelector(".content");
    this.axisXContainer = this.shadowRoot.querySelector(".axis-x");
    this.axisYContainer = this.shadowRoot.querySelector(".axis-y");

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
        pull: true,
        put: true,
      },
      animation: 150,
      sort: false,
      ghostClass: "sortable-ghost",
      chosenClass: "sortable-chosen",
      onEnd: this.updatePosition.bind(this),
    });
    this.loadPolygons();
    this.updateView();
  }
  
  updatePosition() {
    this.contentElement.querySelectorAll("svg").forEach((svg) => {
      const rect = svg.getBoundingClientRect();
      const parentRect = this.contentElement.getBoundingClientRect();

      const x = (rect.left - parentRect.left) / this.scaleFactor - this.offsetX;
      const y = (rect.top - parentRect.top) / this.scaleFactor - this.offsetY;
      svg.style.position = "absolute";
      svg.style.left = `${x}px`;
      svg.style.top = `${y}px`;
    });

    this.saveWorkZone();
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

    items.forEach(({ svg: svgString, left, top }) => {
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
