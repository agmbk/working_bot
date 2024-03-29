const config = require('../config.json');
const database = require('../data/database.js');

/**
 * @name saveData
 * @description Save data it into the DB row corresponding to the id
 *
 * @param {Object} data data to save
 * @param {int} id DB row id (account id)
 * @param {Date} date last money message date
 * @returns {void}
 */
module.exports = async function saveData(data, id, date) {
	try {
		const query = `
            UPDATE ${config.table}
            SET total_days_count = ${data.total_days_count},
                money_total      = ${data.money_total},
                money            = ${data.money},
                money_mean       = ${data.money_mean},
                count_total      = ${data.count_total},
                count            = ${data.count},
                count_mean       = ${data.count_mean},
                error            = ${data.error},
                date             = '${date.toUTCString()}'
            WHERE id = '${id}'`;
		await database.query(query);
		
	} catch (e) {
		console.error('saveData has crashed'.red(), e);
	}
};