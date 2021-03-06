wiki.get(/^\/api\/v2\/w\/(.*)/, async function API_viewDocument_v2(req, res) {
	const title = req.params[0];
	const rev = req.query['rev'];
	
	if(title.replace(/\s/g, '') === '') {
		res.status(400).json({
			title: title,
			state: 'invalid_document',
			content: ''
		});
		return;
	}
	
	if(rev) {
		await curs.execute("select content from history where title = ? and rev = ?", [title, rev]);
	} else {
		await curs.execute("select content from documents where title = ?", [title]);
	}
	const rawContent = curs.fetchall();

	var content = '';
	
	var httpstat = 200;
	var viewname = 'wiki';
	var error = false;
	
	var isUserDoc = false;
	
	var lstedt = undefined;
	
	try {
		if(!await getacl(req, title, 'read')) {
			httpstat = 403;
			error = true;
			
			res.status(httpstat).json({
				title: title,
				state: 'insufficient_privileges_read',
				content: ''
			});
			
			return;
		} else {
			content = markdown(rawContent[0]['content']);
			
			if(title.startsWith("사용자:") && getperm(req, 'admin', title.replace(/^사용자[:]/, ''))) {
				content = `
					<div style="border-width: 5px 1px 1px; border-style: solid; border-color: orange gray gray; padding: 10px; margin-bottom: 10px;" onmouseover="this.style.borderTopColor=\'red\';" onmouseout="this.style.borderTopColor=\'orange\';">
						<span style="font-size: 14pt;">이 사용자는 특수 권한을 가지고 있습니다.</span>
					</div>
				` + content;
			}
			
			await curs.execute("select time from history where title = ? order by cast(rev as integer) desc limit 1", [title]);
			lstedt = Number(curs.fetchall()[0]['time']);
		}
	} catch(e) {
		viewname = 'notfound';
		
		httpstat = 404;
		content = '';
	}
	
	res.status(httpstat).json({
		title: title,
		state: viewname,
		content: content,
		last_edited: lstedt
	});
});

wiki.get(/^\/api\/v2\/raw\/(.*)/, async function API_viewRaw_v2(req, res) {
	const title = req.params[0];
	const rev = req.query['rev'];
	
	if(title.replace(/\s/g, '') === '') {
		res.status(400).json({
			title: title,
			state: 'invalid_document',
			content: ''
		});
		return;
	}
	
	if(rev) {
		await curs.execute("select content from history where title = ? and rev = ?", [title, rev]);
	} else {
		await curs.execute("select content from documents where title = ?", [title]);
	}
	const rawContent = curs.fetchall();

	var content = '';
	
	var httpstat = 200;
	var viewname = 'wiki';
	var error = false;
	
	var isUserDoc = false;
	
	var lstedt = undefined;
	
	try {
		if(!await getacl(req, title, 'read')) {
			httpstat = 403;
			error = true;
			
			res.status(httpstat).json({
				title: title,
				state: 'insufficient_privileges_read',
				content: ''
			});
			
			return;
		} else {
			content = rawContent[0]['content'];
		}
	} catch(e) {
		viewname = 'notfound';
		
		httpstat = 404;
		content = '';
	}
	
	res.status(httpstat).json({
		title: title,
		state: viewname,
		content: content
	});
});

wiki.get(/^\/api\/v2\/users\/(.*)/, async function API_userInfo_v2(req, res) {
	const username = req.params[0];
	
	await curs.execute("select username from users where username = ?", [username]);
	
	if(!curs.fetchall().length) {
		res.status(404).json({
			username: username,
			state: 'invalid_user'
		});
		return;
	}
	
	var ret = {
		username: username,
		state: 'ok'
	};
	
	await curs.execute("select time from history where rev = '1' and title = ?", ['사용자:' + username]);
	ret['join_timestamp'] = curs.fetchall()[0]['time'];
	
	await curs.execute("select username from history where username = ?", [username]);
	ret['contribution_count'] = curs.fetchall().length;
	
	ret['permissions'] = [];
	
	ret['banned'] = await isBanned(req, 'author', username);
	
	for(var perm of perms) {
		if(getperm(req, perm, username)) ret['permissions'].push(perm);
	}
	
	res.json(ret);
});

wiki.get(/^\/api\/v2\/history\/(.*)/, async function API_viewHistory_v2(req, res) {
	const title = req.params[0];
	
	const start = req.query['start'];
	const end = req.query['end'];
	
	if(!start || !end || isNaN(atoi(start)) || isNaN(atoi(end))) {
		res.json({
			title: title,
			state: 'invalid_parameters',
			history: null,
			description: 'URL에 시작 리비전과 끝 리비전을 start 및 end 키워드로 명시하십시오.'
		});
		return;
	}
	
	if(atoi(start) > atoi(end)) {
		res.json({
			title: title,
			state: 'invalid_parameters',
			history: null,
			description: '시작 리비전은 끝 리비전보다 클 수 없습니다.'
		});
		return;
	}
	
	if(atoi(end) - atoi(start) > 100) {
		res.json({
			title: title,
			state: 'invalid_parameters',
			history: null,
			description: '시작 리비전과 끝 리비전의 차이는 100 이하이여야 합니다.'
		});
		return;
	}
	
	await curs.execute("select rev, time, changes, log, iserq, erqnum, advance, ismember, username from history \
						where title = ? and cast(rev as integer) >= ? and cast(rev as integer) <= ? order by cast(rev as integer) desc limit 30",
						[title, atoi(start), atoi(end)]);
	var ret = {};
	
	var cnt = 0;
	
	for(var row of curs.fetchall()) {
		ret[row['rev']] = {
			rev: row['rev'],
			timestamp: row['time'],
			changes: row['changes'],
			log: row['log'],
			edit_request: row['iserq'] == '1' ? true : false,
			edit_request_number: row['iserq'] == '1' ? row['erqnum'] : null,
			advance: row['advance'],
			contribution_type: row['ismember'],
			username: row['username']
		};
		cnt++;
	}
	
	res.json({
		title: title,
		startrev: start,
		endrev: end,
		state: 'ok',
		total: cnt,
		history: ret
	});
});

wiki.get(/^\/api\/v2\/thread\/(.+)/, async function API_threadData_v2(req, res) {
	const tnum = req.params[0];
	
	const start = req.query['start'];
	const end = req.query['end'];
	
	if(!start || !end || isNaN(atoi(start)) || isNaN(atoi(end))) {
		res.json({
			thread_id: tnum,
			state: 'invalid_parameters',
			history: null,
			description: 'URL에 시작 레스번호와 끝 레스번호를 start 및 end 키워드로 명시하십시오.'
		});
		return;
	}
	
	if(atoi(start) > atoi(end)) {
		res.json({
			thread_id: tnum,
			state: 'invalid_parameters',
			history: null,
			description: '시작 번호는 끝 번호보다 클 수 없습니다.'
		});
		return;
	}
	
	if(atoi(end) - atoi(start) > 2000) {
		res.json({
			thread_id: tnum,
			state: 'invalid_parameters',
			history: null,
			description: '시작 레스번호와 끝 레스번호의 차이는 2,000 이하이여야 합니다.'
		});
		return;
	}
	
	await curs.execute("select id from res where tnum = ?", [tnum]);
	
	const rescount = curs.fetchall().length;
	
	if(!rescount) { 
		res.status(400).json({
			thread_id: tnum,
			state: 'notfound',
			description: '토론을 찾을 수 없습니다.'
		});
	}
	
	await curs.execute("select username from res where tnum = ? and (id = '1')", [tnum]);
	const fstusr = curs.fetchall()[0]['username'];
	
	await curs.execute("select title, topic, status from threads where tnum = ?", [tnum]);
	const title = curs.fetchall()[0]['title'];
	const topic = curs.fetchall()[0]['topic'];
	const status = curs.fetchall()[0]['status'];
	
	await curs.execute("select id, content, username, time, hidden, hider, status, ismember, stype, isadmin from res where tnum = ? and (cast(id as integer) >= ? and cast(id as integer) <= ?) order by cast(id as integer) asc", [tnum, Number(start), Number(end)]);

	content = '';
	var ret = {};
	var cnt = 0;
	for(var rs of curs.fetchall()) {
		ret[rs['id']] = {
			id: rs['id'],
			hidden: rs['hidden'] == '1' ? true : false,
			hider: rs['hidden'] == '1' ? rs['hider'] : null,
			type: rs['status'] == '1' ? 'status' : 'normal',
			contribution_type: rs['ismember'],
			status_type: rs['status'] == '1' ? rs['stype'] : null,
			timestamp: rs['time'],
			username: rs['username'],
			content: rs['hidden'] == '1' || rs['hidden'] == 'O' ? (
								getperm(req, 'hide_thread_comment', ip_check(req))
								? markdown(rs['content'], 1)
								: ''
							  ) : (
								markdown(rs['content'], 1)
							),
			raw: rs['hidden'] == '1' ? (
								getperm(req, 'hide_thread_comment', ip_check(req))
								? rs['content']
								: ''
							  ) : (
								rs['content']
							),
			first_author: rs['username'] == fstusr ? true : false,
			admin: rs['isadmin'] == '1' ? true : false
		};
		cnt++;
	}
	
	return res.json({
		title: title,
		topic: topic,
		status: status,
		thread_id: tnum,
		total: cnt,
		res: ret,
		startres: start,
		endres: end
	});
});

wiki.post(/\/api\/v2\/login/, async function API_botLogin_v2(req, res) {
	await curs.execute("select username from bots where token = ?", [req.body['token']]);
	if(curs.fetchall().length) {
		res.session.username = curs.fetchall()[0]['username'];
		res.json({
			'status': 'success'
		});
	} else {
		res.json({
			'status': 'fail'
		});
	}
});

wiki.get(/^\/api\/v2\/(.*)/, (req, res) => res.json({
	state: 'not_found',
	description: '해당 API를 찾을 수 없습니다. (현재 사용 중인 API 버전은 2입니다)'
}));
