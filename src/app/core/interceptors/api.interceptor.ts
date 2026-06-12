import { HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { environment } from '../../../environments/environment';

const addJsonHeaders = (req: HttpRequest<unknown>): HttpRequest<unknown> => {
  const hasBody = ['POST', 'PUT', 'PATCH'].includes(req.method);

  return req.clone({
    url: `${environment.apiUrl}${req.url}`,
    setHeaders: {
      'Accept': 'application/json',
      ...(hasBody ? { 'Content-Type': 'application/json' } : {})
    }
  });
};

export const apiInterceptor: HttpInterceptorFn = (req, next) => {
  return next(addJsonHeaders(req));
};
