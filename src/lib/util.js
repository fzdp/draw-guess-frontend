function generateRandomId() {
  return Math.random().toString(36).substr(2, 9);
}

function debounce(func, timeout) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      func.apply(this, args);
    }, timeout);
  }
}

function debounce_leading(func, timeout) {
  let timer;
  return (...args) => {
    if (!timer) {
      func.apply(this, args);
    }
    clearTimeout(timer);
    timer = setTimeout(() => {
      timer = undefined;
    }, timeout)
  }
}

export {generateRandomId, debounce, debounce_leading};
