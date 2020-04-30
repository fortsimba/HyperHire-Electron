/*
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const {FileSystemWallet, Gateway, X509WalletMixin} = require('fabric-network');
const fs = require('fs');
const path = require('path');

const ccpPath = path.resolve(__dirname, '..', 'basic-network', 'connection.json');
const ccpJSON = fs.readFileSync(ccpPath, 'utf8');
const ccp = JSON.parse(ccpJSON);
let company;
var success = false;
module.exports = async function(options) {
  success = false;
  company = options
  await called()
  return success
};
async function called() {
    try {
        // Create a new file system based wallet for managing identities.
        const walletPath = path.join(process.cwd(), 'wallet');
        const wallet = new FileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);

        // Check to see if we've already enrolled the company.
        const companyExists = await wallet.exists(company);
        if (companyExists) {
            console.log(`An identity for the company ${company} already exists in the wallet`);
            success = true;
            return;
        }

        // Check to see if we've already enrolled the admin user.
        const adminExists = await wallet.exists('admin');
        if (!adminExists) {
            console.log('An identity for the admin user "admin" does not exist in the wallet');
            console.log('Run the enrollAdmin.js application before retrying');
            return;
        }

        // Create a new gateway for connecting to our peer node.
        const gateway = new Gateway();
        await gateway.connect(ccp, {wallet, identity: 'admin', discovery: {enabled: false}});

        // Get the CA client object from the gateway for interacting with the CA.
        const ca = gateway.getClient().getCertificateAuthority();
        const adminIdentity = gateway.getCurrentIdentity();

        // Register the company, enroll the company, and import the new identity into the wallet.
        const secret = await ca.register({
            affiliation: 'org1.department1',
            enrollmentID: company,
            role: 'client'
        }, adminIdentity);
        const enrollment = await ca.enroll({enrollmentID: company, enrollmentSecret: secret});
        const companyIdentity = X509WalletMixin.createIdentity('Org1MSP', enrollment.certificate, enrollment.key.toBytes());
        wallet.import(company, companyIdentity);
        console.log(`Successfully registered and enrolled company ${company} and imported it into the wallet`);
        success = true;

    } catch (error) {
        console.error(`Failed to register company ${company}: ${error}`);
        process.exit(1);
    }
}