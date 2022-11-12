import $ from 'jquery'

type ModelToElementActionConverter<TElement extends HTMLElement, TValue> = (element: TElement, value: TValue | null) => void;
type ElementToModelConverter<TElement extends HTMLElement, TValue> = (element: TElement, e: unknown) => TValue | null;

class ControlBinding<TElement extends HTMLElement, TValue> {
  #element: TElement;
  #modelValue: TValue | null = null;
  #suspendBinding: boolean = false;
  #isBindingToElement: boolean = false;
  #elementEventHandlerBinded: null | ((e: unknown) => void) = null;

  constructor(private selector: TElement | string, private event: keyof HTMLElementEventMap
    , private elementToModelConverter: ElementToModelConverter<TElement, TValue>
    , private modelToElementConverter: ModelToElementActionConverter<TElement, TValue>
    , initialValue: TValue | null = null) {
    if (typeof this.selector === "string") {
      const element: TElement | null = document.querySelector(this.selector);
      if (!element) {
        throw new Error(`No se ha encontrado ningún control con el selector "${this.selector}"`);
      } else {
        this.#element = element;
      }
    }
    else {
      this.#element = this.selector;
    }
    this.#modelValue = initialValue;

    this.#elementEventHandlerBinded = this.elementEventHandler.bind(this);
    if (initialValue != null) {
      this.modelToElementConverter(this.#element, initialValue);
    }
    this.#element.addEventListener(this.event, this.#elementEventHandlerBinded);
  }

  get ModelValue(): TValue | null {
    return this.#modelValue;
  }

  set ModelValue(modelValue: TValue | null) {
    this.#modelValue = modelValue;
    this.#isBindingToElement = true;
    try {
      if (this.#element) {
        this.modelToElementConverter(this.#element, modelValue);
      }
    } catch (e: unknown) {
      this.#isBindingToElement = false;
    }
  }

  get Element(): HTMLElement | null {
    return this.#element;
  }

  get SuspendBinding(): boolean {
    return this.#suspendBinding;
  }

  set SuspendBinding(value: boolean) {
    this.#suspendBinding = value;
  }

  private elementEventHandler(e: unknown) {
    if (this.#suspendBinding || this.#isBindingToElement || !this.#element) {
      return;
    }
    this.elementToModelConverter(this.#element, e);
  }

  public Dispose() {
    if (this.#element) {
      if (this.#elementEventHandlerBinded) {
        this.#element.removeEventListener(this.event, this.#elementEventHandlerBinded);
      }
    }
  }
}

class Validation<TValue> {

}

const textBinding = new ControlBinding<HTMLInputElement, string>('#texto', 'input'
  , (element, e) => {
    return element.value;
  },
  (element, value) => {
    element.value = value || "";
  },
  "Daniel");


setInterval(() => textBinding.ModelValue = (Math.random() * 100).toFixed(), 1000);
