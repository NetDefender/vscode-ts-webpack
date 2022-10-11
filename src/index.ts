//const image2: string = require('./image.jpg')
//import './styles.css';
//const css: string = require('./styles.css')
const worker = new Worker(new URL('./backgroundWorker.ts', import.meta.url));

worker.addEventListener('message', (ev: MessageEvent<any>) => {
  const response = ev.data;
  console.log(response.id, response.message);
});

