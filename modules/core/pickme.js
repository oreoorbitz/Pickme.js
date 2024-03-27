import { pipe, Maybe, tap, liftAppendChild } from '../../modules/utils/utils.js'
import frel from '../../modules/utils/frel.js'

// logError :: String -> Maybe<null>
const logError = message => {
  console.error(message)
  return Maybe.of(null)
}

const querySelector = selector => Maybe.of(document.querySelector(selector))
const createElement = tagName => Maybe.of(document.createElement(tagName))

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
    const rootMaybe = querySelector(rootSelector).orElse(() => createElement(this.tagName))

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

  component(parentComponentName, componentName, tagName, attributes, innerText) {
    const parentSelector = `[data-pickme-component="${parentComponentName}"]`
    const parentMaybe = querySelector(parentSelector)

    const childSelector = `[data-pickme-component="${componentName}"]`
    const childMaybe = querySelector(childSelector)

    const attributesMatch = childMaybe.map(element =>
      Object.entries(attributes).every(([key, value]) => element.getAttribute(key) === value)
    )
    const innerTextMatch = childMaybe.map(element => element.textContent === innerText)

    childMaybe
      .map(element => attributesMatch.val && innerTextMatch.val ? element : element.remove())
      .orElse(() => logError(`Component "${componentName}" exists but doesn't match the specified attributes and inner text.`))

    if (childMaybe.isNothing()) {
      const childElement = createElement(tagName).map(element => {
        Object.entries(attributes).forEach(([key, value]) => element.setAttribute(key, value))
        element.textContent = innerText
        return element
      })

      parentMaybe.map(parent => {
        liftAppendChild(childElement)(Maybe.of(parent))
        this.components[componentName] = childElement
      })
    }
  }

  registerEvent(eventName, handler) {
    Object.entries(this.components).forEach(([_, maybeElement]) => {
      maybeElement.map(element => element.addEventListener(eventName, handler))
    })
  }

  modify(componentName, tagName, attributes, innerText) {
    const selector = `[data-pickme-component="${componentName}"]`
    const componentMaybe = querySelector(selector)

    const attributesMatch = componentMaybe.map(element =>
      Object.entries(attributes).every(([key, value]) => element.getAttribute(key) === value)
    )
    const innerTextMatch = componentMaybe.map(element => element.textContent === innerText)

    componentMaybe
      .map(element => attributesMatch.val && innerTextMatch.val ? element : element.remove())
      .orElse(() => logError(`Component "${componentName}" exists but doesn't match the specified attributes and inner text.`))
      .orElse(() => logError(`Component "${componentName}" doesn't exist in the DOM.`))

    return this
  }

  addClass(componentName, className) {
    const selector = `[data-pickme-component="${componentName}"]`
    const componentMaybe = querySelector(selector)

    componentMaybe
      .map(element => element.classList.add(className))
      .orElse(() => logError(`Component "${componentName}" doesn't exist in the DOM.`))

    return this
  }

  innerText(componentName, text) {
    const selector = `[data-pickme-component="${componentName}"]`
    const componentMaybe = querySelector(selector)

    componentMaybe
      .map(element => element.textContent = text)
      .orElse(() => logError(`Component "${componentName}" doesn't exist in the DOM.`))

    return this
  }
}

export default Pickme