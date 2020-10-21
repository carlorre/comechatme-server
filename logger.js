const { createLogger, format, transports } = require('winston');

const {
  combine, timestamp, label, printf,
} = format;

// eslint-disable-next-line no-shadow
const myFormat = printf(({ level, message, timestamp }) => `${timestamp} ${level}: ${message}`);

const logger = createLogger({
  format: combine(label({ label: this.level }), timestamp(), myFormat),
  transports: [
    new transports.File({ filename: 'activity.log' }),
    new transports.Console(),
  ],
});

module.exports = logger;
