import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage = 'Une erreur est survenue';
      
      if (error.error instanceof ErrorEvent) {
        errorMessage = `Erreur: ${error.error.message}`;
      } else {
        switch (error.status) {
          case 401:
            errorMessage = 'Session expirée. Veuillez vous reconnecter.';
            localStorage.removeItem('jwt_token');
            localStorage.removeItem('current_user');
            window.location.href = '/auth/login';
            break;
          case 403:
            errorMessage = 'Vous n\'avez pas les permissions nécessaires.';
            break;
          case 404:
            errorMessage = 'Ressource non trouvée.';
            break;
          case 409:
            errorMessage = error.error?.message || 'Conflit détecté.';
            break;
          case 500:
            errorMessage = 'Erreur serveur. Réessayez plus tard.';
            break;
          default:
            errorMessage = error.error?.message || `Erreur ${error.status}`;
        }
      }
      
      console.error('HTTP Error:', errorMessage, error);
      return throwError(() => new Error(errorMessage));
    })
  );
};
