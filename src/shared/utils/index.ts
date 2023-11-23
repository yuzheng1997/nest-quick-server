export * from './parseStack';

export const getTimestamp = () => {
  const localeStringOptions = {
    year: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    day: '2-digit',
    month: '2-digit',
  };
  return new Date(Date.now()).toLocaleString(
    undefined,
    localeStringOptions as Intl.DateTimeFormatOptions,
  );
};

export const isString = (val: any): val is string => {
  return typeof val === 'string';
};
