'use strict';
(() => {

  var SymId = Symbol();
  var lastSTO;
  var blocks = {};
  window.blocks = blocks;

  function doselect(row) {
    if (row.AAU_expand) return;
    if (!blocks[row.AAU_id]) {
      blocks[row.AAU_id] = {
        AAUSupplies: []
      };
    }
    var AAU = blocks[row.AAU_id];
    AAU[SymId] = row.id;
    AAU.id = row.AAU_id;
    AAU.qop = row.AAU_qop;
    AAU.unit = row.AAU_unit;
    AAU.cost = row.AAU_cost;
    AAU.is_estimated = row.AAU_is_estimated;
    AAU.description = row.AAU_description;
    AAU.information = row.AAU_information;

    var Supply = {};
    Supply.id = row.Supplies_id;
    Supply.cost = row.Supplies_cost;
    Supply.type = row.Supplies_type;
    Supply.unit = row.Supplies_unit;
    Supply.description = row.Supplies_description;

    var AAUSupply = {};
    AAUSupply.id = row.AAUSupplies_id;
    AAUSupply.qop = row.AAUSupplies_qop;
    AAUSupply.AAUId = row.AAUSupplies_AAUId;
    AAUSupply.SupplyId = row.AAUSupplies_SupplyId;

    AAUSupply.Supply = Supply;
    AAUSupply.AAU = AAU;
    if (AAUSupply.id) {
      AAU.AAUSupplies.push(AAUSupply);
    }

    if (lastSTO) {
      clearTimeout(lastSTO);
    }
    lastSTO = setTimeout(() => {
      render();
    }, 300);
  }

  function render() {
    var apu = d3.select('div.blocks')
      .selectAll('div.block')
      .data(Object.keys(blocks).map(key => blocks[key]))
      .enter().append('div').classed('block', true);

    var table;
    var tr;

    table = apu.append('table');
    tr = table.append('tr');
    tr.append('td').text(d => d.id);
    tr.append('td').text(d => d.unit);
    tr.append('td').text(d => d.cost);
    tr.append('td').text(d => d.qop);
    tr = table.append('tr');
    var ds = tr.append('td').attr('colspan', 4);
    ds.append('span').text(d => d.description)
      .on('click', () => {
        var e = d3.event;
        var span = e.target;
        var form = span.nextElementSibling;
        span.hidden = true;
        form.hidden = false;
      });
    var fr = ds.append('form')
      .attr('hidden', true)
      .on('submit', () => {
        var e = d3.event;
        e.preventDefault();
        var form = e.target;;
        var fd = new FormData(form);
        var entry = fd.toJSON();

        var span = form.previousElementSibling;
        span.hidden = false;
        form.hidden = true;
      });

    fr.append('input')
      .attr('type', 'text')
      .attr('value', d => d.description)
      .attr('name', 'value');

    fr.append('input')
      .attr('type', 'hidden')
      .attr('value', 'AAU_description')
      .attr('name', 'key');

    fr.append('input')
      .attr('type', 'hidden')
      .attr('value', d => d[SymId])
      .attr('name', 'id');

    fr.append('input')
      .attr('type', 'hidden')
      .attr('value', 'id')
      .attr('name', 'idkey');

    tr = table.append('tr');
    tr.append('td').text(d => d.information).attr('colspan', 4);

    table = apu.append('table');
    tr = table.selectAll('thead')
      .data(['thead']).enter()
      .append('tr');
    tr.append('th').text('Tipo');
    tr.append('th').text('Descripcion');
    tr.append('th').text('Unidad');
    tr.append('th').text('Costo');
    tr.append('th').text('Rdto');
    tr.append('th').text('');

    tr = table.selectAll('tbody tr.aausupply')
      .data(d => d.AAUSupplies)
      .enter().append('tbody').append('tr').classed('aausupply', true);

    tr.append('td').text(d => d.Supply.type);
    tr.append('td').text(d => d.Supply.description);
    tr.append('td').text(d => d.Supply.unit);
    tr.append('td').text(d => d.Supply.cost);
    tr.append('td').text(d => d.qop);
    tr.append('td').append('button').text('-');

    apu.append('button').text('+');
    apu.append('button').text('Importar');
  }

  function request(d) {
    Object.keys(blocks).forEach(key => {
      delete blocks[key];
    });
    d3.select('div.blocks').html('');
    client.emit('data', {
      query: 'select',
      module: 'viewAAUSupplies',
      keynote: d.id_to_concrete
    });
  }

  window.viewaausupplies = {
    doselect: doselect,
    request: request
  };
})();
