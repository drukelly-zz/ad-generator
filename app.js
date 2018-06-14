// disable form on submit
$('form').submit(false);

// disable callToAction click
$('#callToAction').click(false);

// populate design options onload
const request = new XMLHttpRequest();
request.open('GET', 'creatives.json', true);
request.onload = function() {
  if (request.status >= 200 && request.status < 400) {
    // success!
    let data = JSON.parse(request.responseText);
    $('input[name="headlineText"]').val(data.headlineText);
    $('input[name="bannerText"]').val(data.bannerText);
    $('#headlineText').text(data.headlineText);
    $('#bannerText').text(data.bannerText);
    $('input[name="callToActionText"]').val(data.callToActionText);
    $('#callToAction span').text(data.callToActionText);
    data.creatives.forEach(function(item, option) {
      $('#designOptions').append(`<li class="tc dib mr2"><img alt="" data-option="${item.label}" src="images/btn-${item.label}.png" class="ba bw2 b--black-10 br2 h3 w3 dib"></li>`);
    });
    data.adUnits.forEach(function(item, unit) {
      $('#adUnitOptions').append(`<input type="radio" id="ad${item}" name="adUnit" value="${item}" class="mr2"><label for="ad${item}" class="mr3">${item}</label>`);
    });
    // onload, select the first adUnit
    $('input[type="radio"]:first').prop('checked', true).trigger('click');
  }
};
request.onerror = function() {
  // there was a connection error of some sort
};
request.send();

// click handler for the selected design option
$('#designOptions').on('click', 'li', function() {
  $('li.active').removeClass('active');
  $(this).addClass('active');

  // determine color option per design
  const designColorOption = $(this).find('img').data('option');
  $('#colorOptions').empty().append('<option disabled>Choose One</option>');
  $('#colorOptions option:first').attr('selected', 'selected');

  // remove hide class to show dropdown
  $('#colorVariant, #colorOptions').removeClass('hide');

  // reset preview window and background
  $('#previewWindow').attr('class', '').addClass(designColorOption);
  $('#positioningContainer').attr('class', '');
  $('.background').attr('class', 'background');

  // filter color options
  const colorOptions = new XMLHttpRequest();
  colorOptions.open('GET', 'creatives.json', true);
  colorOptions.onload = function() {
    if (colorOptions.status >= 200 && colorOptions.status < 400) {
      let data = JSON.parse(colorOptions.responseText);
      data.creatives.forEach(function(item) {
        if (item.label === designColorOption) {
          item.options.forEach(function(value, key) {
            let niceValue = value.replace('-', ' ');
            niceValue = titleCase(niceValue);
            $('#colorOptions').append(`<option value="${value}">${niceValue}</option>`);
            if (key === 0) {
              // console.log(true);
              $('#colorOptions').val(value).trigger('change');
            }
          });
        }
      });
    }
  };
  colorOptions.onerror = function() { };
  colorOptions.send();
});

// change background from color variant selection
$('select').change(function() {
  $('.background').attr('class', 'background');
  $('#positioningContainer').attr('class', '');
  $('#positioningContainer, .background').addClass($(this).val());
});

// adUnit selection handler
$(function(){
  // onchange, check for selected value
  $('input[type="radio"][name="adUnit"]').change(function(){
    const adUnitSelection = $(this).val();
    $('#previewWindowContainer').attr('class', 'ba b--black-40 flex items-center mt1 mb4').addClass(`ad${adUnitSelection}`);
  });
  // onload, trigger click
  $('#designOptions li:first-child').trigger('click');
});

// handlers for text change for copy and call-to-action
const headlineInput = $('input[name="headlineText"]');
const headline = $('#headlineText');
$(headlineInput).on('keyup blur change', function(e) {
  headline.text(headlineInput.val());
});

const copyInput = $('input[name="bannerText"]');
const copy = $('#bannerText');
$(copyInput).on('keyup blur change', function(e) {
  copy.text(copyInput.val());
});

const callToActionInput = $('input[name="callToActionText"]');
const callToAction = $('#callToAction');
$(callToActionInput).on('keyup blur change', function(e) {
  callToAction.text(callToActionInput.val());
});

// generate download links
$('#adDownload').on('mouseover', function(e) {
  html2canvas($('#previewWindowContainer')[0]).then(canvas => {
    const image = canvas.toDataURL('image/png').replace('image/png','application/octet-stream');
    const adUnitSelection = $('input[type="radio"][name="adUnit"]:checked').val();
    $('#adDownload').attr('href', image);
    $('#adDownload').attr('download', adUnitSelection + '-' + moment().format('X') + '.png');
  });
});

function titleCase(str) {
  str = str.toLowerCase().split(' ');
  for (var i = 0; i < str.length; i++) {
    str[i] = str[i].charAt(0).toUpperCase() + str[i].slice(1); 
  }
  return str.join(' ');
}