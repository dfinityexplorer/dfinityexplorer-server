/**
 * @file BlockProducer
 * @copyright Copyright (c) 2018 Dylan Miller and dfinityexplorer contributors
 * @license MIT License
 */

const sha3_256 = require('js-sha3').sha3_256;
const getRandomInt = require('./utils/getRandomInt');
const getRandomNumber = require('./utils/getRandomNumber');

/**
 * Provides a simulation of the DFINITY network.
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
    this.blockTimeMs = 3500;

    // Starting block height.
    const startDate = new Date(2018, 8, 1);
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
  }

  /**
   * Add a new block to the Prisma server.
   * @private
   */
  addBlock() {
    const date = new Date();
    const numTransactions = 0 + getRandomInt(0, 12);
    const block = {
      height: this.blockHeight++,
      timestamp: date
    }; 
    this.prisma.mutation
      .createBlock({ data: block }, '{ id }')
      .then(response => {
        for (let i = 0; i < numTransactions; i++)
          this.addTransaction(response.id);
      });
  }

  /**
   * Add a new transaction to the Prisma server.
   * @param {String} blockId The ID of the block to add the transaction to.
   * @private
   */
  addTransaction(blockId) {                    
    const hash = sha3_256(getRandomInt(0, Number.MAX_SAFE_INTEGER).toString());
    const amount = getRandomNumber(1, getRandomNumber(0, 1) > 0.5 ? 1000 : 100);
    const transaction = {
      hash: hash,
      amount: amount,
      block: { connect: { id: blockId} }
    };
    this.prisma.mutation
      .createTransaction({ data: transaction }, '{ id }');
  }
};
