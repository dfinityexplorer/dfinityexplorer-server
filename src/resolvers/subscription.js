/**
 * @file subscription
 * @copyright Copyright (c) 2018 Dylan Miller and dfinityexplorer contributors
 * @license MIT License
 */

/**
 * GraphQL resolver for block query.
 * @param {Object} parent The result object of the parent resolver.
 * @param {Object} args The parameters for the subscription.
 * @param {Object} context Object shared by all resolvers that gets passed through resolver chain.
 * @param {Object} info An AST representation of the subscription.
 * @return {Object} The scalar/object resolver result.
 */
function blockSubscribe (parent, args, context, info) {
  return context.db.subscription.block(
    { where: { mutation_in: ['CREATED'] } },
    info
  );
}
const block = { subscribe: blockSubscribe };

/**
 * GraphQL resolver for transaction query.
 * @param {Object} parent The result object of the parent resolver.
 * @param {Object} args The parameters for the subscription.
 * @param {Object} context Object shared by all resolvers that gets passed through resolver chain.
 * @param {Object} info An AST representation of the subscription.
 * @return {Object} The scalar/object resolver result.
 */
function transactionSubscribe (parent, args, context, info) {
  return context.db.subscription.transaction(
    { where: { mutation_in: ['CREATED'] } },
    info
  );
}
const transaction = { subscribe: transactionSubscribe };

module.exports = {
   block,
   transaction
};