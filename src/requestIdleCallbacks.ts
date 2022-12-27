type Task = { id: number; handler: (value: number) => number; payload: number };
type TaskResult = { id: number; payload: number; result: number };

const progress = document.querySelector(".progress-bar") as HTMLDivElement;
const button = document.querySelector(".action-button") as HTMLButtonElement;
const tasks: Task[] = [];
const tasksCompleted: TaskResult[] = [];
let taskId = 1;
const taskLength = 100000;

const work = (value: number): number => {
  let r = 0;
  for (let i = 0; i < value; i++) {
    r = r % i;
    r = r ^ r;
    r = r % i;
    r = r ^ r;
    r = r % i;
    r = r ^ r;
    r = r % i;
    r = r ^ r;
    r = r % i;
    r = r ^ r;
  }
  return r;
};

const refresh = (tick: number) => {
  const percentage = (tasksCompleted.length / taskLength) * 100;
  progress.style.width = `${percentage}%`;
  progress.textContent = `${tasksCompleted.length}`;
  if (tasksCompleted.length === taskLength) {
    button.disabled = false;
  }
};

const mainLoop = (deadline: IdleDeadline) => {
  while (deadline.timeRemaining() > 0 && tasks.length > 0) {
    const task = tasks.shift();
    if (task) {
      const result = task.handler(task.payload);
      tasksCompleted.push({
        id: task.id,
        payload: task.payload,
        result: result,
      });
      requestAnimationFrame(refresh);
    }
  }
  if (tasks.length > 0) {
    requestIdleCallback(mainLoop);
  }
};

button.addEventListener("click", e => {
  button.disabled = true;
  tasksCompleted.length = 0;
  for (let i = 0; i < taskLength; i++) {
    tasks.push({ id: taskId++, handler: work, payload: 100 });
  }
  requestIdleCallback(mainLoop);
  const style = getComputedStyle(button);
  console.log(style.width);
});
