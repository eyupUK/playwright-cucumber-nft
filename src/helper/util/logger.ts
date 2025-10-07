import { createLogger, transports, format } from "winston";

export function options(scenarioName?: string, logLevel: string = "info") {
    // Fallback to a default name if scenarioName is undefined or empty
    const safeScenarioName = scenarioName?.replaceAll(/[^a-zA-Z0-9]+/g, "_") || "default_scenario";

    return createLogger({
        level: logLevel, // Set the default log level
        format: format.combine(
            format.label({ label: safeScenarioName }), // Add scenario name as a label
            format.timestamp({ format: 'MMM-DD-YYYY HH:mm:ss' }),
            format.errors({ stack: true }), // Include stack traces for errors
            format.align(),
            format.printf(info => {
                return `${info.level}: ${info.timestamp}: ${info.message}`;
            })
        ),
        transports: [
            new transports.File({
                filename: `test-results/logs/${safeScenarioName}.log`,
                level: logLevel,
                maxsize: 5 * 1024 * 1024, // 5 MB log rotation
                maxFiles: 5, // Keep up to 5 rotated files
            }),
            new transports.Console({
                level: logLevel, // Log to console for real-time debugging
                format: format.combine(
                    format.colorize(), // Add colors for console logs
                    format.printf(info => `${info.level}: ${info.timestamp}: ${info.message}`)
                )
            }),
        ],
        // exceptionHandlers: [
        //     new transports.File({ filename: `test-results/logs/${safeScenarioName}-exceptions.log` })
        // ],
        exitOnError: false, // Prevent the logger from exiting on exceptions
    });
}
