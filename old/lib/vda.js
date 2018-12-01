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

/* global getFactory getAssetRegistry emit query */
'use strict';

/**
 * Transfer a vehicle to another private owner
 * @param {org.vda.PrivateVehicleTransfer} privateVehicleTransfer - the PrivateVehicleTransfer transaction
 * @transaction
 */
async function privateVehicleTransfer(privateVehicleTransfer) {
  // eslint-disable-line no-unused-vars
  console.log('privateVehicleTransfer');

  const NS = 'org.acme.vehicle.lifecycle';
  const NS_D = 'org.vda';
  const factory = getFactory();

  const seller = privateVehicleTransfer.seller;
  const buyer = privateVehicleTransfer.buyer;
  const vehicle = privateVehicleTransfer.vehicle;

  //change vehicle owner
  vehicle.owner = buyer;

  //PrivateVehicleTransaction for log
  const vehicleTransferLogEntry = factory.newConcept(
    NS_D,
    'VehicleTransferLogEntry'
  );
  vehicleTransferLogEntry.vehicle = factory.newRelationship(
    NS_D,
    'Vehicle',
    vehicle.getIdentifier()
  );
  vehicleTransferLogEntry.seller = factory.newRelationship(
    NS,
    'PrivateOwner',
    seller.getIdentifier()
  );
  vehicleTransferLogEntry.buyer = factory.newRelationship(
    NS,
    'PrivateOwner',
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

/**
 * Scrap a vehicle
 * @param {org.vda.ScrapVehicle} scrapVehicle - the ScrapVehicle transaction
 * @transaction
 */
async function scrapVehicle(scrapVehicle) {
  // eslint-disable-line no-unused-vars
  console.log('scrapVehicle');

  const NS_D = 'org.vda';

  const assetRegistry = await getAssetRegistry(NS_D + '.Vehicle');
  const vehicle = await assetRegistry.get(scrapVehicle.vehicle.getIdentifier());
  vehicle.vehicleStatus = 'SCRAPPED';
  await assetRegistry.update(vehicle);
}

/**
 * Scrap a vehicle
 * @param {org.vda.ScrapAllVehiclesByColour} scrapAllVehicles - the ScrapAllVehicles transaction
 * @transaction
 */
async function scrapAllVehiclesByColour(scrapAllVehicles) {
  // eslint-disable-line no-unused-vars
  console.log('scrapAllVehiclesByColour');

  const NS_D = 'org.vda';
  const assetRegistry = await getAssetRegistry(NS_D + '.Vehicle');
  const vehicles = await query('selectAllCarsByColour', {
    colour: scrapAllVehicles.colour
  });
  if (vehicles.length >= 1) {
    const factory = getFactory();
    const vehiclesToScrap = vehicles.filter(function(vehicle) {
      return vehicle.vehicleStatus !== 'SCRAPPED';
    });
    for (let x = 0; x < vehiclesToScrap.length; x++) {
      vehiclesToScrap[x].vehicleStatus = 'SCRAPPED';
      const scrapVehicleEvent = factory.newEvent(NS_D, 'ScrapVehicleEvent');
      scrapVehicleEvent.vehicle = vehiclesToScrap[x];
      emit(scrapVehicleEvent);
    }
    await assetRegistry.updateAll(vehiclesToScrap);
  }
}

/**
 * Repair a vehicle
 * @param {org.vda.RepairVehicle} repairVehicle - the RepairVehicle transaction
 * @transaction
 */
async function repairVehicle(repairVehicle) {
  // eslint-disable-line no-unused-vars
  console.log('repairVehicle');

  const NS_D = 'org.vda';
  const NS = 'org.acme.vehicle.lifecycle';
  const factory = getFactory();

  const assetRegistry = await getAssetRegistry(NS_D + '.Vehicle');
  const vehicle = await assetRegistry.get(repairVehicle.vehicle.getIdentifier());
  vehicle.vehicleStatus = 'REPAIRING';

  const shop = repairVehicle.shop;
  const repairer = repairVehicle.repairer;
  const customer = repairVehicle.customer;
  //VehicleRepairTransaction for log
  const vehicleRepairLogEntry = factory.newConcept(
    NS_D,
    'VehicleRepairLogEntry'
  );
  vehicleRepairLogEntry.vehicle = factory.newRelationship(
    NS_D,
    'Vehicle',
    vehicle.getIdentifier()
  );
  vehicleRepairLogEntry.shop = factory.newRelationship(
    NS,
    'RepairShop',
    shop.getIdentifier()
  );
  vehicleRepairLogEntry.repairer = factory.newRelationship(
    NS,
    'PrivateOwner',
    repairer.getIdentifier()
  );
  vehicleRepairLogEntry.customer = factory.newRelationship(
    NS,
    'PrivateOwner',
    customer.getIdentifier()
  );
  vehicleRepairLogEntry.timestamp = repairVehicle.timestamp;
  vehicleRepairLogEntry.description = repairVehicle.description;
  if (!vehicle.logEntries) {
    vehicle.logEntries = [];
  }

  vehicle.reapairLogEntries.push(vehicleRepairLogEntry);

  await assetRegistry.update(vehicle);

  const repairVehicleEvent = factory.newEvent(NS_D, 'RepairVehicleEvent');
  repairVehicleEvent.vehicle = vehicle;
  emit(repairVehicleEvent);
}

/**
 * Repair a vehicle
 * @param {org.vda.RepairVehicle} repairVehicle - the RepairVehicle transaction
 * @transaction
 */
async function repairVehicleComplete(repairVehicle) {
  // eslint-disable-line no-unused-vars
  console.log('repairVehicleComplete');

  const NS_D = 'org.vda';

  const assetRegistry = await getAssetRegistry(NS_D + '.Vehicle');
  const vehicle = await assetRegistry.get(repairVehicle.vehicle.getIdentifier());
  vehicle.vehicleStatus = 'ACTIVE';
  await assetRegistry.update(vehicle);
}
