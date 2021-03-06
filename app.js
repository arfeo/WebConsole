const globals = {
  // App settings
  domain: 'WebConsole',
  api: 'api.php',

  // Commands history & current history position
  history: [],
  x: 0,

  // App styles
  backgroundColor: 'black',
  textColor: '#f0f0f0',
  fontSize: '14px',
  fontWeight: '100',
};

const apiData = (file, data) => {
  return new Promise((resolve, reject) => {
    const params = Object.entries(data).map(([key, val]) => `${key}=${val}`).join('&');
    const xhr = new XMLHttpRequest();

    xhr.overrideMimeType('application/json');
    xhr.open('GET', `${file}?${params}`, true);

    xhr.onload = function () {
      if (this.readyState === 4) {
        if (this.status >= 200 && this.status < 300) {
          resolve(xhr.responseText);
        } else {
          reject(xhr.statusText);
        }
      }
    };

    xhr.onerror = function () {
      reject(xhr.statusText);
    };

    xhr.send();
  });
};

const getCommands = () => JSON.parse(window.localStorage.getItem('WebConsole_saved_commands'));

const saveCommand = (cmd) => {
  let b = getCommands() || [];

  try {
    b.push(cmd);
    window.localStorage.setItem('WebConsole_saved_commands', JSON.stringify(b));
  } catch (err) {
    console.error(err);
  }
};

const createNewInput = () => {
  const c = document.getElementById('console');

  // Append a new input to the console
  c.insertAdjacentHTML('beforeend', `${globals.domain}:~$ <span id="command" contenteditable="true"></span>`);

  const command = document.getElementById('command');

  // Set focus on the input
  command.focus();

  // Remove formatting from the input on paste event
  command.addEventListener('paste', (e) => {
    e.preventDefault();
    document.execCommand('insertHTML', false, e.clipboardData.getData('text/plain'));
  });
};

const setCaretToTheEnd = (el) => {
  const range = document.createRange();
  const sel = window.getSelection();

  if (el.childNodes.length > 0) {
    range.setStart(el.childNodes[0], el.innerHTML.length);
    range.collapse(true);
    sel.removeAllRanges();
    sel.addRange(range);
  }
};

const executeCommand = async (cmd) => {
  const c = document.getElementById('console');
  const command = document.getElementById('command');
  let response = '\n';

  // Request response via api
  if (cmd.length > 0 && cmd !== '<br>') {
    response += `${await apiData(globals.api, { q: cmd })}\n`;
    saveCommand(cmd);
  }

  // Remove the current input
  if (cmd !== '<br>') {
    c.insertBefore(document.createTextNode(command.innerHTML), command);
  }
  command.remove();

  // Output api response
  c.insertAdjacentHTML('beforeend', response);

  createNewInput();

  // Update commands history
  globals.history = getCommands();

  // Set current history position
  globals.x = globals.history ? globals.history.length : 0;

  // Keep the current input visible when scrolled to the bottom of page
  window.scrollTo(0, 99999999);
};

window.onload = async () => {
  const c = document.getElementById('console');
  const title = document.getElementsByTagName('title')[0];
  const date = await apiData(globals.api, { q: 'date' });
  const ip = await apiData(globals.api, { q: 'ip' });

  // Apply app styles
  document.body.style.backgroundColor = globals.backgroundColor;
  document.body.style.color = globals.textColor;
  c.style.fontSize = globals.fontSize;
  c.style.fontWeight = globals.fontWeight;

  // Load commands history
  globals.history = getCommands();

  // Set current history position
  globals.x = globals.history ? globals.history.length : 0;

  // Set page title
  title.appendChild(document.createTextNode(globals.domain));

  // Print welcome message on window load
  c.innerHTML = `Welcome to ${globals.domain}\nLast login: ${date} from ${ip}\n\n`;

  createNewInput();

  setTimeout(() => {
    // Handle keydown events
    document.addEventListener('keydown', async (e) => {
      const command = document.getElementById('command');

      if (e.key === 'Enter') {
        e.preventDefault();
        await executeCommand(command.innerHTML);
      }

      if (e.key === 'ArrowUp' || e.key === 'Up') {
        e.preventDefault();

        if (globals.x > 0) {
          globals.x -= 1;
          command.innerHTML = globals.history[globals.x];
          setCaretToTheEnd(command);
        }
      }

      if (e.key === 'ArrowDown' || e.key === 'Down') {
        e.preventDefault();

        if (globals.history && globals.x < globals.history.length) {
          globals.x += 1;
          command.innerHTML = globals.history[globals.x] || '';
          setCaretToTheEnd(command);
        }
      }
    });
  }, 0);
};

window.onclick = () => {
  const command = document.getElementById('command');

  // When clicking inside the window, do not lose focus off the current input
  command.focus();
};
