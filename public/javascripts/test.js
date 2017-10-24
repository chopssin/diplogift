var TEST = {
  run: function() {
    var AT = Acatool.build(false);
    AT.fetchData();

    var str = '';
    for(var i = 0; i < AT.data.length; i++) {
      if(AT.data[i].hasOwnProperty('images')) {
        str += '<p><span>' + AT.data[i].id + '</span>' + AT.data[i].name + '</p>';
      }
    }
    $( '#print' ).html( str );
  }
}

TEST.run();
