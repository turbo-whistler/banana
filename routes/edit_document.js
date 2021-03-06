wiki.get(/^\/edit\/(.*)/, async function editDocument(req, res) {
	const title = req.params[0];
	
	if(!await getacl(req, title, 'read')) {
		res.status(403).send(await showError(req, 'insufficient_privileges_read'));
		
		return;
	}
	
	await curs.execute("select content from documents where title = ? and ((title like '사용자:%') or (subwikiid = ? and not title like '사용자:%'))", [title, (title.startsWith('사용자:') ? '' : subwiki(req))]);
	var rawContent = curs.fetchall();
	
	if(!rawContent[0]) rawContent = '';
	else rawContent = rawContent[0]['content'];
	
	var error = false;
	var content = '';
	
	var token = rndval('abcdef1234567890', 64);
	
	var baserev;
	
	await curs.execute("select rev from history where title = ? and ((title like '사용자:%') or (subwikiid = ? and not title like '사용자:%')) order by CAST(rev AS INTEGER) desc limit 1", [title, (title.startsWith('사용자:') ? '' : subwiki(req))]);
	try {
		baserev = curs.fetchall()[0]['rev'];
	} catch(e) {
		baserev = 0;
	}
	
	var captcha = '';
	
	if(!req.cookies.dooly) {
		captcha = generateCaptcha(req, 1);
	}
	
	if(!await getacl(req, title, 'edit')) {
		error = true;
		content = `
			${alertBalloon('[권한 부족]', '문서에 내용을 쓸 권한이 없습니다. 토론에 편집할 내용을 올리십시오.', 'danger', true)}
		
			<textarea name=text class=form-control readonly>${html.escape(rawContent)}</textarea>
		`;
	} else {
		content = `
			<!-- 나무픽스 비교 기능 오류 수정 -->
			<h1 class=title style="display: none;">
				<a>${html.escape(title)}</a>
			</h1>
		
			<ul class="nav nav-pills">
				<li class=nav-item>
					<a class="nav-link active" href="#editpage">내용 쓰기</a>
				</li>
				
				<li class=nav-item>
					<a class=nav-link href="#delete">문서 지우기</a>
				</li>
				
				<li class=nav-item>
					<a class=nav-link href="#move">제목 바꾸기</a>
				</li>
			</ul>
			
			<div class=tab-content>
				<div class="tab-pane active" id=editpage>
					<form method=post id=editForm data-title="${html.escape(title)}">
						<input type=hidden name=token value="나무픽스 호환용">
						<input type=hidden name=baserev value="${baserev}">

            <div id=quick-markup>
              <button 
                type=button
                data-default-value="내용"
                class="btn btn-secondary btn-sm insert-markup"

                data-start="'''"
                data-end="'''"
              >굵게</button>

              <button 
                type=button
                data-default-value="내용"
                class="btn btn-secondary btn-sm insert-markup"

                data-start="''"
                data-end="''"
              >기울게</button>

              <button 
                type=button
                data-default-value="내용"
                class="btn btn-secondary btn-sm insert-markup"

                data-start="__"
                data-end="__"
              >밑줄</button>

              <button 
                type=button
                data-default-value="내용"
                class="btn btn-secondary btn-sm insert-markup"

                data-start="--"
                data-end="--"
              >취소선</button>

              <button 
                type=button
                data-default-value="내용"
                class="btn btn-secondary btn-sm insert-markup"

                data-start="{{{#색이름 "
                data-end="}}}"
              >글자색</button>

              <button 
                type=button
                data-default-value="내용"
                class="btn btn-secondary btn-sm insert-markup"

                data-start="{{{+수치 "
                data-end="}}}"
              >큰글자</button>

              <button 
                type=button
                data-default-value="내용"
                class="btn btn-secondary btn-sm insert-markup"

                data-start="{{{-수치 "
                data-end="}}}"
              >작은글자</button>

              <button 
                type=button
                data-default-value="틀이름"
                class="btn btn-secondary btn-sm insert-markup"

                data-start="[include(틀:"
                data-end=")]"
              >틀</button>

              <button 
                type=button
                data-default-value="문서명"
                class="btn btn-secondary btn-sm insert-markup"

                data-start="[["
                data-end="]]"
              >링크</button>

              <button 
                type=button
                class="btn btn-secondary btn-sm"
				id=showColorPicker
              >색 선택기</button>
            </div>
						
						<ul class="nav nav-tabs" style="height: 38px;">
							<li class=nav-item>
								<a class="nav-link active" href="#edit">편집기</a>
							</li>
							
							<li class=nav-item>
								<a id=previewLink class=nav-link href="#preview">미리보기</a>
							</li>
							
							<li class=nav-item>
								<a id=diffLink class=nav-link href="#diff">비교</a>
							</li>
						</ul>
						
						<div class="tab-content bordered">
							<div class="tab-pane active" id=edit>
								<textarea name=text rows=25 class=form-control id=textInput>${html.escape(rawContent)}</textarea>
								<textarea id=originalContent style="display: none;">${html.escape(rawContent)}</textarea>
							</div>
							
							<div class=tab-pane id=preview>
								<iframe id=previewFrame name=previewFrame></iframe>
							</div>
				
							<div class=tab-pane id=diff>
							
							</div>
						</div>
						
						<div class=form-group>
							<div class=for-script>
								<label>분류(엔터로 등록): [미구현, [[분류:xxx]] 사용]</label>
								<div id=tags class=form-control>
									<input id=tagInput />
								</div>
								
								<div id=tagSearch>
								
								</div>
							</div>
							
							<noscript>
								<label>분류(줄바꿈으로 구분): </label>
								<textarea class=form-control name=category-fallback rows=6></textarea>
							</noscript>
						</div>

						<div class=form-group>
							<label>편집 메모:</label>
							<input type=text class=form-control id=logInput name=log />
						</div>

            <input type=checkbox checked id=agreeCheckbox value=Y description="theseed.js를 사용 중일 때 저장이 되지 않는 문제 수정용" style="display: none;" />
						
						<div class=form-group>
							${captcha}
						</div>
						
						${config.getString('edit_warning', '')}
						
						<input type=hidden name=agree value=Y />
						
						<div class=btns>
							<button id=editBtn class="btn btn-primary" style="width: 100px;">저장</button>
						</div>
					</form>
				</div>
				
				<div class=tab-pane id=delete>
					<form method="post" action="/delete/${encodeURIComponent(title)}" data-title="${title}" data-recaptcha="0">
						<div class="form-group" style="margin-top: 1rem;">
							<label>사유: </label>
							<input type="text" class="form-control" id="logInput" name="log" value="">
						</div>
						
						<label><input type=checkbox name=agree> 문서 제목을 변경하는 것이 아님에 동의합니다.</label>
						
						<div class=form-group>
							${captcha}
						</div>
						
						<div class="btns">
							<button class="btn btn-danger" style="width: 100px;">문서 삭제</button>
						</div>
					</form>
				</div>
				
				<div class=tab-pane id=move>
					<form method="post" action="/move/${encodeURIComponent(title)}" data-title="${title}" data-recaptcha="0">
						<div class="form-group" style="margin-top: 1rem;">
							<label>새로운 제목: </label>
							<input type=text class=form-control name=newtitle>
						</div>

						<div class="form-group" style="margin-top: 1rem;">
							<label>사유: </label>
							<input type="text" class="form-control" id="logInput" name="log" value="">
						</div>
						
						<div class=form-group>
							${captcha}
						</div>
						
						<div class="btns">
							<button class="btn btn-warning" style="width: 100px;">문서 이동</button>
						</div>
					</form>
				</div>
			</div>
		`;
	}
	
	if(!islogin(req)) {
		content += `<p style="font-weight: bold; color: red;">로그인하지 않았습니다. 문서 역사에 IP(${ip_check(req)})를 영구히 기록하는 것에 동의하는 것으로 간주합니다.</p>`;
	}

	var httpstat = 200;
	
	res.status(httpstat).send(await render(req, title, content, {
		token: token,
		captcha: 0,
		body: {
			baserev: baserev,
			text: rawContent,
			section: null,
			error: error
		},
		st: 2
	}, ' (쓰기)', error, 'edit'));
});

wiki.post(/^\/edit\/(.*)/, async function saveDocument(req, res) {
	const title = req.params[0];
	
	if(!await getacl(req, title, 'edit') || !await getacl(req, title, 'read')) {
		res.send(await showError(req, 'insufficient_privileges_edit'));
		
		return;
	}
	
	if(!req.cookies.dooly && config.getString('enable_captcha', '1') != '0') {
		try {
			if(req.body['captcha'].replace(/\s/g, '') != req.session.captcha) {
				res.send(await showError(req, 'invalid_captcha_number'));
				return;
			} else {
				res.cookie('dooly', 0, {
					maxAge: 30 * 24 * 60 * 60 * 1000, 
					httpOnly: false 
				});
			}
		} catch(e) {
			res.send(await showError(req, 'captcha_check_fail'));
			return;
		}
	}
	
	await curs.execute("select content from documents where title = ? and ((title like '사용자:%') or (subwikiid = ? and not title like '사용자:%'))", [title, (title.startsWith('사용자:') ? '' : subwiki(req))]);
	var original = curs.fetchall();
	
	if(!original[0]) original = '';
	else original = original[0]['content'];
	
	var content = req.body['text'];
	if(!content) return res.send(await showError(req, 'invalid_request_body'));
	content = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
	if(content.startsWith('#넘겨주기 ')) {
		content = content.replace('#넘겨주기 ', '#redirect ');
	}
	const rawChanges = content.length - original.length;
	
	try {
		markdown(content);
	} catch(e) {
		print(e);
		res.send(await showError(req, 'syntax_error'));
		return;
	}
	
	const changes = (rawChanges > 0 ? '+' : '') + String(rawChanges);
	
	const log = req.body['log'];
	
	const agree = req.body['agree'];
	
	const baserev = req.body['baserev'];
	
	const ismember = islogin(req) ? 'author' : 'ip';
	
	var advance = '';
	
	await curs.execute("select title from documents where title = ? and ((title like '사용자:%') or (subwikiid = ? and not title like '사용자:%'))", [title, (title.startsWith('사용자:') ? '' : subwiki(req))]);
	
	if(!curs.fetchall().length) {
		advance = '(문서 생성)';
		curs.execute("insert into documents (title, content, subwikiid) values (?, ?, ?)", [title, content, (title.startsWith('사용자:') ? '' : subwiki(req))]);
	} else {
		curs.execute("update documents set content = ? where title = ? and ((title like '사용자:%') or (subwikiid = ? and not title like '사용자:%'))", [content, title, (title.startsWith('사용자:') ? '' : subwiki(req))]);
		curs.execute("update stars set lastedit = ? where title = ? and ((title like '사용자:%') or (subwikiid = ? and not title like '사용자:%'))", [getTime(), title, (title.startsWith('사용자:') ? '' : subwiki(req))]);
	}
	
	curs.execute("insert into history (title, content, rev, username, time, changes, log, iserq, erqnum, ismember, advance, subwikiid) \
					values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", [
		title, content, String(Number(baserev) + 1), ip_check(req), getTime(), changes, log, '0', '-1', ismember, advance, (title.startsWith('사용자:') ? '' : subwiki(req))
	]);
	
	res.redirect('/w/' + title + (req.query['section'] ? '#s-' + req.query['section'] : ''));
});

wiki.post(/\/preview\/(.*)/, async (req, res) => {
	try {
		res.send(await JSnamumark(req.params[0], req.body['text'] || req.body['raw']));
	} catch(e) {
		res.send(await showError('invalid_request_body'));
	}
});
