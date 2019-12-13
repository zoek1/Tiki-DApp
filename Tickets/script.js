//jQuery time
var current_fs, next_fs, previous_fs; //fieldsets
var left, opacity, scale; //fieldset properties which we will animate
var animating; //flag to prevent quick multi-click glitches

var geocoder;
var map;
var marker;

/*
 * Google Map with marker
 */
function initialize() {
    var initialLat = $('.search_latitude').val();
    var initialLong = $('.search_longitude').val();
    initialLat = initialLat?initialLat:36.169648;
    initialLong = initialLong?initialLong:-115.141000;

    var latlng = new google.maps.LatLng(initialLat, initialLong);
    var options = {
        zoom: 16,
        center: latlng,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };

    map = new google.maps.Map(document.getElementById("geomap"), options);

    geocoder = new google.maps.Geocoder();

    marker = new google.maps.Marker({
        map: map,
        draggable: true,
        position: latlng
    });

    google.maps.event.addListener(marker, "dragend", function () {
        var point = marker.getPosition();
        map.panTo(point);
        geocoder.geocode({'latLng': marker.getPosition()}, function (results, status) {
            if (status == google.maps.GeocoderStatus.OK) {
                map.setCenter(results[0].geometry.location);
                marker.setPosition(results[0].geometry.location);
                $('.search_addr').val(results[0].formatted_address);
                $('.search_latitude').val(marker.getPosition().lat());
                $('.search_longitude').val(marker.getPosition().lng());
            }
        });
    });

}

function validarExistencia(){
	existencia = document.getElementById('existencia');
	if(existencia.value < 0){
		alert("No se admiten numeros negativos!")
		return false;
    }else
		return true;
}

function Validacion(active){
	title = document.getElementById('title');
	description = document.getElementById('description');
	options1 = document.getElementById('options1');
	idate = document.getElementById('idate');
	ihora = document.getElementById('ihora');
	fdate = document.getElementById('fdate');
	fhora = document.getElementById('fhora');
	nticket = document.getElementById('nticket');
	existencia = document.getElementById('existencia');
	costo = document.getElementById('costo');
	options2 = document.getElementById('options2');

	if (active.id == "basic") {
		if( title.value == null || title.value.length == 0 )
	  		return false;
		
		if( description.value == null || description.value.length == 0 )
	  		return false;
		
		if( options1.value == null || options1.value.length == 0 )
	  		return false;
		
		return true;
	}
        if (active.id == "time") {
		if( idate.value == null || idate.value.length == 0 )
  		return false;

		if( ihora.value == null || ihora.value.length == 0 )
  		return false;

		if( fdate.value == null || fdate.value.length == 0 )
  		return false;

		if( fhora.value == null || fhora.value.length == 0 )
  		return false;

        }
        if (active.id == "ticket") {
		if( nticket.value == null || nticket.value.length == 0 )
  		return false;

		if(validarExistencia() == false )
  		return false;

		if( costo.value == null || costo.value.length == 0 )
  		return false;

		if( options2.value == null || options2.value.length == 0 )
  		return false;

	}

		return true;
}

function getValuesForm() {
  return {
    title: document.getElementById('title').value,
    description:  document.getElementById('description').value,
    categoria: document.getElementById('options1').value,
    inicio_date: document.getElementById('idate').value,
    inicio_hora: document.getElementById('ihora').value,
    fin_date: document.getElementById('fdate').value,
    fin_hora: document.getElementById('fhora').value,
    name_ticket: document.getElementById('nticket').value,
    existencia: document.getElementById('existencia').value,
    costo: document.getElementById('costo').value,
    moneda: document.getElementById('options2').value
  }
}

// console.log(getValuesForm())
$(document).ready(function() {
    $('textarea').summernote({
        height: 100,   //set editable area's height
    });

$(".next").click(function(){

	if(Validacion($(this).parent()[0])==true){

	if(animating) return false;
	animating = true;
	
	current_fs = $(this).parent();
	next_fs = $(this).parent().next();
	
	//activate next step on progressbar using the index of next_fs
	$("#progressbar li").eq($("fieldset").index(next_fs)).addClass("active");
	
	//show the next fieldset
	next_fs.show(); 
	//hide the current fieldset with style
	current_fs.animate({opacity: 0}, {
		step: function(now, mx) {
			//as the opacity of current_fs reduces to 0 - stored in "now"
			//1. scale current_fs down to 80%
			scale = 1 - (1 - now) * 0.2;
			//2. bring next_fs from the right(50%)
			left = (now * 50)+"%";
			//3. increase opacity of next_fs to 1 as it moves in
			opacity = 1 - now;
			current_fs.css({
        'transform': 'scale('+scale+')',
        'position': 'absolute'
      });
			next_fs.css({'left': left, 'opacity': opacity});
		}, 
		duration: 800, 
		complete: function(){
			current_fs.hide();
			animating = false;
		}, 
		//this comes from the custom easing plugin
		easing: 'easeInOutBack'
	});
	}else
		alert("Los campos * son requeridos!");
});

$(".previous").click(function(){
	if(animating) return false;
	animating = true;
	
	current_fs = $(this).parent();
	previous_fs = $(this).parent().prev();
	
	//de-activate current step on progressbar
	$("#progressbar li").eq($("fieldset").index(current_fs)).removeClass("active");
	
	//show the previous fieldset
	previous_fs.show(); 
	//hide the current fieldset with style
	current_fs.animate({opacity: 0}, {
		step: function(now, mx) {
			//as the opacity of current_fs reduces to 0 - stored in "now"
			//1. scale previous_fs from 80% to 100%
			scale = 0.8 + (1 - now) * 0.2;
			//2. take current_fs to the right(50%) - from 0%
			left = ((1-now) * 50)+"%";
			//3. increase opacity of previous_fs to 1 as it moves in
			opacity = 1 - now;
			current_fs.css({'left': left});
			previous_fs.css({'transform': 'scale('+scale+')', 'opacity': opacity});
		}, 
		duration: 800, 
		complete: function(){
			current_fs.hide();
			animating = false;
		}, 
		//this comes from the custom easing plugin
		easing: 'easeInOutBack'
	});
});

$(".submit").click(function(){
	return false;
})



    //load google map
    initialize();
    
    /*
     * autocomplete location search
     */
    var PostCodeid = '#search_location';
    $(function () {
        $(PostCodeid).autocomplete({
            source: function (request, response) {
                geocoder.geocode({
                    'address': request.term
                }, function (results, status) {
                    response($.map(results, function (item) {
                        return {
                            label: item.formatted_address,
                            value: item.formatted_address,
                            lat: item.geometry.location.lat(),
                            lon: item.geometry.location.lng()
                        };
                    }));
                });
            },
            select: function (event, ui) {
                $('.search_addr').val(ui.item.value);
                $('.search_latitude').val(ui.item.lat);
                $('.search_longitude').val(ui.item.lon);
                var latlng = new google.maps.LatLng(ui.item.lat, ui.item.lon);
                marker.setPosition(latlng);
                initialize();
            }
        });
    });
    
    /*
     * Point location on google map
     */
    $('.get_map').click(function (e) {
        var address = $(PostCodeid).val();
        geocoder.geocode({'address': address}, function (results, status) {
            if (status == google.maps.GeocoderStatus.OK) {
                map.setCenter(results[0].geometry.location);
                marker.setPosition(results[0].geometry.location);
                $('.search_addr').val(results[0].formatted_address);
                $('.search_latitude').val(marker.getPosition().lat());
                $('.search_longitude').val(marker.getPosition().lng());
            } else {
                alert("Geocode was not successful for the following reason: " + status);
            }
        });
        e.preventDefault();
    });

    //Add listener to marker for reverse geocoding
    google.maps.event.addListener(marker, 'drag', function () {
        geocoder.geocode({'latLng': marker.getPosition()}, function (results, status) {
            if (status == google.maps.GeocoderStatus.OK) {
                if (results[0]) {
                    $('.search_addr').val(results[0].formatted_address);
                    $('.search_latitude').val(marker.getPosition().lat());
                    $('.search_longitude').val(marker.getPosition().lng());
                }
            }
        });
    });



});










