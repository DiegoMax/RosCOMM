const config = require('./config.json');
const _ = require('lodash');
const RouterOSClient = require('routeros-client').RouterOSClient;
module.exports = class RouterOS {
  constructor(siteName) {
    this.site = this.validateSite(siteName);
    console.log(
      `Started RouterOS Connector for site ${siteName} -> ${this.site.routeros_gateway_ip} - Suspension List: ${this.site.routeros_suspended_list}`,
    );
    this.setupConnection();
  }

  validateSite(siteName) {
    let site = _.find(config.unms.sites, { name: siteName });
    if (!site) {
      throw Error(
        `Can not find a site with name: ${siteName} in the config file. Aborting`,
      );
    }
    if (!_.has(site, 'routeros_gateway_ip')) {
      throw Error(
        `Parameter routeros_gateway_ip is not configured for ${siteName}. Aborting`,
      );
    }
    if (!_.has(site, 'routeros_suspended_list')) {
      throw Error(
        `Parameter routeros_suspended_list is not configured for ${siteName}. Aborting`,
      );
    }
    if (!_.has(site, 'routeros_username')) {
      throw Error(
        `Parameter routeros_username is not configured for ${siteName}. Aborting`,
      );
    }
    if (!_.has(site, 'routeros_password')) {
      throw Error(
        `Parameter routeros_password is not configured for ${siteName}. Aborting`,
      );
    }
    return site;
  }

  setupConnection() {
    this.api = new RouterOSClient({
      host: this.site.routeros_gateway_ip,
      user: this.site.routeros_username,
      password: this.site.routeros_password,
    });
  }

  suspendServiceWithAddresses(addresses, unmsClientSiteId) {
    return this.api.connect().then(client => {
      return this.addEntryWithSiteId(unmsClientSiteId, addresses, client).then(
        result => {
          if (_.has(result, 'address')) {
            console.log(
              `Succesfully added ${result.address} to ${result.list} list`,
            );
            this.api.close();
            return { result: result, site: this.site };
          } else {
            this.api.close();
            return null;
          }
        },
      );
    });
  }

  unsuspendServiceWithAddresses(addresses, unmsClientSiteId) {
    return this.api.connect().then(client => {
      return this.deleteEntriesWithSiteId(unmsClientSiteId, client).then(
        result => {
          if (_.has(result, 'address')) {
            console.log(
              `Succesfully removed ${result.address} to ${result.list} list`,
            );
            this.api.close();
            return { result: result, site: this.site };
          }
          this.api.close();
          return null;
        },
      );
    });
  }

  addEntryWithSiteId(unmsClientSiteId, addresses, rosClient) {
    // First, lets check if we arleady have any entry for this client site
    return this.deleteEntriesWithSiteId(unmsClientSiteId, rosClient).then(
      removedEntries => {
        // Now, add the new ip
        let listMenu = rosClient.menu('/ip firewall address-list');
        return listMenu.add({
          list: this.site.routeros_suspended_list,
          comment: unmsClientSiteId,
          address: addresses.customer[0],
        });
      },
    );
  }

  deleteEntriesWithSiteId(unmsClientSiteId, rosClient) {
    console.log(`Removing suspended ip's for client site: ${unmsClientSiteId}`);
    let listMenu = rosClient.menu('/ip firewall address-list');
    return listMenu.where('comment', unmsClientSiteId).remove();
  }
};
