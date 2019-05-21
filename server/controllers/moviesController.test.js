const moviesController = require('./moviesController');
const testInit = require('../../test/init');
const movieData = require('../lib/movieData');

describe('integration tests', () => {
  let db;
  function clearDatabase() {
    return db.query('DELETE FROM movies');
  }

  beforeAll(() => {
    return testInit.initDb().then(database => {
      db = database;
    });
  });

  beforeEach(() => {
    return clearDatabase();
  });

  beforeAll(() => {
    // This hides the error when we console log in the code called from the
    // test named "responds with an error on a duplicate movie name".
    // From: https://stackoverflow.com/a/52259482/135101
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });
  afterAll(() => {
    // Restore mock after all tests are done, so it won't affect other test suites
    console.error.mockRestore();
  });
  afterEach(() => {
    // Clear mock (all calls etc) after each test.
    // It's needed when you're using console somewhere in the tests so you have clean mock each time
    console.error.mockClear();
  });

  describe('create', () => {
    const movieName = 'Test Movie Name';
    const req = {
      app: {
        get: () => db
      },
      body: { name: movieName }
    };

    it('responds with success', done => {
      const res = {
        json: function(data) {
          expect(data).toMatchObject({
            name: movieName,
            created_at: expect.any(Date)
          });
          done();
        }
      };
      moviesController.create(req, res);
    });
    
    it('responds with an error on a duplicate movie name', done => {
      // First, force a single movie in the database.
      movieData.create(db, { name: movieName }).then(() => {
        // Now use the controller to create it again.
        const res = {
          status(num) {
            expect(num).toBe(500);
            return this;
          },

          json(data) {
            expect(data).toEqual({ message: 'There was an error on the server' });
            done();
          }
        };
        moviesController.create(req, res);
      });
    });
  });
});
