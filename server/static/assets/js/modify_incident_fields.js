$(document).ready(function() {
  var noneVal = "__None"
  // When a school is selected, pre-fill or disable the district and union fields
  function handleDistrictChange(onLoad) {
    var district_id = $('#district').val();
    // If district is changing this means school options are changing
    // so let's reset school to nothing
    var school_id = onLoad ? $('#school').val() :  noneVal;
    if (district_id != noneVal) {
      $.ajax({
        url: "get_schools_unions_by_district/" + district_id,
        method: 'GET',
        success: function(data) {
          // Reset and populate school dropdown
          $('#school').empty().append(`<option value=${noneVal}></option>`);
          data.schools.forEach(function(school) {
              $('#school').append(new Option(school.name, school.id));
          });
          $('#school').val(school_id).trigger('change');
        }
      });
    }
  }

  function handleSchoolChange() {
    // If we are selecting a school after district was selected
    // do nothing.
    if ($('#district').val() != noneVal) {
      return;
    }
    
    var school_id = $('#school').val();
    if (school_id != noneVal) {
        // Enable and pre-fill district and union based on selected school
        $.ajax({
            url: "get_school_details/" + school_id,
            method: 'GET',
            success: function(data) {
                $('#district').val(data.district_id).trigger("change").prop("disabled", true);
                $('#union').prop('disabled', true);
            }
        });
    } else {
        // If no school selected, enable both fields
        $('#district').off('change').val(noneVal).trigger('change').prop('disabled', false);
        $('#union').off('change').val(noneVal).trigger('change').prop('disabled', false);
    }
  }
  $('#school').on('change', handleSchoolChange);
  $('#district').on('change', () => handleDistrictChange(false));

  setTimeout(function() {
    if ($('#district').val() != noneVal) {
      handleDistrictChange(true);
    } else if ($('#school').val() != noneVal) {
      handleSchoolChange();
    }
  }, 100);

});
