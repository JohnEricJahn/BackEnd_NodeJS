import { getRepository, getCustomRepository } from 'typeorm';

import AppError from '../errors/AppError';
import TransactionRepository from '../repositories/TransactionsRepository';
import Transaction from '../models/Transaction';
import Category from '../models/Category';

interface Request {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

class CreateTransactionService {
  public async execute({
    category,
    type,
    title,
    value,
  }: Request): Promise<Transaction> {
    const transactionsRepository = getCustomRepository(TransactionRepository);
    const categoriesRepository = getRepository(Category);

    let categoryAlreadyExists = await categoriesRepository.findOne({
      where: { title: category },
    });

    if (!categoryAlreadyExists) {
      categoryAlreadyExists = categoriesRepository.create({
        title: category,
      });

      await categoriesRepository.save(categoryAlreadyExists);
    }

    const { total } = await transactionsRepository.getBalance();

    if (type === 'outcome' && total < value) {
      throw new AppError(
        'You dont have enough balance to complete this transaction',
        400,
      );
    }

    const transaction = transactionsRepository.create({
      title,
      type,
      value,
      category: categoryAlreadyExists,
    });

    await transactionsRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
