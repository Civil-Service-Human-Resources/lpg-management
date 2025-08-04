import { format, transports, createLogger } from 'winston'
const { combine, timestamp, printf } = format
import * as config from '../config'
import * as debug from 'debug'
import * as winston from 'winston'
import {validLogLevel} from '../config'

let logger: winston.Logger

const loggingFormat = printf(info => JSON.stringify({
	timestamp: info.timestamp,
	level: info.level,
	message: info.message,
	name: info.name
}))

export function createNodeLogger(loggingLevel: validLogLevel) {
	const WINSTON_CONFIG = {
		level: loggingLevel.toLowerCase(),
		format: combine(
			timestamp(),
			loggingFormat
		),
		transports: [
			new transports.Console()
		]
	}

	logger = createLogger(WINSTON_CONFIG)

	if (config.LOGGING_LEVEL === 'silly') {
		debug.enable("*")
		const serverLogger = logger.child({name: 'internals'})
		const originalStdErr = process.stderr.write.bind(process.stderr);
		serverLogger.info("ENABLING TRACE LOGS")
		process.stderr.write = (chunk?: any, encodingOrCb?: string | Function, cb?: Function): boolean => {
			if (typeof chunk == 'string') {
				serverLogger.silly(`NODE INTERNAL: ${chunk}`, encodingOrCb)
				return true
			}
			return originalStdErr(chunk, encodingOrCb, cb)
		}
		serverLogger.info("TRACE LOGS ENABLED")
	}
}




export const getLogger = (loggerName: string) => {
	return logger.child({name: loggerName})
}
