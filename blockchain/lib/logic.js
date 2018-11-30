/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

/* global getParticipantRegistry emit */


/**
 * EarnPoints transaction
 * @param {com.mixchain.EarnPoints} earnPoints
 * @transaction
 */
async function EarnPoints(earnPoints) {

  //update member points
  earnPoints.member.points = earnPoints.member.points + earnPoints.points;

  //update member
  const memberRegistry = await getParticipantRegistry('com.mixchain.Member');
  await memberRegistry.update(earnPoints.member);

  // check if partner exists on the network
  const partnerRegistry = await getParticipantRegistry('com.mixchain.Partner');
  let partnerExists = await partnerRegistry.exists(earnPoints.partner.id);
  if (partnerExists === false) {
    throw new Error('Partner does not exist - check partner id');
  }

}


/**
 * UsePoints transaction
 * @param {com.mixchain.UsePoints} usePoints
 * @transaction
 */
async function UsePoints(usePoints) {

  //check if member has sufficient points
  if (usePoints.member.points < usePoints.points) {
    throw new Error('Insufficient points');
  }

  //update member points
  usePoints.member.points = usePoints.member.points - usePoints.points;

  //update member
  const memberRegistry = await getParticipantRegistry('com.mixchain.Member');
  await memberRegistry.update(usePoints.member);

  // check if partner exists on the network
  const partnerRegistry = await getParticipantRegistry('com.mixchain.Partner');
  let partnerExists = await partnerRegistry.exists(usePoints.partner.id);
  if (partnerExists === false) {
    throw new Error('Partner does not exist - check id');
  }
}

/**
 * UpdateInvoiceStatus transaction
 * @param {com.mixchain.UpdateInvoiceStatus} updateInvoiceStatus
 * @transaction 
 */
async function UpdateInvoiceStatus(updateInvoiceStatus) {
  consolse.log("Update invoice status");
  const factory = getFactory();
  //get invoice
  const registry = await factory.getAssetRegistry('com.mixchain.Invoice');
  const invoice = await registry.get(updateInvoiceStatus.invoice.invoiceId)
  invoice.invoiceStatus = updateInvoiceStatus.invoiceStatus
  await registry.update(invoice) 
}

/**
 * Create Invoice
 * @param {com.mixchain.CreateInvoice}
 * @transaction
 */

// async function RepairBegin(repairBegin) {
//   console.log('RepairBegin');

//   // update status
//   const assetRegistry = await getAssetRegistry('com.mixchain.Vehicle');
//   const vehicle = await assetRegistry.get(repairBegin.vehicle.getIdentifier());
//   vehicle.vehicleStatus = 'REPAIRING';

//   // log
//   const shop = repairBegin.shop;
//   const vehicleRepairLogEntry = factory.newConcept('com.mixchain.VehicleRepairLogEntry');
//   vehicleRepairLogEntry.vehicle = factory.newRelationship(
//     'com.mixchain.Vehicle',
//     vehicle.getIdentifier()
//   );
//   vehicleRepairLogEntry.shop = factory.newRelationship(
//     'com.mixchain.Partner',
//     shop.getIdentifier()
//   );
//   vehicleRepairLogEntry.timestamp = repairBegin.timestamp;
//   vehicleRepairLogEntry.description = repairBegin.description;
//   vehicleRepairLogEntry.type = "begin";
//   if (!vehicle.logEntries) {
//     vehicle.logEntries = [];
//   }
//   vehicle.reapairLogEntries.push(vehicleRepairLogEntry);
//   await assetRegistry.update(vehicle);

//   // check if partner exists on the network
//   const partnerRegistry = await getParticipantRegistry('com.mixchain.Partner');
//   let partnerExists = await partnerRegistry.exists(repairBegin.shop.id);
//   if (partnerExists === false) {
//     throw new Error('Partner does not exist - check partner id');
//   }
// }

async function CreateInvoice(createInvoice) {
  console.log("Create Invoice");
  const factory = getFactory();
  //get invoice
  const registry = await factory.getAssetRegistry('com.mixchain.Invoice');
  let existInvoice = registry.getAll();
  let count = 0;
  await existInvoice.forEach(function(asset) {
    count ++;
  })
  const invoice = await factory.newResource('com.mixchain', 'Invoice', count);
  invoice.invoiceStatus = 'PENDING';
  invoice.partner = factory.newRelationship(
    'com.mixchain',
    'Vehicle',
    createInvoice.partner.id);
  invoice.push(createInvoice.maintanceParts)
  //Vehicle 
  const vehicleRegistry = await factory.getAssetRegistry('com.mixchain.Vehicle');
  const vehicle = await vehicleRegistry.get(createInvoice)
  invoice.vehicle = factory.newRelationship(
    'com.mixchain',
    'Vehicle',
    vehicle.vin
  );
}


/**
 * UpdateMetric transaction
 * @param {com.mixchain.UpdateMetric} updateMetric
 * @transaction
 */
async function UpdateMetric(updateMetric) {
  console.log('UpdateMetric')

  const assetRegistry = await getAssetRegistry('com.mixchain.Vehicle');
  const vehicle = await assetRegistry.get(updateMetric.vehicle.getIdentifier());

  const vehicleMetricLogEntry = factory.newConcept('com.mixchain.VehicleMetricLogEntry');
  vehicleMetricLogEntry.vehicle = factory.newRelationship(
    'com.mixchain.Vehicle',
    vehicle.getIdentifier()
  );
  vehicleMetricLogEntry.timestamp = updateMetric.timestamp;
  vehicleMetricLogEntry.fuelUsed = updateMetric.fuelUsed;
  vehicleMetricLogEntry.tirePressure = updateMetric.tirePressure;
  if (!vehicle.logEntries) {
    vehicle.logEntries = [];
  }
  vehicle.reapairLogEntries.push(vehicleMetricLogEntry);
  await assetRegistry.update(vehicle);
}

/**
 * PrivateVehicleTransfer transaction
 * @param {com.mixchain.UpdateMetric} privateVehicleTransfer
 * @transaction
 */
async function privateVehicleTransfer(privateVehicleTransfer) {
  // eslint-disable-line no-unused-vars
  console.log('privateVehicleTransfer');

  const seller = privateVehicleTransfer.seller;
  const buyer = privateVehicleTransfer.buyer;
  const vehicle = privateVehicleTransfer.vehicle;

  //change vehicle owner
  vehicle.owner = buyer;

  //PrivateVehicleTransaction for log
  const vehicleTransferLogEntry = factory.newConcept(
    'com.mixchain.VehicleTransferLogEntry'
  );
  vehicleTransferLogEntry.vehicle = factory.newRelationship(
    'com.mixchain.Vehicle',
    vehicle.getIdentifier()
  );
  vehicleTransferLogEntry.seller = factory.newRelationship(
    'com.mixchain.Member',
    seller.getIdentifier()
  );
  vehicleTransferLogEntry.buyer = factory.newRelationship(
    'com.mixchain.Member',
    buyer.getIdentifier()
  );
  vehicleTransferLogEntry.timestamp = privateVehicleTransfer.timestamp;
  if (!vehicle.logEntries) {
    vehicle.logEntries = [];
  }

  vehicle.logEntries.push(vehicleTransferLogEntry);

  const assetRegistry = await getAssetRegistry(vehicle.getFullyQualifiedType());
  await assetRegistry.update(vehicle);
}

// TODO: check payment from api
async function CheckPayment(tx) {}