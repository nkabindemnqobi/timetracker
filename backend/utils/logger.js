const isDev = process.env.NODE_ENV !== 'production';

const log = (message, data = null) => {
  if (isDev) {
    if (data) {
      console.log(`[LOG] ${message}`, data);
    } else {
      console.log(`[LOG] ${message}`);
    }
  }
};

const error = (message, error = null) => {
  if (isDev) {
    if (error) {
      console.error(`[ERROR] ${message}`, {
        message: error.message,
        status: error.status,
        statusText: error.statusText,
        url: error.url,
        stack: error.stack,
        cause: error.cause
      });
    } else {
      console.error(`[ERROR] ${message}`);
    }
  }
};

const warn = (message, data = null) => {
  if (isDev) {
    if (data) {
      console.warn(`[WARN] ${message}`, data);
    } else {
      console.warn(`[WARN] ${message}`);
    }
  }
};

const info = (message, data = null) => {
  if (isDev) {
    if (data) {
      console.info(`[INFO] ${message}`, data);
    } else {
      console.info(`[INFO] ${message}`);
    }
  }
};

export { log, error, warn, info };
