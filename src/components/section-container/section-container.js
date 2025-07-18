import "../buffer-zone/buffer-zone";
import "../work-zone/work-zone";

const template = document.createElement("template");
template.innerHTML = `
 <style>
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
.section__zones{
  background-color: #323232;
  margin-block: 1em;
}
 </style>
   <section class="section" aria-labelledby="test-task-title">
      <header class="section__header">
        <h2 class="visually-hidden section__title" id="test-task-title">
          Test Task
        </h2>
      </header>
      <div class="section__zones">
        <buffer-zone></buffer-zone>
        // <work-zone></work-zone>
      </div>
    </section>
`;

class SectionContainer extends HTMLElement {
  constructor() {
    super();
    const shadow = this.attachShadow({ mode: "open" });
    shadow.appendChild(template.content.cloneNode(true));
  }
}
customElements.define("section-container", SectionContainer);
