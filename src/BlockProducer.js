/**
 * @file BlockProducer
 * @copyright Copyright (c) 2018 Dylan Miller and openblockexplorer contributors
 * @license MIT License
 */

const sha3_256 = require('js-sha3').sha3_256;
const getRandomInt = require('./utils/getRandomInt');
const getRandomNumber = require('./utils/getRandomNumber');

/**
 * Provides a simulation of a blockchain network.
 */
module.exports = class BlockProducer {
  /**
   * Create a BlockProducer object.
   * @param {Object} The Prisma binding object.
   * @constructor
   */
  constructor(prisma) {
    // The Prisma binding object.
    this.prisma = prisma;

    // The block time.
    this.blockTimeMs = 10000;   // 10 seconds

    // The remove time and the max number of blocks to keep in the database.
    this.removeTimeMs = 60000; // 10 minutes
    const blocksPerDay = 24 * 60 * 60 / (this.blockTimeMs / 1000);
    this.maxBlocks = blocksPerDay; // keep at most one day of blocks

    // Starting block height.
    const startDate = new Date(2020, 6, 1);
    const todayDate = new Date();
    const elapsedMs = todayDate.getTime() - startDate.getTime();
    this.blockHeight = Math.floor(elapsedMs / this.blockTimeMs);
  }

  /**
   * Start adding blocks.
   * @public
   */
  start() {
    // Add new blocks using intervals.
    setInterval(() => { this.addBlock() }, this.blockTimeMs);

    // Remove old blocks using intervals.
    setInterval(() => { this.removeBlocks() }, this.removeTimeMs);
  }

  /**
   * Add a new block to the Prisma server.
   * @private
   */
  addBlock() {
    let transactions = [];
    const numTransactions = 0 + getRandomInt(0, 5);
    for (let i = 0; i < numTransactions; i++)
      transactions.push(this.createTransaction());

    const date = new Date();
    const block = {
      height: this.blockHeight++,
      timestamp: date,
      transactions: { create: transactions }
    };
    // If an error occurs, we simply log it, since we want the BlockProducer to keep running.
    this.prisma.mutation
      .createBlock({ data: block }, '{ id }')
      .catch(error => console.log(error));
  }

  /**
   * Remove old blocks from the Prisma server.
   * @private
   */
  async removeBlocks() {
    const block = {
      height_lt: this.blockHeight - this.maxBlocks
    };
    // If an error occurs, we simply log it, since we want the BlockProducer to keep running.
    await this.prisma.mutation
      .deleteManyTransactions({ where: { block: block } })
      .catch(error => console.log(error));
    await this.prisma.mutation
      .deleteManyBlocks({ where: block })
      .catch(error => console.log(error));
  }

  /**
   * Add a new transaction to the Prisma server.
   * @param {String} blockId The ID of the block to add the transaction to.
   * @private
   */
  addTransaction(blockId) {   
    const transaction = createTransaction();
    transaction.block = { connect: { id: blockId} };
    // If an error occurs, we simply log it, since we want the BlockProducer to keep running.
    this.prisma.mutation
      .createTransaction({ data: transaction }, '{ id }')
      .catch(error => console.log(error));
  }

  /**
   * Create a new transaction object.
   * @return {Object} The created transaction object.
   * @private
   */
  createTransaction() {                    
    const hash = sha3_256(getRandomInt(0, Number.MAX_SAFE_INTEGER).toString());
    const amount = getRandomNumber(1, getRandomNumber(0, 1) > 0.5 ? 1000 : 100);
    const transaction = {
      hash: hash,
      amount: amount
    };
    return transaction;
  }
};
