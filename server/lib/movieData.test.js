const movieData = require('./movieData');
const testInit = require('../../test/init');

describe('unit tests', () => {
  describe('create', () => {
    it('automatically passes in the current createdAt timestamp', () => {
      const movieName = 'Test Movie Name';
      const query = jest.fn();
      const fakeDb = { query };
      movieData.create(fakeDb, { name: movieName })
      expect(query).toBeCalledWith(expect.any(String), expect.objectContaining({
        name: movieName,
        createdAt: expect.any(Date)
      }))
    });
  });
});

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

  describe('create', () => {
    it('inserts a record into the database with a created_at date', () => {
      const movieName = 'Test Movie Name';
      return movieData.create(db, { name: movieName })
      .then(() => {
        return db.query('SELECT * FROM movies').then(movies => {
          expect(movies.length).toEqual(1);
          expect(movies[0]).toMatchObject({
            name: movieName,
            created_at: expect.any(Date)
          });
        });
      });
    });
  });
});
