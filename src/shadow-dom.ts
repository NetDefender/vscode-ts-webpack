// class UserCard extends HTMLElement {
//   constructor() {
//     super();
//     this.attachShadow({mode: 'open'});
//     this.innerHTML = `John Doe`;
//   }
// }

// window.customElements.define('user-card', UserCard);

const template: HTMLTemplateElement = document.createElement("template");
template.innerHTML = `
<style>

</style>
<div>
  <h3 class="shadow">Shadow Dom</h3>
</div>`;

const e: HTMLDivElement = document.createElement("div");
const shadow: ShadowRoot = e.attachShadow({
  delegatesFocus: false,
  mode: "open",
});
e.shadowRoot?.appendChild(template.content.cloneNode(true));

document.body.appendChild(e);

for (const i of [
  document.getElementsByClassName("shadow"),
  e.getElementsByClassName("shadow"),
  e.shadowRoot?.querySelectorAll(".shadow"),
  shadow.querySelectorAll(".shadow"),
]) {
  console.log(i);
}
