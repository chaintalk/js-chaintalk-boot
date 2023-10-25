import minimist from "minimist";
import _ from "lodash";
import { TypeUtil } from "chaintalk-utils";

const argv = minimist( process.argv.slice( 2 ) );


export class ParamUtils
{
	static getPort( defaultPort )
	{
		let port;
		if ( undefined !== argv &&
			undefined !== argv.port )
		{
			port = parseInt( argv.port );
			if ( this.isValidPortNumber( port ) )
			{
				return port;
			}
		}
		if ( undefined !== process &&
		     undefined !== process.env &&
		     undefined !== process.env.PORT )
		{
			port = parseInt( process.env.PORT );
			if ( this.isValidPortNumber( port ) )
			{
				return port;
			}
		}

		return this.isValidPortNumber( defaultPort ) ? defaultPort : 0;
	}

	static isValidPortNumber( port )
	{
		return _.isInteger( port ) && port > 80 && port <= 65535;
	}

	static getParamStringValue( name, defaultValue )
	{
		if ( ! TypeUtil.isNotEmptyString( name ) )
		{
			return defaultValue;
		}

		//	...
		name = name.toLowerCase().trim();
		if ( undefined !== argv &&
		     undefined !== argv[ name ] )
		{
			return String( argv[ name ] ).trim();
		}

		//	...
		name = name.toUpperCase().trim();
		if ( undefined !== process &&
		     undefined !== process.env &&
		     undefined !== process.env[ name ] )
		{
			return String( process.env[ name ] ).trim();
		}

		return defaultValue;
	}

	static getParamIntValue( name, defaultValue )
	{
		if ( ! TypeUtil.isNotEmptyString( name ) )
		{
			return defaultValue;
		}

		try
		{
			//	...
			name = name.toLowerCase().trim();
			if ( undefined !== argv &&
			     undefined !== argv[ name ] )
			{
				return parseInt( argv[ name ] );
			}

			//	...
			name = name.toUpperCase().trim();
			if ( undefined !== process &&
			     undefined !== process.env &&
			     undefined !== process.env[ name ] )
			{
				return parseInt( process.env[ name ] );
			}
		}
		catch ( err )
		{
		}

		return defaultValue;
	}

	static getScriptFilename( filenameOnly )
	{
		if ( ! process )
		{
			return '';
		}
		if ( ! Array.isArray( process.argv ) || process.argv.length < 2 )
		{
			return '';
		}

		//	process.argv :  [
		//		'/Users/you/.nvm/versions/node/v18.17.1/bin/node',
		//		'/Users/your/chaintalk/js-chaintalk-sync/demo/clientDemo1.js'
		//	]
		const scriptFullFilename = process.argv.slice( 1, 2 )[ 0 ];
		if ( filenameOnly )
		{
			//	will return the last item, filename only
			const fileNameMatch = scriptFullFilename.split( /[\\/]+/ );
			return fileNameMatch.pop();
		}
		else
		{
			return scriptFullFilename;
		}
	}
}
