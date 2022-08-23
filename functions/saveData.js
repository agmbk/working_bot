import config from '../config.json' assert { type: 'json' };
import database from '../data/database.js';
import getDate from './getDate.js';

export default async function save_data(data, id) {
	/**
	 * Save data in the corresponding DB row
	 * data: The data to save
	 * id: The DB row id
	 * @type {string}
	 */
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