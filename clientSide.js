const socket = require('socket.io-client')('http://localhost:3000');
const repl = require('repl')
const chalk = require('chalk');

socket.on('connect', () => {
    console.log(chalk.green('=== connected ==='))
})

socket.on('disconnect', () => {
    socket.disconnect()
})

socket.on('message', (data) => {
    console.log(data);
})

repl.start({
    prompt: '',
    eval: (cmd) => {
        socket.send(cmd)
    }
})