const app = require('express')();
const PORT = 3000;
const BR = '<br />';

const apple = `
<div style="margin: 100px auto; width: 400px;">
<pre>
                       ttttt
     tt                ttttt                 tt
    tppt      ttttttt  ttttt   tttttt       tppt
  t  tpt  tttt          tttt          tttt  tpt  t
   ttt   pt              tt              tp   ttt
      ttpt                                tptt
       tpt                                tpt
        pt                                tp
        tt                                tt
         pt                              tp
          tt                            tt
           tt                          tt
             tt                      tt
               tt                  tt
                 ttt    t  t    ttt
                    tttt    tttt

                      WELCOME!

                Teachers Pay Teachers
</pre>
<h1 style="text-align: center">http://bkjs.tpt.life</h1>
</div>
`;

/**
 * a lil helper object to abstract the stats getters
 */
const data = (() => {
  let idx = 0;
  const stats = [
    'STATS',
    '==========',
    '- 4 million active educators',
    '- 2.7 million resources',
    '- Over $100 million dollars earned by Teachers Authors in the last year',
    '- we\'re profitable!',
    '- 2 out of 3 teachers in the US used a resource from TpT in the last year',
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
    '- 45 engineers',
    '- super diverse',
    '- listen first',
    '- we learn continuously',
    '- mission driven',
    '',
    'CONTACT',
    '=============',
    '- email: <a target="_blank" href="mailto:ryan.s@teacherspayteachers.com">ryan.s@teacherspayteachers.com</a>',
    '- twitter: <a target="_blank" href="https://twitter.com/tpteng">@tpteng</a>',
    '- blog: <a target="_blank" href="http://engineering.teacherspayteachers.com">engineering.teacherspayteachers.com</a>',
    '- apply: <a target="_blank" href="https://teacherspayteachers.com/Careers">teacherspayteachers.com/Careers</a>',
    '- this code: <a target="_blank" href="https://github.com/TeachersPayTeachers/bkjs">TpT bkjk</a>'
  ];

  return {
    next: () => stats.slice(idx, ++idx),
    agg: () => stats.slice(0, idx),
    all: () => stats,
    reset: () => idx = 0,
    isDone: () => stats.length <= idx
  };
})();

/**
 * keep track of all open client connections so we can broadcast as data is
 * revealed
 */
const connectionPool = new Map();

app.use((req, res, next) => {
  res.writeHead(200, {
    'content-type': 'text/html',
    'transfer-encoding': 'chunked',
    connection: 'keep-alive'
  });

  res.write('<head>');
  res.write('<meta name="viewport" content="width=device-width, initial-scale=1">');
  res.write('<style>body { font-family: monospace }</style>');

  // browser needs ~1k to start flushing
  res.write(new Buffer(Array(1e3).fill('')));
  res.write('</head>');
  next();
});

const introConnectionPool = new Map();

app.get('/intro', (req, res) => {
  res.write(apple);
  introConnectionPool.set(res);
});

app.get('/', (req, res) => {
  connectionPool.set(res);

  introConnectionPool.forEach((_, _res) => {
    _res.write('<script>window.location = "/"</script>');
    _res.end();
    introConnectionPool.delete(_res);
  });

  const removeConnection =
    connectionPool.delete.bind(connectionPool, res);

  req
    .on('abort', removeConnection) // client aborted
    .on('aborted', removeConnection); // we aborted

  res
    .on('close', removeConnection) // connection closed before `res.end`
    .on('finish', removeConnection); // after `res.end` was called

  // send data already revealed
  const agg = data.agg();
  if (agg.length) {
    res.write(agg.join(BR) + BR);
  }

  // reveal one more to all
  const last = data.next();
  const isDone = data.isDone();
  connectionPool.forEach((_, _res) => {
    _res.write(last.join('') + BR);
    isDone && _res.end();
  });
});

/**
 * Reveal all data at once. (aka when we eff it up :-0)
 */
app.get('/all', (req, res) => {
  res.write(data.all().join(BR));
  res.end();
});

/**
 * Start from the beginning
 */
app.get('/reset', (req, res) => {
  data.reset();
  connectionPool.clear();
  res.write('OK');
  res.end();
});

app.listen(PORT, () => {
  console.log(`Server is now listening on ${PORT}`);
});