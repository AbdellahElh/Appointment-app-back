const winston = require('winston');
// Haal de format functies uit winston
const { combine, timestamp, colorize, printf } = winston.format;

// Declareer een variabele om de root logger te houden
let rootLogger;

// Functie om de root logger te krijgen
const getLogger = () => {
  // Als de root logger nog niet is geïnitialiseerd, gooi dan een foutmelding
  if (!rootLogger) {
    throw new Error('Je moet eerst de logger initialiseren');
  }

  // Geef de root logger terug
  return rootLogger;
};

// Functie om het formaat van de logberichten te definiëren
const loggerFormat = () => {
  // Functie om een logbericht te formatteren
  const formatMessage = ({
    level,
    message,
    timestamp,
    name = 'server',
    ...rest
  }) =>
    `${timestamp} | ${name} | ${level} | ${message} | ${JSON.stringify(rest)}`;

  // Functie om een fout logbericht te formatteren
  const formatError = ({ error: { stack }, ...rest }) =>
    `${formatMessage(rest)}\n\n${stack}\n`;
  // Functie om het juiste formaat te kiezen op basis van het type van het logbericht
  const format = (info) =>
    info.error instanceof Error ? formatError(info) : formatMessage(info);
  return combine(colorize(), timestamp(), printf(format));
};

// Functie om de logger te initialiseren
const initializeLogger = ({
  level,
  disabled = false,
  defaultMeta = {}
}) => {
  // Creëer de root logger met de gegeven configuratie
  rootLogger = winston.createLogger({
    level,
    format: loggerFormat(),
    defaultMeta,
    transports: [
      // Stuur logs naar de console
      new winston.transports.Console({
        silent: disabled,
      }),
    ],
  });

  // Geef de root logger terug
  return rootLogger;
};

// Exporteer de initializeLogger en getLogger functies
module.exports = {
  initializeLogger,
  getLogger,
};