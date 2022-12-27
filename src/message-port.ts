enum Context {
  host,
  iframe,
}

type RpcMethod = "getUser" | "deleteUser";

enum RpcErrorSeverity {
  warning,
  error,
}

interface User {
  idUser: number;
  name: string;
  age: number;
}
interface RpcError {
  message?: string;
  serverity: RpcErrorSeverity;
}

interface RpcParameters {
  [parameter: string]: any;
}

interface RpcPromise {
  resolve: (value: RpcResult<any> | PromiseLike<RpcResult<any>>) => void;
  reject: (value?: any) => void;
}
interface RpcMessage {
  sequence: number;
  method: RpcMethod;
  parameters: RpcParameters;
}

interface RpcResult<T> {
  sequence: number;
  result?: T;
  errors: RpcError[];
}

interface RpcMethodCallSignature {
  (message: RpcMessage): RpcResult<any>;
}
interface RpcFrameOptions {
  source: string;
  width: string;
  height: string;
}
class RpcFrame {
  private iframe?: HTMLIFrameElement;
  private isFrameLoaded: boolean;

  constructor(private options: RpcFrameOptions) {
    this.isFrameLoaded = false;
  }

  create(): RpcFrame {
    this.iframe = document.createElement("iframe");
    this.iframe.src = this.options.source;
    this.iframe.width = this.options.width;
    this.iframe.height = this.options.height;
    document.body.appendChild(this.iframe);

    return this;
  }

  public get frame() {
    return this.iframe;
  }

  public get isLoaded() {
    return this.isFrameLoaded;
  }

  public wait(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.iframe!.addEventListener("load", () =>
        this.frameLoaded(resolve, reject)
      );
    });
  }

  private frameLoaded(
    resolve: (value: boolean | PromiseLike<boolean>) => void,
    reject: (reason?: any) => void
  ) {
    this.iframe!.removeEventListener("load", () =>
      this.frameLoaded(resolve, reject)
    );
    this.isFrameLoaded = true;
    resolve(true);
  }
}
class RpcClient {
  private readonly channel: MessageChannel;
  private responses: Map<number, RpcPromise>;
  private sendPort?: MessagePort;

  constructor(private frame: RpcFrame) {
    this.channel = new MessageChannel();
    this.responses = new Map<number, RpcPromise>();
  }

  connect(): RpcClient {
    if (!this.frame.isLoaded) {
      throw Error("Frame is not loaded!");
    }

    this.channel.port1.onmessage = (event: MessageEvent<any>) =>
      this.response(event);

    return this;
  }

  call(message: RpcMessage): Promise<RpcResult<any>> {
    const promise = new Promise<RpcResult<any>>((resolve, reject) => {
      this.responses.set(message.sequence, { resolve, reject });
    });
    if (!this.sendPort) {
      this.sendPort = this.channel.port1;
      this.frame.frame?.contentWindow?.postMessage(message, "*", [
        this.channel.port2,
      ]);
    } else {
      this.sendPort?.postMessage(message);
    }

    return promise;
  }

  response(event: MessageEvent<any>): void {
    console.log("Message received in Host");
    const result = event.data as RpcResult<any>;
    const promise = this.responses.get(result.sequence);
    this.responses.delete(result.sequence);
    promise!.resolve(result);
    console.log(event.data);
  }
}

class RpcServerOptions {}
class RpcServer {
  private isStarted = false;
  private methods: Map<RpcMethod, RpcMethodCallSignature> = new Map<
    RpcMethod,
    RpcMethodCallSignature
  >();
  private responsePort?: MessagePort;

  constructor(private options: RpcServerOptions) {}

  start(): RpcServer {
    if (this.isStarted) {
      throw new Error("Server is already started");
    }
    this.registerMethods();
    window.addEventListener("message", e => this.processMessage(e));
    return this;
  }

  registerMethods(): RpcServer {
    this.methods.set("getUser", message =>
      this.wrapResult(message, () =>
        new UserService().getUser(
          new Number(message.parameters["idUser"]).valueOf()
        )
      )
    );
    this.methods.set("deleteUser", message =>
      this.wrapResult<void>(message, () =>
        new UserService().deleteUser(
          new Number(message.parameters["idUser"]).valueOf()
        )
      )
    );
    return this;
  }

  wrapResult<T>(message: RpcMessage, valueResolver: () => T): RpcResult<T> {
    try {
      return {
        sequence: message.sequence,
        result: valueResolver(),
        errors: [],
      };
    } catch (e) {
      return {
        sequence: message.sequence,
        errors: [
          {
            serverity: RpcErrorSeverity.error,
            message: (e as Error)?.message,
          },
        ],
      };
    }
  }

  processMessage(e: MessageEvent<any>) {
    const message = e.data as RpcMessage;
    if (message && message.method && message.sequence) {
      const result = this.invokeMethod(message);
      if (!this.responsePort && e.ports.length > 0) {
        this.responsePort = e.ports[0];
        this.responsePort.onmessage = e => this.processMessage(e);
      }
      this.responsePort?.postMessage(result);
    }
  }

  stop(): RpcServer {
    return this;
  }

  invokeMethod(message: RpcMessage): RpcResult<any> {
    const invocation = this.methods.get(message.method);
    if (!invocation) {
      return {
        sequence: message.sequence,
        errors: [
          {
            serverity: RpcErrorSeverity.error,
            message: "Cant get the method " + (message.method ?? "undefined"),
          },
        ],
      };
    }

    return invocation(message);
  }
}

class UserService {
  public getUser(idUser: number): User {
    return {
      idUser,
      name: "Daniel",
      age: Math.ceil(Math.random() * 100),
    };
  }

  public deleteUser(idUser: number) {
    console.log("User %d deleted", idUser);
  }
}

async function bootStrap() {
  let context = Context.iframe;
  const contextValue: any = document
    .querySelector('meta[name="context"]')
    ?.getAttribute("content")
    ?.valueOf();
  if (contextValue) {
    context = Context[contextValue as keyof typeof Context];
  }

  if (context == Context.host) {
    await startHost();
  } else {
    await startIframe();
  }
}

bootStrap();

async function startHost() {
  const frame = new RpcFrame({
    source: "sideBar.html",
    width: "100px",
    height: "100px",
  }).create();

  await frame.wait();

  const rpc = new RpcClient(frame).connect();

  let result = await rpc.call({
    sequence: 1,
    method: "getUser",
    parameters: {
      idUser: 100,
    },
  });

  console.log(result);

  result = await rpc.call({
    sequence: 2,
    method: "getUser",
    parameters: {
      idUser: 101,
    },
  });

  console.log(result);
}

async function startIframe() {
  const rpcServer = new RpcServer({}).start();

  // const getUserResponse = rpcServer.invokeMethod('getUser', {
  //   'idUser': 1
  // })
  // console.log(getUserResponse);

  // const deleteUserResponse = rpcServer.invokeMethod('deleteUser', {
  //   'idUser': 1
  // })
  //console.log(deleteUserResponse);
  console.log("Server started");
}
