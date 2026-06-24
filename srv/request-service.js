module.exports = (srv) => {
  srv.before('CREATE', 'Requests', (req) => {
    if (req.data.status_code !== 'DRAFT') {
      req.reject(
        400, 
        'Only requests with status "DRAFT" can be created', 
        'status_code'
      );
    }
  });

};
