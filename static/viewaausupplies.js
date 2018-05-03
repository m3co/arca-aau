'use strict';
(() => {

  var SymId = Symbol();
  var lastSTO;
  var blocks = {};
  window.blocks = blocks;

  function dodelete(row) {
    var AAU = blocks[row.AAU_id];
    if (!AAU) return;
    var found = blocks[row.AAU_id].AAUSupplies
      .find(d => d.AAUSupplies_id == row.AAUSupplies_id);
    if (found) {
      blocks[row.AAU_id].AAUSupplies
        .splice(blocks[row.AAU_id].AAUSupplies
          .findIndex(d => d.AAUSupplies_id == row.AAUSupplies_id), 1);
    } else {
      // ESTO AUN ESTA POR RESOLVERSE...
      delete blocks[row.AAU_id];
    }

    if (lastSTO) {
      clearTimeout(lastSTO);
    }
    lastSTO = setTimeout(() => {
      render();
    }, 300);
  }

  function doinsert(row) {
    if (row.AAU_id.indexOf(blocks[SymId]) == 0) {
      doselect(row);
    }
  }

  function doupdate(row) {
    var AAU = blocks[row.AAU_id];
    if (!AAU) return;
    AAU.AAU_id = row.AAU_id;
    AAU.AAU_qop = row.AAU_qop;
    AAU.AAU_unit = row.AAU_unit;
    AAU.AAU_cost = row.AAU_cost;
    AAU.AAU_is_estimated = row.AAU_is_estimated;
    AAU.AAU_description = row.AAU_description;
    AAU.AAU_information = row.AAU_information;

    var found;
    if (blocks[row.AAU_id]) {
      found = blocks[row.AAU_id].AAUSupplies
        .find(d => d.AAUSupplies_id == row.AAUSupplies_id);

      if (found) {
        found.Supplies_cost = row.Supplies_cost;
        found.Supplies_description = row.Supplies_description;
        found.Supplies_type = row.Supplies_type;
        found.Supplies_unit = row.Supplies_unit;
        found.Supplies_id = row.Supplies_id;
        found.AAUSupplies_qop = row.AAUSupplies_qop;
        found.AAUSupplies_id = row.AAUSupplies_id;
        found.AAUSupplies_AAUId = row.AAUSupplies_AAUId;
        found.AAUSupplies_SupplyId = row.AAUSupplies_SupplyId;
      }
    }

    if (lastSTO) {
      clearTimeout(lastSTO);
    }
    lastSTO = setTimeout(() => {
      render();
    }, 300);
  }

  function doselect(row) {
    if (row.AAU_expand) return;
    if (!blocks[row.AAU_id]) {
      blocks[row.AAU_id] = {
        AAUSupplies: []
      };
    }
    var AAU = blocks[row.AAU_id];
    if (!AAU.id) {
      AAU.id = row.id;
    }
    AAU.AAU_id = row.AAU_id;
    AAU.AAU_qop = row.AAU_qop;
    AAU.AAU_unit = row.AAU_unit;
    AAU.AAU_cost = row.AAU_cost;
    AAU.AAU_is_estimated = row.AAU_is_estimated;
    AAU.AAU_description = row.AAU_description;
    AAU.AAU_information = row.AAU_information;

    var AAUSupply = {};
    AAUSupply.id = row.id;
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

  function setupEntry(idkey, key, module, query = 'update', row = null) {
  return function redact(selection) {
    selection.attr('column', key)
      .append('span').text(d => d[key] ? d[key].toString().trim() : '-')
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
        var form = e.target;
        var fd = new FormData(form);
        var entry = fd.toJSON();

        if (query == 'update') {
          entry.value = [entry.value.toString().trim()];
          entry.key = [entry.key];
          entry.query = query;
          entry.module = module;

          client.emit('data', entry);
        } else if (query == 'insert') {
          row[entry.key] = entry.value;
          console.log('to create', entry, row);
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
      .attr('value', d => d[idkey])
      .attr('name', 'id');

    fr.append('input')
      .attr('type', 'hidden')
      .attr('value', idkey)
      .attr('name', 'idkey');
  }
  }

  function updateAAUSupplies(tr) {
    tr.select('td[column="Supplies_type"] span')
      .text(d => d.Supplies_type);
    tr.select('td[column="Supplies_description"] span')
      .text(d => d.Supplies_description ? d.Supplies_description : '-');
    tr.select('td[column="Supplies_description"] datalist')
      .attr('id', d => `list-${d.AAUSupplies_id}`);
    tr.select('td[column="Supplies_description"] input')
      .attr('list', d => `list-${d.AAUSupplies_id}`)
      .attr('value', d => d.AAUSupplies_SupplyId);

    tr.select('td[column="Supplies_unit"] span')
      .text(d => d.Supplies_unit ? d.Supplies_unit : '-');
    tr.select('td[column="Supplies_cost"] span')
      .text(d => d.Supplies_cost ? d.Supplies_cost : '-');
    tr.select('td[column="AAUSupplies_qop"] span')
      .text(d => d.AAUSupplies_qop ? d.AAUSupplies_qop : '-');

    tr.select('td[column="Supplies_unit"] input[name="id"]')
      .attr('value', d => d.id);
    tr.select('td[column="Supplies_cost"] input[name="id"]')
      .attr('value', d => d.id);
    tr.select('td[column="AAUSupplies_qop"] input[name="id"]')
      .attr('value', d => d.id);
  }

  function insertSupplies(tr) {
    tr.append('td').attr('column', 'Supplies_type')
      .call(function(selection) {
      selection.append('span').text(d => d.Supplies_type)
        .on('click', d => {
          d3.event.target.hidden = true;
          d3.event.target.nextElementSibling.style.display = '';
        });
      selection.append('input').classed('awesomplete', true)
        .attr('list', 'Supplies_type')
        .attr('value', d => d.Supplies_type)
        .each(function() {
          this.style.display = 'none';
        })
        .on('change', d => {
          d3.event.target.style.display = 'none';
          d3.event.target.previousElementSibling.hidden = false;
          client.emit('data', {
            query: 'update',
            module: 'viewAAUSupplies',
            idkey: 'id',
            id: d.id,
            key: ['Supplies_type'],
            value: [d3.event.target.value]
          });
        });
    });
    tr.append('td').attr('column', 'Supplies_description')
      .call(function(selection) {
      selection.append('span').text(d => d.Supplies_description)
        .on('click', d => {
          d3.event.target.hidden = true;
          d3.event.target.nextElementSibling.style.display = '';
        });
      selection.append('input')
        .attr('list', d => `list-${d.AAUSupplies_id}`)
        .attr('value', d => d.AAUSupplies_SupplyId)
        .on('click', () => {
          d3.event.target.select();
        })
        .each(function() {
          this.style.display = 'none';
        })
        .on('change', d => {
          d3.event.target.style.display = 'none';
          d3.event.target.previousElementSibling.hidden = false;
          client.emit('data', {
            query: 'update',
            module: 'viewAAUSupplies',
            idkey: 'id',
            id: d.id,
            key: ['AAUSupplies_SupplyId'],
            value: [d3.event.target.value]
          });
        })
        .on('keyup', d => {
          client.emit('data', {
            query: 'search',
            combo: d3.event.target.getAttribute('list'),
            module: 'Supplies',
            key: 'description',
            value: d3.event.target.value
          });
        });
      var dl = selection.append('datalist')
        .attr('id', d => `list-${d.AAUSupplies_id}`);
      dl.append('option')
        .attr('value', d => d.Supplies_id)
        .text(d => d.Supplies_description);
    });
    tr.append('td')
      .call(setupEntry('id', 'Supplies_unit', 'viewAAUSupplies'));
    tr.append('td')
      .call(setupEntry('id', 'Supplies_cost', 'viewAAUSupplies'));
    tr.append('td')
      .call(setupEntry('id', 'AAUSupplies_qop', 'viewAAUSupplies'));
    tr.append('td')
      .append('button').text('-')
      .on('click', d => {
        client.emit('data', {
          query: 'delete',
          module: 'AAUSupplies',
          id: d.AAUSupplies_id,
          idkey: 'id'
        });
      });
  }

  function render() {
    var table;
    var tr;

    var apu = d3.select('div.blocks')
      .selectAll('div.block')
      .data(Object.keys(blocks).map(key => blocks[key]));

    apu.select('td[column="AAU_id"] span')
      .text(d => d.AAU_id);
    apu.select('td[column="AAU_unit"] span').
      text(d => d.AAU_unit ? d.AAU_unit.toString().trim() : '-');
    apu.select('td[column="AAU_cost"] span').
      text(d => d.AAU_cost ? d.AAU_cost.toString().trim() : '-');
    apu.select('td[column="AAU_qop"] span').
      text(d => d.AAU_qop ? d.AAU_qop.toString().trim() : '-');
    apu.select('td[column="AAU_description"] span').
      text(d => d.AAU_description ? d.AAU_description.toString().trim() : '-');
    apu.select('td[column="AAU_information"] span').
      text(d => d.AAU_information ? d.AAU_information.toString().trim() : '-');

    var tr = apu.selectAll('tr.aausupply')
      .data(d => d.AAUSupplies);
    tr.exit().remove();
    tr.call(updateAAUSupplies);
    tr.enter().select('table.apusupplies')
      .append('tr').classed('aausupply', true)
      .call(insertSupplies);

    apu.exit().remove();
    var apu = apu.enter().append('div').classed('block', true);

    table = apu.append('table');
    tr = table.append('tr')
      .classed('first', true);
    tr.append('td').text(d => d.AAU_id).attr('column', 'AAU_id');
    tr.append('td').call(setupEntry('id', 'AAU_unit', 'viewAAUSupplies'));
    tr.append('td').call(setupEntry('id', 'AAU_cost', 'viewAAUSupplies'));
    tr.append('td').call(setupEntry('id', 'AAU_qop', 'viewAAUSupplies'));
    tr = table.append('tr')
      .classed('second', true);

    tr.append('td').attr('colspan', 4)
      .call(setupEntry('id', 'AAU_description', 'viewAAUSupplies'));

    tr = table.append('tr');
    tr.append('td').attr('colspan', 4)
      .call(setupEntry('id', 'AAU_information', 'viewAAUSupplies'));

    table = apu.append('table').classed('apusupplies', true);
    tr = table.selectAll('thead')
      .data(['thead']).enter()
      .append('tr');
    tr.append('th').text('Tipo');
    tr.append('th').text('Descripcion');
    tr.append('th').text('Unidad');
    tr.append('th').text('Costo');
    tr.append('th').text('Rdto');
    tr.append('th').text('');

    tr = table.selectAll('tr.aausupply')
      .data(d => d.AAUSupplies);
    tr.exit().remove();
    tr.call(updateAAUSupplies);

    tr = tr.enter().append('tr').classed('aausupply', true);
    tr.call(insertSupplies);

    apu.append('button').text('+').on('click', (d, i, m) => {
      var tr = d3.select(m[i].parentElement)
        .select('table.apusupplies')
        .selectAll('tr.new').data([d])
        .enter().append('tr').classed('new', true);
      tr.append('td').text('-');
      tr.append('td').call(function(selection) {
        var fr = selection.append('form')
          .on('submit', () => {
            var e = d3.event;
            e.preventDefault();
            var form = e.target;
            var fd = new FormData(form);
            var row = fd.toJSON();

            e.target.closest('tr.new').remove();
            setTimeout(() => {
              client.emit('data', {
                query: 'insert',
                row: row,
                module: 'AAUSupplies'
              });
            }, 100);
          });

        fr.append('input')
          .attr('name', 'SupplyId')
          .attr('list', d => `list-new`)
          .on('keyup', d => {
            client.emit('data', {
              query: 'search',
              combo: d3.event.target.getAttribute('list'),
              module: 'Supplies',
              key: 'description',
              value: d3.event.target.value
            });
          });

        fr.append('input')
          .attr('type', 'hidden')
          .attr('value', d.AAU_id)
          .attr('name', 'AAUId');

        var dl = selection.append('datalist')
          .attr('id', d => `list-new`);
        dl.append('option')
          .attr('value', d => d.Supplies_id)
          .text(d => d.Supplies_description);
      });
      tr.append('td').text('-');
      tr.append('td').text('-');
      tr.append('td').text('-');
    });
    apu.append('button').text('Importar');

  }

  function request(d) {
    Object.keys(blocks).forEach(key => {
      delete blocks[key];
    });
    d3.select('div.blocks').html('');
    blocks[SymId] = d.id_to_concrete;
    client.emit('data', {
      query: 'select',
      module: 'viewAAUSupplies',
      keynote: d.id_to_concrete
    });
  }

  function dosearch(res) {
    var opts = d3.select(`datalist[id="${res.combo}"]`)
      .selectAll('option').data(res.rows);
    opts.attr('value', d => d.id)
      .text(d => d.description);
    opts.enter().append('option')
      .attr('value', d => d.id)
      .text(d => d.description);
    opts.exit().remove();
  }

  window.viewaausupplies = {
    doinsert: doinsert,
    doselect: doselect,
    doupdate: doupdate,
    dodelete: dodelete,
    dosearch: dosearch,
    request: request
  };
})();
