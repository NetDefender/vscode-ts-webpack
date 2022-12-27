import imgUri from "./image.jpg";

function dragstart_handler(ev: DragEvent) {
  if (ev.dataTransfer && ev.target instanceof HTMLElement) {
    ev.dataTransfer.effectAllowed = "move";
    console.log("drag start");
    ev.dataTransfer.setData("text/plain", ev.target.id);
  }
}

function dragover_handler(ev: DragEvent) {
  console.log("drag over");
  ev.preventDefault();
  if (ev.dataTransfer) {
    ev.dataTransfer.dropEffect = "move";
    ev.dataTransfer.effectAllowed = "move";
  }
}

function drop_handler(ev: DragEvent) {
  console.log("drop");
  ev.preventDefault();
  if (ev.dataTransfer && ev.target instanceof HTMLElement) {
    const data = ev.dataTransfer.getData("text/plain");
    ev.target.appendChild(document.getElementById(data)!);
  }
}

window.addEventListener("DOMContentLoaded", () => {
  // Get the element by id
  const element = document.getElementById("draggable-bar")!;
  // Add the ondragstart event listener
  element.addEventListener("dragstart", dragstart_handler);

  const dropZone = document.getElementById("side")!;
  dropZone.addEventListener("dragover", dragover_handler);
  dropZone.addEventListener("drop", drop_handler);
});

