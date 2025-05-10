exports.errorHandler = (err, req, res, next) => {
    console.error(err);
    res.status(err.status || 500).json({ error: err.message });
  };

exports.notFoundHandler = (req, res) => {
    res.status(404).json({ error: 'Not Found' });
  };  

exports.methodNotAllowedHandler = (req, res) => {
    res.status(405).json({ error: 'Method Not Allowed' });
  };

exports.unauthorizedHandler = (req, res) => {
    res.status(401).json({ error: 'Unauthorized' });
  };

exports.forbiddenHandler = (req, res) => {
    res.status(403).json({ error: 'Forbidden' });
  };

exports.badRequestHandler = (req, res) => {
    res.status(400).json({ error: 'Bad Request' });
  };

exports.internalServerErrorHandler = (req, res) => {
    res.status(500).json({ error: 'Internal Server Error' });
  };
  
exports.serviceUnavailableHandler = (req, res) => {
    res.status(503).json({ error: 'Service Unavailable' });
  };