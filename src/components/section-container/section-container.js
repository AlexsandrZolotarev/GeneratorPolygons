import "../buffer-zone/buffer-zone";
import "../work-zone/work-zone";

const template = document.createElement("template");
template.innerHTML = `
 <style>
      .zone__controls-list {
        display: flex;
        flex-direction: row;
        background-color: #323232;
        padding-block: 1em;
        padding-inline: 2em;
        list-style: none;
        margin-block: 0;
      }
      .zone__controls__button {
        padding: 15px 50px;
        border: none;
        border-radius: 5px;
        background-color: #969696;
      }
      .zone__controls__button:hover {
       background-color: #5c5c5cff;
      }
      .zone__controls__button:active {
       background-color: #01820eff;
      }
      .zone__controls--save {
        margin-right: 10px;
      }
      .left {
        margin-left: auto;
      }
      .section {
        background-color: #c8c8c8;
        max-width: calc(1280px + 16px * 2);
        margin-inline: auto;
        font-size: 15px;
      }
      .visually-hidden {
        position: absolute !important;
        width: 1px !important;
        height: 1px !important;
        margin: -1px !important;
        border: 0 !important;
        padding: 0 !important;
        white-space: nowrap !important;
        clip-path: inset(100%) !important;
        clip: rect(0 0 0 0) !important;
        overflow: hidden !important;
      }
      .section__zones {
        display: flex;
        flex-direction: column;
        gap: 16px;
        margin-block: 1em;
      }
      svg {
        -webkit-user-drag: element;
      }
    </style>

  <section class="section" aria-labelledby="test-task-title">
      <header class="section__header">
        <h2 class="visually-hidden section__title" id="test-task-title">
          Test Task
        </h2>
      </header>
      <div class="section__zones">
        <div class="zone__controls">
          <ul class="zone__controls-list">
            <li class="zone__controls-item">
              <button class="zone__controls__button zone__controls--create">
                Create
              </button>
            </li>
            <li class="zone__controls-item left">
              <button class="zone__controls__button zone__controls--save">
                Save
              </button>
            </li>
            <li class="zone__controls-item">
              <button class="zone__controls__button zone__controls--reset">
                Reset
              </button>
            </li>
          </ul>
        </div>
        <buffer-zone></buffer-zone>
        <work-zone></work-zone>
      </div>
    </section>
`;

class SectionContainer extends HTMLElement {
  constructor() {
    super();
    const shadow = this.attachShadow({ mode: "open" });
    shadow.appendChild(template.content.cloneNode(true));
  }
  connectedCallback() {
    const bufferZone = this.shadowRoot.querySelector("buffer-zone");
    const workZone = this.shadowRoot.querySelector("work-zone");
    this.shadowRoot
      .querySelector(".zone__controls--create")
      .addEventListener("click", () => {
        bufferZone.generatePolygons();
      });
    this.shadowRoot
      .querySelector(".zone__controls--save")
      .addEventListener("click", () => {
        bufferZone.saveBufferZone();
        workZone.saveWorkZone();
      });
    this.shadowRoot
      .querySelector(".zone__controls--reset")
      .addEventListener("click", () => {
        bufferZone.clearBufferZone();
        workZone.clearWorkZone();
      });
  }
}
customElements.define("section-container", SectionContainer);
