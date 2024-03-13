import pickMe from './modules/core/pickme.js'

const pickMeInstance = new pickMe('#app')
pickMeInstance.init()
pickMeInstance.component('main', 'nav', 'nav', { id: 'main-nav' });
pickMeInstance.component('nav', 'link', 'a', { href: '#home' });


console.log(pickMeInstance.componentTree)