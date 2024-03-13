const isNodeString = 'isNode';

const isType = (object, type) => typeof object === type;

const appendChild = (element, child) => {
    if (child !== null) {
        if (Array.isArray(child)) {
            child.map(subChild => appendChild(element, subChild));
        } else {
            if (!frel[isNodeString](child)) {
                child = document.createTextNode(child);
            }
            element.appendChild(child);
        }
    }
};

const setAttributes = (element, attributes) => {
    for (const key in attributes) {
        const attribute = attributes[key];
        const mappedKey = frel.attrMap[key] || key;
        if (isType(mappedKey, 'function')) {
            mappedKey(element, attribute);
        } else if (isType(attribute, 'function')) {
            element[key] = attribute;
        } else {
            element.setAttribute(key, attribute);
        }
    }
};

function frel(element, settings, ...children) {
    element = frel.isElement(element) ? element : document.createElement(element);

    if (isType(settings, 'object') && !frel[isNodeString](settings) && !Array.isArray(settings)) {
        setAttributes(element, settings);
    } else {
        children = [settings].concat(children);
    }

    children.forEach(child => appendChild(element, child));

    return element;
}

frel.attrMap = {};
frel.isElement = object => object instanceof Element;
frel[isNodeString] = node => node instanceof Node;
if (typeof Proxy != "undefined") {
    frel.proxy = new Proxy(frel, {
        get: (target, key) => {
            !(key in frel) && (frel[key] = frel.bind(null, key));
            return frel[key];
        }
    });
}

export default frel;