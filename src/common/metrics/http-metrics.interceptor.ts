import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { InjectMetric } from '@willsoto/nestjs-prometheus';
import { Counter, Histogram } from 'prom-client';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export default class HttpMetricsInterceptor implements NestInterceptor {
  constructor(
    @InjectMetric('http_requests_total')
    private readonly requestsCounter: Counter<string>,
    @InjectMetric('http_request_duration_seconds')
    private readonly requestDuration: Histogram<string>,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    if (context.getType() !== 'http') {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    const route = request.route?.path ?? request.url;
    const stopTimer = this.requestDuration.startTimer({
      method: request.method,
      route,
    });

    return next.handle().pipe(
      tap({
        next: () => this.recordEnd(request.method, route, response.statusCode, stopTimer),
        error: (error) =>
          this.recordEnd(
            request.method,
            route,
            error?.status ?? 500,
            stopTimer,
          ),
      }),
    );
  }

  private recordEnd(
    method: string,
    route: string,
    statusCode: number,
    stopTimer: (labels?: Record<string, string | number>) => number,
  ) {
    this.requestsCounter.inc({ method, route, status_code: statusCode });
    stopTimer({ status_code: statusCode });
  }
}
