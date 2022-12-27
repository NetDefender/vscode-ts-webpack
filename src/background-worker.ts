let id: number = 0;

self.setInterval(() => {
  id++;

  const message = {
    id: id,
    message: "Message sent at " + Date.now(),
  };

  postMessage(message);
}, 2000);
