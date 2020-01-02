# RosCOMM

A communication layer between Ubiquiti's amazing UNMS and Mikrotik's RouterOS API.

## What is this ?

RosCOMM is a simple web service aimed at linking Ubiquiti's UNMS and UCRM ISP Management systems with routing devices running Mikrotik's RouterOS version 6.46 and newer.

## What it does ?

It automates the suspension/un-suspension of clients and the creation of shaping and QoS rules across all the RouterOS devices distributed in your network.

## Important Foreword

Keep in mind that this code is in **VERY** alpha state and is **NOT** meant to be used in production under any circunstances.

I'm **NOT** responsible for any issues you might have by using this.

This code is provied 'as is', without any warranty or support whatsoever, other than the "issues" section in here, which will be replied on a *best-effort* basis.

### System Requeriments

* This should run on any flavor of Linux or Windows, however I have **only** tested this code in Ubuntu Server 18.04 LTS using **NodeJS version 12.14.0** 64bit.

## Getting Started

### Installation

As with any NodeJS app, you need to run ``npm install`` after downloading this code, so that all the dependencies get installed and built.

### RosCOMM config.json file

RosCOMM comes with a default *config.json.example* file. You need to rename this file to *config.json* before running this application.

#### Example config.json file

```javascript
{
  "RosCOMM": {
    "port": 4000 // Port where RosCOMM will listen for requests
  },
  "unms": {
    // API Token Generated in UNMS Users section
    "api_token": "cb9b5ce6-5e1e-4094-8da0-xxxxxxxxxxxx",
    // domain or ip address of your UNMS Install
    "fqdn": "unms.example.com",
    "use_ssl": true,
    // For every one of your sites, you must create
    // a matching site on this array. Most importantly
    // be absolutely sure that the "name" parameter
    // matches exactly the site name on UNMS
    "sites": [
      {
        "name": "SITE1",
        "routeros_gateway_ip": "10.10.91.1",
        "routeros_api_port": 1234,
        "routeros_username": "foo",
        "routeros_password": "bar",
        "routeros_suspended_list": "suspended"
      },
      {
        "name": "SITE2",
        "routeros_gateway_ip": "10.0.20.1",
        "routeros_api_port": 1234,
        "routeros_username": "admin",
        "routeros_password": "1234",
        "routeros_suspended_list": "suspended"
      }
    ]
  },
  "ucrm": {
    // UCRM App Token
    // You can generate one in UCRM -> System -> Security
    "app_token": "ezr7ont1Bk/iPfYmUosdfdsfsdf5gTyYrHdwYrMydrpclmBEeHz",
    "fqdn": "unms.example.com",
    "use_ssl": true
  },
  // If you use PPPoE, set this to true
  "customer_is_pppoe": true, 
  // Set your management VLAN ID
  "management_vlan_id": 100, 
  // Set your customer's traffic vlan ID
  "customer_vlan_id": 10
}
```

### UNMS Configuration

* You need to have a properly configured UNMS topology, your sites must include the RouterOS gateway device manually added using the "Add Device" feature of UNMS.

* After manually adding a RouterOS device to your site, set a name for it, which will be later used in the config.json file.

### UCRM Configuration

For now, only suspension and reactivation of users is implemented. For it to work, you need to configure a WebHook in UCRM. Go to System -> Webhooks, create a new one with the following parameters.

* URL: Your RosCOMM url or ip /set_suspension. Example: http://172.16.1.1/set_suspension.
* Enabled: **YES**
* Any Event: **NO**. Select only service.suspend and service.suspend_cancel. Selecting more events wont harm, but its going to generate useless requests to the API.

## Launching the API

For testing, you can pretty much do: `node index.js` and the application will run and start listening for requests at the port you have configured in the config.json file, however, you might want to have a process manager taking care of running the webapp (and restarting it in the event it crashes) like for example PM2.

If everything goes right, after launching the API you shuld see something like this in the console:

```console
Request handler has been initialized!
Initializing UNMS Connector...
UNMS Hostname: yourhost.example.com
UNMS SSL: yes
RosCOMM API listening on port 4000
```

### What now ?

If everything went right, your network topology is properly set in UNMS and your config.json file is correctly configured, when a client gets automatically or manually suspended or re-activated in UCRM, the following things will happen:

* Will get the client's device addresses.
* Will determine what gateway this client's service is connected to (based on UNMS Topology).
* Will connect to the RouterOS gateway, using the credentials provided in the config.json file, and add or remove the client's IP from an address-list (that you can later use to mark your traffic).

For example, if you (or UCRM) suspend a service in UCRM, you should see something like this in the console output:

```console
Suspending Service...
Found parent site: Site1 for client site: cb09328c-9997-46b0-be0e-eea1fc85b644
Searching management IP for client device...
Found Management IP 10.5.91.68/24
Found Customer IP 100.64.91.226/32
Started RouterOS Connector for site Site1 -> 10.0.20.1 - Suspension List: suspended
Removing suspended ip's for client site: cb09328c-9997-46b0-be0e-eea1fc85b644
Succesfully added 100.64.91.226 to suspended list
```

When the service gets re-enabled, you should see output similar to this:

```console
Re-Enabling Service...
Found parent site: Site1 for client site: cb09328c-9997-46b0-be0e-eea1fc85b644
Searching management IP for client device...
Found Management IP 10.5.91.68/24
Found Customer IP 100.64.91.226/32
Started RouterOS Connector for site Site1 -> 10.0.20.1 - Suspension List: suspended
Removing suspended ip's for client site: cb09328c-9997-46b0-be0e-eea1fc85b644
Succesfully removed 100.64.91.226 to suspended list
```

---

## Features

### Working

* Automatically add suspended clients to a defined address list in RouterOS
* Automatically remove suspended ip's when the service is re-enabled for whatever reason
* Ability to deal with multiple RouterOS Gateways detected automatically from UNMS network topology
* All actions/errors get logged to the UCRM Customer's account log.

### Planned

* Automatically add active clients to a custom address list based on their UCRM Service (so that PCQ Queues can be esasily used)
* Implement a dispatch queue, so that network requests can be queued and re-tried in the event of connectivity issues, etc.
* Implement Customer Ip Update (If a customer gets a DHCP IP, it might restart the CPE, this could potentially assign a new IP. This case will be implemented in a future version so that the IP for a suspended service gets updated in the event of a CPE IP Change)
* Who knows...


## Contributing

Feel free to send a pull request with your fixes or features.

## Authors

* Just me for now.

## License

This project is licensed under the GNU version 2 License - see the [license.md](license.md) file for details

## Acknowledgments

* Hat tip to anyone whose code was used
* Inspiration
* etc