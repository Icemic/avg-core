/*!
 * sayHello, print information of AVG.js to console.
 *
 * Attention: If you remove it, you agree to obtain this copy of the current or future AVG.js under AGPL 3.0.
 *
 * 警告：如果你采取任何措施从控制台移除该部分内容，AVG.js 许可将自动变为 AGPL 3.0，并视为你已同意以 AGPL 3.0 获得 AVG.js 的当前或其后续副本。
 *
 * @method sayHello
 */
/* eslint-disable */
export default function sayHello() {

  if (navigator.userAgent.toLowerCase().indexOf('chrome') > -1) {
    const args = [
      `\n %c %c %c AVG.js ${VERSION} - ✰ Setsumi ✰  %c  %c  https://avgjs.org/  %c %c 🍞🍞🍞 \n\n`,
      'background: #EFCEA1; padding:5px 0;',
      'background: #EFCEA1; padding:5px 0;',
      'color: #EFCEA1; background: #794E3E; padding:5px 0;',
      'background: #EFCEA1; padding:5px 0;',
      'background: #FFF2D2; padding:5px 0;',
      'background: #EFCEA1; padding:5px 0;',
      'color: #ff2424; background: #fff; padding:5px 0;',
      // 'color: #ff2424; background: #fff; padding:5px 0;',
      // 'color: #ff2424; background: #fff; padding:5px 0;'
    ];

    window.console.log.apply(console, args);
  } else if (window.console) {
    window.console.log(`AVG.js ${VERSION} - OpenSource - https://avgjs.org/`);
  }

    // saidHello = true;
}
