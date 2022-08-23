export default function getDate() {
	return new Date().toLocaleString( 'en-US', {timeZone: 'Europe/Paris'} );
}
