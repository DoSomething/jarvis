'use strict';

const console = require('keypunch');
const Keyword = require(`${global.nodes}/Keyword`);

module.exports = {
  retireOldProtocolKeywords: (keyword, protocol, done) =>
    Keyword.find({
      keyword,
      protocol,
      active: true,
    })
    .exec()
    .then((keywords) => {
      if (keywords.length === 0 && done) done();

      keywords.forEach((key, index) => {
        key.active = false;
        key.save()
        .then(() => {
          if (done && index === keywords.length - 1) done();
        });
      });
    })
    .catch(err => console.error(err)),
};
