
$(window).on('load', function () {
    if ($('#preloader').length) {
        $('#preloader').delay(100).fadeOut('slow', function () {
            $(this).remove();
        });
    }
});

//When document loads up it shows everyone in the directory
$.ajax({
    url: "libs/php/getAll.php",
    type: 'POST',
    datatype: 'json',
    data: {
    },
    success: function (result) {
        console.log(result);

        if (result.status.name == 'ok') {

            for (var i = 0; i < result['data'].length; i++) {
                $('#resultsTable').append('<tr class="result"><td>' + results['data'][i]['lastName'] + '</td></tr>');
            }
        };

    },
    error: function (jqXHR, textStatus, errorThrown) {
        var errorMessage = jqXHR.status + ': ' + jqXHR.statusText;
        alert('Error - ' + errorMessage);
        
    }

});


//Eventually have one search box where it is possible to search all criteria within
//search name results
/*
$.ajax({
    url: "",
    type: 'POST',
    datatype: 'json',
    data: {
    },
    success: function (result) {
        console.log(result);

        if (result.status.name == 'ok') {

        };

    },
    error: function (jqXHR, textStatus, errorThrown) {
        var errorMessage = jqXHR.status + ': ' + jqXHR.statusText;
        alert('Error - ' + errorMessage);
    }

});
*/