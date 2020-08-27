wiki.get(/\/revert\/(.*)/, async (req, res) => {
	const title = req.params[0];
	
	if(!await getacl(req, title, 'read')) {
		return res.send(await showError(req, 'insuffisient_privileges_read'));
	}
	
	if(!await getacl(req, title, 'edit')) {
		return res.send(await showError(req, 'insuffisient_privileges_edit'));
	}
	
	if(!await getacl(req, title, 'revert')) {
		return res.send(await showError(req, 'insuffisient_privileges_revert'));
	}
	
	const rev = req.query['rev'];
	if(!rev) {
		return res.send(await showError(req, 'revision_not_specified'));
	}
	
	if(isNaN(atoi(rev))) {
		return res.send(await showError(req, 'invalid_value'));
	}
	
	const _recentRev = await curs.execute("select content, rev from history where title = ? order by cast(rev as integer) desc limit 1", [title]);
	if(!_recentRev.length) {
		return res.send(await showError(req, 'document_not_found'));
	}
	
	const dbdata = await curs.execute("select content, time, username from history where title = ? and rev = ?", [title, rev]);
	if(!dbdata.length) {
		return res.send(await showError(req, 'revision_not_found'));
	}
	
	const revdata   = dbdata[0];
	const recentRev = _recentRev[0];
	
	var content = `
		<form method=get>
			<div class=form-group>
				<label>리비전:</label><br />
				<input type=number name=rev class=form-control value="${rev}" />
			</div>
			
			<div class=btns>
				<a class="btn btn-secondary" href="/revert/${encodeURIComponent(title)}?rev=1">&lt;&lt;</a>
				<a class="btn btn-secondary ${rev == '1' ? 'disabled' : ''}" ${rev == '1' ? 'disabled' : ''} href="/revert/${encodeURIComponent(title)}?rev=${atoi(rev) - 1}">&lt; ${rev == '1' ? '' : atoi(rev) - 1}</a>
				<button type=submit class="btn btn-info">이동</button>
				<a class="btn btn-secondary" href="/revert/${encodeURIComponent(title)}?rev=${atoi(rev) + 1}">${atoi(rev) + 1} &gt;</a>
				<a class="btn btn-secondary" href="/delete/${encodeURIComponent(title)}">×</a>
			</div>
		</form>
		
		<form>
			<div class=form-group>
				<label>날짜 (UTC):</label><br />
				<input type=text readonly class=form-control value="${html.escape(toDate(revdata.time))}" />
			</div>
			
			<div class=form-group>
				<label>기여자:</label><br />
				<input type=text readonly class=form-control value="${html.escape(revdata.username)}" />
			</div>
			
			<div class=form-group>
				<ul class="nav nav-tabs" role=tablist style="height: 38px;">
					<li class=nav-item>
						<a class="nav-link active" data-toggle=tab href="#preview" role=tab aria-expanded=true>미리 보기</a>
					</li>
					
					<li class=nav-item>
						<a class=nav-link data-toggle=tab href="#raw" role=tab aria-expanded=true>RAW</a>
					</li>
					
					<li class=nav-item>
						<a class=nav-link data-toggle=tab href="#diff" role=tab aria-expanded=true>비교</a>
					</li>
				</ul>
				
				<div class="tab-content bordered">
					<div id=preview class="tab-pane active" role=tabpanel aria-expanded=true>
						${await JSnamumark(title, revdata.content.replace(/\r\n/g, '\n').replace(/\r/g, '\n'))}
					</div>
					
					<div id=raw class=tab-pane role=tabpanel aria-expanded=true>
						<textarea class=form-control rows=15 readonly>${revdata.content}</textarea>
					</div>
					
					<div id=diff class=tab-pane role=tabpanel aria-expanded=true>
						${difflib.diff(recentRev.content.replace(/\r\n/g, '\n').replace(/\r/g, '\n'), revdata.content.replace(/\r\n/g, '\n').replace(/\r/g, '\n'), recentRev.rev + '판', rev + '판')}
					</div>
				</div>
			</div>
		</form>
		
		<form method=post>
			<div class=form-group>
				<label>사유:</label><br>
				<input type=text class=form-control name=log />
			</div>
			
			<div class=btns>
				<button type=submit class="btn btn-primary" style="width: 100px;">확인</button>
			</div>
		</form>
	`;
	
	res.send(await render(req, title, content, {
		rev: rev,
		text: revdata.content
	}, ' (' + rev + '판으로 복원)', _, 'revert'))
});