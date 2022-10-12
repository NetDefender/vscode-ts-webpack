const worker = new Worker(new URL('./background-worker.ts', import.meta.url));

worker.addEventListener('message', (ev: MessageEvent<any>) => {
  const response = ev.data;
  console.log(response.id, response.message);
});

