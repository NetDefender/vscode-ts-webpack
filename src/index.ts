//const image2: string = require('./image.jpg')
//import './styles.css';
//const css: string = require('./styles.css')
class Handlers {
  constructor(public context: number){
  }

  public Save() {
    this.context++;
    console.log(this.context);
  }
}

const handlers: Handlers = new Handlers(55);
handlers.Save();
const button = document.createElement('button');
button.textContent = 'Click Me!';
button.addEventListener('click', ev => handlers.Save());
document.body.appendChild(button);


class Gen<T> {
  constructor(private readonly value: T) {
  }
}

const call = (input: Gen<any>) => console.log(input);

const g = new Gen<number>(12);
call(g);
