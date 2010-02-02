var sztahanov = function() {
	var title = 'Sztahanov';
	var hours = 0;
	var pageSize = 5;
	var page = 0;
	var own = false;
	var	ownerId, isProfile;

	var friends_params = {};
	friends_params[opensocial.DataRequest.PeopleRequestFields.MAX] = pageSize;
	friends_params[opensocial.DataRequest.PeopleRequestFields.SORT_ORDER] = opensocial.DataRequest.SortOrder.NAME;

	var fixSize = function() {
		gadgets.window.adjustHeight($$('.sztahanov')[0].getDimensions().height);		
	}


	var updatedisplay = function() {
		document.getElementById('sum').innerHTML = hours > 0 ? hours + ' órát' : 'még nem dolgoztál semmit (milyen sztahanov vagy ?!)';
		if(hours > 0) {
			gadgets.window.setTitle(title+' ('+hours+')');
		}
	}

	var showError = function(data, fields) {
		var msg = '';
		if(data.getErrorMessage()) {
			msg += data.getErrorMessage() + '<br/>';
		}
		if(fields) {
			for(var i=0; i<fields.length; i++) {
				var item = data.get(fields[i]);
				if(item.hadError()) {
					msg += item.getErrorMessage() + ' (' +item.getErrorCode() + ')<br/>';
				}
			}
		}
		var e = document.getElementById('error');
		e.innerHTML += msg ? msg : 'valami hiba van<br/>';
		e.style.display = 'block';
	}

	var hideError = function () {
		var e = document.getElementById('error');
		e.style.display = 'none';
	}

	var load = function(data) {
		if(data.hadError()) {
			showError(data,['owner','viewer', 'sztahanovData','ownerFriends', 'friendsSztahanovData','viewerSztahanovData'])
		}
		var viewer = data.get('viewer').getData();
		var owner = data.get('owner').getData();
		own = viewer.isOwner();
		ownerId = owner.getId();

		//sztahanovdata foldolgozasa
		var workHours = extractSztahanovHours(data.get('sztahanovData').getData(), owner);
		if(workHours > 0) {
			hours = workHours;
		}

		var viewerWorkHours = extractSztahanovHours(data.get('viewerSztahanovData').getData(), viewer);

		if(own) {
			$('logWork').show();
		} else {
			$('summary').show();
			$('name').update(owner.getDisplayName());
			$('sum2').update(hours);
			$('sum_viewer').update(viewerWorkHours > 0 ? viewerWorkHours + ' órát' : 'semennyit');
		}

		updatedisplay();

		//ismeroslista feldolgozasa
		if(!isProfile) {
			updateFriends(data.get('ownerFriends').getData(), data.get('friendsSztahanovData').getData());
		}
		fixSize();
	}

	var workLogged = function(data) {
		if(data.hadError()) {
			showError(data,['workHours']);
		}
	}

	var activityCreated = function(responseItem) {
		if(responseItem.hadError()) {
			showError(responseItem);
		}
	}
	
	var loadFriends = function(loadPage, defaultRequest) {
			var req = defaultRequest ? defaultRequest : opensocial.newDataRequest();
			var ownerFriends = opensocial.newIdSpec({ "userId" : "OWNER", "groupId" : "FRIENDS" });
			var params = Object.clone(friends_params);
			params[opensocial.DataRequest.PeopleRequestFields.FIRST] = (loadPage >= 0 ? loadPage : page) * pageSize;
			req.add(req.newFetchPeopleRequest(ownerFriends, params), 'ownerFriends');
			req.add(req.newFetchPersonAppDataRequest(ownerFriends, 'workHours', params), 'friendsSztahanovData');

			if(!defaultRequest) req.send(function(data){
				if(data.hadError()) {
					showError(data,['ownerFriends', 'friendsSztahanovData'])
				}
				updateFriends(data.get('ownerFriends').getData(), data.get('friendsSztahanovData').getData());
			});
	}

	var updateFriends = function(friends,friendsSztahanovData) {
		var list = [];

		friends.each(function(person) {
			var workHours = extractSztahanovHours(friendsSztahanovData, person);
			list.push(
				'<li class="person"><span class="img"><img src="'
							+(person.getField(opensocial.Person.Field.THUMBNAIL_URL) ? person.getField(opensocial.Person.Field.THUMBNAIL_URL) : 'http://gadget.virgosystems.hu/~mrc/sztahanov/tn_empty.jpg') 
				+'"/></span>'
				+'<a href="'+person.getField(opensocial.Person.Field.PROFILE_URL)+'" target="_top">'+person.getDisplayName()+'</a>'
				+ getStars(workHours)
				+'<span class="hours">' + (workHours ? workHours + ' órát lapátolt' : 'veszélyes munkakerülő')+'</span>'
				+'</li>');
		})

		$('friends').update(list.join(''));
		
		if(friends.getTotalSize() > 0) {
			$('friend_pager').show();
			$('friends_prev')[friends.getOffset() >= pageSize ? 'show' : 'hide']();
			$('friends_next')[friends.getTotalSize() > (friends.getOffset() + pageSize) ? 'show' : 'hide']();
			$('friends_count').update(friends.getTotalSize()+' ismerős');
			page = friends.getOffset() / pageSize;
			$('current_page').update((page + 1)+'.oldal');
		} else {
			if($('filter').checked) {
				$('friends').update('<li class="nofriends"><strong>:(</strong>'
				+(own ? 'Nincs egyetlen sztahanovista ismerősöd sem. Figyelünk is egy ideje...' : 'Nincs egyetlen sztahanovista ismerőse sem. Figyeljük is egy ideje...')
				+'</li>');
			} else {
				$('friend_pager').hide();
			}
		}
		fixSize();
	}

	var getStars = function(workHours) {
		var star = '★';
		var stars, title;
		if(workHours) {
			if($R(1,10).include(workHours)) {
				title = 'a kollektíva tagja';
				stars = star;
			} else if($R(10,50).include(workHours)) {
				title = 'jó munkásember';
				stars = star.times(2);
			} else if($R(50,100).include(workHours)) {
				title = 'kiváló dolgozó';
				stars = star.times(3);
			} else if($R(100,1000).include(workHours)) {
				title = 'a munka hőse';
				stars = star.times(4);
			} else {
				title = 'maga Sztahanov elvtárs személyesen';
				stars = star.times(5);
			}
			return '<span class="stars" title="'+title+'">'+stars+'</span>';
		} else {
			return '';
		}
	}

	var extractSztahanovHours = function(sztahanovData, person) {
		var hours = 0;
		if(sztahanovData[person.getId()] && sztahanovData[person.getId()]['workHours']) {
			try {		
				var workHours = gadgets.json.parse(gadgets.util.unescapeString(sztahanovData[person.getId()]['workHours']));
				if(workHours.hours){
					hours = workHours.hours;
				}
			} catch (e) {
				//console.log('x',e);
			}
		}
		return hours;
	}

	return {
		init: function() {
			isProfile = gadgets.views.getCurrentView().getName() == 'profile';
			if(isProfile){
				$(document.body).addClassName('profile');
			}
			var viewer = opensocial.newIdSpec({ "userId" : "VIEWER" });
			var owner = opensocial.newIdSpec({ "userId" : "OWNER" });
			var ownerFriends = opensocial.newIdSpec({ "userId" : "OWNER", "groupId" : "FRIENDS" });
			var req = opensocial.newDataRequest();

			req.add(req.newFetchPersonRequest(opensocial.IdSpec.PersonId.VIEWER), 'viewer');
			req.add(req.newFetchPersonRequest(opensocial.IdSpec.PersonId.OWNER), 'owner');
			req.add(req.newFetchPersonAppDataRequest(owner, 'workHours'), 'sztahanovData');
			req.add(req.newFetchPersonAppDataRequest(viewer, 'workHours'), 'viewerSztahanovData');
			if(! isProfile) {
				req.add(req.newFetchPeopleRequest(ownerFriends, friends_params), 'ownerFriends');
				req.add(req.newFetchPersonAppDataRequest(ownerFriends, 'workHours', friends_params), 'friendsSztahanovData');
			}
			req.send(load);
		},

		logWork: function () {
			var hoursLogged = + document.getElementById('hours').value;
			if(hoursLogged > 0) {
				document.getElementById('hours').value = '';
				hours += hoursLogged;
				updatedisplay();

				//activity
				var params = {};
				params[opensocial.Activity.Field.TITLE] = hoursLogged + ' órát lapátolt';
				var activity = opensocial.newActivity(params);
				opensocial.requestCreateActivity(activity,opensocial.CreateActivityPriority.HIGH, activityCreated);

				//save data
				var req = opensocial.newDataRequest();
				req.add(req.newUpdatePersonAppDataRequest("VIEWER", 'workHours', {hours:hours}),'workHours');
				req.send(workLogged);
			}
			return false;
		},

		nextFriends: function() {
			loadFriends(page + 1);
			return false;
		},

		prevFriends: function() {
			loadFriends(page - 1);
			return false;
		},

		filterChange: function() {
			if($('filter').checked) {
				friends_params[opensocial.DataRequest.PeopleRequestFields.FILTER] =	opensocial.DataRequest.FilterType.HAS_APP;
			} else {
				delete friends_params[opensocial.DataRequest.PeopleRequestFields.FILTER];
			}
			loadFriends(0);
		},
		canvas: function() {
			gadgets.views.requestNavigateTo(gadgets.views.getSupportedViews()["canvas"],{},ownerId);
			return false;
		}
	}
}();
gadgets.util.registerOnLoadHandler(sztahanov.init);

