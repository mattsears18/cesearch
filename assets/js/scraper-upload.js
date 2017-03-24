$(function(){
  $('#file-button').click(function(e){
    $('#data').click();
  });

  $('#data').change(function(e){
    $(this).closest('form').submit();
  });
});
