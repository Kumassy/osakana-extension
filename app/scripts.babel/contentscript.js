'use strict';

(function () {
  const styles = `
  <style>
    .heaven-extension-rotate {
      -webkit-animation:spin 4s linear infinite;
      -moz-animation:spin 4s linear infinite;
      animation:spin 4s linear infinite;
    }
    @-moz-keyframes spin { 100% { -moz-transform: rotate(360deg); } }
    @-webkit-keyframes spin { 100% { -webkit-transform: rotate(360deg); } }
    @keyframes spin { 100% { -webkit-transform: rotate(360deg); transform:rotate(360deg); } }

    .heaven-extension-strong {
      background: tomato;
    }
  </style>
  `;
  document.querySelector('head').insertAdjacentHTML('beforeend', styles);
  Array.from(document.querySelectorAll('img')).forEach((img) => {
    img.classList.add('heaven-extension-rotate');
  });


  if (window.location.href === 'http://osakana.ailab.ics.keio.ac.jp/ranking') {
    // add bootstap class
    document.querySelector('table tr strong').parentElement.parentElement.classList.add('danger');
  }
  else if (window.location.href.match(/http:\/\/osakana.ailab.ics.keio.ac.jp\/histories\/\d+/)) {
    chrome.storage.sync.get({
      username: ''
    }, function(items) {
      let username = '';
      const table = Array.from(document.querySelector('table tbody').children);

      if (items.username === '') {
        // detect username
        const counter = {};
        table.forEach((tr) => {
          const name1 = tr.children[1].innerText;
          const name2 = tr.children[2].innerText;

          if (!counter.hasOwnProperty(name1)) {
            counter[name1] = 0;
          }
          if (!counter.hasOwnProperty(name2)) {
            counter[name2] = 0;
          }

          counter[name1]++;
          counter[name2]++;
        });
        // console.log(counter);

        Object.keys(counter).forEach(function(key,index) {
          if (counter[key] > 1) {
            username = key;
          }
        });
      } else {
        username = items.username;
      }
      console.log(items.username);
      console.log(username);

      // swap table columns so that 'username' comes to leftmost
      table.forEach((tr) => {
        const name1 = tr.children[1].innerText;
        const name2 = tr.children[2].innerText;

        if (name2 === username) {
          // need swap
          tr.children[1].innerText = name2;
          tr.children[2].innerText = name1;

          const score1 = tr.children[3].innerText;
          const score2 = tr.children[4].innerText;
          tr.children[3].innerText = score2;
          tr.children[4].innerText = score1;
        }
      });

      // highlight rows
      table.forEach((tr) => {
        const score1 = parseInt(tr.children[3].innerText);
        const score2 = parseInt(tr.children[4].innerText);

        if (score1 === score2) {
          // draw
          tr.classList.add('active');
        } else if (score1 > score2) {
          // win
          tr.classList.add('success');
        } else {
          // lose
          tr.classList.add('danger');
        }
      });
    });
  }
  else if (window.location.href.match(/http:\/\/osakana.ailab.ics.keio.ac.jp\/histories\/matches\/\d+/)) {
    chrome.storage.sync.get({
      username: ''
    }, function(items) {
      const username = items.username;
      if (items.username === '') {
        // TODO show error
        return;
      }

      let userColumn = -1;
      const headtr = document.querySelector('thead tr');
      const name1 = headtr.children[1].textContent;
      const name2 = headtr.children[2].textContent;
      if (name1 === `${username} state`) {
        userColumn = 1;
      } else if (name2 === `${username} state`) {
        userColumn = 2;
      }
      if (userColumn === -1) {
        // TODO show error
        return;
      }


      const tbody = document.querySelector('table tbody');
      const rows = Array.from(tbody.children);
      // if need swap
      if (userColumn === 2) {
        headtr.children[1].textContent = name2;
        headtr.children[2].textContent = name1;

        rows.forEach((row) => {
          const state1 = row.children[1].textContent;
          const state2 = row.children[2].textContent;

          row.children[1].textContent = state2;
          row.children[2].textContent = state1;
        });
      }

      rows.sort((a, b) => {
        const _a = parseInt(a.children[0].textContent);
        const _b = parseInt(b.children[0].textContent);

        if (_a < _b) {
          return -1;
        }
        if (_a > _b) {
          return 1;
        }
        return 0;
      });


      // update dom
      while (tbody.firstChild) {
        tbody.removeChild(tbody.firstChild);
      }
      rows.forEach((row) => {
        tbody.appendChild(row);
      });
    });
  }
})();
