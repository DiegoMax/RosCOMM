# RosCOMM

A communication layer between Ubiquiti's amazing UNMS and Mikrotik's RouterOS API.

## Getting Started

This code is in *VERY* alpha state and is NOT meant to be used in production unter any circunstances.
Im not responsible for any issues you might have by using this.

This code is provied 'as is', without any warranty whatsoever.

### Prerequisites

This should work on anything capable of running NodeJS.

## Features

* (in progress) Automatically add suspended clients to a defined address list in RouterOS
* (in progress) Automatically remove suspended ip's when the service is re-enabled for whatever reason
* (in progress) Ability to deal with multiple RouterOS Gateways detected automatically from UNMS network topology
* (planned) Automatically add active clients to a custom address list based on their UCRM Service (so that PCQ Queues can be esasily used)

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