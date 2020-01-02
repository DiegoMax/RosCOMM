const config = require('./config.json');
const rp = require('request-promise');
const _ = require('lodash');

module.exports = class UNMS {
  constructor() {
    console.log('Initializing UNMS Connector...');
    console.log('UNMS Hostname: ' + config.unms.fqdn);
    console.log('UNMS SSL: ' + (config.unms.use_ssl == true ? 'yes' : 'no'));
  }

  requestOptions() {
    return {
      headers: {
        'x-auth-token': config.unms.api_token,
      },
      json: true,
    };
  }

  unmsURL() {
    let schema = config.unms.use_ssl == true ? 'https://' : 'http://';
    return schema + config.unms.fqdn + '/nms/api/v2.1';
  }

  connClass() {
    if (config.unms_use_ssl) {
      return https;
    } else {
      return http;
    }
  }

  getSites(siteID) {
    let options = this.requestOptions();
    options.uri = this.unmsURL() + `/sites`;
    options.qs = {
      id: siteID,
    };
    return rp(options);
  }

  getDevices(siteID) {
    let options = this.requestOptions();
    options.uri = this.unmsURL() + `/devices`;
    options.qs = {
      siteId: siteID,
    };
    return rp(options);
  }

  getAddressesForClientSite(siteId) {
    let options = this.requestOptions();
    options.uri = this.unmsURL() + `/devices`;
    options.qs = {
      siteId: siteId,
      withInterfaces: true,
    };
    console.log('Searching management IP for client device...');
    return rp(options).then(response => {
      if (response.length) {
        let device = response[0];
        let managementInterface = this.getManagementInterfaceForDevice(device);
        if (!managementInterface) {
          throw Error(
            'Can not find Management Interface for device, aborting.',
          );
        }
        let customerInterface = this.getCustomerTrafficInterfaceForDevice(
          device,
        );
        if (!customerInterface) {
          throw Error('Can not find Customer Interface for device, aborting.');
        }
        let addresses = {};
        addresses.management = this.getIpAddressesForInterface(
          managementInterface,
        );
        addresses.customer = this.getIpAddressesForInterface(customerInterface);
        console.log(`Found Management IP ${addresses.management[0]}`);
        console.log(`Found Customer IP ${addresses.customer[0]}`);
        return addresses;
      } else {
        throw Error('Can not find a device for this Client Site');
      }
    });
  }

  getParentSiteForClientSite(clientSiteID) {
    let options = this.requestOptions();
    options.uri = this.unmsURL() + `/sites`;
    options.qs = {
      id: clientSiteID,
    };
    return rp(options).then(response => {
      if (_.has(response[0], 'identification.parent.id')) {
        return this.getSites(response[0].identification.parent.id);
      } else {
        throw Error(
          `Can not find parent site for this Client Site: ${clientSiteID}`,
        );
      }
    });
  }

  getGatewayForClientSite(clientSiteID) {
    let parentSiteName;
    return this.getParentSiteForClientSite(clientSiteID)
      .then(parentSite => {
        let site = parentSite[0];
        parentSiteName = site.identification.name;
        let parentSiteID = site.id;
        console.log(
          `Found parent site: ${parentSiteName} for client site: ${clientSiteID}`,
        );
        return this.getDevices(parentSiteID);
      })
      .then(parentDevices => {
        let sitesConfig = config.unms.sites;
        let siteConfig = _.find(sitesConfig, { name: parentSiteName });
        if (siteConfig) {
          return siteConfig;
        } else {
          throw Error(`Can not find a valid site config for ${parentSiteName}`);
        }
      });
  }

  getManagementInterfaceForDevice(deviceObject) {
    let interfaces = deviceObject.interfaces;
    let managementInterface = _.find(interfaces, {
      vlan: { id: config.management_vlan_id },
    });
    return managementInterface;
  }

  getCustomerTrafficInterfaceForDevice(deviceObject) {
    let interfaces = deviceObject.interfaces;
    let searchPath;
    if (config.customer_is_pppoe == true) {
      searchPath = { identification: { type: 'pppoe' } };
    } else {
      searchPath = { vlan: { id: config.customer_vlan_id } };
    }
    let customerInterface = _.find(interfaces, searchPath);
    return customerInterface;
  }

  getIpAddressesForInterface(interfaceObject) {
    if (!_.has(interfaceObject, 'addresses')) {
      throw Error('Invalid interface object, can not continue.');
    }
    let addresses = [];
    interfaceObject.addresses.forEach((item, index) => {
      if (_.has(item, 'cidr') && item.version == 'v4') {
        addresses.push(item.cidr);
      }
    });
    return addresses;
  }
};
