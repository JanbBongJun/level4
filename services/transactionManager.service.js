const { Transaction } = require("sequelize");
class CustomTransactionManager {
    constructor(transaction) {
        this.transaction = transaction;
    }

    getTransaction() {
        return this.transaction;
    }
    async commitTransaction() {
        await this.transaction.commit();
    }
    async rollbackTransaction() {
        await this.transaction.rollback();
    }
}

const TransactionManager = async (sequelize, transactionOptions = null) => {
    let transaction;
    if (transactionOptions) {
        transaction = await sequelize.transaction(transactionOptions);
    } else {
        transaction = await sequelize.transaction();
    }
    return new CustomTransactionManager(transaction);
};

module.exports = { TransactionManager, Transaction };
