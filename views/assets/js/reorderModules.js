var el = document.getElementById('modules')
var courseId = document.currentScript.getAttribute('courseid')
var sortable = Sortable.create(el, {
	handle: '.handle',
	dataIdAttr: 'data-id',
	onSort: function(evt) {
		var order = ''
		var numItems = document.getElementsByClassName('draggable').length
		for (i = 0; i < numItems; i++) {
			var itemId = document.getElementsByClassName('draggable')[i].id
			if (i === 0) {
				order += 'moduleIds=' + itemId
			} else {
				order += '&moduleIds=' + itemId
			}
		}

		var queryString = '/content-management/courses/' + courseId + '/sortDateRanges-modules?' + order
		var xhttp = new XMLHttpRequest()
		xhttp.open('GET', queryString, true)
		xhttp.send()
	},
})
