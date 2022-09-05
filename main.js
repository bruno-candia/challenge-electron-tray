const { resolve, basename } = require('path');
const {
  app, Menu, Tray, dialog, MenuItem, shell,
} = require('electron');
const Store = require('electron-store');
const { spawn } = require('child_process');
const Sentry = require('@sentry/electron');
// const fixPath = require('fix-path');

// fixPath();

Sentry.init({ dsn: 'https://ea5b377ae04142fd8d1a898646e88860@o1395043.ingest.sentry.io/6717501' });

const schema = {
  projects: {
    type: 'string',

  },
};

const store = new Store({ schema });

// store.clear();

let tray = null;

function render() {
  // if (!tray.isDestroyed()) {
  //   tray.destroy();
  //   tray = new Tray(resolve(__dirname, 'assets', 'iconTemplate.png'));
  // }

  const storedProjects = store.get('projects');
  const projects = storedProjects ? JSON.parse(storedProjects) : [];
  const items = projects.map((project) => ({
    label: project.name,
    submenu: [
      {
        label: 'Abrir Pasta',
        click: () => {
          spawn('explorer', [project.path], {
            cwd: process.cwd(),
            env: {
              PATH: process.env.PATH,
            },
            stdio: 'inherit',
          });
          // shell.openExternal(`start ${project.path}`);
          // spawn('explorer', [project.path], { stdio: 'inherit' });
        },
      },
      {
        label: 'Abrir com VS Code',
        click: () => {
          spawn('code', [project.path], {
            cwd: process.cwd(),
            env: {
              PATH: process.env.PATH,
            },
            stdio: 'inherit',
          });
          // shell.openExternal(`start ${project.path}`);
          // spawn('explorer', [project.path], { stdio: 'inherit' });
        },
      },
      {
        label: 'Remover',
        click: () => {
          store.set('projects', JSON.stringify(projects.filter((item) => item.path !== project.path)));
          render();
        },
      },
    ],

  }));

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Adicionar novo pasta...',
      click: async () => {
        const pathName = await dialog.showOpenDialog({ properties: ['openDirectory'] });
        if (!pathName) return;
        const name = basename(pathName.filePaths[0]);
        const path = pathName.filePaths[0];

        store.set('projects', JSON.stringify([...projects, {
          path,
          name,
        }]));

        render();
      },
    },
    {
      type: 'separator',
    },
    ...items,
    {
      type: 'separator',
    },
    {
      type: 'normal',
      label: 'Fechar Code Tray',
      role: 'quit',
      enabled: true,
    },
  ]);
  tray.setContextMenu(contextMenu);
}

app.on('ready', () => {
  tray = new Tray(resolve(__dirname, 'assets', 'iconTemplate.png'));
  render();
});
