import MeaningOfLife, { sayHello } from './module'
const image2: string = require('./image.jpg')
import './styles.css';
//const css: string = require('./styles.css')
import * as image3 from './image.jpg'
console.log(image2);
console.log(image3);
const rule: HTMLElement = document.createElement('hr');
var body = document.getElementsByTagName('body')[0];
body.appendChild(rule);
console.log("hola que tal estamos");
console.log(MeaningOfLife)
sayHello('Bobby')
