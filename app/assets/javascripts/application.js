// This is a manifest file that'll be compiled into application.js, which will include all the files
// listed below.
//
// Any JavaScript/Coffee file within this directory, lib/assets/javascripts, vendor/assets/javascripts,
// or any plugin's vendor/assets/javascripts directory can be referenced here using a relative path.
//
// It's not advisable to add code directly here, but if you do, it'll appear at the bottom of the
// compiled file.
//
// Read Sprockets README (https://github.com/rails/sprockets#sprockets-directives) for details
// about supported directives.
//
//= require jquery
//= require jquery.ui.all
//= require bootstrap-sprockets
//= require jquery_ujs
//= require turbolinks
//= require_tree .

$(document).ready( function () {

  // VARIABLES

  // Post is an object that we will fill with different methods

  var postIt = {};

  // this is a variable I will use later
  postIt.interval = null;
  

  // METHODS

  // 1. Animations

  postIt.randomBgcolor = function () {
  	var bgColors = ["#A0FFFF", "#FF7D00", "#FFF000", "#90F432", "#FF00AE", "#F8FF8F", "#D071BB"];
  	return bgColors[Math.floor(Math.random() * bgColors.length)];
  };

  postIt.assignColor = function () {

    var self = this;

    $posts = $('.post-it');

    $.each($posts, function (i, post) {
      var $post = $(post),
          bgColor = $post.data("bgcolor");
      $post.css("background-color", bgColor);
    });

  };

  postIt.changeToForm = function (elem) {

    var $elem = $(elem),
        content = $elem.html(),
        order = $elem.data("order"),
        id = $elem.data("id");
    $elem.html("<textarea data-id='" + id + "' data-order='" + order + "' class='post-it--input " + "i-" + id + "' rows='10'>" + content + "</textarea>");
    $('.i-' + id).focus();

  };

  postIt.disco = function (clicked) {

    if (clicked) {

      var $posts = $('.post-it');

      var colorChange = function () {

        $.each($posts, function (i, post) {
          var $post = $(post);
          $post.data("bgcolor", postIt.randomBgcolor());
          var bgColor = $post.data("bgcolor");
          $post.css("background-color", bgColor);
        });
      }

      $('body').animate({backgroundColor: "#000"}, 'slow');

      // Because I want to control the interval depending on the conditonal statement
      // I've set it equal to an obj property so that I can use it throughout my obj

      postIt.interval = setInterval(colorChange, 500);

    } else {

      $('body').animate({backgroundColor: "#FFF"}, 'slow');

      // Here I am calling it again and updating it.

      clearInterval(postIt.interval);
    }
    
  };

  // 2. Ajax 

  postIt.ajaxPost = function (content) {

    // post posts to the post_controller :)
    
    // build a data obj so that our ajax request is written a little cleaner

  	var data = {
  		post: {
        order: 0,
	  	  content: content,
	  	  background: postIt.randomBgcolor()
	    }
	  };

    $.ajax({
      method: "POST",
      url: "/posts",
      data: data,
      dataType: "json",
      complete: function () {

        // After we post to the server we want to retrieve it immediately and add it to our list

      	postIt.append();

      }
    });

  };
  
  postIt.append = function () {

    $.ajax({
      method: "GET",
      dataType: "json",
      url: "/",
      success: function (data) {

        console.log(data);

        // see post_controller 

        var newestPost = data.last_post;
        $('.post-it-container').prepend('<div class="post-it col-md-3" data-id="' + newestPost.id + '" data-bgcolor="' + newestPost.background + '">' + newestPost.content + '</div>');
        
        //Now that we've created the newest element, we can assign its color

        postIt.assignColor();

        // We also want to save the order of the post immediately

        postIt.ajaxUpdate();
      }
    });

  };

  postIt.ajaxUpdate = function () {

    //jquery ui method returns an array of the order of posts
    // based on their id attributes

    var ids = $('.post-it-container').sortable("toArray", {
      attribute: "data-id"
    });


    $.ajax({
      method: "POST",
      dataType: "script",
      url: "/update_order",
      data: {
        ids: ids,
        _method: "put"
      },
      complete: function () {
        console.log("order updated");
      }
    });

  };

  postIt.collectTextAreas = function () {

    if ($('.post-it--input').length) {

      var $inputs = $('.post-it--input');

      $.each($inputs, function (i, input) {
        var $input = $(input);

        var post = {
          id: $input.data("id"),
          order: $input.data("order"),
          content: $input.val()
        };

        //this will update the each post that has turned into a text area

        postIt.updatePost(post);

      });

    } else {

      console.log("nothing to save");

    }

  };

  postIt.updatePost = function (post) {
    $.ajax({
      method: "POST",
      dataType: "script",
      url: "/posts/" + post.id,
      data: {
        post,
        _method: "put"
      },
      complete: function () {
        console.log("post updated!");
      }
    });
  };

  postIt.destroyAll = function () {

    if (postIt.interval) {
      postIt.disco(false);
      clearInterval(postIt.interval)
    }

    var $posts = $('.post-it');

    $.each($posts, function (i, post) {

      var id = $(post).data("id");

      $.ajax({
        method: "POST",
        dataType: "script",
        url: "/posts/" + id,
        data: {
          id,
          _method: "delete"
        },
        complete: function () {
          $(post).fadeOut(100);
        }
      });

    });
    
  };

  // assign colors once the document is ready

  postIt.assignColor();


  // EVENT HANDLERS

  $('.post-it-form--submit').on("click", function (event) {

    // propagation is when a parent element is affected by event, such as a click.

  	event.stopPropagation();

    // stop the default action. We are going to tell it what to do when this event happens

    event.preventDefault();

  	var content = $('.post-if-form--content');

    postIt.ajaxPost(content.val());

    //clear the text-area
    content.val("");

  });

  //jquery ui
  $('.post-it-container').sortable({

    update: function (event, ui) {
      postIt.ajaxUpdate()
    }
  }).disableSelection();


  $('.post-it-container').on("dblclick", ".post-it", function (event){
    
    event.stopPropagation();
    event.preventDefault();

    var $this = $(event.target);

    //it is important to specify if the target is textarea already or not

    if ($this.is($('textarea')) || $this.children().is($('textarea'))) {

      console.log("already a text area");

    } else {

      // send this element to the change to form method where it will be changed to a form

      postIt.changeToForm($this);

    }

  });

  $(".destroy").on("click", function (event) {
    event.stopPropagation();
    event.preventDefault();

    postIt.destroyAll();

    location.reload();
  });

  $(".save").on("click", function (event){

    // manual save option, if you must

    event.stopPropagation();
    event.preventDefault();

    postIt.collectTextAreas();

  });

  //autosave

  setInterval(function () {
    postIt.collectTextAreas()
  }, 10000);

  // and a disco function because we like to party 

  var i = 0;

  $(".disco").on("click", function (event) {

    var clicked = null;

    event.stopPropagation();
    event.preventDefault();

    i = i + 1;

    if (i % 2 == 1) {
      clicked = true;
    } else if (i % 2 == 0) {
      clicked = false;
    };

    postIt.disco(clicked);
  });

});