const errorHandler = (err, req, res, next) => {
    console.error(err.stack || err);
    
    const status = err.status || 500;
    const message = err.message || 'Hubo un problema interno en el servidor.';
    
    res.status(status).json({ error: message });
};

const notFoundHandler = (req, res) => {
    res.status(404).json({ error: 'Endpoint no encontrado' });
};

module.exports = {
    errorHandler,
    notFoundHandler
};
