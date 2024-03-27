import { pipe, Maybe, tap, liftAppendChild } from '../../modules/utils/utils.js'
import frel from '../../modules/utils/frel.js'

// logError :: String -> Maybe<null>
const logError = message => {
  console.error(message)
  return Maybe.of(null) // Encapsulating null to maintain chainability
}

const querySelector = selector => Maybe.of(document.querySelector(selector))
const createElement = tagName => Maybe.of(document.createElement(tagName))

class Pickme {
  constructor(namespace, tagName, attributes, innerText, eventHandlers) {
    this.namespace = namespace // The namespace to identify elements.
    this.tagName = tagName // The tag name for the root component.
    this.attributes = attributes // Initial attributes for the root component.
    this.innerText = innerText // Text content for the root component.
    this.eventHandlers = eventHandlers // Event handlers for the root component.
    this.components = {} // To store references to child components.
    this.initRootComponent() // Initialize the root component.
  }

  initRootComponent() {
    const rootSelector = `[data-pickme-component="${this.namespace}"]`
    const rootMaybe = querySelector(rootSelector).orElse(() => createElement(this.tagName))
  
    rootMaybe.map(maybeElement => {
      console.log(maybeElement.val)
      Object.entries(this.attributes).forEach(([key, value]) => {
        maybeElement.val.setAttribute(key, value)
      })
      maybeElement.val.textContent = this.innerText
      Object.entries(this.eventHandlers).forEach(([event, handler]) => {
        if (typeof handler === 'function') {
          maybeElement.val.addEventListener(event, handler)
        }
      })
      return maybeElement
    })
  
    rootMaybe.orElse(() => {
      const appElement = querySelector('#app').val
      appElement.appendChild(rootMaybe.val)
      return rootMaybe
    })
  
    this.rootElement = rootMaybe.val
  }

  // Registers a component as a child of another component.
  component(parentComponentName, componentName, tagName, attributes, innerText) {
    const parentSelector = `[data-pickme-component="${parentComponentName}"]`
    const parentMaybe = querySelector(parentSelector)
  
    const childSelector = `[data-pickme-component="${componentName}"]`
    const childMaybe = querySelector(childSelector)
  
    childMaybe.map(element => {
      console.log(element)
      const attributesMatch = Object.entries(attributes).every(([key, value]) => element.val.getAttribute(key) === value)
      const innerTextMatch = element.val.textContent === innerText
  
      if (!attributesMatch || !innerTextMatch) {
        element.val.remove()
        logError(`Component "${componentName}" exists but doesn't match the specified attributes and inner text.`)
      }
    })
  
    if (childMaybe.isNothing()) {
      const childElement = createElement(tagName).map(element => {
        Object.entries(attributes).forEach(([key, value]) => element.setAttribute(key, value))
        element.textContent = innerText
        return element
      })
  
      liftAppendChild(childElement)(parentMaybe)
      this.components[componentName] = childElement
    }
  }

  registerEvent(eventName, handler) {
    Object.entries(this.components).forEach(([componentName, maybeElement]) => {
      maybeElement.val.addEventListener(eventName, handler)
    })
  }

  // Modifies an existing component in the DOM.
  modify(componentName, tagName, attributes, innerText) {
    const selector = `[data-pickme-component="${componentName}"]`
    const componentMaybe = querySelector(selector)

    componentMaybe.map(element => {
      const attributesMatch = Object.entries(attributes).every(([key, value]) => element.getAttribute(key) === value)
      const innerTextMatch = element.textContent === innerText

      if (!attributesMatch || !innerTextMatch) {
        element.remove()
        logError(`Component "${componentName}" exists but doesn't match the specified attributes and inner text.`)
      }

      return element
    })

    if (componentMaybe.isNothing()) {
      logError(`Component "${componentName}" doesn't exist in the DOM.`)
    }

    return this // For method chaining.
  }

  // Adds a class to a component.
  addClass(componentName, className) {
    const selector = `[data-pickme-component="${componentName}"]`
    const componentMaybe = querySelector(selector)

    componentMaybe.map(element => {
      element.classList.add(className)
      return element
    })

    if (componentMaybe.isNothing()) {
      logError(`Component "${componentName}" doesn't exist in the DOM.`)
    }

    return this // For method chaining.
  }

  // Sets the innerText for a component.
  innerText(componentName, text) {
    const selector = `[data-pickme-component="${componentName}"]`
    const componentMaybe = querySelector(selector)

    componentMaybe.map(element => {
      element.textContent = text
      return element
    })

    if (componentMaybe.isNothing()) {
      logError(`Component "${componentName}" doesn't exist in the DOM.`)
    }

    return this // For method chaining.
  }
}

export default Pickme