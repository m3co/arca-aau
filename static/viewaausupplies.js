'use strict';
(() => {

  var SymId = Symbol();
  var lastSTO;
  var blocks = {};
  window.blocks = blocks;

  function doupdate(row) {
    console.log('do update', row);
  }

  function doselect(row) {
    if (row.AAU_expand) return;
    if (!blocks[row.AAU_id]) {
      blocks[row.AAU_id] = {
        AAUSupplies: []
      };
    }
    var AAU = blocks[row.AAU_id];
    AAU[SymId] = row.id;
    AAU.AAU_id = row.AAU_id;
    AAU.AAU_qop = row.AAU_qop;
    AAU.AAU_unit = row.AAU_unit;
    AAU.AAU_cost = row.AAU_cost;
    AAU.AAU_is_estimated = row.AAU_is_estimated;
    AAU.AAU_description = row.AAU_description;
    AAU.AAU_information = row.AAU_information;

    var AAUSupply = {};
    AAUSupply[SymId] = row.id;
    AAUSupply.AAUSupplies_id = row.AAUSupplies_id;
    AAUSupply.AAUSupplies_qop = row.AAUSupplies_qop;
    AAUSupply.AAUSupplies_AAUId = row.AAUSupplies_AAUId;
    AAUSupply.AAUSupplies_SupplyId = row.AAUSupplies_SupplyId;

    AAUSupply.Supplies_id = row.Supplies_id;
    AAUSupply.Supplies_cost = row.Supplies_cost;
    AAUSupply.Supplies_type = row.Supplies_type;
    AAUSupply.Supplies_unit = row.Supplies_unit;
    AAUSupply.Supplies_description = row.Supplies_description;

    AAUSupply.AAU = AAU;
    if (AAUSupply.AAUSupplies_id) {
      AAU.AAUSupplies.push(AAUSupply);
    }

    if (lastSTO) {
      clearTimeout(lastSTO);
    }
    lastSTO = setTimeout(() => {
      render();
    }, 300);
  }

  function setupEntry(idkey, key) {
  return function redact(selection) {
    selection.append('span').text(d => d[key])
      .on('click', () => {
        var e = d3.event;
        var span = e.target;
        var form = span.nextElementSibling;
        span.hidden = true;
        form.hidden = false;
      });

    var fr = selection.append('form')
      .attr('hidden', true)
      .on('submit', (d) => {
        var e = d3.event;
        e.preventDefault();
        var form = e.target;;
        var fd = new FormData(form);
        var entry = fd.toJSON();

        if (entry.value != d[entry.key]) {
          entry.query = 'update';
          entry.module = 'viewAAUSupplies';
          client.emit('data', entry);
        }

        var span = form.previousElementSibling;
        span.hidden = false;
        form.hidden = true;
      });

    fr.append('input')
      .attr('type', 'text')
      .attr('value', d => d[key])
      .attr('name', 'value');

    fr.append('input')
      .attr('type', 'hidden')
      .attr('value', key)
      .attr('name', 'key');

    fr.append('input')
      .attr('type', 'hidden')
      .attr('value', d => d[SymId])
      .attr('name', 'id');

    fr.append('input')
      .attr('type', 'hidden')
      .attr('value', idkey)
      .attr('name', 'idkey');
  }
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
    tr.append('td').text(d => d.AAU_id);
    tr.append('td').call(setupEntry('id', 'AAU_unit'));
    tr.append('td').call(setupEntry('id', 'AAU_cost'));
    tr.append('td').call(setupEntry('id', 'AAU_qop'));
    tr = table.append('tr');
    tr.append('td').attr('colspan', 4)
      .call(setupEntry('id', 'AAU_description'));

    tr = table.append('tr');
    tr.append('td').attr('colspan', 4)
      .call(setupEntry('id', 'AAU_information'));

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

    tr.append('td').call(setupEntry('id', 'Supplies_type'));
    tr.append('td').call(setupEntry('id', 'Supplies_description'));
    tr.append('td').call(setupEntry('id', 'Supplies_unit'));
    tr.append('td').call(setupEntry('id', 'Supplies_cost'));
    tr.append('td').call(setupEntry('id', 'AAUSupplies_qop'));
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
    doupdate: doupdate,
    request: request
  };
})();
