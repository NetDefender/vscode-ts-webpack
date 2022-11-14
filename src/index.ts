import $ from 'jquery'
import { randInt } from 'three/src/math/MathUtils';

type ModelToElementActionConverter<TElement extends HTMLElement, TValue> = (value: TValue | null, element: TElement) => void;
type ElementToModelActionConverter<TElement extends HTMLElement, TValue> = (element: TElement, e: Event) => TValue | null;
type ModelPropertyGetter<TModel, TValue> = (model: TModel) => TValue | null;
type ValidationFunction<TModel, TValue> = (model: TModel, oldValue: TValue | null, newValue: TValue | null) => string;
type ValidationChanged = (errors: string[]) => void;

class ControlBinding<TElement extends HTMLElement, TModel, TValue> {
  #element: TElement;
  #suspendBinding: boolean = false;
  #isBindingToElement: boolean = false;
  #elementEventHandlerBinded: null | ((e: Event) => void) = null;
  #modelPropertySetter: (model: TModel, value: TValue | null) => void;
  static #regexLambda = /\((?<parameter>.*)\)\s*=>\s*(?<body>.+)/i;

  constructor(private selector: TElement | string, private event: keyof HTMLElementEventMap
    , private elementToModelConverter: ElementToModelActionConverter<TElement, TValue>
    , private modelToElementConverter: ModelToElementActionConverter<TElement, TValue>
    , private modelPropertyGetter : ModelPropertyGetter<TModel, TValue>
    , private model: TModel
    , private propertyBindingUpdated?: (fromModel: boolean, oldValue: TValue | null, newValue: TValue | null) => void
    , private validations?: Validation<TModel, TValue>[]) {
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
    this.#modelPropertySetter = this.createModelPropertySetter();;
    this.#elementEventHandlerBinded = this.elementEventHandler.bind(this);
    this.modelToElementConverter(this.modelPropertyGetter(this.model) , this.#element);
    this.#element.addEventListener(this.event, this.#elementEventHandlerBinded);
  }

  get Value(): TValue | null {
    return this.modelPropertyGetter(this.model);
  }

  set Value(value: TValue | null) {
    const oldValue = this.modelPropertyGetter(this.model);
    const isValid = this.validations?.map(validation => validation.Validate(oldValue, value))
      .reduce((prev, curr) => prev || curr);
    this.#modelPropertySetter(this.model, value);
    this.#isBindingToElement = true;
    try {
      if (this.#element && !this.#suspendBinding) {
        this.modelToElementConverter(value, this.#element);
        this.propertyBindingUpdated?.(true, oldValue, value);
      }
    } catch (e: unknown) {
      console.error("Se produjo un error al establecer la propiedad Value", e);
    } finally
    {
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

  get Validations() {
    return this.validations;
  }

  private elementEventHandler(e: Event) {
    if (this.#suspendBinding || this.#isBindingToElement || !this.#element) {
      return;
    }
    const oldValue = this.modelPropertyGetter(this.model);
    const newValue = this.elementToModelConverter(this.#element, e);
    this.#modelPropertySetter(this.model, newValue);
    this.propertyBindingUpdated?.(false, oldValue, newValue);
  }

  private createModelPropertySetter() {
    const match = this.modelPropertyGetter.toString().match(ControlBinding.#regexLambda);
    return eval(`(${match?.groups?.parameter}, value) => ${match?.groups?.body}=value`);
  }

  public Dispose() {
    if (this.#element) {
      if (this.#elementEventHandlerBinded) {
        this.#element.removeEventListener(this.event, this.#elementEventHandlerBinded);
      }
    }
  }
}

class ValidationContext<TModel> {
  constructor(public Model: TModel, public Validations: IValidation<TModel>[]
    , public ValidationChanged: ValidationChanged) {
  }

  ClearErrors() {
    this.Validations.forEach(validation => validation.Error = '');
    this.ValidationChanged(this.Errors());
  }

  Errors() {
    return this.Validations.map(validation => validation.Error).filter(error => error && error.length > 0);
  }

  IsValid() {
    return this.Errors().length == 0;
  }

  NotifyValidationChanged() {
    this.ValidationChanged(this.Errors());
  }
}

interface IValidation<TModel>
{
  Context: ValidationContext<TModel>;
  Validate(oldValue: unknown, newValue: unknown): boolean;
  Error: string;
}

class Validation<TModel, TValue> implements IValidation<TModel> {
  constructor(public Context: ValidationContext<TModel>
    , public Name: string
    , public ValidationFunction: ValidationFunction<TModel, TValue>
    , public Error: string) {
  }

  public Validate (oldValue: unknown, newValue: unknown): boolean  {
    const wasValid = this.Error != null && this.Error.length == 0;
    this.Error = '';
    this.Error = this.ValidationFunction(this.Context.Model, this.isTValue(oldValue) ? oldValue : null, this.isTValue(newValue) ? newValue : null);
    const isValid = this.Error != null && this.Error.length == 0;
    if(wasValid != isValid){
      this.Context.NotifyValidationChanged();
    }
    return isValid;
  }

  private isTValue(value: unknown): value is TValue {
    return !!(value as TValue);
  }
}

class Modelz {
  constructor(public Id: number, public Price: number) {
  }
}

const model = new Modelz(1, 100);
const textBinding = new ControlBinding<HTMLInputElement, Modelz, number>('#texto', 'keyup'
  , (element, e) => parseFloat(element.value)
  , (value, element) => element.value = value ? value.toString() : ''
  , (m) => m.Price
  , model
  , (fromModel, oldValue, newValue) => console.log(fromModel, oldValue, newValue));

document.getElementById('inspect')?.addEventListener('click', e => {
  textBinding.Value = randInt(1, 1000);
  // const u: unknown = 'abc'
  // console.log(<number>u);
});
