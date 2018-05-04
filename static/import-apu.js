'use strict';
(() => {
  var data = [];
  var COLUMNS = ['type', 'description', 'unit', 'cost', 'qop'];
  function spanEmpty(s) {
    return s.append('span')
      .text(d => d.value ? d.value.toString().trim() : '-')
      .on('click', d => {
        var e = d3.event;
        e.target.hidden = true;
        e.target.nextElementSibling.hidden = false;
      });
  }
  function formAndInput(span, s) {
    return s.append('form')
      .attr('hidden', true)
      .on('submit', d => {
        var e = d3.event;
        e.preventDefault();

        d.value = new FormData(e.target).toJSON().value;
        d.original[d.key] = d.value;
        span.text(d =>  d.value);

        e.target.hidden = true;
        e.target.previousElementSibling.hidden = false;
      })
      .append('input')
      .attr('name', 'value')
      .attr('value', d => d.value);
  }
  var createRedactCell = {
    type: s => {
      var span = spanEmpty(s);
      formAndInput(span, s)
        .attr('list', 'Supplies_type');
    },
    description: s => {
      var span = spanEmpty(s);
      formAndInput(span, s);
    },
    unit: s => s.append('span')
      .text(d => d.value ? d.value.toString().trim() : '-'),
    cost: s => s.append('span')
      .text(d => d.value ? d.value.toString().trim() : '-'),
    qop: s => s.append('span')
      .text(d => d.value ? d.value.toString().trim() : '-')
  };
  document.querySelector('#import-aau-close').addEventListener('click', e => {
    e.target.parentElement.style.display = 'none';
  });
  function renderRow(selection) {
    var cols = selection.selectAll('td.col')
      .data((d, i) => Object.keys(d).map(c => ({
        key: c,
        value: d[c],
        original: d,
        i: i
      })));
    cols.select('span').text(d => d.value);
    cols.select('input').attr('value', d => d.value);
    cols.enter().append('td')
      .classed('col', true)
      .each(function(d) {
        createRedactCell[d.key](d3.select(this));
      });
    cols.exit().remove();
  }

  document.querySelector('#import-aau-form').addEventListener('submit', e => {
    e.preventDefault();
    data.map(d => COLUMNS.reduce((acc, key) => {
      acc[key] = (key === 'cost' || key === 'qop') ? Number(d[key]) : d[key];
      return acc;
    }, { AAUId: document
      .querySelector('#import-aau-form input[name="AAU"]')
      .value
    })).map(d => ({
      query: 'insert',
      module: 'importAAUSupplies',
      from: 'importAAUSupplies',
      row: d
    })).forEach(event => {
      console.log(event);
      //client.emit('data', event);
    });
    document.querySelector('#import-aau').style.display = 'none';
    document.querySelector('#paste-aau tbody').innerHTML = '';
    data.length = 0;
  });
  document.addEventListener('paste', e => {
    data.push(...e.clipboardData.getData('text')
      .split(/[\n\r]/).filter(d => d !== '')
      .map(d => d.split(/[\t]/).reduce((acc, d, i) => {
        acc[COLUMNS[i] ? COLUMNS[i] : `xtra${i}`] = d;
        return acc;
      }, {})));
    var rows = d3.select('table#paste-aau tbody').selectAll('tr.row').data(data);
    rows.call(renderRow);
    rows.enter().append('tr')
      .classed('row', true)
      .call(renderRow);
    rows.exit().remove();
  });
})();
