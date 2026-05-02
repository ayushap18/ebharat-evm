export function notFound(_request, response) {
  response.status(404).json({ error: 'Route not found' });
}

export function errorHandler(error, _request, response, _next) {
  const status = error.status || 500;
  response.status(status).json({ error: status === 500 ? 'Internal server error' : error.message });
}
