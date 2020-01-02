const RouterOS = require('./ros');
const UNMS = require('./unms');
const UCRM = require('./ucrm');

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
      })
      .then(response => {
        let crm = new UCRM();
        return crm.writeLogForClient(
          data.entity.clientId,
          `Service ${data.entity.name} with customer ip ${addresses.customer[0]} succesfully suspended in RouterOS Gateway ${response.site.name} with address: ${response.site.routeros_gateway_ip}`,
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
      })
      .then(response => {
        let crm = new UCRM();
        return crm.writeLogForClient(
          data.entity.clientId,
          `Service ${data.entity.name} with customer ip ${addresses.customer[0]} succesfully re-activated in RouterOS Gateway ${response.site.name} with address: ${response.site.routeros_gateway_ip}`,
        );
      });
  }
};
