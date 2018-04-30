'use strict';
(() => {

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
    AAU.AAUSupplies.push(AAUSupply);

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

    apu.append('span').text(d => d.id);
    apu.append('span').text(d => d.description);
    apu.append('span').text(d => d.unit);
    apu.append('span').text(d => d.cost);
    apu.append('span').text(d => d.qop);

    var tr = apu.append('table')
      .selectAll('tr.aausupply')
      .data(d => d.AAUSupplies)
      .enter().append('tr');

    tr.append('td').text(d => d.Supply.type);
    tr.append('td').text(d => d.Supply.description);
    tr.append('td').text(d => d.Supply.unit);
    tr.append('td').text(d => d.Supply.cost);
    tr.append('td').text(d => d.qop);
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
