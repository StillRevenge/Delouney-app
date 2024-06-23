
let asd;
var data;
var points;
var boundaries;
var jsonData;
var pathFile;
var windowWidth = 1600.0,
    windowHeight = 750.0;
var scene;
var camera;
var renderer;
var isDragging = false;
var previousMousePosition = {
    x: 0,
    y: 0
};
window.electron.getFile((value) => {
    console.log('2');
    asd = value;
    document.getElementById("wait").style.display = "none";
})
const play = () => {
    getFromMain();
    renderScene();
};
// Функция для вычисления границ
function getFromMain() {
    pathFile = asd;
    data = window.electron.readjson(pathFile);
    jsonData = JSON.parse(data.replace(/'/g, '"'));
    points = jsonData.points;
    boundaries = jsonData.boundaries;
    extents = computeExtents(points);
}



//функция получения данных из файла
function computeExtents(points) {
    var extents = {
        "xmin": Number.MAX_VALUE,
        "xmax": -Number.MAX_VALUE,
        "ymin": Number.MAX_VALUE,
        "ymax": -Number.MAX_VALUE,
        "zmin": Number.MAX_VALUE,
        "zmax": -Number.MAX_VALUE
    };
    for (var i = 0; i < points.length; i++) {
        var p = points[i];
        if (p.x < extents.xmin) extents.xmin = p.x;
        if (p.y < extents.ymin) extents.ymin = p.y;
        if (p.x > extents.xmax) extents.xmax = p.x;
        if (p.y > extents.ymax) extents.ymax = p.y;
        if (p.z > extents.zmax) extents.zmax = p.z;
        if (p.z < extents.zmin) extents.zmin = p.z;
    }
    return extents;
}

// Функция для преобразования точки в сцену
function transformPointToScene(p) {
    var xfact = 200 / (extents.xmax - extents.xmin);
    var yfact = 200 / (extents.ymax - extents.ymin);
    var zfact = 4 / (extents.zmax - extents.zmin);
    return {
        "x": (p.x - extents.xmin) * xfact,
        "y": (p.y - extents.ymin) * yfact,
        "z": (p.z - extents.zmin) * zfact
    };
}

// Создает геометрию линии, представляющую ребра треугольника
function createTriangleEdges(triangle) {
    var material = new THREE.LineBasicMaterial({ color: 0xffffff }); // Изменен цвет линии на белый
    var p0 = transformPointToScene(points[triangle[0]]);
    var p1 = transformPointToScene(points[triangle[1]]);
    var p2 = transformPointToScene(points[triangle[2]]);
    var geometry = new THREE.Geometry();
    geometry.vertices.push(new THREE.Vector3(p0.x, p0.y, p0.z));
    geometry.vertices.push(new THREE.Vector3(p1.x, p1.y, p1.z));
    geometry.vertices.push(new THREE.Vector3(p2.x, p2.y, p2.z));
    geometry.vertices.push(new THREE.Vector3(p0.x, p0.y, p0.z)); // Замыкание граней
    return new THREE.Line(geometry, material);
}

// Обработчик события нажатия на колесико мыши для начала перемещения
function onMouseDown(event) {
    if (event.button === 1) { // Проверка, что нажата средняя кнопка мыши (колесико)
        isDragging = true;
        previousMousePosition.x = event.clientX;
        previousMousePosition.y = event.clientY;
    } else if (event.button === 0) { // Проверка, что нажата левая кнопка мыши
        isRotating = true;
        previousMousePosition.x = event.clientX;
        previousMousePosition.y = event.clientY;
    }
}

// Обработчик события отпускания кнопки мыши для завершения перемещения или вращения
function onMouseUp(event) {
    if (event.button === 1) { // Проверка, что отпущена средняя кнопка мыши (колесико)
        isDragging = false;
    } else if (event.button === 0) { // Проверка, что отпущена левая кнопка мыши
        isRotating = false;
    }
}
// Обработчик события движения мыши для вращения модели
function onMouseMove(event) {
    if (event.buttons === 1) { // Левая кнопка мыши
        var deltaMousePosition = {
            x: event.clientX - previousMousePosition.x,
            y: event.clientY - previousMousePosition.y
        };

        // Вращение модели вокруг своей оси в зависимости от движения мыши
        scene.rotation.y += deltaMousePosition.x * 0.01;
        scene.rotation.x += deltaMousePosition.y * 0.01;

        previousMousePosition.x = event.clientX;
        previousMousePosition.y = event.clientY;
    } else if (event.buttons === 4) { // Средняя кнопка мыши
        var deltaMousePosition = {
            x: event.clientX - previousMousePosition.x,
            y: event.clientY - previousMousePosition.y
        };

        // Перемещение модели в плоскости XY в зависимости от движения мыши
        scene.position.x += deltaMousePosition.x * 0.1;
        scene.position.y -= deltaMousePosition.y * 0.1; // Изменение знака для правильного направления движения

        previousMousePosition.x = event.clientX;
        previousMousePosition.y = event.clientY;
    }
}
function onMouseWheel(event) {
    // Определение направления прокрутки колесика мыши
    var zoomSpeed = event.deltaY > 0 ? 1.1 : 0.9;

    // Масштабирование модели
    camera.position.z *= zoomSpeed;

    // Ограничение максимального и минимального масштаба. Если нужны ограничения, раскомментируй строчки ниже
    //camera.position.z = Math.max(camera.position.z, 100);
    //camera.position.z = Math.min(camera.position.z, 1000);
}

// Это основная функция рендеринга. Она будет вызываться постоянно, снова и снова,
// в зависимости от возможной частоты кадров вашего устройства.
function render() {
    renderer.render(scene, camera);
    stopAnimation = requestAnimationFrame(function () { render(); });
}

function renderScene() {
    // Создать сцену
    scene = new THREE.Scene();

    // Создать камер
    camera = new THREE.PerspectiveCamera(75, windowWidth / windowHeight, 0.1, 1000);

    // Создание рендерера THREE
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setClearColor(0x000000); // Установка цвета фона рендерера на черный
    renderer.setSize(windowWidth, windowHeight);
    document.body.appendChild(renderer.domElement); // добавление его в DOM

    // Позиционирование и нацеливание камеры на центр сцены (0,0,0)
    camera.position.x = 0;
    camera.position.y = 0;
    camera.position.z = 500; // Изменено для перемещения камеры дальше
    camera.lookAt(new THREE.Vector3(0, 0, 0));

    var light = new THREE.HemisphereLight(0xffffbb, 0x080820, 2);
    scene.add(light);

    // Преобразование объектов в массивы для использования библиотеки Delaunay
    var vertices = new Array(points.length);
    for (var i = 0; i < points.length; i++) {
        vertices[i] = [points[i].x, points[i].y];
    }

    // ВАЖНО! Здесь мы вызываем метод триангуляции
    // Убедитесь, что ваши методы возвращают треугольники ПОСЛЕ усечения границ
    var triangles = computeTriangulation(points);
    if (Array.isArray(boundaries)) {
        triangles = pruneBoundaries(boundaries);
    }

    for (var i = 0; i < triangles.length; i++) {
        scene.add(createTriangleEdges(triangles[i]));
    }

    // Добавление вспомогательных осей
    var ah = new THREE.AxisHelper(50);
    scene.add(ah);
    // Добавление обработчиков событий для перемещения модели с помощью мыши
    document.addEventListener('mousedown', onMouseDown, false);
    document.addEventListener('mouseup', onMouseUp, false);
    document.addEventListener('mousemove', onMouseMove, false);
    document.addEventListener('wheel', onMouseWheel, false);
    // Вызов функции рендеринга. Это вызовет бесконечную рекурсию
    render();
}