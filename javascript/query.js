/*
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const {FileSystemWallet, Gateway} = require('fabric-network');
const fs = require('fs');
const path = require('path');

const ccpPath = path.resolve(__dirname, '..', 'basic-network', 'connection.json');
const ccpJSON = fs.readFileSync(ccpPath, 'utf8');
const ccp = JSON.parse(ccpJSON);
let choice;
let companyID;
let candidateID;
var success = false;
let result;
module.exports = async function(arg1, arg2, arg3) {
  success = false;
  choice = arg1;
  companyID = arg2;
  candidateID = arg3;
  await called()
  return [success, result]
};
async function called() {
    try {

        // Create a new file system based wallet for managing identities.
        const walletPath = path.join(process.cwd(), 'wallet');
        const wallet = new FileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);

	if (choice === 'queryCandidate') {
            // Check to see if we've already enrolled the candidate.
            const candidateExists = await wallet.exists(candidateID);
            if (!candidateExists) {
                console.log(`An identity for the candidate ${candidateID} does not exist in the wallet`);
                console.log('Run the registerCandidate.js application before retrying');
                return;
            }
	}

	// Check to see if we've already enrolled the company.
	const companyExists = await wallet.exists(companyID);
        if (!companyExists) {
            console.log(`An identity for the company ${companyID} does not exist in the wallet`);
            console.log('Run the registerCompany.js application before retrying');
            return;
        }

        // Create a new gateway for connecting to our peer node.
	const gateway = new Gateway();
        await gateway.connect(ccp, {wallet, identity: companyID, discovery: {enabled: false}});

        // Get the network (channel) our contract is deployed to.
        const network = await gateway.getNetwork('mychannel');

        // Get the contract from the network.
        const contract = network.getContract('hyperhire');

        // Evaluate the specified transaction.
        // queryMsg transaction - requires 1 argument, ex: ('queryMsg', 'MSG0')
        // queryAllMsgs transaction - requires no arguments, ex: ('queryAllMsgs')

	if (choice === 'queryAllCandidates') {
            result = await contract.evaluateTransaction('queryAllCandidates', companyID);
            console.log(`TransactionTypeAll has been evaluated, result is: ${result.toString()}`);
            success = true;
	} else if (choice === 'queryCandidate') {
            result = await contract.evaluateTransaction('queryCandidate', companyID, candidateID);
            console.log(`TransactionTypeID has been evaluated, result is: ${result.toString()}`);
            success = true;
	} else {
            console.log(`${choice} is invalid!`);
        }

        // Disconnect from the gateway.
        await gateway.disconnect();

    } catch (error) {
        console.error(`Failed to evaluate transaction: ${error}`);
        // process.exit(1);
    }
}
