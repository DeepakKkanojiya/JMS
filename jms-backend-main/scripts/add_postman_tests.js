const fs = require('fs');

const erpFile = 'postman/Jewellery_ERP.postman_collection.json';
const iamFile = 'postman/IAM.postman_collection.json';

const col = JSON.parse(fs.readFileSync(erpFile, 'utf8'));

function addTestToRequest(req, customTest) {
  const defaultTest = [
    "pm.test('Status code is 200 or 201', function () {",
    "    pm.expect([200, 201]).to.include(pm.response.code);",
    "});",
    "pm.test('Response structure is successful', function () {",
    "    const jsonData = pm.response.json();",
    "    pm.expect(jsonData.success).to.eql(true);",
    "    pm.expect(jsonData).to.have.property('data');",
    "});"
  ];

  const scriptLines = customTest || defaultTest;

  req.event = req.event || [];
  const existingIdx = req.event.findIndex(e => e.listen === 'test');
  const eventObj = {
    listen: 'test',
    script: {
      exec: scriptLines,
      type: 'text/javascript'
    }
  };

  if (existingIdx >= 0) {
    req.event[existingIdx] = eventObj;
  } else {
    req.event.push(eventObj);
  }
}

col.item.forEach(folder => {
  if (!/^(22|23|24|25|26|27|28)\./.test(folder.name)) return;
  if (!folder.item) return;

  folder.item.forEach(req => {
    const name = req.name.toLowerCase();
    
    if (name.includes('create metal rate')) {
      addTestToRequest(req, [
        "pm.test('Status code is 201 Created or 200', function () {",
        "    pm.expect([200, 201]).to.include(pm.response.code);",
        "});",
        "pm.test('Metal rate created successfully', function () {",
        "    const json = pm.response.json();",
        "    pm.expect(json.success).to.be.true;",
        "    if (json.data && json.data.id) {",
        "        pm.environment.set('metalRateId', json.data.id);",
        "    }",
        "});"
      ]);
    } else if (name.includes('double confirmation') || name.includes('400')) {
      addTestToRequest(req, [
        "pm.test('Status code is 400 Bad Request or 422', function () {",
        "    pm.expect([400, 422]).to.include(pm.response.code);",
        "});",
        "pm.test('Expected rejection of double confirmation', function () {",
        "    const json = pm.response.json();",
        "    pm.expect(json.success).to.be.false;",
        "});"
      ]);
    } else if (name.includes('create pos draft invoice') || name.includes('create draft invoice')) {
      addTestToRequest(req, [
        "pm.test('Status code is 201 Created or 200', function () {",
        "    pm.expect([200, 201]).to.include(pm.response.code);",
        "});",
        "pm.test('Draft invoice created successfully', function () {",
        "    const json = pm.response.json();",
        "    pm.expect(json.success).to.be.true;",
        "    if (json.data && json.data.id) {",
        "        pm.environment.set('posInvoiceId', json.data.id);",
        "        pm.environment.set('invoiceId', json.data.id);",
        "    }",
        "});"
      ]);
    } else if (name.includes('making charge')) {
      addTestToRequest(req, [
        "pm.test('Status code is 200 or 201', function () {",
        "    pm.expect([200, 201]).to.include(pm.response.code);",
        "});",
        "pm.test('Making charge operation successful', function () {",
        "    const json = pm.response.json();",
        "    pm.expect(json.success).to.be.true;",
        "    if (json.data && json.data.id) {",
        "        pm.environment.set('makingChargeId', json.data.id);",
        "    }",
        "});"
      ]);
    } else if (name.includes('tax rate')) {
      addTestToRequest(req, [
        "pm.test('Status code is 200 or 201', function () {",
        "    pm.expect([200, 201]).to.include(pm.response.code);",
        "});",
        "pm.test('Tax rate operation successful', function () {",
        "    const json = pm.response.json();",
        "    pm.expect(json.success).to.be.true;",
        "    if (json.data && json.data.id) {",
        "        pm.environment.set('taxRateId', json.data.id);",
        "    }",
        "});"
      ]);
    } else if (name.includes('payment')) {
      addTestToRequest(req, [
        "pm.test('Status code is 200 or 201', function () {",
        "    pm.expect([200, 201]).to.include(pm.response.code);",
        "});",
        "pm.test('Payment operation successful', function () {",
        "    const json = pm.response.json();",
        "    pm.expect(json.success).to.be.true;",
        "    if (json.data && json.data.id) {",
        "        pm.environment.set('paymentId', json.data.id);",
        "    }",
        "});"
      ]);
    } else if (name.includes('gold exchange')) {
      addTestToRequest(req, [
        "pm.test('Status code is 200 or 201', function () {",
        "    pm.expect([200, 201]).to.include(pm.response.code);",
        "});",
        "pm.test('Gold exchange operation successful', function () {",
        "    const json = pm.response.json();",
        "    pm.expect(json.success).to.be.true;",
        "    if (json.data && json.data.id) {",
        "        pm.environment.set('goldExchangeId', json.data.id);",
        "    }",
        "});"
      ]);
    } else if (name.includes('return request') || name.includes('sales return')) {
      addTestToRequest(req, [
        "pm.test('Status code is 200 or 201', function () {",
        "    pm.expect([200, 201]).to.include(pm.response.code);",
        "});",
        "pm.test('Sales return operation successful', function () {",
        "    const json = pm.response.json();",
        "    pm.expect(json.success).to.be.true;",
        "    if (json.data && json.data.id) {",
        "        pm.environment.set('salesReturnId', json.data.id);",
        "    }",
        "});"
      ]);
    } else if (name.includes('refund')) {
      addTestToRequest(req, [
        "pm.test('Status code is 200 or 201', function () {",
        "    pm.expect([200, 201]).to.include(pm.response.code);",
        "});",
        "pm.test('Sales refund operation successful', function () {",
        "    const json = pm.response.json();",
        "    pm.expect(json.success).to.be.true;",
        "    if (json.data && json.data.id) {",
        "        pm.environment.set('salesRefundId', json.data.id);",
        "    }",
        "});"
      ]);
    } else {
      addTestToRequest(req);
    }
  });
});

fs.writeFileSync(erpFile, JSON.stringify(col, null, 2));
fs.writeFileSync(iamFile, JSON.stringify(col, null, 2));
console.log('Successfully injected pm.test assertions across all Phase 4 folders (22-28)!');
