export const API_ENDPOINTS = {
  heroes: 'heroes',
} as const;

export const QUERY_PARAMS = {
  search: 'search',
  page: 'page',
  size: 'size',
} as const;

export const HTTP_STATUS = {
  ok: 200,
  created: 201,
  noContent: 204,
  notFound: 404,
} as const;

export const HTTP_METHODS = {
  get: 'GET',
  post: 'POST',
  put: 'PUT',
  delete: 'DELETE',
} as const;
