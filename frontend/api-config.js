// Set this to the public URL of the deployed backend when the site is hosted online.
window.PADHAAN_API_BASE = window.PADHAAN_API_BASE || (
    ['localhost', '127.0.0.1'].includes(window.location.hostname)
        ? window.location.origin
        : ''
);

window.padhaanApiUrl = function (path) {
    const base = String(window.PADHAAN_API_BASE || '').replace(/\/$/, '');
    return base ? `${base}${path.startsWith('/') ? path : `/${path}`}` : null;
};

window.padhaanApiFetch = function (path, options) {
    const url = window.padhaanApiUrl(path);
    if (!url) {
        return Promise.reject(new Error('The Padhaan backend URL is not configured for this site.'));
    }
    return window.fetch(url, options);
};

const padhaanNativeFetch = window.fetch.bind(window);
window.fetch = function (resource, options) {
    if (typeof resource === 'string' && resource.startsWith('/') && !resource.startsWith('//')) {
        const apiUrl = window.padhaanApiUrl(resource);
        if (apiUrl) resource = apiUrl;
    }
    return padhaanNativeFetch(resource, options);
};
