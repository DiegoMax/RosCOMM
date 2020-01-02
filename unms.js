const config = require('./config.json');
const http = require('http');
const https = require('https');
const rp = require('request-promise');
const _ = require('lodash');

module.exports = class UNMS {
  constructor() {
    console.log('Initializing UNMS Connector...');
    console.log('UNMS Hostname: ' + config.unms_fqdn);
    console.log('UNMS SSL: ' + (config.unms_use_ssl == true ? 'yes' : 'no'));
  }

  requestOptions() {
    return {
      headers: {
        'x-auth-token': config.unms_api_token,
      },
      json: true,
    };
  }

  unmsURL() {
    let schema = config.unms_use_ssl == true ? 'https://' : 'http://';
    return schema + config.unms_fqdn + '/nms/api/v2.1';
  }

  ucrmURL() {
    let schema = config.unms_use_ssl == true ? 'https://' : 'http://';
    return schema + config.unms_fqdn + '/api/v1.0';
  }

  connClass() {
    if (config.unms_use_ssl) {
      return https;
    } else {
      return http;
    }
  }

  getManagementAddressesForSite(siteId) {
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
        let addresses = this.getIpAddressesForInterface(managementInterface);
        if (addresses && addresses.length) {
          console.log(`Found ${addresses.length} management IP's for device:`);
          return addresses;
        } else {
          throw Error(
            'Can not find Management Addresses for this client site.',
          );
        }
      } else {
        throw Error('Can not find a device for this Client Site');
      }
    });
  }

  getManagementInterfaceForDevice(deviceObject) {
    let interfaces = deviceObject.interfaces;
    let managementInterface = _.find(interfaces, {
      vlan: { id: 100 },
    });
    return managementInterface;
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
