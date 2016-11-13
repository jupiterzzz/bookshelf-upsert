'use strict';

module.exports = function(Bookshelf) {

    /**
     * Perform an "Upsert" using the "INSERT ... ON CONFLICT ... " syntax in PostgreSQL 9.5
     * @link http://www.postgresql.org/docs/9.5/static/sql-insert.html
     * @ original author https://github.com/plurch
     * @ edited and updated transaction support by Tuan Phung - https://github.com/jupiterzzz
     * @param  {Object} options 
     * @param {String} options.tableName - Database Table that need to upsert
     * @param {Array} options.conflictTarget - column(s) in the table which has a unique index constraint
     * @param {Array} options.updateTarget - column(s) in the table which need to update
     * @param {Object / Array} options.itemData - a hash of properties to be inserted/updated into the row(s)
     * @param {Object} options.transaction - supported transaction
     * @returns {Promise} - A Promise which resolves to the inserted/updated row
     */
    var upsert = function(options) {
        let opts = {
            tableName: options.tableName,
            conflictTarget: options.conflictTarget,
            updateTarget: options.updateTarget,
            itemData: options.itemData,
            transaction: options.transaction || undefined
        }
        let conflictTargetString = opts.conflictTarget.join(', ')

        let firstObjectIfArray = Array.isArray(opts.itemData) ? opts.itemData[0] : opts.itemData;
        let exclusions = Object.keys(firstObjectIfArray)
            .filter(c => opts.updateTarget.indexOf(c) >= 0 )
            .map(c => Bookshelf.knex.raw('?? = EXCLUDED.??', [c, c]).toString())
            .join(",\n");

        let insertString = Bookshelf.knex(opts.tableName).insert(opts.itemData).toString();
        let conflictString = Bookshelf.knex.raw(` ON CONFLICT (${conflictTargetString}) DO UPDATE SET ${exclusions} RETURNING *;`).toString();
        let query = (insertString + conflictString).replace(/\?/g, '\\?');

        return (options.transaction || Bookshelf.knex).raw(query)
            // .on('query', data => console.log('Knex: ' + data.sql))
            .then(result => result.rows);
    };

    Bookshelf.Model = Bookshelf.Model.extend({
        upsert: upsert
    });

    Bookshelf.Collection = Bookshelf.Collection.extend({
        upsert: upsert
    });
};
