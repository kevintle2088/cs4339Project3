/* global describe, it */
/**
 * Mocha tests for the Project 4 photo upload and like endpoints.
 */

import assert from 'assert';
import axios from 'axios';

const port = 3001;
const host = 'localhost';
const SEEDED_LOGIN_PASSWORD = 'password';

function makeFullUrl(path) {
  return `http://${host}:${port}${path}`;
}

describe('Photo App: Photo upload and like API tests', function () {
  let sessionCookie;
  let loggedInUserId;
  let createdPhotoId;

  async function login() {
    const response = await axios.post(makeFullUrl('/admin/login'), {
      login_name: 'took',
      password: SEEDED_LOGIN_PASSWORD,
    });

    sessionCookie = response.headers['set-cookie'][0];
    loggedInUserId = response.data._id;
  }

  function authHeaders() {
    return { Cookie: sessionCookie };
  }

  describe('POST /photos', function () {
    it('returns 401 when the user is not logged in', async function () {
      try {
        await axios.post(makeFullUrl('/photos'), { url: 'https://example.com/photo.jpg' });
        assert.fail('Expected request to fail with 401');
      } catch (error) {
        assert.strictEqual(error.response.status, 401);
      }
    });

    it('returns 400 when the url is missing', async function () {
      await login();

      try {
        await axios.post(makeFullUrl('/photos'), {}, { headers: authHeaders() });
        assert.fail('Expected request to fail with 400');
      } catch (error) {
        assert.strictEqual(error.response.status, 400);
      }
    });

    it('saves a photo URL for the logged in user', async function () {
      const imageUrl = 'https://res.cloudinary.com/test/image/upload/v1/sample.jpg';

      const response = await axios.post(
        makeFullUrl('/photos'),
        { url: imageUrl },
        { headers: authHeaders() },
      );

      assert.strictEqual(response.status, 200);
      assert.strictEqual(response.data.file_name, imageUrl);
      assert.strictEqual(response.data.user_id, loggedInUserId);
      assert.ok(response.data._id);
      assert.ok(response.data.date_time);
      assert.deepStrictEqual(response.data.likes, []);

      createdPhotoId = response.data._id;
    });
  });

  describe('POST /photos/:photoId/like', function () {
    it('returns 401 when the user is not logged in', async function () {
      try {
        await axios.post(makeFullUrl(`/photos/${createdPhotoId}/like`), {});
        assert.fail('Expected request to fail with 401');
      } catch (error) {
        assert.strictEqual(error.response.status, 401);
      }
    });

    it('adds the current user to likes', async function () {
      const response = await axios.post(
        makeFullUrl(`/photos/${createdPhotoId}/like`),
        {},
        { headers: authHeaders() },
      );

      assert.strictEqual(response.status, 200);
      assert.ok(Array.isArray(response.data.likes));
      assert.strictEqual(response.data.likes.length, 1);
      assert.ok(response.data.likes.includes(loggedInUserId));
    });

    it('toggles the like off on a second request', async function () {
      const response = await axios.post(
        makeFullUrl(`/photos/${createdPhotoId}/like`),
        {},
        { headers: authHeaders() },
      );

      assert.strictEqual(response.status, 200);
      assert.ok(Array.isArray(response.data.likes));
      assert.strictEqual(response.data.likes.length, 0);
      assert.ok(!response.data.likes.includes(loggedInUserId));
    });
  });
});