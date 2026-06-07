import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { QueryFailedError } from 'typeorm';

const STATUS_MESSAGES: Record<number, string> = {
  400: 'Requisição inválida.',
  401: 'Não autorizado. Faça login para continuar.',
  403: 'Você não tem permissão para realizar esta ação.',
  404: 'Recurso não encontrado.',
  409: 'Conflito: a operação não pode ser concluída.',
  422: 'Dados inválidos. Verifique os campos e tente novamente.',
  429: 'Muitas requisições. Aguarde um momento e tente novamente.',
  500: 'Erro interno do servidor. Tente novamente em instantes.',
  503: 'Serviço temporariamente indisponível. Tente novamente em breve.',
};

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = STATUS_MESSAGES[500];
    let errors: string[] | undefined;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const raw = exception.getResponse();

      if (typeof raw === 'string') {
        message = raw || STATUS_MESSAGES[status] || STATUS_MESSAGES[500];
      } else if (typeof raw === 'object' && raw !== null) {
        const resp = raw as Record<string, unknown>;

        if (Array.isArray(resp.message)) {
          errors = resp.message as string[];
          message =
            errors[0] ?? STATUS_MESSAGES[status] ?? STATUS_MESSAGES[500];
        } else if (typeof resp.message === 'string' && resp.message) {
          message = resp.message;
        } else {
          message = STATUS_MESSAGES[status] ?? STATUS_MESSAGES[500];
        }
      }
    } else if (exception instanceof QueryFailedError) {
      this.logger.error(`Database error: ${exception.message}`);
      const mysqlErr = exception as QueryFailedError & {
        code?: string;
        sqlMessage?: string;
      };

      if (mysqlErr.code === 'ER_DUP_ENTRY') {
        status = HttpStatus.CONFLICT;
        message = 'Registro duplicado. Este item já existe no sistema.';
      } else {
        status = HttpStatus.INTERNAL_SERVER_ERROR;
        message =
          'Erro ao acessar o banco de dados. Tente novamente em instantes.';
      }
    } else {
      this.logger.error('Unhandled exception:', exception);
    }

    response.status(status).json({
      statusCode: status,
      message,
      ...(errors && errors.length > 1 ? { errors } : {}),
    });
  }
}
