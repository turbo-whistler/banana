wiki.get('/RecentChanges', async function recentChanges(req, res) {
	if(config.getString('disable_recentchanges', '0') == '1') {
		res.send(await showError(req, 'disabled_feature'));
		return;
	}
	
	var flag = req.query['logtype'];
	if(!flag) flag = 'all';
	
	switch(flag) {
		case 'create':
			await curs.execute("select title, rev, time, changes, log, iserq, erqnum, advance, ismember, username from history \
						where (advance like '(문서 생성)' or advance like '<i>(새 문서)</i>') order by cast(time as integer) desc limit 100");
		break;case 'delete':
			await curs.execute("select title, rev, time, changes, log, iserq, erqnum, advance, ismember, username from history \
						where (advance like '(삭제)' or advance like '<i>(삭제)</i>') order by cast(time as integer) desc limit 100");
		break;case 'move':
			await curs.execute("select title, rev, time, changes, log, iserq, erqnum, advance, ismember, username from history \
						where (advance like '(%제목 변경)' or advance like '<i>(%이동)</i>') order by cast(time as integer) desc limit 100");
		break;case 'revert':
			await curs.execute("select title, rev, time, changes, log, iserq, erqnum, advance, ismember, username from history \
						where (advance like '(%복원)' or advance like '<i>(%로 되돌림)</i>') order by cast(time as integer) desc limit 100");
		break;case 'modify':
			await curs.execute("select title, rev, time, changes, log, iserq, erqnum, advance, ismember, username from history \
						where not title like '사용자:%' and advance = '' order by cast(time as integer) desc limit 100");
		break;default:
			await curs.execute("select title, rev, time, changes, log, iserq, erqnum, advance, ismember, username from history \
						where not title like '사용자:%' order by cast(time as integer) desc limit 100");
	}
	
	var content = `
		<ol class="breadcrumb link-nav">
			<li><a href="?logtype=all">[전체 내역]</a></li>
			<li><a href="?logtype=modify">[일반 편집]</a></li>
			<li><a href="?logtype=create">[새로 작성]</a></li>
			<li><a href="?logtype=delete">[문서 지움]</a></li>
			<li><a href="?logtype=move">[제목변경]</a></li>
			<li><a href="?logtype=revert">[되돌림]</a></li>
		</ol>
	`;
	
	var tabledata = `
		<table class="table table-hover">
			<colgroup>
				<col style="width: 100px;">
				<col style="width: 22%;">
				<col>
			</colgroup>
			
			<thead id>
				<tr>
					<th>시간</th>
					<th>이름</th>
					<th>문서</th>
				</tr>
			</thead>
			
			<tbody id>
	`;
	
	for(row of curs.fetchall()) {
		tabledata += `
				<tr${(row['log'].length > 0 || row['advance'].length > 0 ? ' class=no-line' : '')}>
					<td>
						${generateTime(toDate(row['time']), 'H시 i분')}
					</td>
					
					<td>
						${ip_pas(req, row['username'], row['ismember'])}
					</td>
					
					<td>
						<strong>r${row['rev']}</strong> <a href="/w/${encodeURIComponent(row['title'])}">${html.escape(row['title'])}</a> 
						( <a href="/history/${encodeURIComponent(row['title'])}">역사</a> 
						${
								Number(row['rev']) > 1
								? ' | <a \href="/diff/' + encodeURIComponent(row['title']) + '?rev=' + row['rev'] + '&oldrev=' + String(Number(row['rev']) - 1) + '">비교</a>'
								: ''
						} 
						| <a href="/revert/${encodeURIComponent(row['title'])}?rev=${atoi(row['rev']) - 1}">롤백</a>
						| <a href="/edit/${encodeURIComponent(row['title'])}">편집</a> )
						
						[<span style="color: ${
							(
								Number(row['changes']) > 0
								? 'green'
								: (
									Number(row['changes']) < 0
									? 'red'
									: 'gray'
								)
							)
							
						}; ${Math.abs(Number(row['changes'])) >= 1000 ? 'font-weight: bold;' : ''}">${row['changes']}</span>]
					</td>
				</tr>
		`;
		
		if(row['log'].length > 0 || row['advance'].length > 0) {
			tabledata += `
				<td colspan="3" style="padding-left: 1.5rem;">
					${row['log']} <i>${row['advance']}</i>
				</td>
			`;
		}
	}
	
	tabledata += `
			</tbody>
		</table>
	`;
	
	if(req.query['tableonly'] == '1') return res.send(tabledata);
	
	res.send(await render(req, '최근 변경', content + tabledata, {}, _, _, 'recent'));
});