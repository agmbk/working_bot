import config from '../config.json' assert { type: 'json' };
import database from '../data/database.js';
import { getLocaleDate } from './dateHandler.js';

/**
 * @name saveData
 * @description Save data it into the DB row corresponding to the id
 *
 * @param {Object} data data to save
 * @param {int} id DB row id (account id)
 * @param {Date} date last money message date
 * @returns {void}
 */
export default async function saveData(data, id, date) {
	console.log( 'saveData'.red(), date, getLocaleDate( date ), getLocaleDate( date ) );
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
                date             = '${date}'
            WHERE id = '${id}'
		`;
		await database.query( query );
		
	} catch (e) {
		console.error( e );
	}
}