const chaiHttp = require("chai-http");
const chai = require("chai");
const assert = chai.assert;
const {app, db} = require("../server");

chai.use(chaiHttp);

suite("Functional Tests", function () {
    let thread_id = null
    let reply_id = null
	test("Creating a new thread: POST request to /api/threads/{board}", function (done) {
        db.deleteMany({}, () => {
            chai
			.request(app)
			.post(`/api/threads/test`)
			.send({
				text: "new thread",
				delete_password: "password",
			})
			.end(async function (err, res) {
				assert.equal(res.status, 200);
				assert.isObject(
					res.body,
					"response should be an object"
				);
                const result = await db.find({}, {sort: {created_on: -1}}).limit(1).toArray();
                thread_id = result[0]._id
				done();
			});
        })
		
	});
    test("Viewing the 10 most recent threads with 3 replies each: GET request to /api/threads/{board}", function (done) {
		chai
			.request(app)
			.get(`/api/threads/test`)
			.end(function (err, res) {
				assert.equal(res.status, 200);
				assert.isArray(
					res.body,
					"response should be an array"
				);
				done();
			});
	});
    test("Reporting a thread: PUT request to /api/threads/{board}", function (done) {
		chai
			.request(app)
			.put(`/api/threads/test`)
            .send({thread_id: thread_id})
			.end(function (err, res) {
				assert.equal(res.status, 200);
				assert.isString(
					res.text,
					"response should be an array"
				);
                assert.equal(res.text, "success")
				done();
			});
	});
    test("Creating a new reply: POST request to /api/replies/{board}", function (done) {
            chai
			.request(app)
			.post(`/api/replies/test`)
			.send({
                thread_id: thread_id,
				text: "new reply",
				delete_password: "password",
			})
			.end(function (err, res) {
				assert.equal(res.status, 200);
				assert.isObject(
					res.body,
					"response should be an object"
				);
                db.find({}, {sort: {created_on: -1}}).limit(1).toArray((err, result) => {
                    reply_id = result[0].replies[0]._id
                    done();
                });
			});
		
	});
    test("Viewing a single thread with all replies: GET request to /api/replies/{board}", function (done) {
		chai
			.request(app)
			.get(`/api/replies/test?thread_id=${thread_id}`)
			.end(function (err, res) {
				assert.equal(res.status, 200);
				assert.isObject(
					res.body,
					"response should be an object"
				);
				done();
			});
	});
    test("Reporting a reply: PUT request to /api/replies/{board}", function (done) {
		chai
			.request(app)
			.put(`/api/replies/test`)
            .send({thread_id: thread_id, reply_id: reply_id})
			.end(function (err, res) {
				assert.equal(res.status, 200);
				assert.isString(
					res.text,
					"response should be an array"
				);
                assert.equal(res.text, "success")
				done();
			});
	});
    test("Deleting a reply with the incorrect password: DELETE request to /api/replies/{board} with an invalid delete_password", function (done) {
		chai
			.request(app)
			.delete(`/api/replies/test`)
            .send({thread_id: thread_id, delete_password: "hello", reply_id: reply_id})
			.end(function (err, res) {
				assert.equal(res.status, 200);
				assert.isString(
					res.text,
					"response should be an array"
				);
                assert.equal(res.text, "incorrect password")
				done();
			});
	});
    test("Deleting a reply with the correct password: DELETE request to /api/replies/{board} with a valid delete_password", function (done) {
		chai
			.request(app)
			.delete(`/api/replies/test`)
            .send({thread_id: thread_id, delete_password: "password", reply_id: reply_id})
			.end(function (err, res) {
				assert.equal(res.status, 200);
				assert.isString(
					res.text,
					"response should be an array"
				);
                assert.equal(res.text, "success")
				done();
			});
	});
    test("Deleting a thread with the incorrect password: DELETE request to /api/threads/{board} with an invalid delete_password", function (done) {
		chai
			.request(app)
			.delete(`/api/threads/test`)
            .send({thread_id: thread_id, delete_password: "hello"})
			.end(function (err, res) {
				assert.equal(res.status, 200);
				assert.isString(
					res.text,
					"response should be an array"
				);
                assert.equal(res.text, "incorrect password")
				done();
			});
	});
    test("Deleting a thread with the correct password: DELETE request to /api/threads/{board} with a valid delete_password", function (done) {
		chai
			.request(app)
			.delete(`/api/threads/test`)
            .send({thread_id: thread_id, delete_password: "password"})
			.end(function (err, res) {
				assert.equal(res.status, 200);
				assert.isString(
					res.text,
					"response should be an array"
				);
                assert.equal(res.text, "success")
				done();
			});
	});
   
});
