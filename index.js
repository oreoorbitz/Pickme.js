import Pickme from './modules/core/pickme.js'

const onClickHandler = (pickMeElement, event) => {
  console.log('Clicked')
}

let pickMeInstance = new Pickme(
  'app',
  'div',
  { class: 'example' },
  'Some text',
  { onClick: onClickHandler }
)
pickMeInstance.component(
  'app',
  'example-child',
  'div',
  { class: 'example-child' },
  'Child content'
)

pickMeInstance.registerEvent(
  'app',
  'example-child',
  'div',
  { class: 'example-child' },
  'Child content',
  { click: onClickHandler }
)

pickMeInstance
  .modify(
    'app',
    'example-child',
    'div',
    { class: 'example-child' },
    'Child content'
  )
  .addClass('second-example-class')
  .setInnerText('test')
