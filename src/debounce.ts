import { Animals } from "./animal-store";
interface Animal {
  id: number;
  name: string;
}

const search = <HTMLInputElement>document.getElementById("search");
const last = <HTMLLabelElement>document.getElementById("last-time-search");
const rowsContainer = <HTMLTableSectionElement>document.getElementById("rows");
let i: number = 1;
const animals: Animal[] = Animals.map(animal => ({ id: i++, name: animal }));
let view: Animal[] = [...animals];

function debounceHTMLEvent<K extends keyof HTMLElementEventMap>(
  type: K,
  action: () => void,
  timeout: number = 500
) {
  search.addEventListener(type, searchKeyUpHandler);
  let cancelAction: number = 0;
  function searchKeyUpHandler(e: HTMLElementEventMap[K]) {
    if (cancelAction > 0) {
      clearTimeout(cancelAction);
    }
    cancelAction = setTimeout(action, timeout);
  }

  return {
    dispose: function () {
      search.removeEventListener(type, searchKeyUpHandler);
    },
  };
}

function searchAnimals() {
  setView(
    animals.filter(animal =>
      animal.name.toLowerCase().includes(search.value?.toLocaleLowerCase())
    )
  );
}

function setView(animals: Animal[]) {
  view = animals;
  render();
}

function render() {
  let cancelAction: number = 0;

  function debounce() {
    if (cancelAction > 0) {
      clearTimeout(cancelAction);
    }
    cancelAction = setTimeout(renderInternal, 250);
  }

  function renderInternal() {
    let rows: string = view
      .map(animal => `<tr data-id="${animal.id}"><td>${animal.name}</td></tr>`)
      .join("");
    rowsContainer.innerHTML = rows;
  }

  debounce();
}

debounceHTMLEvent("keyup", searchAnimals, 500);
render();
