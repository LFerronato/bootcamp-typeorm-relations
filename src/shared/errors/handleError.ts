import { ErrorRequestHandler } from 'express';

import AppError from './AppError';

const handleError: ErrorRequestHandler = (err, req, resp, _) => {
  if (err instanceof AppError) {
    return resp.status(err.statusCode).json({
      status: 'error',
      message: err.message,
    });
  }

  console.error(err);

  return resp.status(500).json({
    status: 'error',
    message: 'Internal server error',
  });
};

export default handleError;
