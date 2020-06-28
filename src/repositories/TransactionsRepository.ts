import { EntityRepository, Repository } from 'typeorm';

import Transaction from '../models/Transaction';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {
  public async getBalance(): Promise<Balance> {
    const transactions = await this.find();

    const { income, outcome, total } = transactions.reduce(
      (accumulator: Balance, { type, value }) => {
        if (type === 'income') {
          accumulator.income += value;
          accumulator.total += value;
        } else {
          accumulator.outcome += value;
          accumulator.total -= value;
        }

        return accumulator;
      },
      {
        income: 0,
        outcome: 0,
        total: 0,
      },
    );

    return { income, outcome, total };
  }
}

export default TransactionsRepository;
