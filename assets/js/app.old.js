// いろいろコピーしてきたコード群
// 使用していない

(function(global) {
  "use strict";

  global.app = global.app || {};

  global.app.core = (function (global) {

    var Star = function(options) {

      var color = options || options.color;

      //this.geometry = new THREE.SphereGeometry(200);
      //this.material = new THREE.MeshPhongMaterial({color: 0xffff00, specular: 0xffffff, shininess: 5});

      this.geometry = new THREE.SphereGeometry(2, 16, 16);
      //var material = new THREE.MeshPhongMaterial({
      //  side: THREE.FrontSide,
      //  shading: THREE.FlatShading,
      //  color: "#f00"
      //});
      this.material = new THREE.MeshLambertMaterial({ color: color });
      this.mesh = new THREE.Mesh( this.geometry, this.material );
      this.mesh.castShadow = true;
      this.mesh.receiveShadow = true;
      this.mesh.geometry.computeVertexNormals();

      return this.mesh;
    };
    Star.prototype = {};

    var run = function() {

      var renderer, scene, camera, light1, light2;

      //レンダラに対してカメラと光源の定義（初期化処理）
      renderer = new THREE.WebGLRenderer({antialias: true});
      renderer.setSize( window.innerWidth, window.innerHeight );
      document.body.appendChild( renderer.domElement );

      scene = new THREE.Scene();
      light1 = new THREE.DirectionalLight(0xffffff, 1.0);
      light1.position.set(-2, 1, 1).normalize();
      light2 = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.25);
      scene.add( light1 );
      scene.add( light2 );
      camera = new THREE.PerspectiveCamera(
        35,
        window.innerWidth / window.innerHeight,
        1,
        1000
      );
      camera.position.set(-7.5, 7.5, 7.5);
      camera.lookAt(scene.position);
      scene.add(camera);

      var moon = new Star(0xffc800);
      scene.add(moon);

      function render() {
        requestAnimationFrame(render);
        renderer.render(scene, camera);
      }

      render();

    };


    var run2 = function() {

      var scene, camera, renderer, stats;
      var texture;
      var light;
      var radius = 500;
      var angle = - 90;
      var degree = 0;
      var depression = 30;
      var radian = Math.PI/180;
      var center = new THREE.Object3D();

      window.onload = init;

      function init() {
        if (!Detector.webgl) Detector.addGetWebGLMessage();

        scene = new THREE.Scene();
        camera = new THREE.PerspectiveCamera(60, window.innerWidth/window.innerHeight, 0.1, 1000);
        scene.add(camera);
        light = new THREE.DirectionalLight(0xFFFFFF);
        scene.add(light);
        renderer = new THREE.WebGLRenderer({antialias: true});
        renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(renderer.domElement);
        setup();
        //initialize();
        THREE.ImageUtils.loadTexture("assets/world.jpg", undefined, loaded);

        stats = new Stats();
        stats.setMode(0);
        stats.domElement.style.position = "fixed";
        stats.domElement.style.right = "0px";
        stats.domElement.style.top = "0px";
        document.body.appendChild(stats.domElement);

        render();
        window.addEventListener("resize", resize, false);
      }
      function setup() {
        renderer.setClearColor(0x000000, 1);
        camera.position.z = -radius;
        light.position.set(-100, 110, -120);
      }
      function loaded(data) {
        texture = data;

        initialize();
      }
      function initialize() {
        var geometry = new THREE.SphereGeometry(150, 20, 20);
        var material = new THREE.MeshLambertMaterial({map: texture, color: 0xFFFFFF});
        material.emissive.set(0x333333);
        var sphere = new THREE.Mesh(geometry, material);
        scene.add(sphere);
      }
      function render() {
        requestAnimationFrame(render);

        angle -= 0.5;
        degree += 1;
        var dip = depression*Math.sin(degree*radian);
        camera.position.x = radius*Math.cos(angle*radian)*Math.cos(dip*radian);
        camera.position.y = radius*Math.sin(dip*radian);
        camera.position.z = radius*Math.sin(angle*radian)*Math.cos(dip*radian);
        camera.lookAt(center.position);

        renderer.render(scene, camera);

        stats.update();
      }
      function resize(event) {
        camera.aspect = window.innerWidth/window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
      }



    };

    return {
      run: run,
      run2: run2
    };

  })(global);

  //------------
  // Main
  //------------
  $(function(){

    global.app.core.run();

  });

})((typeof window === 'object' && window) || global);
