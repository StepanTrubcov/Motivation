// One notification slot; every operation owns its result and delayed loader.
export function createNotificationController(transport, clock = {
  setTimeout: (...args) => globalThis.setTimeout(...args),
  clearTimeout: (...args) => globalThis.clearTimeout(...args),
}) {
  let revision = 0;
  let timer;
  let active = false;
  let quietUntil = 0;
  const id = 'app-notification';
  const clear = () => {
    clock.clearTimeout(timer);
    timer = undefined;
  };
  const show = (type, message) => {
    transport[type](message, {
      id,
      duration: type === 'loading' || type === 'error' ? Infinity : 1400,
      removeDelay: 250,
    });
  };
  function begin(message) {
    const ownedRevision = ++revision;
    active = true;
    clear();
    transport.remove(id);
    let settled = false;
    timer = clock.setTimeout(() => {
      if (ownedRevision === revision && !settled) show('loading', message);
    }, 300);
    const finish = (type, result) => {
      if (settled || ownedRevision !== revision) return;
      settled = true;
      active = false;
      quietUntil = type === 'error' ? Infinity : Date.now() + 1600;
      clear();
      show(type, result);
    };
    return {
      success: (result) => finish('success', result),
      error: (result) => finish('error', result),
      cancel: () => {
        if (settled || ownedRevision !== revision) return;
        settled = true;
        active = false;
        clear();
        transport.remove(id);
      },
    };
  }
  const notify = (type, message) => {
    ++revision;
    active = false;
    quietUntil = type === 'error' ? Infinity : Date.now() + 1600;
    clear();
    show(type, message);
    return id;
  };
  return {
    begin,
    success: (message) => notify('success', message),
    error: (message) => notify('error', message),
    passiveSuccess: (message) => {
      if (!active && Date.now() >= quietUntil) notify('success', message);
    },
    dismiss: () => { ++revision; active = false; quietUntil = 0; clear(); transport.dismiss(id); },
  };
}
