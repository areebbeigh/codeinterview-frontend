type Callback = (data: any) => void;

interface IEmitter {
  eventSubscibersMap: {
    [event: string]: Callback[];
  };
  emit(event: string, data: any): void;
  on(event: string, cb: Callback): void;
}

class Emitter {
  eventSubscibersMap: {
    [event: string]: Callback[];
  } = {};

  emit(event: string, data: any): void {
    try {
      const subscribers = this.eventSubscibersMap[event] || [];
      subscribers.forEach((cb: Callback) => {
        try {
          cb(data);
        } catch (err) {
          console.warn('emit warning:', err);
        }
      });
    } catch (err) {
      console.warn('emit exception:', err);
    }
  }

  on(event: string, cb: Callback): void {
    if (!(event in this.eventSubscibersMap))
      this.eventSubscibersMap[event] = [];
    if (this.eventSubscibersMap[event].indexOf(cb) === -1)
      this.eventSubscibersMap[event].push(cb);
  }
}

export default Emitter;
