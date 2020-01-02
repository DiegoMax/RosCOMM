//const http = require('http');
const express = require('express');
const bodyParser = require('body-parser');
const RouterOS = require('./ros');
const UNMS = require('./unms');

module.exports = class Handler {
  constructor() {
    console.log('Request handler has been initialized!');
    this.server = express();
    this.unms = new UNMS();
    this.server.use(bodyParser.json());
    this.init();
    this.server.listen(4000, () => {
      console.log('RosUNMS API listening on port 4000');
    });
  }

  init() {
    this.server.post('/set_suspension', ({ body }, response) => {
      const { changeType, extraData, entityId } = body;
      // console.log(extraData);
      switch (changeType) {
        case 'suspend':
          this.suspendService(extraData).then((res, err) => {
            response.send('Grea');
          });
          break;
        case 'unsuspend':
          this.unsuspendService(extraData);
          break;
      }
    });
  }

  suspendService(data) {
    return new Promise((resolve, reject) => {
      console.log('Suspending Service...');
      this.unms
        .getManagementAddressesForSite(data.entity.unmsClientSiteId)
        .then((addresses, err) => {
          console.log(addresses);
        })
        .catch(err => {
          console.log(err);
        });
      //const ros = new RouterOS('FD_CAV');
      //resolve('All Fine.');
    });
  }

  unsuspendService(data) {
    console.log('Re-Enabling Service...');
    this.unms
      .getManagementAddressesForSite(data.entity.unmsClientSiteId)
      .then((addresses, err) => {
        console.log(addresses);
      })
      .catch(err => {
        console.log('Can not find management ip address for this site');
      });
  }

  getClientSiteData(id) {
    return new Promise((resolve, reject) => {});
  }
};
