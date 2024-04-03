import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { ToastrService } from "ngx-toastr";
import { Observable, catchError, throwError } from "rxjs";
import { HttpException } from "../models/http-exception.model";

@Injectable()
export class HttpExceptionInterceptor implements HttpInterceptor {

  constructor(private toastr: ToastrService){}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      catchError((err) => {
        let errors = []
        if (err instanceof HttpErrorResponse) {
          console.error(err);
          switch (err.status) {
            case 400:
              if (err.error.errors) {
                //check if err.error.errors is array
                if (Array.isArray(err.error.errors)) {
                  let validErrors = err.error.errors;
                  for(let i = 0; i < validErrors.length; i++)
                    errors.push(validErrors[i].ErrorMessage);
                  }
                else {
                  Object.keys(err.error.errors).forEach(key => {
                    errors.push(err.error.errors[key][0]);
                  });
                }

                break;
              }

              if (err.error) {
                errors.push(err.error)
                break;
              }

              break;
            case 401:
              errors.push(err.statusText)

              break;
            case 403:
              if(err.error?.ExpiresAt && err.error?.Reason)
              {
                let msg = `You are banned until ${new Date(err.error.ExpiresAt).toLocaleString()}, reason: ${err.error.Reason}`;

                errors.push(msg);
                this.toastr.error(msg);
              }
              errors.push("Access denied");

              break;
            case 404:
              errors.push(err.error ?? "Failed to send request")

              break;
            case 500:
              errors.push("Internal server error");

              break;
            default:
              // connection refused or timeout
              if(err.status == 0) {
                errors.push("Connection refused");

                break;
              }

              errors.push("Something went wrong");

              break;
          }
        }

        if(err instanceof Error) {
          errors.push(err.message);
        }

        const httpException: HttpException = {
          statusCode: err.status,
          errors: errors,
          error: err
        }

        return throwError(httpException);
      })
    );
  }

}
