const config = require('./config');
const errors = require('./errors');
const progress = require('./progress');
const validation = require('./validation');
const chalk = require('chalk');
const emoji = require('node-emoji')
const prompts = require('prompts');

module.exports = {
  loginCommand: async function () {

    const promptRes = await prompts({
      type: 'text',
      name: 'value',
      message: `Please enter your API key`
    });

    if (promptRes.value) {
      progress.spinner().start('Logging in');
      let headers = {
        'X-Api-Key': promptRes.value
      }
      let init = {
        headers: headers,
        method: 'GET'
      }
      let response = await validation.safelyFetch(config.api.baseurl + 'login', init)
      let responseJson = await validation.safelyParseJson(response)

      progress.spinner().stop();

      switch(response.status) {
        case 200:
          config.userpref.set('apiKey', promptRes.value);
          console.log(
            chalk.green(emoji.get('key') + ' Logged in successfully!')
          );
          break;
        case 403:
          console.log(
            chalk.red('Incorrect API key. Please try again.')
          );
          break;
        default:
          console.log(
            chalk.red('An unknown error occurred')
          );
      }
    }
  },
  logoutCommand: async function () {
    config.userpref.delete('apiKey');
    console.log(
      chalk.green(emoji.get('door') + ' Logged out successfully')
    );
  },
  whoamiCommand: async function () {
    validation.requireApiKey();

    progress.spinner().start('Fetching data');

    let headers = {
      'X-Api-Key': config.userpref.get('apiKey')
    }
    let init = {
      headers: headers,
      method: 'GET'
    }
    let response = await validation.safelyFetch(config.api.baseurl + 'account/whoami', init)
    let responseJson = await validation.safelyParseJson(response)

    switch(response.status) {
      case 200:
        progress.spinner().stop();
        console.log(emoji.get('wave') + ' You are logged in as ' + responseJson.account.email);
        break;
      default:
        errors.returnServerError(response.status, responseJson);
    }
  }
};