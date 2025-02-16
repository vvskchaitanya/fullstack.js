var builder = require('../../imports/builder');

module.exports = (req, res) => {
     
    builder.build();

    res.writeHead(200);
    res.end();
}
