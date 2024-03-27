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
      return element
    })
    .orElse(() => logError(`Unable to add event listener to element.`))

class Pickme {
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

  registerEvent(eventName, handler) {
    Object.values(this.components).forEach(element => {
      maybeAddEventListener(element, eventName, handler).orElse(() =>
        logError(`Unable to add event listener to component.`)
      )
    })
  }

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
