const RouterOS = require('./ros');
const UNMS = require('./unms');

module.exports = class Engine {
  constructor() {
    this.unms = new UNMS();
  }

  suspendService(data) {
    console.log('Suspending Service...');
    let siteConfig;
    let addresses;
    return this.unms
      .getGatewayForClientSite(data.entity.unmsClientSiteId)
      .then(config => {
        siteConfig = config;
        return this.unms.getAddressesForClientSite(
          data.entity.unmsClientSiteId,
        );
      })
      .then(clientAddresses => {
        let ros = new RouterOS(siteConfig.name);
        addresses = clientAddresses;
        return ros.suspendServiceWithAddresses(
          addresses,
          data.entity.unmsClientSiteId,
        );
      });
  }

  unsuspendService(data) {
    console.log('Re-Enabling Service...');
    let siteConfig;
    let addresses;
    return this.unms
      .getGatewayForClientSite(data.entity.unmsClientSiteId)
      .then(config => {
        siteConfig = config;
        return this.unms.getAddressesForClientSite(
          data.entity.unmsClientSiteId,
        );
      })
      .then(clientAddresses => {
        let ros = new RouterOS(siteConfig.name);
        addresses = clientAddresses;
        return ros.unsuspendServiceWithAddresses(
          addresses,
          data.entity.unmsClientSiteId,
        );
      });
  }
};
