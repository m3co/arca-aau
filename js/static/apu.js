'use strict';
(() => {
  var COLUMNS = ['description', 'unit', 'cost', 'qop'];
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
    var rows = d3.select('tbody').selectAll('tr.row').data(data);
    rows.call(renderRow);
    rows.enter().append('tr')
      .classed('row', true)
      .call(renderRow);
    rows.exit().remove();
    document.querySelector('button').addEventListener('click', e => {
      var subir = data.map(d => COLUMNS.reduce((acc, key) => {
        acc[key] = d[key];
        return acc;
      }, {}));
      console.log(subir);
    });
  });
})();
