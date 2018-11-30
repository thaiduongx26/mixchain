'use strict';

/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| Http routes are entry points to your web application. You can create
| routes for different URL's and bind Controller actions to them.
|
| A complete guide on routing is available here.
| http://adonisjs.com/docs/4.1/routing
|
*/

/** @type {typeof import('@adonisjs/framework/src/Route/Manager')} */
const Route = use('Route');

Route.group(() => {
  Route.post('/auth/sign-in', 'AuthController.signIn');
  Route.post('/auth/register', 'AuthController.register');
  Route.post('/auth/token/refresh', 'AuthController.refreshToken');
  Route.post('/auth/logout', 'AuthController.logout');
}).prefix('api/v1');

Route.group(() => {
  Route.get('/user/me', 'UserController.getUser');

  // Route.post('/vehicle', 'VehicleController.store');
  Route.resource('/vehicle', 'VehicleController');

  Route.post('vehicle/:vin/metric', 'VehicleController.newMetric');

  Route.get('vehicle/invoices', 'VehicleController.invoices');
  Route.get('vehicle/:vin/suggestions', 'VehicleController.suggestions');

  // repair shop partner
  Route.post('/invoice', 'InvoiceController.store');
  Route.put('/invoice', 'InvoiceController.update');
  Route.post('/invoice/complete', 'InvoiceController.checkComplete');

  // points exchange (proposed)
  Route.post('/points/transfer', 'UserController@transfer');

  // TODO: payment, everiToken or wokong pay

  // future: certificate
}).prefix('api/v1').middleware(['auth:jwt']);

Route.on('/').render('welcome');
