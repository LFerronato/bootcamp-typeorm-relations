import { Request, Response } from 'express';

import CreateCustomerService from '@modules/customers/services/CreateCustomerService';
import ListCustomersService from '@modules/customers/services/ListCustomersService';

import { container } from 'tsyringe';

export default class CustomersController {
  public async create(request: Request, response: Response): Promise<Response> {
    const { name, email } = request.body;

    const customer = await container
      .resolve(CreateCustomerService)
      .execute({ name, email });

    return response.json(customer);
  }

  public async index(_: Request, response: Response): Promise<Response> {
    const customers = await container.resolve(ListCustomersService).execute();

    return response.json(customers);
  }
}
