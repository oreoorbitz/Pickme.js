import { components, setValue, setText, setHref } from './assets/utils.js'; // Adjust the import path as necessary

// Mocking document.querySelectorAll to test `components`
describe('components', () => {
  it('should return an array of elements matching the specified component', () => {
    document.body.innerHTML = `
      <div data-component-test="1"></div>
      <div data-component-test="2"></div>
    `;

    const testComponents = components('test');
    expect(testComponents.length).toBe(2);
    expect(testComponents[0]).toBeInstanceOf(Element);
    expect(testComponents[0].dataset.componentTest).toBe('1');
  });
});

// Testing setValue
describe('setValue', () => {
  it('should set the value of an input element', () => {
    document.body.innerHTML = `<input id="testInput" />`;
    const input = document.getElementById('testInput');
    setValue(input, 'test value');
    expect(input.value).toBe('test value');
  });
});

// Testing setText
describe('setText', () => {
  it('should set the inner text of an element', () => {
    document.body.innerHTML = `<div id="testDiv"></div>`;
    const div = document.getElementById('testDiv');
    setText(div, 'test text');
    expect(div.innerText).toBe('test text');
  });
});

// Testing setHref
describe('setHref', () => {
  it('should set the href of an anchor element', () => {
    document.body.innerHTML = `<a id="testAnchor"></a>`;
    const anchor = document.getElementById('testAnchor');
    setHref(anchor, 'https://example.com');
    expect(anchor.href).toBe('https://example.com/');
  });
});