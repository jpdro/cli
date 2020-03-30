const config = require('./config');
const errors = require('./errors');
const projectSettings = require('./projectsettings');
const prices = require('./prices');
const progress = require('./progress');
const validation = require('./validation');
const fs = require('fs');
const chalk = require('chalk');
const Table = require('cli-table');
const emoji = require('node-emoji');
const prompts = require('prompts');

module.exports = {
  listCommand: async function (path) {
    progress.spinner().start('Listing domains');
    await module.exports.list(function(status, domains) {
      if (status) {
        progress.spinner().stop();
        console.log('List of domains:');
        const table = new Table({
            head: ['Domain'],
            colWidths: [50]
        });
        domains.forEach(function (item) {
          table.push(
            [item.domain_name]
          );
        });
        console.log(table.toString());
      }
    });
  },
  createCommand: async function (domain) {
    validation.requireApiKey();

    progress.spinner().start('Fetching data');

    await prices.get(async function(prices) {
      progress.spinner().stop();
      const promptRes = await prompts( {
        type: 'confirm',
        name: 'value',
        message: 'Creating the domain ' + domain + ' will cost ' + prices.symbol + prices.domain + ' per month. Would you like to continue?',
        initial: false
      });

      // Continue if user confirms
      if (promptRes.value) {
        progress.spinner().start('Creating domain');
        let headers = {
          'X-Api-Key': config.userpref.get('apiKey')
        }
        let init = {
          headers: headers,
          method: 'POST'
        }
        let response = await validation.safelyFetch(config.api.baseurl + 'domains/' + domain, init)
        let responseJson = await validation.safelyParseJson(response)
    
        progress.spinner().stop();
    
        switch(response.status) {
          case 200:
            console.log(
              chalk.green(emoji.get('white_check_mark') + ' Domain created successfully!')
            );
            break;
          default:
            errors.returnServerError(response.status, responseJson);
        }
      }
    });
  },
  deleteCommand: async function (domain) {
    validation.requireApiKey();

    const promptRes = await prompts({
      type: 'confirm',
      name: 'value',
      message: 'Are you sure you want to delete the domain ' + domain + '?',
      initial: false
    });

    // Continue if user confirms
    if (promptRes.value) {
      progress.spinner().start('Deleting domain');
      let headers = {
        'X-Api-Key': config.userpref.get('apiKey')
      }
      let init = {
        headers: headers,
        method: 'DELETE'
      }
      let response = await validation.safelyFetch(config.api.baseurl + 'domains/' + domain, init)
      let responseJson = await validation.safelyParseJson(response)

      progress.spinner().stop();

      switch(response.status) {
        case 200:
          console.log(
            chalk.green(emoji.get('white_check_mark') + ' Domain deleted successfully!')
          );
          break;
        default:
          errors.returnServerError(response.status, responseJson);
      }
    }
  },
  useCommand: async function (domain) {
    projectSettings.set('domain', domain);

    console.log(
      chalk.green(emoji.get('white_check_mark') + ' Domain set')
    );
  },
  list: async function (cb) {
    cb = cb || function(){};

    validation.requireApiKey();
    
    let headers = {
      'X-Api-Key': config.userpref.get('apiKey')
    }
    let init = {
      headers: headers,
      method: 'GET'
    }
    let response = await validation.safelyFetch(config.api.baseurl + 'domains', init)
    let responseJson = await validation.safelyParseJson(response)

    switch(response.status) {
      case 200:
        cb(true, responseJson.domains);
        break;
      default:
        errors.returnServerError(response.status, responseJson);
    }
  }
};