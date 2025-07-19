import Sortable from "sortablejs";
import { getRandomNumber } from "../../utils/random";
import { generateSvgPolygons } from "../../utils/svg-generator";

const template = document.createElement("template");
template.innerHTML = `
<style>
      .buffer-zone{
        display: flex;
        flex-wrap: wrap;
        overflow: auto;
        background-color: #323232;
        height: 400px;
      }
      svg {
      -webkit-user-drag: element;
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
  <div class="buffer-zone">
  </div>

`;

class BufferZone extends HTMLElement {
  constructor() {
    super();
    const shadow = this.attachShadow({ mode: "open" });
    shadow.appendChild(template.content.cloneNode(true));
  }
  connectedCallback() {
    this.bufferZone = this.shadowRoot.querySelector(".buffer-zone");
    Sortable.create(this.bufferZone, {
     group: {
        name: 'polygons',
        pull: true,  
        put: true  
      },
      animation: 150,
      sort: false,
      ghostClass: 'sortable-ghost',
      chosenClass: 'sortable-chosen'
    });
    this.loadPolygons();
  }
  disconnectedCallback() {
  }
  loadPolygons() {
    const saved = localStorage.getItem("polygonsBufferZone");
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
  saveBufferZone() {
    const arr = Array.from(this.bufferZone.querySelectorAll('svg'))
      .map(svg => svg.outerHTML);
    localStorage.setItem('polygonsBufferZone', JSON.stringify(arr));
  }
  clearBufferZone() {
    this.bufferZone.innerHTML = '';
    localStorage.removeItem('polygonsBufferZone');
  }
  deletePolygons() {
    this.bufferZone.innerHTML = "";
    localStorage.removeItem("polygonsBufferZone");
  }
  generatePolygons() {
    generateSvgPolygons(this.bufferZone);
  }
}
customElements.define("buffer-zone", BufferZone);
