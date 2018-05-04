'use strict';
(() => {
  var COLUMNS = ['type', 'description', 'unit', 'cost', 'qop'];
  document.querySelector('#import-apu-close').addEventListener('click', e => {
    e.target.parentElement.style.display = 'none';
  });
  function renderRow(selection) {
    var cols = selection.selectAll('td.col')
      .data(d => Object.keys(d).map(c => d[c]));
    cols.text(d => d);
    cols.enter().append('td')
      .classed('col', true)
      .text(d => d);
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
        client.emit('data', event);
        document.querySelector('#import-apu').style.display = 'none';
      });
    }, { once: true });
  });
})();
