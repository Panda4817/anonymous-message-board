const newThread = (event) => {
	event.preventDefault();
	const board = event.target[0].value;
	const text = event.target[1].value;
	const delete_password = event.target[2].value;
    console.log(board, text, delete_password)
	fetch(`/api/threads/${board}`, {
		method: "POST",
		body: JSON.stringify({
			text: text,
			delete_password: delete_password,
            board: board
		}),
		headers: {
			"Content-Type": "application/json",
		},
	}).then((res) => {
		if (res.redirected) {
			window.location.href = res.url;
		}
	});
};

const reportThread = (event) => {
	event.preventDefault();
	const board = event.target[0].value;
	const thread_id = event.target[1].value;
	fetch(`/api/threads/${board}`, {
		method: "PUT",
		body: JSON.stringify({
			thread_id: thread_id,
            board: board
		}), headers: {
			"Content-Type": "application/json",
		},
	})
    .then((res) => res.text()).then((text) => {
        console.log(text)
        if (text == "success") {
            alert("Thread was reported!");
        }
    })
}

const deleteThread = (event) => {
	event.preventDefault();
	const board = event.target[0].value;
	const thread_id = event.target[1].value;
	const delete_password = event.target[2].value;
	fetch(`/api/threads/${board}`, {
		method: "DELETE",
		body: JSON.stringify({
			thread_id: thread_id,
			delete_password: delete_password,
            board: board
		}), headers: {
			"Content-Type": "application/json",
		},
	})
    .then((res) => res.text()).then((text) => {
        console.log(text)
        if (text == "success") {
            alert("Thread was deleted!");
        }
    })
};

const newReply = (event) => {
	event.preventDefault();
	const board = event.target[0].value;
	const thread_id = event.target[1].value;
	const text = event.target[2].value;
	const delete_password = event.target[3].value;
	fetch(`/api/replies/${board}`, {
		method: "POST",
		body: JSON.stringify({
			thread_id: thread_id,
			text: text,
			delete_password: delete_password,
            board: board
		}),
		redirect: "follow", headers: {
			"Content-Type": "application/json",
		},
	}).then((res) => {
		if (res.redirected) {
			window.location.href = res.url;
		}
	});
};

const reportReply = (event) => {
	event.preventDefault();
	const board = event.target[0].value;
	const thread_id = event.target[1].value;
	const reply_id = event.target[2].value;
	fetch(`/api/replies/${board}`, {
		method: "PUT",
		body: JSON.stringify({
			thread_id: thread_id,
			reply_id: reply_id,
            board: board
		}), headers: {
			"Content-Type": "application/json",
		},
	})
    .then((res) => res.text()).then((text) => {
        console.log(text)
        if (text == "success") {
            alert("Reply message was reported!");
        }
    })
};

const deleteReply = (event) => {
	event.preventDefault();
	const board = event.target[0].value;
	const thread_id = event.target[1].value;
	const reply_id = event.target[2].value;
	const delete_password = event.target[3].value;
	fetch(`/api/thread/${board}`, {
		method: "DELETE",
		body: JSON.stringify({
			thread_id: thread_id,
			reply_id: reply_id,
			delete_password: delete_password,
		}),
	})
    .then((res) => res.text()).then((text) => {
        console.log(text)
        if (text == "success") {
            alert("Reply message was deleted!");
        }
    })
};
