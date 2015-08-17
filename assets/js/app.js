(function(global) {
  "use strict";

  global.app = global.app || {};

  //-------------------------
  // parameterManager module
  //-------------------------
  global.app.parameterManager = (function (global) {

    var default_value_moon_speed = 0.25, // [日/秒]
        default_value_moon_size;  // [px]

    var getDefaultValueMoonSize = function() {
      return default_value_moon_size;
    };

    /**
     * @param event
     * @param ui
     */
    var handlerOfMoonSpeed = function(event, ui) {

      $( "#amount-moon-speed" ).val( ui.value );

    };

    /**
     * @param event
     * @param ui
     */
    var handlerOfMoonSize = function(event, ui) {

      var moonManager = global.app.moonManager,
          renderer = moonManager.getRenderer(),
          camera = moonManager.getCamera(),
          size = ui.value;

      renderer.setSize(size, size);
      camera.aspect = size / size;
      camera.updateProjectionMatrix();

      $( "#amount-moon-size" ).val( size );

    };

    /**
     *
     */
    var setDefaultValues = function() {

      var containerElement = $('#moon-shape-container');

      default_value_moon_size = containerElement.width();

    };

    /**
     *
     */
    var setEventHandlers = function() {

      /* +++++ slider-moon-speed +++++ */
      $( "#slider-moon-speed" ).slider({
        orientation: "horizontal",
        range: "min",
        max: 5, // from 0
        step: 0.125,
        value: default_value_moon_speed, // default
        slide: handlerOfMoonSpeed,
        change: handlerOfMoonSpeed
      });
      $( "#amount-moon-speed" ).val( default_value_moon_speed );

      /* +++++ slider-moon-size +++++ */
      $( "#slider-moon-size" ).slider({
        orientation: "horizontal",
        range: "min",
        max: 500, // from 0
        step: 5,
        value: default_value_moon_size, // default
        slide: handlerOfMoonSize,
        change: handlerOfMoonSize
      });
      $( "#amount-moon-size" ).val( default_value_moon_size );

    };

    /**
     *
     */
    var init = function() {

      setDefaultValues();
      setEventHandlers();

    };

    return {
      init: init,
      getDefaultValueMoonSize: getDefaultValueMoonSize
    };


  })(global);

  //--------------------------------------------
  // moonDaysManager module （月齢管理モジュール）
  //--------------------------------------------
  global.app.moonDaysManager = (function (/*global*/) {

    /**
     * @param days
     */
    var update = function(days) {

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

    var renderer, camera, containerElement,
        x_prev, z_prev;

    var getRenderer = function() {
      return renderer;
    };

    var getCamera = function() {
      return camera;
    };

    var getContainerElement = function() {
      return containerElement;
    };

    /**
     * @param lightObj
     * @param baseTime
     * @param currentTime
     * @return {Boolean} - 変化があれば true, なければ false
     */
    var moveLight = function(lightObj, baseTime, currentTime) {

      var cycle_days = 29.53, // 月の周期[日]
          rad_per_day = (2 * Math.PI) / cycle_days, // 本来の速度[ラジアン/日]
          rate = $( "#amount-moon-speed" ).val(), // 1秒で何日進めるか（倍速機能）
          elapsed_days, x, y, z;

      elapsed_days = (currentTime - baseTime) / (1000 * 60 * 60 * 24); // 経過日数[日]
      elapsed_days = elapsed_days * (rate * (60 * 60 * 24)); // 表示用の値に変換する
      elapsed_days = (Math.round(elapsed_days * 100) % (parseInt(cycle_days * 100))) / 100;

      x = 4 * Math.sin( rad_per_day * elapsed_days );
      z = (-1) * 2 * Math.cos( rad_per_day * elapsed_days );
      y = 0.158;

      if (x === x_prev && z === z_prev) {
        return false;
      }

      lightObj.position.set(x, y, z);

      global.app.moonDaysManager.update(elapsed_days);

      x_prev = x;
      z_prev = z;

      return true;
    };

    /**
     *
     * Ref. 多彩な表現力のWebGLを扱いやすくする「Three.js」
     *      http://www.atmarkit.co.jp/ait/articles/1210/04/news142_5.html
     */
    var run = function() {

      if(!Detector.webgl) Detector.addGetWebGLMessage();

      var moon_size_default = global.app.parameterManager.getDefaultValueMoonSize();

      renderer = new THREE.WebGLRenderer({ antialias:true });
      renderer.setSize( moon_size_default, moon_size_default );
      document.getElementById('moon-shape-container').appendChild(renderer.domElement);

      var scene = new THREE.Scene();

      /* +++++ Camera +++++ */
      camera = new THREE.PerspectiveCamera(
        15, moon_size_default / moon_size_default);
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
      var geometry = new THREE.SphereGeometry(1, 32, 32);
      var material = new THREE.MeshPhongMaterial({
        color: 0xffffff,
        specular: 0xcccccc,
        shininess: 0,
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
      var baseTime = +new Date();
      function render() {

        stats.begin();

        if (moveLight(light, baseTime, +new Date())) {
          renderer.render(scene, camera);
        }

        stats.end();

        requestAnimationFrame(render);
      }
      render();

    };

    return {
      run: run,
      getRenderer: getRenderer,
      getCamera: getCamera,
      getContainerElement: getContainerElement
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
