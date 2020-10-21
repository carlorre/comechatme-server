const app = require('express')();
const server = require('http').createServer(app);
const cors = require('cors');
const io = require('socket.io')(server, { pingInterval: 20000, pingTimeout: 1000 });
const moment = require('moment');
const logger = require('./logger.js');
const PORT = process.env.PORT || 5000;

app.use(cors());

let users = [];

const removeUser = (user) => { users = users.filter((name) => name !== user); };
const checkForDuplicate = (username) => users.includes(username);

app.get('/', (req, res) => {
  const { username } = req.query;
  if (checkForDuplicate(username)) {
    res.status(409);
    res.send('That username is taken, try again!');
    logger.info('Connection refused due to duplicate username');
  } else {
    res.send();
  }
});

io.on('connection', (socket) => {
  socket.on('newuser', ({ username, color }) => {
    logger.info(`${username} joined the chat`);
    users.push(username);
    socket.emit('welcome user', { username: 'broadcast', message: `Welcome ${username}!` });
    socket.broadcast.emit('inform chat', { username: 'broadcast', message: `${username} has joined the chat` });
    socket.on('message', (data) => {
      const time = moment().format('h:mm');
      io.emit('message', {
        color, time, username: data.username, message: data.message,
      });
      logger.info(`${username} sent a message`);
    });
    socket.on('disconnect', (reason) => {
      removeUser(username);
      if (reason === 'ping timeout') {
        socket.broadcast.emit('disconnect reason', { username: 'broadcast', message: `${username} was disconnected due to inactivity` });
        logger.info(`${username} was disconnected due to inactivity`);
      } else {
        socket.broadcast.emit('disconnect reason', { username: 'broadcast', message: `${username} has left the chat` });
        logger.info(`${username} left the chat`);
      }
    });
  });
});

// eslint-disable-next-line no-console
server.listen(PORT, () => console.log(`Listening on ${ PORT }`));
