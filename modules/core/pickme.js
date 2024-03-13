import {
  Maybe,
  pipe,
  query,
  component,
  tap,
} from "../../modules/utils/utils.js";
import frel from "../../modules/utils/frel.js";

const createNewComponent = (
  parentComponent,
  componentId,
  tagName,
  attributes
) => {
  const newComponent = frel(tagName, attributes);
  newComponent.setAttribute(`data-component-${componentId}`, "");
  parentComponent.appendChild(newComponent);
  return newComponent;
};

const replaceComponent = (
  targetComponent,
  componentId,
  tagName,
  attributes
) => {
  const newComponent = frel(tagName, attributes);
  newComponent.setAttribute(`data-component-${componentId}`, "");
  targetComponent.replaceWith(newComponent);
  return newComponent;
};

const setAttributes = (targetComponent, attributes) =>
  Object.entries(attributes).forEach(([attr, value]) => {
    targetComponent[attr] = value;
  });

const cacheComponent = (
  instance,
  parentComponentId,
  parentComponent,
  componentId,
  component
) => {
  if (!instance.componentTree[parentComponentId]) {
    instance.componentTree[parentComponentId] = parentComponent;
  }
  instance.componentTree[`${parentComponentId}-${componentId}`] = component;
  return component;
};

class pickMe {
  constructor(mainQueryString) {
    this.mainQueryString = mainQueryString;
    this.componentTree = {};
  }

  init() {
    console.log("pickMe initialized");

    // Process main query string
    const mainElement = document.querySelector(this.mainQueryString);
    if (!mainElement) {
      throw new Error(
        `Main element not found with query: ${this.mainQueryString}`
      );
    }

    // Set as main parent element
    this.mainComponent = mainElement;
  }

  component(parentComponentId, componentId, tagName, attributes = {}) {
    const parentComponent = Maybe.of(
      this.componentTree[parentComponentId]
    ).orElse(document.body);
    const componentQuery = component(componentId);

    return pipe(
      componentQuery,
      (targetComponent) =>
        Maybe.of(targetComponent)
          .map((targetComponent) =>
            targetComponent.tagName.toLowerCase() === tagName
              ? setAttributes(targetComponent, attributes) || targetComponent
              : replaceComponent(
                  targetComponent,
                  componentId,
                  tagName,
                  attributes
                )
          )
          .orElse(
            createNewComponent(
              parentComponent.val,
              componentId,
              tagName,
              attributes
            )
          )
          .map((component) => {
            cacheComponent(this, parentComponentId, parentComponent.val, componentId, component); 
            return component; // Ensure something is returned from map 
        }).val
    )(parentComponent.val);
  }
}

export default pickMe;
