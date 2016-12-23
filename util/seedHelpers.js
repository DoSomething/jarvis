'use strict';

const console = require('keypunch');
const Keyword = require(`${global.entries}/Keyword`);

module.exports = {
  retireOldProtocolKeywords: (keyword, protocol, done) => {
    return Keyword.find({
      keyword,
      protocol,
      active: true,
    })
    .exec()
    .then((keywords) => {
      if (keywords.length === 0 && done) done();

      keywords.forEach((keyword, index) => {
        keyword.active = false;
        keyword.save()
        .then(() => {
          if (done && index === keywords.length - 1) done();
        });
      });
    })
    .catch(err => console.error(err));
  }
}
