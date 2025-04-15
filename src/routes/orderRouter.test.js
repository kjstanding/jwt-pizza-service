const request = require('supertest');
const app = require('../service');
const { createAdminUser } = require('../testUtils.js');

let testAdmin;
let testUserAuthToken;
const testPizza = {
  title: 'Student',
  description: 'No topping, no sauce, just carbs',
  image: 'pizza9.png',
  price: 0.0001,
};

beforeAll(async () => {
  testAdmin = await createAdminUser();
  const loginRes = await request(app).put('/api/auth').send(testAdmin);
  testUserAuthToken = loginRes.body.token;

  const res = await request(app)
    .put('/api/order/menu')
    .set('Authorization', `Bearer ${testUserAuthToken}`)
    .send(testPizza);
  expect(res.status).toBe(200);
  expect(res.body).toContainEqual(
    expect.objectContaining({
      id: expect.any(Number),
      ...testPizza,
    })
  );
});

test('get menu', async () => {
  const res = await request(app).get('/api/order/menu');
  expect(res.status).toBe(200);
  expect(res.body).toContainEqual(
    expect.objectContaining({
      id: expect.any(Number),
      ...testPizza,
    })
  );
});

test('get orders', async () => {
  const res = await request(app).get('/api/order').set('Authorization', `Bearer ${testUserAuthToken}`);
  expect(res.status).toBe(200);
  expect(res.body).toHaveProperty('dinerId');
  expect(res.body).toHaveProperty('orders');
  expect(res.body).toHaveProperty('page');
});

test('create order', async () => {
  const testOrder = {
    franchiseId: 1,
    storeId: 1,
    items: [{ menuId: 1, description: 'Veggie', price: 0.05 }],
  };

  const res = await request(app).post('/api/order').set('Authorization', `Bearer ${testUserAuthToken}`).send(testOrder);
  expect(res.status).toBe(200);
  expect(res.body).toHaveProperty('order');
  expect(res.body).toHaveProperty('jwt');
});

// async function createAdminUser() {
//   let user = { password: 'toomanysecrets', roles: [{ role: Role.Admin }] };
//   user.name = randomName();
//   user.email = user.name + '@admin.com';

//   user = await DB.addUser(user);
//   return { ...user, password: 'toomanysecrets' };
// }

// function randomName() {
//   return Math.random().toString(36).substring(2, 12);
// }
