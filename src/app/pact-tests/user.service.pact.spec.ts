import { UserService } from '../services/user.service';
import { Pact } from '@pact-foundation/pact/httpPact';
import * as path from "path";
import { TestBed, async } from '@angular/core/testing';
import { Matchers } from '@pact-foundation/pact';

import { User } from '../models/user.model'
import { HttpClientModule } from '@angular/common/http';

const user: User = {
  email: 'tay.ta@axonactive.com',
  firstName: 'Tay',
  lastName: 'Ta'
};

const getUserId = 1;
const addedUserId = 2;

describe('UserServicePact', () => {
  const provider: Pact = new Pact({
    port: 1234,
    log: path.resolve(process.cwd(), 'pact', 'logs', 'mockserver-integration.log'),
    dir: path.resolve(process.cwd(), '..', '..', 'pacts'),
    spec: 3,
    logLevel: 'info',
    consumer: 'ui-jest',
    provider: 'userservice'
  });

  // Setup Pact mock server for this service
  beforeAll(async () => {
    await provider.setup();
  });

  // Configure Angular Testbed for this service
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        HttpClientModule
      ],
      providers: [
        UserService
      ]
    });
  });

  // Verify mock service
  afterEach(async () => {
    await provider.verify();
  });

  // Create contract
  afterAll(async () => {
    await provider.finalize();
  });

  describe('getUser()', () => {

    beforeAll(async () => {
      await provider.addInteraction({
        state: `user 1 exists`,
        uponReceiving: 'a request to GET a user',
        withRequest: {
          method: 'GET',
          path: `/api/users/${getUserId}`
        },
        willRespondWith: {
          status: 200,
          body: Matchers.somethingLike(user)
        }
      });
    });

    it('should get a user', (done) => {
      const userService: UserService = TestBed.inject(UserService);

      userService.getUser(getUserId).subscribe(response => {
        expect(response).toEqual(user);
        done();
      }, err => {
        done.fail(err);
      });
    });
  });

  describe('addNewUser()', () => {
    beforeAll(async () => {
      await provider.addInteraction({
        state: `provider accepts a new user`,
        uponReceiving: 'a request to POST a user',
        withRequest: {
          method: 'POST',
          path: `/api/users`,
          body: user,
          headers: {
            'Content-Type': 'application/json'
          }
        },
        willRespondWith: {
          status: 201,
          body: Matchers.somethingLike({
            id: addedUserId
          }),
          headers: {
            'Content-Type': 'application/json'
          }
        }
      });
    })

    it('should add a user', (done) => {
      const userService: UserService = TestBed.inject(UserService);

      userService.addNewUser(user).subscribe(responseUserId => {
        expect(responseUserId).toEqual(addedUserId);
        done();
      }, err => done.fail(err));
    })
  })
})