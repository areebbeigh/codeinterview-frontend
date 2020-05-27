class Emitter {
  eventSubscibersMap = {};

  emit(event, data) {
    try {
      const subscribers = this.eventSubscibersMap[event] || [];
      subscribers.forEach(cb => {
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

  on(event, cb) {
    if (!(event in this.eventSubscibersMap))
      this.eventSubscibersMap[event] = [];
    if (this.eventSubscibersMap[event].indexOf(cb) === -1)
      this.eventSubscibersMap[event].push(cb);
  }
}

export default Emitter;
