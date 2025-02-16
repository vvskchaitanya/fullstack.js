var compiler = require('../../imports/compiler');

module.exports = (req, res) => {
    compiler.compile();
    compiler.develop();

    res.writeHead(200);
    res.end();
}
