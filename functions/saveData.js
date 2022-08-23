import config from '../config.json' assert { type: 'json' };
import database from '../data/database.js';
import getDate from './getDate.js';

/**
 * @name save_data
 * @description Save data it into the DB row corresponding to the id
 *
 * @param {Object} data data to save
 * @param {int} id DB row id (account id)
 * @returns {void}
 */
export default async function save_data(data, id) {
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
                error            = ${10},
                date             = '${getDate()}'
            WHERE id = '${id}'
		`;
		await database.query( query );
		
	} catch (e) {
		console.error( e );
	}
}