<? print("<?xml version=\"1.0\" encoding=\"UTF-8\"?>"); ?>
<Module>
	<ModulePrefs title="activity test <?echo $_GET['title']?>" 
		author="Gipsz Jakab"
		author_email="noreply@iwiw.hu">
		<Require feature="opensocial-0.8" />
		<Require feature="dynamic-height"/>
		<Locale messages="http://gadget.virgosystems.hu/~mrc/activity/messages.xml"/>
  </ModulePrefs>
  <Content type="html">
	 <![CDATA[
		<!--  -->
		<style type="text/css">
			.mediaItems label {display: block}
		</style>
		<script type="text/javascript" src="http://ajax.googleapis.com/ajax/libs/prototype/1.6.0.2/prototype.js"></script>
		<script type="text/javascript">
			var activity = function() {
				function submit(event) {
					Event.stop(event);
					var d = $('f').serialize(true);

					var options = {};

					['body','title', 'titleId', 'bodyId'].each(function(field){
						if(d[field] != 'undefined') {
							options[field] = d[field];
						}
					});

					if($F('templateParams')){ 
						try{
							var value = gadgets.json.parse($F('templateParams'));
								
							if(value !== false){
								options[opensocial.Activity.Field.TEMPLATE_PARAMS] = value;
							} else {
								console.log('error parsing json');
							}
						}catch(e){
							console.log('error parsing json: '+e.message);
						}
					}

					var mediaItems = [];
					if($F('mediaItem_url') != 'undefined' || $F('mediaItem_thumnbnailUrl') != 'undefined') {
						//TODO: handle more than one mediaItem
						var mediaItem = opensocial.newMediaItem(null, d['mediaItem.url'] != 'undefined' ? d['mediaItem.url'] : null);
						['title', 'description', 'thumbnailUrl','type'].each(function(field){
							if(d['mediaItem.'+field] != 'undefined'){
								mediaItem.setField(field,d['mediaItem.'+field]);
							}
						});
						mediaItems.push(mediaItem);
					}

					for(var i=1; i<= parseInt(d.num); i++) {
						var o = Object.clone(options);
						//o.title = o.title + ' ('+i+'.)';
						var a = opensocial.newActivity(o);
						if(mediaItems.length) {
							a.setField(opensocial.Activity.Field.MEDIA_ITEMS, mediaItems);
						}
						opensocial.requestCreateActivity(a, d.priority != 'undefined' ? d.priority : null, response);
					}
				}

		
				function response(response) {
					$('response').innerHTML += (response.hadError() ? response.getErrorMessage() : 'OK') + "\n";
					gadgets.window.adjustHeight();
				}

				function cls() {
					$('response').update('');
					gadgets.window.adjustHeight();
				}

				return {
					init: function() {
						$('f').observe('submit', submit);
						$('cls').observe('click',cls);
					}
				}
			}();
			gadgets.util.registerOnLoadHandler(activity.init);
		</script>
		<form id="f">
			<fieldset>
				<p>
					<label>Activitk száma:</label><input type="text" name="num" value="1"/>
				</p>
				<p>
					<label>Priority</label>
					<select name="priority">
						<option value="undefined"></option>
						<option value="HIGH">HIGH</option>
						<option value="LOW">LOW</option>
					</select>
				</p>
				<p>
					<label>Title</label>
					<textarea name="title">hello world</textarea>
				</p>
				<p>
					<label>Body:</label><br/>
					<textarea name="body">undefined</textarea>
				</p>
				<p>
					<label>titleId</label>
					<select name="titleId">
						<option value="undefined">undefined</value>
						<option value="hello_world">hello_world</value>
						<option value="activity1">activity1</value>
						<option value="activity2">activity2</value>
						<option value="html_test">html_test</value>
					</select>
				</p>
				<p>
					<label>bodyId</label>
					<select name="bodyId">
						<option value="undefined">undefined</value>
						<option value="hello_world">hello_world</value>
						<option value="activity1">activity1</value>
						<option value="activity2">activity2</value>
						<option value="html_test">html_test</value>
					</select>
				</p>
				<p>
					<label>Template params:</label><br/>
					<textarea id="templateParams" name="templateParams" cols="30">{"foo":"bar","baz":"1"}</textarea>
				</p>
				<fieldset class="mediaItems">
					<legend>Mediaitem(s):</legend>
					<label>url<input type="text" name="mediaItem.url" id="mediaItem_url" value="undefined"/></label>
					<label>thumbnailUrl<input type="text" name="mediaItem.thumbnailUrl" id="mediaItem_thumnbnailUrl" value="undefined"/></label>
					<label>title<input type="text" name="mediaItem.title" value="undefined"/></label>
					<label>description<textarea name="mediaItem.description">undefined</textarea></label>
					<label>
						type
						<select name="mediaItem.type">
							<option value="undefined">undefined</value>
							<option value="image" selected="selected">image</value>
							<option value="video">video</value>
							<option value="audio">audio</value>
						</select>
					</label>
				</fieldset>	
				<p>
					<input type="submit"/>
				</p>
			</fieldset>
			<fieldset>
				<legend>Válasz:</legend>
				<pre id="response"></pre>
				<button type="button" id="cls">töröl</button>
			</fieldset>
		</form>		
    ]]>
  </Content>
</Module>

