import { inject, injectable } from 'tsyringe';

import AppError from '@shared/errors/AppError';

import IProductsRepository from '@modules/products/repositories/IProductsRepository';
import ICustomersRepository from '@modules/customers/repositories/ICustomersRepository';
import Customer from '@modules/customers/infra/typeorm/entities/Customer';
import Order from '../infra/typeorm/entities/Order';
import IOrdersRepository from '../repositories/IOrdersRepository';

interface IProduct {
  id: string;
  quantity: number;
}

interface IRequest {
  customer_id: string;
  products: IProduct[];
}

@injectable()
class CreateOrderService {
  constructor(
    @inject('INJOrdersRepository')
    private ordersRepository: IOrdersRepository,
    @inject('INJProductsRepository')
    private productsRepository: IProductsRepository,
    @inject('INJCustomersRepository')
    private customersRepository: ICustomersRepository,
  ) {}

  public async execute({ customer_id, products }: IRequest): Promise<Order> {
    const customer = await this.customersRepository.findById(customer_id);
    if (!customer) throw new AppError('User not exists');

    // Inexistents ALL
    const existentProducts = await this.productsRepository.findAllById(
      products,
    );

    if (!existentProducts.length)
      throw new AppError('Could not find any a product');

    // Inexistents
    const inexistentsProducts = products.filter(
      product => !existentProducts.map(e => e.id).includes(product.id),
    );

    if (inexistentsProducts.length)
      throw new AppError(
        `Could not find these products IDs: ${inexistentsProducts
          .map(i => i.id)
          .join('|')}`,
      );

    const findProductsWithNoQuantityAvailable = products.filter(
      product =>
        existentProducts.filter(p => p.id === product.id)[0].quantity <
        product.quantity,
    );

    if (findProductsWithNoQuantityAvailable.length)
      throw new AppError(
        `Insuficient quantity for these products IDs: ${findProductsWithNoQuantityAvailable
          .map(i => i.id)
          .join('|')}`,
      );

    const serializedProducts = products.map(p => {
      const [{ price }] = existentProducts.filter(pr => pr.id === p.id);

      if (!price) throw new AppError(`Product ${p.id} without registred price`);

      return {
        product_id: p.id,
        quantity: p.quantity,
        price,
      };
    });

    const order = await this.ordersRepository.create({
      customer,
      products: serializedProducts,
    });

    const orderedProductsQuantity = products.map(product => ({
      id: product.id,
      quantity:
        existentProducts.filter(p => p.id === product.id)[0].quantity -
        product.quantity,
    }));

    await this.productsRepository.updateQuantity(orderedProductsQuantity);

    return order;
  }
}

export default CreateOrderService;
