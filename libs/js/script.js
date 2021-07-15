
    //When document loads up it shows everyone in the directory
$(window).on('load', function () {

    if ($('#preloader').length) {
        $('#preloader').delay(100).fadeOut('slow', function () {
            $(this).remove();
        });
    }
    
    //Hides conformation section before hitting button
    $('.ddConfirm').hide();
    $('.dpConfirm').hide();
    $('.editPersonnel').hide();
    $('.ddFail').hide();
    $('#csMissingInfoStatement').hide();
});

var locationList = {};
var personnelID;
var departmentID;
getAllStaff();
loadDepartments();
loadLocations();

function staffExpand(id) {
    $.ajax({
        url: "libs/php/getPersonnel.php",
        type: 'POST',
        datatype: 'json',
        data: {
            id: id
        },
        success: function (result) {
            console.log(result);
            if (result.status.name == 'ok') {
                $('.staffInfo').val("");
                $('#ssFirst').val(result['data']['personnel'][0]['firstName']);
                $('#ssLast').val(result['data']['personnel'][0]['lastName']);
                $('#ssEmail').val(result['data']['personnel'][0]['email']);
                $('#ssTitle').val(result['data']['personnel'][0]['jobTitle']);

                departmentID = result['data']['personnel'][0]['departmentID'];
                var departments = result['data']['department'];
                var department = departments.find(x => x.id == departmentID).name;

                var locID = departments.find(x => x.id == departmentID).locationID;
                var locations = result['data']['location'];
                var location = locations.find(x => x.id == locID).name;

                $('#ssDepartment').val(department);
                $('#ssLocation').val(location);

            };
        },
        error: function (jqXHR, textStatus, errorThrown) {
            var errorMessage = jqXHR.status + ': ' + jqXHR.statusText;
            alert('Error - ' + errorMessage);
        }
    });
};

function getAllStaff() {
    $.ajax({
        url: "libs/php/getAll.php",
        type: 'POST',
        datatype: 'json',
        data: {
        },
        success: function (result) {
            console.log(result);

            if (result.status.name == 'ok') {
                $('.letterGroup').remove();
                $('.result').remove();
                /*
                for (var i = 0; i < result['data'].length; i++) {
                    $('#resultsTable').append('<tr class="result" id="id' + result['data'][i]['id'] + '"><td>' + result['data'][i]['firstName'] + '</td><td>' + result['data'][i]['lastName'] + '</td></tr>');
                }
                */

                var first_letter = "";
                for (var i = 0; i < result['data'].length; i++) {
                    var this_first_letter = result['data'][i]['lastName'].substr(0, 1).toUpperCase();

                    if (this_first_letter != first_letter) {
                        first_letter = this_first_letter;
                        
                        $('#contactList').append('<tr class="letterGroup" id = "group' + first_letter + '" ><td colspan="3" >' + first_letter + ' </td></tr>');
                    }
                  
                    $('#contactList').append('<tr class="result" data-bs-toggle="modal" data-bs-target="#personnelModal"  id="id' + result['data'][i]['id'] + '"><td>' + result['data'][i]['firstName'] + ' ' + result['data'][i]['lastName'] + '</td><td>' + result['data'][i]['department'] + ' </td><td>' + result['data'][i]['location'] + ' </td></tr>');
                }


                $(".result").click(function () {
                    $('.staffInfo').show();
                    $('.staffInitialButton').show();
                    $('.editPersonnel').hide();
                    $('.dpConfirm').hide();

                    var idNum = $(this).attr('id'); // $(this) refers to button that was clicked
                    var id = idNum.slice(2);
                    staffExpand(id);
                    personnelID = id;
                });
            };

        },
        error: function (jqXHR, textStatus, errorThrown) {
            var errorMessage = jqXHR.status + ': ' + jqXHR.statusText;
            alert('Error - ' + errorMessage);
        }

    });
};


//When document loads it populates the dropdown for the department search
function loadDepartments() {
    $.ajax({
        url: "libs/php/getAllDepartments.php",
        type: 'POST',
        datatype: 'json',
        data: {
        },
        success: function (result) {
            console.log(result);
            if (result.status.name == 'ok') {
                deptLoc = {};
                for (var i = 0; i < result['data'].length; i++) {
                    $('.departments').append('<option class="department" value="' + result['data'][i]['id'] + '">' + result['data'][i]['name'] + ' </option>');
                    //deptLoc key=departmentID, value=locationID
                    deptLoc[result['data'][i]['id']] = result['data'][i]['locationID'];
                }
                
            };
        },
        error: function (jqXHR, textStatus, errorThrown) {
            var errorMessage = jqXHR.status + ': ' + jqXHR.statusText;
            alert('Error - ' + errorMessage);
        }
    });
};


//When document loads it populates the dropdown for location search
function loadLocations() {
    $.ajax({
        url: "libs/php/getAllLocations.php",
        type: 'POST',
        datatype: 'json',
        data: {
        },
        success: function (result) {
            console.log(result);
            if (result.status.name == 'ok') {
                for (var i = 0; i < result['data'].length; i++) {
                    $('.locations').append('<option class = "location" value="' + result['data'][i]['id'] + '">' + result['data'][i]['name'] + '</option>');
                    locationList[result['data'][i]['id']] = result['data'][i]['name'];
                }
            };
        },
        error: function (jqXHR, textStatus, errorThrown) {
            var errorMessage = jqXHR.status + ': ' + jqXHR.statusText;
            alert('Error - ' + errorMessage);
        }
    });
};

//Resets the search boxes
$('#clear').click(function () {
    $('#name').val("");

    $('#location').val("all").trigger('change');
    $('#department').val("all").trigger('change');

    $('.result').remove();
    $('.noResults').remove();
    getAllStaff();
});


function idConversion(id) {
    if (parseInt(id, 10)) {
        return parseInt(id, 10);
    }
};

/* When name is typed, or dropdown selected, it performs a search */

$('#name').on('input', function () {
    search();
});

$('#location').on('change', function () {
    search();
});

$('#department').on('change', function () {
    search();
});

//performs search on submitted on keystroke or dropdown selection
function search() {
    var searchName = ($('#name').val()).replace(/\s+/g, ' ').trim();
    var searchDepartment = idConversion($('#department option:selected').val());
    var searchLocation = idConversion($('#location option:selected').val());
 
    var space = searchName.indexOf(' ');
    var name2 = searchName.substring(0, space);
    var name1 = searchName.substring(space + 1);

    var data = {};

    if (name1) {
        data.name1 = name1;
    }

    if (name2) {
        data.name2 = name2;
    }

    if (searchLocation) {
        data.locID = searchLocation;
    }

    if (searchDepartment) {
        data.deptID = searchDepartment;
    }
    
    if (!jQuery.isEmptyObject(data)) {
        $('.result').remove();
        $('.noResults').remove();
        $.ajax({
            url: "libs/php/personnelSearch.php",
            type: 'POST',
            datatype: 'json',
            data: data,
            success: function (result) {
                console.log(result);
                if (result.status.name == 'ok') {
                    if (result['data'].length > 0) {
                        $('.letterGroup').remove();
                        var first_letter = "";
                        for (var i = 0; i < result['data'].length; i++) {
                            var this_first_letter = result['data'][i]['lastName'].substr(0, 1).toUpperCase();

                            if (this_first_letter != first_letter) {
                                first_letter = this_first_letter;

                                $('#contactList').append('<tr class="letterGroup" id = "group' + first_letter + '" ><td colspan="3" >' + first_letter + '</td></tr>');
                            }

                            $('#contactList').append('<tr class="result" data-bs-toggle="modal" data-bs-target="#personnelModal" id="id' + result['data'][i]['id'] + '"><td>' + result['data'][i]['firstName'] + ' ' + result['data'][i]['lastName'] + '</td><td>' + result['data'][i]['department'] + ' </td><td>' + result['data'][i]['location'] + ' </td></tr>');
                        }
                    } else {
                        $('#contactList').append('<tr class="noResults"><td>No results!</td></td>');
                        $('.letterGroup').remove();
                    }

                    $(".result").click(function () {
                        $('.staffInfo').show();
                        $('.staffInitialButton').show();
                        $('.editPersonnel').hide();
                        $('.dpConfirm').hide();

                        var idNum = $(this).attr('id'); // $(this) refers to button that was clicked
                        var id = idNum.slice(2);
                        staffExpand(id);
                        personnelID = id;
                    });
                };
            },
            error: function (jqXHR, textStatus, errorThrown) {
                var errorMessage = jqXHR.status + ': ' + jqXHR.statusText;
                alert('Error - ' + errorMessage);
            }
        });

    } else {
        getAllStaff();
    }
        
};

/* Create Department - Start*/
$('#createDeptButton').click(function () {
    $('#cdDeptName').val("");
    $('#cdDeptLocation').val("").trigger('change');
    $('#cdMissingInfoStatement').hide();
    $('#cdDeptName').css("border-color", "");
    $('#cdDeptLocation').css("border-color", "");
    $('#cdDuplicate').hide();
});

$('#createDepartment').click(function () {
    $('#cdMissingInfoStatement').hide();
    $('#cdDuplicate').hide();
    $('#cdDeptName').css("border-color", "");
    $('#cdDeptLocation').css("border-color", "");

    var cdLocation = idConversion($('#cdDeptLocation option:selected').val());
    var cdDeptName = $('#cdDeptName').val().replace(/\s+/g, ' ').trim().toLowerCase();

    /*
     * Performs search of DB to see if dept with same name exists in the same location.
     * If there is not, then the department will be added to the DB
     */
    if (cdLocation && cdDeptName) {
        var words = cdDeptName.split(" ");
        for (var i = 0; i < words.length; i++) {
            if (words[i] === "and" || words[i] === "of") {
                words[i] = words[i];
            } else {
                words[i] = words[i][0].toUpperCase() + words[i].substr(1);
            }         
        }

        var cdTrimDept = words.join(" ");

        $.ajax({
            url: "libs/php/departmentSearch.php",
            type: 'POST',
            datatype: 'json',
            data: {
                name: cdTrimDept,
                locationID: cdLocation
            },
            success: function (result) {
                console.log(result);
                if (result.status.name == 'ok') {
                    if (result['data'].length < 1) {
                        
                        $.ajax({
                            url: "libs/php/insertDepartment.php",
                            type: 'POST',
                            datatype: 'json',
                            data: {
                                name: cdTrimDept,
                                locationID: cdLocation
                            },
                            success: function (result) {
                                console.log(result);
                                if (result.status.name == 'ok') {
                                    $('#createDeptModal').modal('hide');

                                    $('#cdDeptName').val("");
                                    $('#cdDeptLocation').val("").trigger('change');

                                    $('#cdMissingInfoStatement').hide();
                                    $('#cdDeptName').css("border-color", "");
                                    $('#cdDeptLocation').css("border-color", "");

                                    $('.department').remove();
                                    loadDepartments();
                                };
                            },
                            error: function (jqXHR, textStatus, errorThrown) {
                                var errorMessage = jqXHR.status + ': ' + jqXHR.statusText;
                                alert('Error - ' + errorMessage);
                            }
                        });

                    } else {
                        $('#cdDuplicate').show();
                    }
                };
            },
            error: function (jqXHR, textStatus, errorThrown) {
                var errorMessage = jqXHR.status + ': ' + jqXHR.statusText;
                alert('Error - ' + errorMessage);
            }
        });
        

    } else {
        $('#cdMissingInfoStatement').show();

        if (!cdLocation) {
            $('#cdDeptLocation').css("border-color", "red");
        }

        if (!cdDeptName) {
            $('#cdDeptName').css("border-color", "red");
        }
    }

});

$('#cdCancel').click(function () {
    $('#cdDeptName').val("");
    $('#cdDeptLocation').val("").trigger('change');
    $('#cdMissingInfoStatement').hide();
    $('#cdDeptName').css("border-color", "");
    $('#cdDeptLocation').css("border-color", "");
});


/* Create Department - end*/

/*
    deleting department- start

    performs a personnel search with the location id of the department
    -if it is returned with data.length > 0 it will not allow the department to be deleted
    --as people are assigned to that department.

    if data.length = 0 it means no one is assigned to that department so will allow to be deleted
*/
$('#delDept').click(function () {
    $('#ddDepartment').val('').trigger('change');
});



$('#deleteDepartment').click(function () {
    var ddID = idConversion($('#ddDepartment option:selected').val());
    $('.deptToDelete').html($('#ddDepartment option:selected').text());
    if (ddID) {

        $.ajax({
            url: "libs/php/personnelSearch.php",
            type: 'POST',
            datatype: 'json',
            data: {
                deptID: ddID
            },
            success: function (result) {
                console.log(result);
                if (result.status.name == 'ok') {
                    if (result['data'].length == 0) {
                        $('.ddInitialButtons').hide();
                        $('.ddConfirm').show();

                    } else {
                        $('.ddFail').show();
                    }
                };
            },
            error: function (jqXHR, textStatus, errorThrown) {
                var errorMessage = jqXHR.status + ': ' + jqXHR.statusText;
                alert('Error - ' + errorMessage);
            }
        });
    } 
});

$('#ddClose').click(function () {
    $('.ddConfirm').hide();
    $('.ddFail').hide();

});


$('#ddConfirm').click(function () {
    var ddID = idConversion($('#ddDepartment option:selected').val());
    $.ajax({
        url: "libs/php/deleteDepartmentByID.php",
        type: 'POST',
        datatype: 'json',
        data: {
            id: ddID
        },
        success: function (result) {
            console.log(result);
            if (result.status.name == 'ok') {
                $('.department').remove();
                loadDepartments();
                $('#deleteDepartmentModal').modal('hide');
                $('.ddInitialButtons').show();

                $('.ddConfirm').hide();
                $('.ddFail').hide();

            };
        },
        error: function (jqXHR, textStatus, errorThrown) {
            var errorMessage = jqXHR.status + ': ' + jqXHR.statusText;
            alert('Error - ' + errorMessage);
        }
    });
});

$('#ddDecline').click(function () {
    $('.ddConfirm').hide();
    $('.ddInitialButtons').show();
});



/* deleting department - end */

/* Edit Department - start */
$('#editDept').click(function () {
    $('#edDepartment').val('');
    $('.edDeptSubmit').hide();
    $('.edInitial').show();
    $('#edDepartment').css("border-color", "");
    $('#edMissingInfoStatement').hide();
    $('#edDuplicate').hide();
});

$('#edClose').click(function () {

    $('.edDeptSubmit').hide();
    $('.edInitial').show();

    $('#edMissingInfoStatement').hide();
    $('#edDepartment').css("border-color", "");
    $('#edDuplicate').hide();
});

$('#edEdit').click(function () {

    $('#edDepartment').css("border-color", "");
    $('#edMissingInfoStatement').hide();

    if ($('#edDepartment option:selected').text()) {

        $('#edDepartmentName').val($('#edDepartment option:selected').text());

        var edDeptID = $('#edDepartment option:selected').val();
        var edLocID = deptLoc[edDeptID];
        $('#edDeptLocation').val(edLocID);
        edLocationID = edLocID;
        /*The above holds the initial location ID - used later when editing location*/
        $('.edDeptSubmit').show();
        $('.edInitial').hide();

    } else {
        $('#edMissingInfoStatement').show();
        $('#edDepartment').css("border-color", "red");
    }

});

$('#edCancel').click(function () {

    $('.edDeptSubmit').hide();
    $('.edInitial').show();

    $('#edDeptLocation').val('');
    $('#edDepartmentName').val('');
    $('#edDuplicate').hide();
});

$('#edConfirm').click(function () {
    $('#edDuplicate').hide();

    if ($('#edDepartmentName').val() != $('#edDepartment option:selected').text() || edLocationID != $('#edDeptLocation').val()) {

        $.ajax({
            url: "libs/php/departmentSearch.php",
            type: 'POST',
            datatype: 'json',
            data: {
                locationID : $('#edDeptLocation').val(),
                name: $('#edDepartmentName').val()
            },
            success: function (result) {
                console.log(result);
                if (result.status.name == 'ok') {
                    if (result['data'].length < 1) {
                        $.ajax({
                            url: "libs/php/editDepartment.php",
                            type: 'POST',
                            datatype: 'json',
                            data: {
                                id: $('#edDepartment option:selected').val(),
                                depLocID: $('#edDeptLocation').val(),
                                name: $('#edDepartmentName').val()
                            },
                            success: function (result) {
                                console.log(result);
                                if (result.status.name == 'ok') {
                                    $('.department').remove();
                                    loadDepartments();
                                    $('#editDepartmentModal').modal('hide');
                                };
                            },
                            error: function (jqXHR, textStatus, errorThrown) {
                                var errorMessage = jqXHR.status + ': ' + jqXHR.statusText;
                                alert('Error - ' + errorMessage);
                            }
                        });
                    } else {
                        $('#edDuplicate').show();
                    }
                };
            },
            error: function (jqXHR, textStatus, errorThrown) {
                var errorMessage = jqXHR.status + ': ' + jqXHR.statusText;
                alert('Error - ' + errorMessage);
            }
        });

        


    } else {
        $('.edDeptSubmit').hide();
        $('.edInitial').show();

        $('#edDeptLocation').val('');
        $('#edDepartmentName').val('');
    }

});


/* Edit Department - end */


/* Create Personnel - Start */

$('#crPersonnel').click(function () {
    $('.cs').val('');
    $('#csMissingInfoStatement').hide();
    $('.cs').css("border-color", "");
    $('#csDepartment').css("border-color", "");
    $('#csDepartment').val('').trigger('change');
});

//When department is selcted it automatically selects location
$('#csDepartment').on('change', function () {
    var csDeptID = $(this).val();
    var csLocID = deptLoc[csDeptID];
    $('#csLocation').val(csLocID);
});
//chnage to #createPersonnel - if data is missing place  redbox around input
$('#createPersonnel').click(function () {
    $('#csMissingInfoStatement').hide();
    $('.cs').css("border-color", "");
    $('#csDepartment').css("border-color", "");

    var data = {};

    var firstName = $('#csFirstName').val().replace(/\s+/g, ' ').trim();
    data.firstName = firstName;

    var lastName = $('#csLastName').val().replace(/\s+/g, ' ').trim();
    data.lastName = lastName;

    var deptID = idConversion($('#csDepartment option:selected').val());
    data.deptID = deptID;

    var email = $('#csEmail').val().trim();
    data.email = email;
    

    if ($('#csJobTitle').val()) {
        data.jobTitle = $('#csJobTitle').val().replace(/\s+/g, ' ').trim();
    }
    
    if (firstName && lastName && deptID && email) {
        $.ajax({
            url: "libs/php/insertPersonnel.php",
            type: 'POST',
            datatype: 'json',
            data: data,
            success: function (result) {
                console.log(result);
                if (result.status.name == 'ok') {
                    $('#createPersonnelModal').modal('hide');
                    $('#csDepartment').val("").trigger('change');
                    $('.cs').val('');
                    $('.result').remove();
                    $('.noResults').remove();
                    getAllStaff();
                };
            },
            error: function (jqXHR, textStatus, errorThrown) {
                var errorMessage = jqXHR.status + ': ' + jqXHR.statusText;
                alert('Error - ' + errorMessage);
            }
        });
    } else {
        $('#csMissingInfoStatement').show();

        if (!firstName) {
            $('#csFirstName').css("border-color", "red");
        }

        if (!lastName) {
            $('#csLastName').css("border-color", "red");
        }

        if (!email) {
            $('#csEmail').css("border-color", "red");
        }

        if (!deptID) {
            $('#csDepartment').css("border-color", "red");
        }
    }
});

$('#cancelCreatingPersonnel').click(function () {
    $('.cs').val('');
    $('#csMissingInfoStatement').hide();
    $('#csDepartment').val("").trigger('change');
    $('.cs').css("border-color", "");
    $('#csDepartment').css("border-color", "");
});

/* Create Personnel - end */



/* Delete Personnel - start */ 

$('#deletePersonnel').click(function () {

    $('.dpConfirm').show();
    $('.staffInitialButton').hide();

});

$('#dpDecline').click(function () {
    $('.dpConfirm').hide();
    $('.staffInitalButton').show();
});

$('#dpConfirm').click(function () {

    $.ajax({
        url: "libs/php/deletePersonnel.php",
        type: 'POST',
        datatype: 'json',
        data: {
            id: personnelID
        },
        success: function (result) {
            console.log(result);
            if (result.status.name == 'ok') {
                //Maybe have modal popup to say been deleted
                $('#personnelModal').modal('hide');

                $('.staffInfo').val("");
                $('.dpConfirm').hide();

                $('.doConfirm').hide();
                $('.staffInitialButton').show();

                $('#clear').trigger('click');
            };
        },
        error: function (jqXHR, textStatus, errorThrown) {
            var errorMessage = jqXHR.status + ': ' + jqXHR.statusText;
            alert('Error - ' + errorMessage);
        }
    });
});

/* Delete Personnel - end*/

/* Edit Personnel - start */

//When edit button clicked - can edit the information
$('#editPersonnel').click(function () {
    //personnelID holds the selected persons ID
    //departmentID holds the dept ID
    $('.editPersonnel').show();
    $('.staffInitialButton').hide();
    $('.staffInfo').hide();

    $('#epFirst').val($('#ssFirst').val());
    $('#epLast').val($('#ssLast').val());
    $('#epEmail').val($('#ssEmail').val());
    $('#epJob').val($('#ssTitle').val());
    $('#epDepartment').val(departmentID).trigger('change');

});

$('#epCancel').click(function () {

    $('.editPersonnel').hide();
    $('.staffInfo').show();
    $('.staffInitialButton').show();

});

$('#epDepartment').on('change', function () {
    var epDeptID = $(this).val();
    var epLocID = deptLoc[epDeptID];
    $('#epLocation').val(epLocID);
});

$('#epConfirm').click(function () {
    var data = {};
    var epFirst = $('#epFirst').val().replace(/\s+/g, ' ').trim();
    var epLast = $('#epLast').val().replace(/\s+/g, ' ').trim();
    var epEmail = $('#epEmail').val().replace(/\s+/g, ' ').trim();
    var epJob = $('#epJob').val().replace(/\s+/g, ' ').trim();
    var epDeptID = idConversion($('#epDepartment').val());

    if ((epFirst != $('#ssFirst').val()) || (epLast != $('#ssLast').val()) || (epEmail != $('#ssEmail').val()) || (epJob != $('#ssTitle').val()) || (epDeptID != departmentID)) {

        data.firstName = epFirst;
        data.lastName = epLast;
        data.email = epEmail;
        data.job = epJob;
        data.deptID = epDeptID;
    }
    
    if (!jQuery.isEmptyObject(data)) {

        data.personnelID = personnelID;

        $.ajax({
            url: "libs/php/editPersonnel.php",
            type: 'POST',
            datatype: 'json',
            data: data,
            success: function (result) {
                console.log(result);
                if (result.status.name == 'ok') {
                    /*
                    $('#personnelModal').modal('hide');
                    $('.staffInfo').val('');
                    */
                    $('.editPersonnel').hide();

                    $('#ssFirst').val(epFirst);
                    $('#ssLast').val(epLast);
                    $('#ssEmail').val(epEmail);
                    $('#ssTitle').val(epJob);
                    $('#ssDepartment').val($('#epDepartment option:selected').text());
                    $('#ssLocation').val($('#epLocation option:selected').text());

                    $('.staffInfo').show();
                    $('.staffInitialButton').show();

                    if (($('#name').val()).replace(/\s+/g, ' ').trim() || idConversion($('#department option:selected').val()) || idConversion($('#location option:selected').val())) {
                        search();
                    } else {
                        getAllStaff();
                    }

                    /*
                    $('.result').remove();
                    getAllStaff();
                    */
                };
            },
            error: function (jqXHR, textStatus, errorThrown) {
                var errorMessage = jqXHR.status + ': ' + jqXHR.statusText;
                alert('Error - ' + errorMessage);
            }
        });


    } else {
        $('.editPersonnel').hide();
        $('.staffInfo').show();
        $('.staffInitialButton').show();
    }
});

/* Edit Personnel - end */

/* Create Location - start */
$('#createLoc').click(function () {
    $('#clMissingInfoStatement').hide();
    $('#clLocName').css("border-color", "");
    $('#clDuplicate').hide();
    $('#clLocName').val('');
});

$('#clCancel').click(function () {
    $('#clMissingInfoStatement').hide();
    $('#clLocName').css("border-color", "");
    $('#clDuplicate').hide();
    $('#clLocName').val('');
});

$('#createLocation').click(function () {
    $('#clMissingInfoStatement').hide();
    $('#clLocName').css("border-color", "");
    $('#clDuplicate').hide();

    var locName = ($('#clLocName').val()).replace(/\s+/g, ' ').trim();

    if (locName) {
        $.ajax({
            url: "libs/php/locationSearch.php",
            type: 'POST',
            datatype: 'json',
            data: {
                name: locName
            },
            success: function (result) {
                console.log(result);
                if (result.status.name == 'ok') {
                    if (result['data'].length < 1) {

                        $.ajax({
                            url: "libs/php/insertLocation.php",
                            type: 'POST',
                            datatype: 'json',
                            data: {
                                name: locName
                            },
                            success: function (result) {
                                console.log(result);
                                if (result.status.name == 'ok') {
                                    $('#createLocModal').modal('hide');

                                    $('#clLocName').val("");

                                    $('#clMissingInfoStatement').hide();
                                    $('#clLocName').css("border-color", "");

                                    $('.location').remove();
                                    loadLocations();
                                };
                            },
                            error: function (jqXHR, textStatus, errorThrown) {
                                var errorMessage = jqXHR.status + ': ' + jqXHR.statusText;
                                alert('Error - ' + errorMessage);
                            }
                        });

                    } else {
                        $('#clDuplicate').show();
                    }
                };
            },
            error: function (jqXHR, textStatus, errorThrown) {
                var errorMessage = jqXHR.status + ': ' + jqXHR.statusText;
                alert('Error - ' + errorMessage);
            }
        });



    } else {
        $('#clMissingInfoStatement').show();
        $('#clLocName').css("border-color", "red");
    }
});

/* Create Location - end */


/* Delete Location - start */
$('#delLoc').click(function () {
    $('#dlMissingInfoStatement').hide();
    $('.dlConfirm').hide();
    $('.dlFail').hide();
    $('.dlInitialButtons').show();
    $('#delLocation').css("border-color", "");
    $('#delLocation').val('').trigger('change');
});

$('#dlClose').click(function () {
    $('.dlConfirm').hide();
    $('.dlFail').hide();
    $('.dlInitialButtons').show();
    $('#delLocation').css("border-color", "");
    $('#delLocation').val('').trigger('change');
});
/*
 Perfomrs a personnel search with only the locationID
 If nothing is returned then it can be deleted.
 If something is returned then someone is assigned to it and thus cannot be deleted
 */
$('#deleteLocation').click(function () {

    var dlID = idConversion($('#delLocation option:selected').val());
    $('#dlMissingInfoStatement').hide();
    $('#delLocation').css("border-color", "");


    if (dlID) {
        $('.locToDelete').html($('#delLocation option:selected').text());
        $.ajax({
            url: "libs/php/personnelSearch.php",
            type: 'POST',
            datatype: 'json',
            data: {
                locID: dlID
            },
            success: function (result) {
                console.log(result);
                if (result.status.name == 'ok') {
                    if (result['data'].length == 0) {
                        $('.dlInitialButtons').hide();
                        $('.dlConfirm').show();

                    } else {
                        $('.dlFail').show();
                    }
                };
            },
            error: function (jqXHR, textStatus, errorThrown) {
                var errorMessage = jqXHR.status + ': ' + jqXHR.statusText;
                alert('Error - ' + errorMessage);
            }
        });
    } else {
        $('#dlMissingInfoStatement').show();
        $('#delLocation').css("border-color", "red");

    }
});

$('#dlDecline').click(function () {
    $('.dlConfirm').hide();
    $('.dlInitialButtons').show();
});

$('#dlConfirm').click(function () {
    var dlID = idConversion($('#delLocation option:selected').val());
    $.ajax({
        url: "libs/php/deleteLocationByID.php",
        type: 'POST',
        datatype: 'json',
        data: {
            id: dlID
        },
        success: function (result) {
            console.log(result);
            if (result.status.name == 'ok') {
                $('.location').remove();
                loadLocations();
                $('#deleteLocModal').modal('hide');
                $('.dlInitialButtons').show();

                $('.dlConfirm').hide();
                $('.dlFail').hide();

            };
        },
        error: function (jqXHR, textStatus, errorThrown) {
            var errorMessage = jqXHR.status + ': ' + jqXHR.statusText;
            alert('Error - ' + errorMessage);
        }
    });
});

/* Delete Location - end */


/* Edit Location - start */
$('#editLoc').click(function () {
    $('#elMissingInfoStatement').hide();
    $('.elInitialButtons').show();
    $('#editLocation').css("border-color", "");
    $('#editLocation').val('').trigger('change');
    $('#elLocName').val('');
    $('.elConfirm').hide();
    $('#elLocName').hide();
});

$('#elEdit').click(function () {

    $('#editLocation').css("border-color", "");
    $('#elMissingInfoStatement').hide();

    if ($('#editLocation option:selected').text()) {

        $('#editLocation').hide();
        $('#elLocName').show();

        $('.elInitialButtons').hide();
        $('.elConfirm').show();

        $('#elLocName').val($('#editLocation option:selected').text());
    } else {
        $('#editLocation').css("border-color", "red");
        $('#elMissingInfoStatement').show();
    }
});

$('#elCancel').click(function () {

    $('.elInitialButtons').show();
    $('#elLocName').val('');
    $('.elConfirm').hide();
    $('#elLocName').hide();

});

$('#elConfirm').click(function () {

    if ($('#editLocation option:selected').text() != $('#elLocName').val()) {

        $.ajax({
            url: "libs/php/editLocation.php",
            type: 'POST',
            datatype: 'json',
            data: {
                locID: idConversion($('#editLocation option:selected').val()),
                name: $('#elLocName').val().replace(/\s+/g, ' ').trim()
            },
            success: function (result) {
                console.log(result);
                if (result.status.name == 'ok') {

                    $('.location').remove();
                    loadLocations();

                    $('#editLocationModal').modal('hide');
                    $('.elInitialButtons').show();

                    $('.elConfirm').hide();

                };
            },
            error: function (jqXHR, textStatus, errorThrown) {
                var errorMessage = jqXHR.status + ': ' + jqXHR.statusText;
                alert('Error - ' + errorMessage);
            }
        });

    } else {

        $('.elInitialButtons').show();
        $('.elConfirm').hide();
        $('#elLocName').hide();
        $('#elLocName').val('');
    }
    

});


/* Edit Location - end */