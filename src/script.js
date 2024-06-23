// Извлечение тегов из разметки
let rightSide = window.document.querySelector('#file-right');
let title = window.document.querySelector('#title');
let textarea = window.document.getElementById("readyDots");
const textarea1 = document.getElementById("dots");
let createInput = window.document.querySelector('#create-input');
let saveIcon = window.document.querySelector('#save-icon');
let playIcon = window.document.querySelector('#play-icon');
let imgcont = window.document.querySelector('#image-container');
let fileopenname;
let right = window.document.querySelector('#right-side');
let left = window.document.querySelector('#left-side');
let showModel = window.document.querySelector('#showModel');
let imgId;
let FolderPath;
let dirFile;
// Получение списка файлов
const addFileListItem = (fileName) => {
    let div = window.document.createElement('div');
    let p = window.document.createElement('p');
    let i = window.document.createElement('i');
    p.innerText = fileName;
    p.className = 'file-name';
    i.className = 'material-icons file-icon';
    i.innerText = 'description';
    div.className = 'file-block';
    div.appendChild(i);
    div.appendChild(p);
    div.addEventListener('click', () => {
        imgcont.style.display = 'none';
        rightSide.style.display = 'block';
        title.innerText = fileName;
        textarea.value = window.electron.readFile(fileName, FolderPath[0]);
        fileopenname = fileName;
    });
    window.document.querySelector('#files').appendChild(div);
}
const getFileList = () => {
    let files = window.electron.getFileNames(FolderPath[0]);
    if (files) {
        let filesArray = files.split('\n');
        filesArray.map(elem => addFileListItem(elem));
    }

}


// Обработчики событий
const addIconClick = async () => {

    if (createInput.value) {
        window.electron.createFile(createInput.value, FolderPath[0]);
        window.location.reload();
    }
    /*
        const a = await window.electron.openDialog();
        console.log(a);
        */

}
const saveIconClick = () => {
    window.electron.writeFile(title.innerText, textarea.value, FolderPath[0]);
    saveIcon.style.color = 'var(--text-color)';
}
const textareaInput = () => {
    saveIcon.style.color = 'var(--active-color)';
}
const delIconClick = () => {
    window.electron.deleteFile(title.innerText, FolderPath[0]);
    window.location.reload();
}
function playIconClick() {
    dirFile = window.electron.getPath(fileopenname, FolderPath[0]);
    window.electron.rend(dirFile);
    console.log(dirFile);

}
//смена вкладок
function openCity(evt, cityName) {
    // Declare all variables
    var i, tabcontent, tablinks;
    document.getElementById("attention").style.display = "none";
    document.getElementById("savedots").style.display = "none";
    // Get all elements with class="tabcontent" and hide them
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }

    // Get all elements with class="tablinks" and remove the class "active"
    tablinks = document.getElementsByClassName("tablinks");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }

    // Show the current tab, and add an "active" class to the button that opened the tab
    document.getElementById(cityName).style.display = "block";
    evt.currentTarget.className += " active";
}
//вывод картинки 
function displayImage(event) {
    rightSide.style.display = 'none';
    document.getElementById("savedots").style.display = "none";
    imgcont.style.display = 'block';
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = function () {
        const imag = document.createElement('img');
        imag.id = "imgMap";
        console.log(imag);
        imag.src = reader.result;
        imgId = imag.id;
        console.log(imgId);
        document.getElementById('image').innerHTML = '';
        document.getElementById('image').appendChild(imag);
    }

    reader.readAsDataURL(file);

}
const createPoints = () => {
    console.log('1');
    // Загружаем изображение с помощью OpenCV.js
    if (typeof cv !== 'undefined') {
        console.log('OpenCV.js подключен');
    } else {
        console.log('OpenCV.js не найден');
    }
    let img = cv.imread(imgId);
    // Проверяем, удалось ли загрузить изображение
    if (img.empty()) {
        console.error('Не удалось загрузить изображение');
        return;
    } else {
        console.log('22');
    }

    // Преобразуем изображение в оттенки серого
    cv.cvtColor(img, img, cv.COLOR_RGBA2GRAY, 0);

    // Инициализируем массив для хранения точек трехмерного пространства
    const points = [];

    // Проходим по всем пикселям изображения
    for (let y = 0; y < img.rows; y = y + 10) {
        for (let x = 0; x < img.cols; x = x + 10) {
            // Получаем яркость пикселя
            const intensity = img.ucharPtr(y, x)[0];
            if (intensity == 0) {
                continue;
            }
            // Создаем объект точки в трехмерном пространстве
            const point = {
                x: x, // Координата x
                y: y, // Координата y
                z: intensity // Яркость пикселя, используем ее в качестве z-координаты
            };

            // Добавляем точку в массив
            points.push(point);
        }
    }

    // Выводим массив точек
    document.getElementById("savedots").style.display = "block";
    document.getElementById("imgMap").style.display = "none";
    imgcont.style.display = 'none';
    const textData = JSON.stringify(points);
    textarea1.value = textData;
}

const saveDots = () => {
    //создаем файл и сохраняем его с введенным названием
    const nameDots = document.getElementById("namedots");
    if (nameDots.value) {
        window.electron.createFile(nameDots.value, FolderPath[0]);
    }
    const points = textarea1.value; // Получаем массив точек
    const data = { points: JSON.parse(points) };
    const json = JSON.stringify(data, null, 4);
    window.electron.writeFile((nameDots.value + ".json"), json, FolderPath[0]);
    document.getElementById("savedots").style.display = "none";
    document.getElementById("attention").style.display = "block";
    window.location.reload();
}

function pickDir() {
    window.electron.openDialog();
    window.electron.getFolder((value) => {
        FolderPath = value;
        console.log(FolderPath[0]);
        getFileList();
    });

}