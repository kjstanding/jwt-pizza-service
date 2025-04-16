const request = require('supertest');
const app = require('../service');
const { createAdminUser, randomName } = require('../testUtils.js');

let testFranchise = { name: randomName(), admins: [] };
const testFranchiseStore = { name: 'SLC' };
let testAdmin;
let adminToken;
let franchiseID;
let testFranchiseStoreID;

beforeAll(async () => {
  testAdmin = await createAdminUser();
  testFranchise.admins.push({ email: testAdmin.email });
  const loginRes = await request(app).put('/api/auth').send(testAdmin);
  adminToken = loginRes.body.token;

  const franchiseRes = await request(app)
    .post('/api/franchise')
    .set('Authorization', `Bearer ${adminToken}`)
    .send(testFranchise);
  expect(franchiseRes.status).toBe(200);
  franchiseID = franchiseRes.body.id;

  testFranchiseStore.franchiseId = franchiseID;
  const storeRes = await request(app)
    .post('/api/franchise/' + franchiseID + '/store')
    .set('Authorization', `Bearer ${adminToken}`)
    .send(testFranchiseStore);
  expect(storeRes.status).toBe(200);
  testFranchiseStoreID = storeRes.body.id;
});

test('get franchise', async () => {
  const res = await request(app).get('/api/franchise');
  expect(res.status).toBe(200);
  expect(res.body).toContainEqual(
    expect.objectContaining({
      id: franchiseID,
      name: testFranchise.name,
      stores: [expect.objectContaining({ id: testFranchiseStoreID, name: testFranchiseStore.name })],
    })
  );
});

test('get user franchise', async () => {
  const res = await request(app)
    .get('/api/franchise/' + testAdmin.id)
    .set('Authorization', `Bearer ${adminToken}`);
  expect(res.status).toBe(200);
  expect(res.body).toContainEqual(
    expect.objectContaining({
      id: franchiseID,
      name: testFranchise.name,
      admins: [expect.objectContaining({ id: testAdmin.id, email: testAdmin.email })],
      stores: [expect.objectContaining({ id: testFranchiseStoreID, name: testFranchiseStore.name })],
    })
  );
});

test('delete store', async () => {
  const res = await request(app)
    .delete('/api/franchise/' + testFranchiseStore.franchiseId + '/store/' + testFranchiseStore.id)
    .set('Authorization', `Bearer ${adminToken}`);
  expect(res.status).toBe(200);
  expect(res.body.message).toBe('store deleted');
});

test('delete franchise', async () => {
  const res = await request(app)
    .delete('/api/franchise/' + testFranchiseStore.franchiseId)
    .set('Authorization', `Bearer ${adminToken}`);
  expect(res.status).toBe(200);
  expect(res.body.message).toBe('franchise deleted');
});
