"use strict";
const ObjectId = require("mongodb").ObjectID;
const bcrypt = require("bcrypt");
const saltRounds = 12;

module.exports = function (app, db) {
	const get_threads = async (board) => {
		const result = await db
			.find(
				{ board: board },
				{
					sort: { bumped_on: -1 },
					projection: {
						replies: { $slice: 3 },
						reported: 0,
						delete_password: 0,
					},
				}
			)
			.limit(10)
			.toArray();
		return result;
	};
	//Sample front-end
	app.route("/b/:board/").get(function (req, res) {
		res.sendFile(process.cwd() + "/views/board.html");
	});
	app.route("/b/:board/:threadid").get(function (req, res) {
		res.sendFile(process.cwd() + "/views/thread.html");
	});

	//Index page (static HTML)
	app.route("/").get(function (req, res) {
		//res.sendFile(process.cwd() + "/views/index.html");
		db.find({}).toArray((err, result) => {
			const boards = [];
			result.map((doc) => {
				if (boards.indexOf(doc.board) < 0) {
					boards.push(doc.board);
				}
				return;
			});
			res.render("index.pug", { boards: boards });
		});
	});

	app
		.route("/api/threads/:board")
		.post(async (req, res) => {
			const board = req.body.board;
			const text = req.body.text;
			const delete_password = req.body.delete_password;
			const hash = bcrypt.hashSync(
				delete_password,
				saltRounds
			);
			const result = await db.insertOne({
				text: text,
				delete_password: hash,
				board: board,
				replies: [],
				created_on: new Date(),
				bumped_on: new Date(),
				reported: false,
				reply_count: 0,
			});
			res.redirect(`../../../b/${board}/`);
		})
		.get(async (req, res) => {
			const board = req.params.board;
			const result = await get_threads(board);
			res.json(result);
			// db.find(
			// 	{ board: board },
			// 	{
			// 		sort: { bumped_on: -1 },
			// 		projection: {
			// 			replies: { $slice: 3 },
			// 			reported: 0,
			// 			delete_password: 0,
			// 		},
			// 	}
			// )
			// 	.limit(10)
			// 	.toArray((err, result) => {
			// 		res.json(result);
			// 	});
		})
		.put((req, res) => {
			const thread_id = req.body.thread_id;
			db.findOneAndUpdate(
				{ _id: new ObjectId(thread_id) },
				{ $set: { reported: true } },
				{ returnOriginal: false },
				(err, result) => {
					res.send("success");
				}
			);
		})
		.delete((req, res) => {
			const thread_id = req.body.thread_id;
			const delete_password = req.body.delete_password;
			db.findOne(
				{ _id: new ObjectId(thread_id) },
				(err, result) => {
					const isRight = bcrypt.compareSync(
						delete_password,
						result.delete_password
					);
					if (isRight) {
						db.deleteOne(
							{ _id: new ObjectId(thread_id) },
							(err, result) => {
								res.send("success");
							}
						);
					} else {
						res.send("incorrect password");
					}
				}
			);
		});

	app
		.route("/api/replies/:board")
		.post(async (req, res) => {
			const board = req.params.board;
			const text = req.body.text;
			const delete_password = req.body.delete_password;
			const hash = bcrypt.hashSync(
				delete_password,
				saltRounds
			);
			const thread_id = req.body.thread_id;
			const result = await db.findOneAndUpdate(
				{ _id: new ObjectId(thread_id) },
				{
					$push: {
						replies: {
							$each: [
								{
									_id: new ObjectId(),
									text: text,
									created_on: new Date(),
									delete_password: hash,
									reported: false,
								},
							],
							$sort: { created_on: -1 },
						},
					},
					$set: { bumped_on: new Date() },
					$inc: { reply_count: 1 },
				},
				{ returnOriginal: false }
			);

			res.redirect(`../../../b/${board}/${thread_id}`);
		})
		.get((req, res) => {
			const thread_id = req.query.thread_id;
			db.findOne(
				{ _id: new ObjectId(thread_id) },
				{
					projection: { reported: 0, delete_password: 0 },
				},
				(err, result) => {
					res.json(result);
				}
			);
		})
		.put((req, res) => {
			const thread_id = req.body.thread_id;
			const reply_id = req.body.reply_id;
			db.findOneAndUpdate(
				{
					_id: new ObjectId(thread_id),
					"replies._id": new ObjectId(reply_id),
				},
				{ $set: { "replies.$.reported": true } },
				{ returnOriginal: false },
				(err, result) => {
					res.send("success");
				}
			);
		})
		.delete((req, res) => {
			const thread_id = req.body.thread_id;
			const reply_id = req.body.reply_id;
			const delete_password = req.body.delete_password;
			db.findOne(
				{
					_id: new ObjectId(thread_id),
					"replies._id": new ObjectId(reply_id),
				},
				{ projection: { "replies.$": 1 } },
				(err, result) => {
					const isRight = bcrypt.compareSync(
						delete_password,
						result.replies[0].delete_password
					);
					if (isRight) {
						db.findOneAndUpdate(
							{
								_id: new ObjectId(thread_id),
								"replies._id": new ObjectId(reply_id),
							},
							{
								$set: {
									"replies.$.text": "[deleted]",
								},
								$inc: { reply_count: -1 },
							},
							{ returnOriginal: false },
							(err, result) => {
								res.send("success");
							}
						);
					} else {
						res.send("incorrect password");
					}
				}
			);
		});
};
