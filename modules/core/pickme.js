class Maybe {
  constructor(val) {
    this.val = val
  }

  static of(val) {
    return new Maybe(val)
  }

  isNothing() {
    return this.val === null || this.val === undefined
  }

  map(fn) {
    if (this.isNothing()) {
      return this
    }
    return Maybe.of(fn(this.val))
  }

  filter(predicate) {
    if (this.isNothing() || !predicate(this.val)) {
      return Maybe.of(null)
    }
    return this
  }

  orElse(fallbackFn) {
    if (this.isNothing()) {
      return Maybe.of(fallbackFn())
    }
    return this
  }
}

/**
 * 
 * @param {*} element 
 * @param {*} eventName 
 * @param {*} selector 
 * @param {*} handler 
 */
const delegate = (element, eventName, selector, handler) => {
  element.addEventListener(eventName, event => {
    const target = event.target.closest(selector)
    if (target) {
      handler.call(target, event)
    }
  })
}


// logError :: String -> Maybe<null>
const logError = message => {
  console.error(message)
  return Maybe.of(null)
}

const querySelector = selector => Maybe.of(document.querySelector(selector))
const createElement = tagName => Maybe.of(document.createElement(tagName))
const isElement = element => element instanceof Element
const hasAddEventListener = element =>
  typeof element.addEventListener === 'function'
const maybeAddEventListener = (element, eventName, handler) =>
  Maybe.of(element)
    .filter(isElement)
    .filter(hasAddEventListener)
    .map(element => {
      element.addEventListener(eventName, handler)
      console.log(element, eventName, handler)
      return element
    })
    .orElse(() => logError(`Unable to add event listener to element.`))

class Pickme {
    /**
   * Creates an instance of the Pickme class.
   * @param {string} namespace - The namespace for the root component.
   * @param {string} tagName - The tag name for the root component.
   * @param {Object} attributes - The attributes for the root component.
   * @param {string} innerText - The initial inner text for the root component.
   * @param {Object} eventHandlers - The event handlers for the root component.
   */
  constructor(namespace, tagName, attributes, innerText, eventHandlers) {
    this.namespace = namespace
    this.tagName = tagName
    this.attributes = attributes
    this.innerText = innerText
    this.eventHandlers = eventHandlers
    this.components = {}
    this.initRootComponent()
  }

  initRootComponent() {
    const rootSelector = `[data-pickme-component="${this.namespace}"]`
    const rootMaybe = querySelector(rootSelector).orElse(() =>
      createElement(this.tagName)
    )

    this.rootElement = rootMaybe
      .map(element => {
        Object.entries(this.attributes).forEach(([key, value]) => {
          element.setAttribute(key, value)
        })
        element.textContent = this.innerText
        Object.entries(this.eventHandlers).forEach(([event, handler]) => {
          if (typeof handler === 'function') {
            element.addEventListener(event, handler)
          }
        })
        return element
      })
      .orElse(() => {
        const appElement = querySelector('#app')
        return appElement.map(app => {
          app.appendChild(rootMaybe.val)
          return rootMaybe.val
        })
      })
  }

    /**
   * Creates a new component as a child of the specified parent component.
   * @param {string} parentComponentName - The name of the parent component.
   * @param {string} componentName - The name of the new component.
   * @param {string} tagName - The tag name for the new component.
   * @param {Object} attributes - The attributes for the new component.
   * @param {string} innerText - The inner text for the new component.
   */
  component(
    parentComponentName,
    componentName,
    tagName,
    attributes,
    innerText
  ) {
    const parentSelector = `[data-pickme-component="${parentComponentName}"]`
    const parentMaybe = querySelector(parentSelector)

    // Check if the parent component exists. If not, log an error and exit the method early.
    if (parentMaybe.isNothing()) {
      logError(`Parent component "${parentComponentName}" does not exist.`)
      return // Exit early as the parent does not exist
    }

    // Proceed with checking or creating the child component only if the parent exists
    const childSelector = `[data-pickme-component="${componentName}"]`
    const childMaybe = querySelector(childSelector)

    childMaybe
      .map(element => {
        // Check if the existing child matches the specified attributes and innerText
        const attributesMatch = Object.entries(attributes).every(
          ([key, value]) => element.getAttribute(key) === value
        )
        const innerTextMatch = element.textContent === innerText

        // If matches, do nothing. If not, remove the existing element and log an error
        if (!attributesMatch || !innerTextMatch) {
          element.remove()
          logError(
            `Component "${componentName}" exists but doesn't match the specified attributes and inner text.`
          )
        }
      })
      .orElse(() => {
        // If the child component does not exist, create and append it to the parent
        const childElement = document.createElement(tagName)
        Object.entries(attributes).forEach(([key, value]) =>
          childElement.setAttribute(key, value)
        )
        childElement.textContent = innerText
        parentMaybe.map(parent => parent.appendChild(childElement)) // Append the new child to the found parent

        // Optionally, add data-pickme-component attribute for consistency and future reference
        childElement.setAttribute('data-pickme-component', componentName)

        // Save the child component for future operations
        this.components[componentName] = childElement
      })
  }

  /**
    * Registers an event for the specified component.
    * @param {string} parentComponentName - The name of the parent component.
    * @param {string} componentName - The name of the component to register the event for.
    * @param {string} tagName - The tag name for the component.
    * @param {Object} attributes - The attributes for the component.
    * @param {string} innerText - The inner text for the component.
    * @param {Object} eventHandlers - The event handlers for the component.
  */
  registerEvent(parentComponentName, componentName, tagName, attributes, innerText, eventHandlers) {
    const childSelector = `[data-pickme-component="${parentComponentName}"] [data-pickme-component="${componentName}"]`
    const childElement = document.querySelector(childSelector)
  
    if (childElement) {
      const tagNameMatch = childElement.tagName.toLowerCase() === tagName.toLowerCase()
      const attributesMatch = Object.entries(attributes).every(([key, value]) => childElement.getAttribute(key) === value)
      const innerTextMatch = childElement.textContent === innerText
  
      if (tagNameMatch && attributesMatch && innerTextMatch) {
        Object.entries(eventHandlers).forEach(([eventName, handler]) => {
          maybeAddEventListener(childElement, eventName, handler)
            .orElse(() => logError(`Unable to add event listener "${eventName}" to component "${componentName}".`))
        })
      } else {
        logError(`Component "${componentName}" found, but it doesn't match the specified tagName, attributes, or innerText.`)
      }
    } else {
      logError(`Component "${componentName}" not found. Unable to register event.`)
    }
  }
    /**
   * Modifies an existing component with the specified properties.
   * @param {string} parentComponentName - The name of the parent component.
   * @param {string} componentName - The name of the component to modify.
   * @param {string} tagName - The tag name for the component.
   * @param {Object} attributes - The attributes for the component.
   * @param {string} innerText - The inner text for the component.
   * @returns {Pickme} The Pickme instance for method chaining.
  */
  modify(parentComponentName, componentName, tagName, attributes, innerText) {
    const childSelector = `[data-pickme-component="${parentComponentName}"] [data-pickme-component="${componentName}"]`
    const childMaybe = querySelector(childSelector)
    console
    childMaybe
      .map(element => {
        const tagNameMatch =
          element.tagName.toLowerCase() === tagName.toLowerCase()
        const attributesMatch = Object.entries(attributes).every(
          ([key, value]) => element.getAttribute(key) === value
        )
        const innerTextMatch = element.textContent === innerText
        if (tagNameMatch && attributesMatch && innerTextMatch) {
          this.components[componentName] = element
          return element
        } else {
          console.log(
            `Element ${componentName} doesn't match the specified criteria:`
          )
          if (!tagNameMatch) {
            console.log(
              `  - Expected tagName: ${tagName}, Actual tagName: ${element.tagName}`
            )
          }
          if (!attributesMatch) {
            console.log(`  - Expected attributes:`, {
              ...attributes,
              'data-pickme-component': componentName,
            })
            console.log(`  - Actual attributes:`, element.attributes)
          }
          if (!innerTextMatch) {
            console.log(
              `  - Expected innerText: ${innerText}, Actual innerText: ${element.textContent}`
            )
          }
          element.remove()
          return logError(
            `Component "${componentName}" exists but doesn't match the specified tagName, attributes, or inner text. It has been deleted.`
          )
        }
      })
      .orElse(() =>
        logError(`Component "${componentName}" doesn't exist in the DOM.`)
      )

    return this
  }

  /**
   * Adds a CSS class to the last modified component.
   * @param {string} className - The CSS class to add.
   * @returns {Pickme} The Pickme instance for method chaining.
  */
  addClass(className) {
    const componentName = Object.keys(this.components).pop()
    const componentMaybe = Maybe.of(this.components[componentName])

    componentMaybe
      .map(element => {
        element.classList.add(className)
        return element
      })
      .orElse(() =>
        logError(
          `Component "${componentName}" doesn't exist in the components.`
        )
      )
    console.log(this)
    return this
  }

  /**
   * Sets the inner text of the last modified component.
   * @param {string} text - The inner text to set.
   * @returns {Pickme} The Pickme instance for method chaining.
   */
  setInnerText(text) {
    const componentName = Object.keys(this.components).pop()
    const componentMaybe = Maybe.of(this.components[componentName])

    componentMaybe
      .map(element => {
        element.textContent = text
        return element
      })
      .orElse(() =>
        logError(
          `Component "${componentName}" doesn't exist in the components.`
        )
      )

    return this
  }
}

export default Pickme
