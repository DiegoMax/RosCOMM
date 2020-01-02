const config = require('./config.json');
const rp = require('request-promise');
const _ = require('lodash');

module.exports = class UCRM {
  constructor() {
    console.log('Initializing UCRM Connector...');
    console.log('UCRM Hostname: ' + config.ucrm.fqdn);
    console.log('UCRM SSL: ' + (config.ucrm.use_ssl == true ? 'yes' : 'no'));
  }

  requestOptions() {
    return {
      headers: {
        'X-Auth-App-Key': config.ucrm.app_token,
      },
      json: true,
    };
  }

  unmsURL() {
    let schema = config.ucrm.use_ssl == true ? 'https://' : 'http://';
    return schema + config.ucrm.fqdn + '/api/v1.0';
  }

  writeLogForClient(clientID, message) {
    let options = this.requestOptions();
    options.uri = this.unmsURL() + '/client-logs';
    options.method = 'POST';
    options.body = {
      message: 'RosCOMM: ' + message,
      clientId: clientID,
    };
    console.log(`Writing client log: RosCOMM: ${message}`);
    return rp(options);
  }
};
