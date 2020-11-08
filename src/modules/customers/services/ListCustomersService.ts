import { inject, injectable } from 'tsyringe';

import Customer from '../infra/typeorm/entities/Customer';
import ICustomersRepository from '../repositories/ICustomersRepository';

@injectable()
class ListCustomersService {
  constructor(
    @inject('INJCustomersRepository')
    private customersRepository: ICustomersRepository,
  ) {}

  public async execute(): Promise<Customer[]> {
    const customers = await this.customersRepository.index();

    return customers;
  }
}

export default ListCustomersService;
