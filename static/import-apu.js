'use strict';
(() => {
  var COLUMNS = ['type', 'description', 'unit', 'cost', 'qop'];
  var createRedactCell = {
    type: s => s.append('span').text(d => d.value),
    description: s => {
      var span = s.append('span')
        .text(d => d.value)
        .on('click', d => {
          var e = d3.event;
          e.target.hidden = true;
          e.target.nextElementSibling.hidden = false;
        });
      s.append('form')
        .attr('hidden', true)
        .on('submit', d => {
          var e = d3.event;
          e.preventDefault();

          var fd = new FormData(e.target);
          var entry = fd.toJSON();
          d.value = entry.value;
          span.text(d =>  d.value);

          e.target.hidden = true;
          e.target.previousElementSibling.hidden = false;
        })
        .append('input')
        .attr('name', 'value')
        .attr('value', d => d.value);
    },
    unit: s => s.append('span').text(d => d.value),
    cost: s => s.append('span').text(d => d.value),
    qop: s => s.append('span').text(d => d.value)
  };
  document.querySelector('#import-apu-close').addEventListener('click', e => {
    e.target.parentElement.style.display = 'none';
  });
  function renderRow(selection) {
    var cols = selection.selectAll('td.col')
      .data(d => Object.keys(d).map(c => ({
        key: c,
        value: d[c]
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
  document.addEventListener('paste', e => {
    var data = e.clipboardData.getData('text')
      .split(/[\n\r]/).filter(d => d !== '')
      .map(d => d.split(/[\t]/).reduce((acc, d, i) => {
        acc[COLUMNS[i] ? COLUMNS[i] : `xtra${i}`] = d;
        return acc;
      }, {}));
    var rows = d3.select('table#paste-apu tbody').selectAll('tr.row').data(data);
    rows.call(renderRow);
    rows.enter().append('tr')
      .classed('row', true)
      .call(renderRow);
    rows.exit().remove();
    document.querySelector('#import-apu form').addEventListener('submit', e => {
      e.preventDefault();
      var AAUId = document.querySelector('#import-apu form input').value;
      data.map(d => COLUMNS.reduce((acc, key) => {
        acc[key] = (key === 'cost' || key === 'qop') ? Number(d[key]) : d[key];
        return acc;
      }, { AAUId: AAUId })).map(d => ({
        query: 'insert',
        module: 'importAAUSupplies',
        from: 'importAAUSupplies',
        row: d
      })).forEach(event => {
        console.log(event);
        //client.emit('data', event);
      });
      document.querySelector('#import-apu').style.display = 'none';
    }, { once: true });
  });
})();
