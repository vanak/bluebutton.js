var Core = require('../../core');

/*
 * Parser for the C32 problems section
 */
module.exports = function(doc) {
  var self = this;
  self.doc = doc;
  self.parse = parse;

  function parse(c32) {
    
    var parseDate = self.doc.parseDate;
    var parseName = self.doc.parseName;
    var parseAddress = self.doc.parseAddress;
    var problems = c32.section('problems');
  
    var data = {}, el;
    data.entries = [];
    data.displayName = "Problems";
    data.templateId = problems.tag('templateId').attr('root');
    data.text = problems.tag('text').val(true);
  
    problems.entries().each(function(entry) {
      
      el = entry.tag('effectiveTime');
      var start_date = parseDate(el.tag('low').attr('value')),
          end_date = parseDate(el.tag('high').attr('value'));
      
      el = entry.template('2.16.840.1.113883.10.20.1.28').tag('value');
      var name = el.attr('displayName'),
          code = el.attr('code'),
          code_system = el.attr('codeSystem'),
          code_system_name = el.attr('codeSystemName');
  
      // Pre-C32 CCDs put the problem name in this "originalText" field, and some vendors
      // continue doing this with their C32, even though it's not technically correct
      if (!name) {
        el = entry.template('2.16.840.1.113883.10.20.1.28').tag('originalText');
        if (!el.isEmpty()) {
          name = Core.stripWhitespace(el.val());
        }
      }
  
      el = entry.template('2.16.840.1.113883.10.20.1.28').tag('translation');
      var translation_name = el.attr('displayName'),
          translation_code = el.attr('code'),
          translation_code_system = el.attr('codeSystem'),
          translation_code_system_name = el.attr('codeSystemName');
      
      el = entry.template('2.16.840.1.113883.10.20.1.50');
      var status = el.tag('value').attr('displayName');
      
      var age = null;
      el = entry.template('2.16.840.1.113883.10.20.1.38');
      if (!el.isEmpty()) {
        age = parseFloat(el.tag('value').attr('value'));
      }
      
      data.entries.push({
        date_range: {
          start: start_date,
          end: end_date
        },
        name: name,
        status: status,
        age: age,
        code: code,
        code_system: code_system,
        code_system_name: code_system_name,
        translation: {
          name: translation_name,
          code: translation_code,
          code_system: translation_code_system,
          code_system_name: translation_code_system_name
        },
        comment: null // not part of C32
      });
    });
    
    return data;
  };
}
