
/**
 * Function to querySelect a single element
 * @param {string} string - The query string.
 * @returns {Function} A curried function that takes an element.
 */
export const query = (string) => (element) => element.querySelector(string);

/**
 * Function to querySelect multiple elements with standard data-component attribute
 * @param {string} string - The component identifier.
 * @returns {Element[]} An array of DOM elements matching the specified component.
 */

export const components = (string) =>
  Array.from(document.querySelectorAll(`[data-component-${string}]`));

export const component = (string) => (element) =>
  element.querySelector(`[data-component-${string}]`);

/**
 * Creates a listener for a specific event type on a given element.
 * @param {string} eventType - The type of event to listen for.
 * @returns {Function} A curried function that takes a callback, an element, and optional variables.
 */

const listenToElement = (eventType) => (callback) => (el, variables) => {
  if (el === undefined || el === null) {
    return;
  }
  el.addEventListener(eventType, (event) => {
    callback(el, event, variables);
  });
  return el;
};

/**
 * Creates an onClick event listener.
 */
export const onClick = listenToElement("click");

/**
 * Applies an array of functions to an array of values.
 * @param {...Function} functions - Functions to apply.
 * @returns {Function} A function that takes values and applies all functions to these values.
 */
export const mapFunctions =
  (...functions) =>
  (...value) =>
    functions.forEach((fn) => fn(...value));

/**
 * Delegates event listening to a selector within a root element.
 * @param {string} eventType - The type of event.
 * @param {Element} [root=document] - The root element to listen within.
 * @returns {Function} A curried function that takes a selector and a callback.
 */
export const delegateListen =
  (eventType, root = document) =>
  (selector) =>
  (callback) => {
    const eventListener = (event) => {
      const target = event.target.closest(selector);
      if (target) {
        callback(target, event);
      }
    };

    root.addEventListener(eventType, eventListener);

    return () => {
      root.removeEventListener(eventType, eventListener);
    };
  };

/**
 * Delegates event listening to a selector within a root element.
 * @param {string} eventType - The type of event.
 */

export const listen = (eventType) => (callback) => (el, variables) => {
  document.addEventListener(eventType, (event) => {
    callback(el, event, variables);
  });
  return el;
};

/**
 * Applies a list of functions to a list of arguments.
 * @param {...Function} fns - Functions to apply.
 * @returns {Function} A function that applies each input function to the arguments.
 */
export const juxt =
  (...fns) =>
  (...args) =>
    [...fns].map((fn) => [...args].map(fn));

/**
 * Creates a pipeline of functions to apply to a value.
 * @param {...Function} fs - Functions to pipe.
 * @returns {Function} A function that applies a series of functions to an initial value.
 */
export const pipe =
  (...fs) =>
  (x) =>
    fs.reduce((acc, f) => f(acc), x);

const map = (fn) => (m) => m.map(fn);

const chain = (fn) => (m) => m.map(fn);

const ap = (mf) => (m) => mf.ap(m);

const orElse = (val) => (m) => m.orElse(val);

const prop = (propName) => (obj) => obj == null ? undefined : obj[propName];

export class Maybe {
  constructor(val) {
    this.val = val;
  }

  static of(val) {
    return new Maybe(val);
  }

  isNothing() {
    return this.val === null || this.val === undefined;
  }

  map(fn) {
    if (this.isNothing()) {
      return this;
    }
    return Maybe.of(fn(this.val));
  }

  orElse(val) {
    if (this.isNothing()) {
      return Maybe.of(val);
    }
    return this;
  }
}
/**
 * Executes a function for its side effects and returns the original value.
 * @param {*} x - The value to pass through.
 * @param {Function} f - The side-effect function to execute.
 * @returns {*} The original value.
 */
export const tap = (x) => (f) => {
  f(x);
  return x;
};

/**
 * Creates a thunk function.
 * @param {Function} fn - The function to delay execution of.
 * @returns {Function} A thunk function.
 */
export const thunk =
  (fn) =>
  (...args) =>
  () =>
    fn(...args);

/**
 * Composes a series of functions into a single function.
 * @param {...Function} fns - The functions to compose.
 * @returns {Function} The composed function.
 */
export const compose = (...fns) =>
  fns.reduce(
    (f, g) =>
      (...args) =>
        f(g(...args))
  );

/**
 * Finds the index of a query-selected child within its parent.
 * @param {Element} el - The parent element.
 * @param {string} string - The selector string.
 * @returns {number} The index of the found element, or -1 if not found.
 */
export const indexOfQuery = (el, string) =>
  Array.prototype.indexOf.call(el.children, el.querySelector(string));

/**
 * Finds the index of an element within a NodeList or similar.
 * @param {NodeList} el - The list to search within.
 * @param {string} string - The value to find.
 * @returns {number} The index of the element, or -1 if not found.
 */
export const findIndex = (el, string) =>
  Array.prototype.findIndex.call(el, string);

/**
 * Curried function to add a class to an element.
 * @param {String} className - The element to add a class to.
 * @returns {function(HTMLElement): void} - A function that takes an HTMLElement and adds the specified class to it.
 */
export const curriedAddClass = (className) => (el) =>
  el.classList.add(className);
/**
 * Curried function to remove a class from an element.
 * @param {String} className - The element to remove a class from.
 * @returns {function(HTMLElement): void} - A function that takes an HTMLElement and removes the specified class from it.
 */
export const curriedRemoveClass = (className) => (el) =>
  el.classList.remove(className);

/**
 *
 * @param {*} el
 * @param {*} event
 */
export const bubbleEventToParent = (el, event) => {
  el.parentElement.dispatchEvent(new CustomEvent(event.type, event));
};
/**
 *
 * @param {String} event
 * @param {String} selector
 * @returns {Function} A function that takes an element and dispatches an event to the closest parent with a matching selector.
 */
export const bubleEventToCLosest = (event, selector) => (el) => {
  el.closest(selector).dispatchEvent(
    new CustomEvent(event, { bubbles: true, detail: { triggerElement: el } })
  );
};

/**
 * Sets the value of an input to the specified value.
 * @param {HTMLInputElement} el - The input element.
 * @param {string} string - The value to set the input to.
 */
export const setValue = (el, string) => {
  el.value = string;
};

/**
 * Sets the src of an image to the specified string.
 * @param {HTMLImageElement} el - The image element.
 * @param {string} string - The src to set the image to.
 */
export const setSrc = (el, string) => {
  el.src = string;
};

/**
 * Sets the inner text of an element to the specified string.
 * @param {HTMLElement} el - The element to set the inner text of.
 * @param {string} string - The text to set the element to.
 * @returns {void} - side effect only
 */
export const setText = (el, string) => {
  el.innerText = string;
};

/**
 * Sets the href of an anchor to the specified string.
 * @param {HTMLAnchorElement} el - The anchor element.
 * @param {string} string - The href to set the anchor to.
 * @returns {void} - side effect only
 */
export const setHref = (el, string) => {
  el.href = string;
};

export const setAttribute = (value) => (attribute) => (el) => {
  el.setAttribute(attribute, value);
};
