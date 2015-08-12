(function(global) {
  "use strict";

  global.app = global.app || {};

  //-------------------------
  // parameterManager module
  //-------------------------
  global.app.parameterManager = (function (global) {

    var default_value_moon_speed = 0.50; // [日/秒]

    /**
     * @param event
     * @param ui
     */
    var handlerOfMoonDays = function(event, ui) {

      $( "#amount-moon-speed" ).val( ui.value );

    };

    /**
     *
     */
    var setEventHandlers = function() {

      $( "#slider-moon-speed" ).slider({
        orientation: "horizontal",
        range: "min",
        max: 15, // from 0
        step: 0.25,
        value: default_value_moon_speed, // default
        slide: handlerOfMoonDays,
        change: handlerOfMoonDays
      });
      $( "#amount-moon-speed" ).val( default_value_moon_speed );

    };

    /**
     *
     */
    var init = function() {

      setEventHandlers();

    };

    return {
      init: init
    };


  })(global);

  //-------------------------
  // moonDaysManager module
  //-------------------------
  global.app.moonDaysManager = (function (global) {

    /**
     * @param days
     */
    var update = function(days) {

      days = (Math.round(days * 100) % 2935) / 100;

      $('#moon-days').val(days);

    };

    return {
      update: update
    };

  })(global);

  //--------------------
  // moonManager module
  //--------------------
  global.app.moonManager = (function (global) {

    var container_size_rate = 0.8;

    /**
     * @param lightObj
     * @param baseTime
     * @param currentTime
     */
    var moveLight = function(lightObj, baseTime, currentTime) {

      var cycle_days = 29.53, // 月の周期[日]
          rad_per_day = (2 * Math.PI) / cycle_days, // 本来の速度[ラジアン/日]
          rate = $( "#amount-moon-speed" ).val(), // 1秒で何日進めるか（倍速機能）
          elapsed_days, x, y, z;

      elapsed_days = (currentTime - baseTime) / (1000 * 60 * 60 * 24); // 経過日数[日]
      elapsed_days = elapsed_days * (rate * (60 * 60 * 24)); // 表示用の値に変換する
      x = 4 * Math.sin( rad_per_day * elapsed_days );
      z = (-1) * 4 * Math.cos( rad_per_day * elapsed_days );
      y = 0.158;

      lightObj.position.set(x, y, z);

      global.app.moonDaysManager.update(elapsed_days);

    };

    /**
     *
     * Ref. 多彩な表現力のWebGLを扱いやすくする「Three.js」
     *      http://www.atmarkit.co.jp/ait/articles/1210/04/news142_5.html
     */
    var run = function() {

      if(!Detector.webgl) Detector.addGetWebGLMessage();

      var elm_container = $('#moon-shape-container');
      var renderer = new THREE.WebGLRenderer({ antialias:true });
      renderer.setSize(
        elm_container.width() * container_size_rate,
        elm_container.height() * container_size_rate
      );
      document.getElementById('moon-shape-container').appendChild(renderer.domElement);

      var scene = new THREE.Scene();

      /* +++++ Camera +++++ */
      var camera = new THREE.PerspectiveCamera(
        15, elm_container.width() / elm_container.height());
      camera.position.set(0, 0, 8);
      camera.lookAt(new THREE.Vector3(0, 0, 0));
      scene.add(camera);

      /* +++++ Light +++++ */
      var light = new THREE.DirectionalLight(0x858585, 1.0);
      // set(x, y, z)
      light.position.set(0, 0, -4); // 新月
      var ambient = new THREE.AmbientLight(0x000000);
      scene.add(light);
      scene.add(ambient);

      /* +++++ 球体 +++++ */
      var geometry = new THREE.SphereGeometry(1, 32, 16);
      var material = new THREE.MeshPhongMaterial({
        color: 0xffffff,
        specular: 0xcccccc,
        shininess: 10,
        ambient: 0xffffff,
        map: THREE.ImageUtils.loadTexture('img/moon.jpg') });
      var mesh = new THREE.Mesh(geometry, material);
      // 球体の初期表示面を調整する
      var axis = new THREE.Vector3(0, 2.2, - 0.5).normalize();
      var q = new THREE.Quaternion();
      q.setFromAxisAngle(axis, - Math.PI/2);
      mesh.quaternion.copy(q);
      scene.add(mesh);

      /* +++++ Stats ( https://github.com/mrdoob/stats.js/ ) +++++ */
      var stats = new Stats();
      stats.setMode( 1 );
      stats.domElement.style.position = 'absolute';
      stats.domElement.style.right = '0px';
      stats.domElement.style.top = '0px';
      document.body.appendChild( stats.domElement );

      /* +++++ Loop +++++ */
      var baseTime = +new Date;
      function render() {

        stats.begin();

        moveLight(light, baseTime, +new Date);

        renderer.render(scene, camera);

        stats.end();

        requestAnimationFrame(render);
      }
      render();

      /* +++++ For resizing +++++ */
      /*window.addEventListener('resize', function() {
        renderer.setSize(elm_container.width() * 0.8, elm_container.height() * 0.8);
        camera.aspect = elm_container.width() / elm_container.height();
        camera.updateProjectionMatrix();
      }, false );*/

    };

    return {
      run: run
    };

  })(global);

  //------------
  // Main
  //------------
  $(function(){

    global.app.parameterManager.init();
    global.app.moonManager.run();

  });

})((typeof window === 'object' && window) || global);
