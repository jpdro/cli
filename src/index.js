#!/usr/bin/env node

const console = require("console");
const { program } = require('commander');
const chalk = require('chalk');
var figlet = require('figlet');
const packageJson = require('../package.json');

const progress = require('./progress');
const account = require('./account');
const auth = require('./auth');
const list = require('./list');
const domain = require('./domain');
const file = require('./file');
const sync = require('./sync');
const signup = require('./signup');
const remotestatus = require('./remotestatus');

// Check the program.args obj
let argLength = (process.argv[0].includes('node')) ? process.argv.length - 2 : process.argv.length;

// Handle it however you like
if (argLength === 0) {
  console.clear();

  console.log(
    chalk.red(
      figlet.textSync('bip.sh', { horizontalLayout: 'full' })
    )
  );
  console.log('');
}

remotestatus.getStatus(packageJson.version, function() {
  program.version(packageJson.version);

  program
    .option('--domain <domain>', 'the domain to perform the action on');

    program
    .command('login')
    .description('login to bip.sh')
    .action(auth.loginCommand);

    program
    .command('logout')
    .description('logout of bip.sh')
    .action(auth.logoutCommand);

    program
    .command('signup')
    .description('signup to bip.sh')
    .action(signup.signupCommand);

    const accountCmd = program.command('account')
    .description('account management');

    accountCmd
    .command('balance')
    .description('check the balance of your account')
    .action(account.balanceCommand);

    accountCmd
    .command('topup <amount>')
    .description('topup your account')
    .action(account.topupCommand);

    const domainCmd = program.command('domain')
    .description('domain management');

    domainCmd
    .command('create <domain>')
    .description('create a new domain')
    .action(domain.createCommand);

    domainCmd
    .command('list')
    .description('list domains')
    .action(domain.listCommand);

    domainCmd
    .command('delete <domain>')
    .description('delete a domain')
    .action(domain.deleteCommand);

    program
    .command('list <path>')
    .description('list a directory')
    .action(list.listCommand);

    program
    .command('use <domain>')
    .description('set the domain to perform actions on')
    .action(domain.useCommand);

    program
    .command('upload <filepath> <destination>')
    .description('upload a file')
    .action(file.uploadCommand);

    program
    .command('delete <filepath>')
    .description('delete a file')
    .action(file.deleteCommand);

    program
    .command('sync')
    .description('sync the current working directory with the bip.sh domain')
    .action(sync.syncCommand);

  program.parse(process.argv);
});