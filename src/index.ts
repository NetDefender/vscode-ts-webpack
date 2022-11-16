//import $ from 'jquery'
import { randFloat, randInt } from 'three/src/math/MathUtils';

type ModelToElementActionConverter<TElement extends HTMLElement, TValue> = (value: TValue | null, element: TElement) => void;
type ElementToModelActionConverter<TElement extends HTMLElement, TValue> = (element: TElement, e: Event) => TValue | null;
type ModelPropertyGetter<TModel, TValue> = (model: TModel) => TValue | null;
type ValidationFunction<TModel, TValue> = (model: TModel, oldValue: TValue | null, newValue: TValue | null) => string;
type PropertyBindingUpdated<TValue> = (fromModel: boolean, oldValue: TValue | null, newValue: TValue | null) => void;
type ValidationChanged = (errors: string[]) => void;

interface IControlBinding<TModel>
{
  Model: TModel;
  get Name(): string;
}
class ControlBinding<TElement extends HTMLElement, TModel, TValue> implements IControlBinding<TModel> {
  #element: TElement;
  #suspendBinding: boolean = false;
  #isBindingToElement: boolean = false;
  #elementEventHandlerBinded: null | ((e: Event) => void) = null;
  #modelPropertySetter: (model: TModel, value: TValue | null) => void;
  static #regexLambda = /\((?<parameter>.*)\)\s*=>\s*(?<body>.+)/i;

  constructor(private name: string
    , private selector: TElement | string, private event: keyof HTMLElementEventMap
    , private model: TModel
    , private modelPropertyGetter : ModelPropertyGetter<TModel, TValue>
    , private elementToModelConverter: ElementToModelActionConverter<TElement, TValue>
    , private modelToElementConverter: ModelToElementActionConverter<TElement, TValue>
    , private propertyBindingUpdated?: PropertyBindingUpdated<TValue>
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
    this.#modelPropertySetter(this.model, value);
    this.validations?.forEach(validation => validation.Validate(oldValue, value));
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

  get Model() {
    return this.model;
  }

  set Model(value: TModel) {
    if(this.model !== value) {
      this.model = value;
      this.validations?.forEach(validation => validation.Context.Model = this.model);
      const newValue = this.modelPropertyGetter(this.model);
      this.Value = newValue;
    }
  }

  get Name() {
    return this.name;
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
    if (!this.#element || !this.#elementEventHandlerBinded) {
      return;
    }
    this.#element.removeEventListener(this.event, this.#elementEventHandlerBinded);
  }
}

class ValidationContext<TModel> {
  constructor(public Model: TModel, public Validations: IValidation<TModel>[]
    , public ValidationChanged: ValidationChanged) {
  }

  ClearErrors() {
    this.Validations.forEach(validation => validation.Error = '');
    this.NotifyValidationChanged();
  }

  Errors(): string[] {
    return this.Validations.map(validation => validation.Error)
      .filter(error => error && error.length > 0);
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
    const wasValid = this.isErrorEmpty(this.Error);
    this.Error = this.ValidationFunction(this.Context.Model, this.isValidValue(oldValue) ? oldValue : null, this.isValidValue(newValue) ? newValue : null);
    const isValid = this.isErrorEmpty(this.Error);
    if(wasValid != isValid){
      this.Context.NotifyValidationChanged();
    }
    return isValid;
  }

  protected isValidValue(value: unknown): value is TValue {
    return !!(value as TValue);
  }

  private isErrorEmpty(value: string) {
    return value != null && value.length == 0;
  }
}

function isNullOrUndefined(value: unknown): value is null {
  return value === undefined || value === null;
}

function isNullOrUndefinedOrWhiteSpace(value: unknown): value is null {
  return value === undefined || value === null || value.toString().trim().length === 0;
}

function isNullOrNaNOrUndefined(value: unknown): value is null {
  return value === undefined || value === null || (typeof value === 'number' && isNaN(value));
}
/*********************************** *********************************************************************************************************************************************/
/*********************************** *********************************************************************************************************************************************/

class NumberFormatter {
  #formatter: Intl.NumberFormat;
  #decimalSeparator: string;
  #groupSeparator: string;
  #regexGroup: RegExp;
  #regexSimplified: RegExp;
  constructor(public readonly Locale: string) {
    this.#formatter = new Intl.NumberFormat(this.Locale, {useGrouping: true});
    this.#decimalSeparator = this.#formatter.format(0.1).charAt(1);
    this.#groupSeparator = this.#formatter.format(1000).charAt(1);
    this.#regexGroup = new RegExp(`^(?<principal>[0-9]{1,3})(?<grupo>[${this.#groupSeparator}][0-9]{3})*(?<decimal>[${this.#decimalSeparator}]\\d+)*$`);
    this.#regexSimplified = new RegExp(`^(?<principal>[0-9]+)(?<decimal>[${this.#decimalSeparator}]\\d+)*$`);
  }

  get DecimalSeparator () {
    return this.#decimalSeparator;
  }

  Format(value: number | null): string {
    if(isNullOrNaNOrUndefined(value)) {
      return '';
    }
    return this.#formatter.format(value);
  }

  Parse(value: string) : number | null {
    if(isNullOrUndefinedOrWhiteSpace(value)) {
      return null;
    }
    if(!value.match(this.#regexSimplified) && !value.match(this.#regexGroup)) {
      return null;
    }
    const parsedValue = parseFloat(value.replaceAll(this.#groupSeparator, '').replaceAll(this.#decimalSeparator, '.'));
    return isNaN(parsedValue) ? null : parsedValue;
  }
}

class NumericControlBinding<TModel> extends ControlBinding<HTMLInputElement, TModel, number> {
  static NumberFormatter: NumberFormatter = new NumberFormatter('es-ES');
  constructor(name: string
    , selector: HTMLInputElement | string, event: keyof HTMLElementEventMap
    , model: TModel
    , modelPropertyGetter : ModelPropertyGetter<TModel, number>
    , propertyBindingUpdated?: PropertyBindingUpdated<number>
    , validations?: Validation<TModel, number>[]){
      super(name, selector, event, model, modelPropertyGetter, (element, e) => {
        return NumericControlBinding.NumberFormatter.Parse(element.value);
      }, (value, element) => {
        if(isNullOrNaNOrUndefined(value)) {
          element.value = '';
        } else {
          element.value = NumericControlBinding.NumberFormatter.Format(value);
        }
      }, propertyBindingUpdated, validations);
  }
}

class TextControlBinding<TModel> extends ControlBinding<HTMLInputElement, TModel, string> {
  static NumberFormatter: NumberFormatter = new NumberFormatter('es-ES');
  constructor(name: string
    , selector: HTMLInputElement | string, event: keyof HTMLElementEventMap
    , model: TModel
    , modelPropertyGetter : ModelPropertyGetter<TModel, string>
    , propertyBindingUpdated?: PropertyBindingUpdated<string>
    , validations?: Validation<TModel, string>[]){
      super(name, selector, event, model, modelPropertyGetter, (element, e) => {
        return element.value;
      }, (value, element) => {
        if(isNullOrNaNOrUndefined(value)) {
          element.value = '';
        } else {
          element.value = value;
        }
      }, propertyBindingUpdated, validations);
  }
}

class BindingContext<TModel>
{
  #bindings: Map<string, IControlBinding<TModel>>;
  constructor() {
    this.#bindings = new Map<string, IControlBinding<TModel>>();
  }

  Bindings(name: string): IControlBinding<TModel> | null {
    if(!this.#bindings.has(name)) {
      return null;
    }
    return <IControlBinding<TModel>>this.#bindings.get(name);
  }

  AddBinding(binding: IControlBinding<TModel>) {
    this.#bindings.set(binding.Name, binding);
  }
}

/*********************************** *********************************************************************************************************************************************/
/*********************************** *********************************************************************************************************************************************/

class Modelz {
  constructor(public Id: number, public Price: number | null, public Description: string | null) {
  }
}

const model = new Modelz(1, 100, "Daniel");

const bindingContext = new BindingContext<Modelz>();
bindingContext.AddBinding(new NumericControlBinding<Modelz>('Prize', '#number', 'input', model, (m) => m.Price));
bindingContext.AddBinding(new TextControlBinding<Modelz>('Dezcription', '#text', 'input', model, (m) => m.Description));

document.getElementById('inspect')!.addEventListener('click', e => {
  const newModel = new Modelz(2, randInt(1, 1000), 'Juan');
  bindingContext.Bindings('Prize')!.Model = newModel;
  bindingContext.Bindings('Dezcription')!.Model = newModel;
});
