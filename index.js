const app = require('express')();
const PORT = 3000;

let clientConnections = [];
let idx = 0;
const data = [
  'STATS',
  '==========',
  '- 4 million active educators',
  '- 2.5 million resources',
  '- 350 million dollars earned',
  '- we\'re profitable!',
  '- 2 out of 3 teachers in the US are active users',
  '',
  'TECH STACK',
  '===========',
  '- backend: NodeJS, Elixir Phoenix, PHP',
  '- frontend: React, ES6, Babel, Webpack',
  '- ops: Docker, Kubernetes, AWS, Terraform',
  '- db: RDS MySQL',
  '',
  'TEAM',
  '============',
  '- 50 engineers',
  '- super diverse',
  '- listen first',
  '- we learn continuously',
  '- mission driven',
  '',
  'CONTACT',
  '=============',
  '- email: ryan.s@teacherspayteachers.com',
  '- twitter: @tpteng',
  '- blog: engineering.teacherspayteachers.com',
  '- apply: <a target="_blank" href="https://teacherspayteachers.com/Careers">https://teacherspayteachers.com/Careers</a>'
];

app.use((req, res, next) => {
  res.writeHead(200, {
    'content-type': 'text/html',
    'transfer-encoding': 'chunked',
    connection: 'keep-alive'
  });

  res.write('<meta name="viewport" content="width=device-width, initial-scale=1">');
  res.write('<style>body { font-family: monospace }</style>');
  next();
});

app.get('/', (req, res) => {
  if (idx + 1 === data.length) {
    // TODO
    res.redirect(301, '/all');
  }

  req.on('finish', () => {
    res.end();
    // TODO:
    clientConnections.splice(clientConnections.indexOf(res));
  });

  clientConnections.push(res);

  // send data already revealed
  res.write(Array(2000).fill(' ').join('') + '<br/>');
  res.write(data.slice(0, idx).join('<br/>') + '<br/>');

  // reveal one more to all
  const lastIdx = idx++;
  clientConnections.forEach((_res) => {
    _res.write(data.slice(lastIdx, idx).join('') + '<br/>');
  });
});

app.get('/all', (req, res) => {
  res.write(data.join('<br/>'));
  res.end();
});

app.get('/reset', (req, res) => {
  idx = 0;
  clientConnections = [];
  res.write('OK');
  res.end();
});

const server = app.listen(PORT, () => {
  console.log(`Server is now listening on ${PORT}`);
});