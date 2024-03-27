import Pickme from './modules/core/pickme.js'

const onClickHandler = instance => event => {
  console.log('Clicked', { event, instance })
  instance
    .modify(
      'app',
      'example-child',
      'div',
      { class: 'example-child second-example-class' },
      'test'
    )
    .addClass('third-example-class')
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
