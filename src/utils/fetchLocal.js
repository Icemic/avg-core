export default function fetchLocal(url) {
  return new Promise(function (resolve) {
    resolve({
      json() {
        return new Promise(function (resolve, reject) {
          const xhr = new XMLHttpRequest();

          xhr.onload = function () {
            try {
              resolve(JSON.parse(xhr.responseText));
            } catch (e) {
              reject(e);
            }
          };
          xhr.onerror = function () {
            reject(new TypeError('Local request failed'));
          };
          xhr.open('GET', url);
          xhr.send(null);
        });
      },
      text() {
        return new Promise(function (resolve, reject) {
          const xhr = new XMLHttpRequest();

          xhr.onload = function () {
            resolve(xhr.responseText);
          };
          xhr.onerror = function () {
            reject(new TypeError('Local request failed'));
          };
          xhr.open('GET', url);
          xhr.send(null);
        });
      }
    });
  });
}
