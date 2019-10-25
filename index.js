var debugging = true;
var metadata = [];
var draggables = [];
var droppables = [];

/** FROM https://www.kevinleary.net/javascript-get-url-parameters/
 * JavaScript Get URL Parameter
 * 
 * @param String prop The specific URL parameter you want to retreive the value for
 * @return String|Object If prop is provided a string value is returned, otherwise an object of all properties is returned
 */
function getUrlParams( prop ) {
    var params = {};
    var search = decodeURIComponent( window.location.href.slice( window.location.href.indexOf( '?' ) + 1 ) );
    var definitions = search.split( '&' );

    definitions.forEach( function( val, key ) {
        var parts = val.split( '=', 2 );
        params[ parts[ 0 ] ] = parts[ 1 ];
    } );

    return ( prop && prop in params ) ? params[ prop ] : params;
}

function get_data_from_server(){
    if (getUrlParams('id')==undefined) {
        if (debugging)
            console.log("TODO - Δεν υπάρχει τεστ με αυτό το id - Να τερματιστεί η εφαρμογή");
    }
    $.ajaxSetup({
        async: false
    });
    var jqxhr = $.getJSON("matching/" + getUrlParams('id') + ".json", function(data) {
        if (debugging)
            console.log("Η φόρτωση του json από τον server ολοκληρώθηκε με επιτυχία");
            parse_quiz(data);
    })
    .fail(function() {
        if (debugging) {
            console.log( "Αδυναμία φόρτωσης του json αρχείου από τον server" );
            console.log(jqxhr);
        }
    });
    
    function parse_quiz(data) {
        var draggables_count = 0;
        var droppables_count = 0;
           
       metadata[0] = data['metadata']['title'];
       $("#alx_title").html(metadata[0]);
       metadata[1] = data['metadata']['class'];
       metadata[2] = data['metadata']['answer'];
        $.each(data['draggables'], function(index, value) {
            draggables[draggables_count] = value;
            draggables_count++;  
        });
        console.log(draggables);
        $.each(data['droppables'], function(index, value) {
            droppables[droppables_count] = value;
            droppables_count++;  
        });
        console.log(droppables);
        console.log(metadata);

        if (draggables_count!=droppables_count) {
            if (debugging) { console.log("Ο αριθμός των draggables δεν είναι ίδιος με τον αριθμό των droppables"); }
            alert("Fatal error #001");
            return -1;
        }
        if (draggables_count>5) {
            if (debugging) { console.log("Δεν μπορείς να έχεις περισσότερα από 5 στοιχεία σε κάθε άσκηση αντιστοίχισης"); }
            alert("Fatal error #002");
            fail;
            return -2;
            
        }
        return 1;
    }   
}

function setup_matching() {
    $("#alx_draggables").html("");
    for (var i=0; i<draggables.length; i++) {
        thediv = '<div value="' + draggables[i]['id'] + '" id="draggable' + draggables[i]['id'] + '" class="alx_draggable ui-widget-content"><img src="' + draggables[i]['img_src'] + '" class="img-thumbnail"/></div>';
        $("#alx_draggables").html($("#alx_draggables").html() + thediv);   
    }
    for (var i=0; i<draggables.length; i++) {
        $('#draggable' + draggables[i]['id']).draggable();
    }
    
    $("#alx_droppables").html("");
    for (var i=0; i<droppables.length; i++) {
        thediv = '<div id="droppable' + droppables[i]['id'] + '" class="alx_droppable ui-widget-header text-center"><span class="alx_droppablespan" id="droppable' + droppables[i]['id'] + 'span"></span>' + droppables[i]['text'] + '</div>';
        $("#alx_droppables").html($("#alx_droppables").html() + thediv);
    }
    for (var i=0; i<droppables.length; i++) {
        $("#droppable" + droppables[i]['id']).droppable({
            drop: function( event, ui ) { $(this).find("span").text(ui.draggable.attr('value')); }
        });
    } 

    $("#alx_button").html('<input type="button" id="alxtest" class="btn btn-primary" value="Έλεγχος">');
}

$( function() {
    if (!('id' in getUrlParams())) {
        if (debugging) { console.log("TODO Δεν ορίστηκε το id του quiz - Πρέπει να τερματιστεί η εφαρμογή"); }
        $.ajax(
            {   url: "matching/all_activities",
                success: function(result) {
                    $('#alx_title').html('Διαθέσιμες δραστηριότητες');
                    $('#alx_contents').html('<ul>');
                    console.log('success');
                    console.log(result);
                    var alldata = result.split('\n');
                    for (var i=0; i<alldata.length; i+=2) {
                        if (alldata[i]!='') {
                            var ttitle = alldata[i+1].substring(1, alldata[i+1].length-1);
                            var newLinePosition = ttitle.search('<br />');
                            if (newLinePosition!=-1)
                                ttitle=ttitle.substring(0, newLinePosition);
                            $('#alx_contents').html($('#alx_contents').html() + "<li><a href='?id=" + alldata[i].substring(0, alldata[i].length-5) + "'>" + ttitle + "</a></li>");
                        }
                    }
                    $('#alx_contents').html($('#alx_contents').html() + '</ul>');
                    $('#alx_draggables').html('');
                },
                error: function(result) {
                    console.log('failure');
                } 
            });
        return; 
    }
    
    if (get_data_from_server()<0) {
        if (debugging) { console.log("Σφάλμα στην ανάγνωση του json");}
        return;
    }
    
    setup_matching();
    /*
    $( "#droppable0" ).droppable({
        drop: function( event, ui ) { $("#droppable0span").text(ui.draggable.attr("value")); }
    });
    $( "#droppable1" ).droppable({
        drop: function( event, ui ) { $("#droppable1span").text(ui.draggable.attr("value")); }
    });
    */
    $("#alxtest").click(function() {
        user_thinks = "";
        for (var i=0; i<droppables.length; i++) { 
            user_thinks = user_thinks + $("#droppable" + droppables[i]['id']+ "span").text();
        }
        console.log('User thinks: ' + user_thinks);
        console.log('Correct answer: ' + metadata[2]);
        if (user_thinks==metadata[2]) 
        {
            $("#alx_draggables").html('<img src="img/happy_winner.gif" />');
            $("#alx_droppables").html("");
            $("#alx_button").html("");
        }
        else
            alert('Δυστυχώς όχι... Δοκίμασε πάλι!');
        
    });
  })