import Pickme from './modules/core/pickme.js'

const onClickHandler = (pickMeElement, event) => {
  console.log('Clicked');
}

let pickMeInstance = new Pickme('app', 'div', { class: 'example' }, 'Some text', { onClick: onClickHandler });
pickMeInstance.component('example', 'example-child', 'div', { class: 'example-child' }, 'Child content');
pickMeInstance.registerEvent('onClick', onClickHandler);
// pickMeInstance.modify('example', 'example-child', 'div', { class: 'example-child-modified' }, 'Modified child content').addClass('second-example-class').innerText('Updated child Example innertext');
