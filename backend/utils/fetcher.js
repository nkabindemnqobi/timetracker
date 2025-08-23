const { debug, error } = require('./logger');

const createFetcher = (baseURL = '', defaultHeaders = {}) => {
  const headers = {
    'Content-Type': 'application/json',
    ...defaultHeaders
  };
  
  debug('Fetcher initialized', { baseURL, defaultHeaders: Object.keys(defaultHeaders) });

  const request = async (endpoint, options = {}) => {
    const url = `${baseURL}${endpoint}`;
    const config = {
      headers: {
        ...headers,
        ...options.headers
      },
      ...options
    };

    debug('Making request', { 
      url, 
      method: config.method || 'GET',
      headers: Object.keys(config.headers)
    });

    try {
      const response = await fetch(url, config);
      
      debug('Response received', { 
        status: response.status, 
        statusText: response.statusText,
        url: response.url
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        error('HTTP error response', {
          status: response.status,
          statusText: response.statusText,
          url: response.url,
          responseText: errorText
        });
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const contentType = response.headers.get('content-type');
      debug('Response content type', { contentType });
      
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        debug('JSON response parsed successfully');
        return data;
      }
      
      const textData = await response.text();
      debug('Text response received', { length: textData.length });
      return textData;
    } catch (err) {
      error('Fetcher request failed', err);
      
      if (err.name === 'TypeError' && err.message.includes('fetch')) {
        error('Network error - possible causes:', {
          invalidUrl: url,
          networkIssue: true,
          dnsIssue: true,
          firewallIssue: true
        });
        throw new Error(`Network error: Unable to reach ${baseURL}. Please check your domain and network connection.`);
      }
      
      throw err;
    }
  };

  const get = (endpoint, options = {}) => request(endpoint, { ...options, method: 'GET' });
  const post = (endpoint, data, options = {}) => request(endpoint, {
    ...options,
    method: 'POST',
    body: JSON.stringify(data)
  });
  const put = (endpoint, data, options = {}) => request(endpoint, {
    ...options,
    method: 'PUT',
    body: JSON.stringify(data)
  });
  const del = (endpoint, options = {}) => request(endpoint, { ...options, method: 'DELETE' });

  return { get, post, put, delete: del };
};

module.exports = createFetcher;

