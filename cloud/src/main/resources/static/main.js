import { ArrayList } from "./util.js";
const selectedItems = new ArrayList();
const history = new ArrayList(5);
const visitedDirectory = new Map();
let nowDirectory = "";
let nowDirectoryElement = null;

function selectItem(element) {
    if(selectedItems.removeIfExists(element)) {
        element.style.border = "2px solid #F8E5D3";
    }
    else {
        element.style.border = "2px solid gray";
        selectedItems.add(element);
    }
}

function loadFiles(DirectoryName) {
    const params = new URLSearchParams({ directory: DirectoryName });
    fetch(`/load?${params.toString()}`, {
        method: "get",
    })
    .then((response) => {
        return response.json();
    })
    .then((json) => {
        const obj = JSON.parse(JSON.stringify(json));
        console.log(obj);
        nowDirectory = DirectoryName;
        const container = document.querySelector(".item-container");
        container.innerHTML = "";
        createlistGUI(obj);
        const clone = container.cloneNode(true);
        visitedDirectory.set(DirectoryName, clone);
    });
}

function handleFiles(files) {
    const formDate = new FormData();

    for (let i = 0; i < files.length; i++) {
        formDate.append("path", nowDirectory);
        formDate.append("files", files[i]);
    }

    fetch("/upload", {
        method: "post",
        body: formDate
    })
    .then(res => {
        if(res.ok) {
            loadFiles(nowDirectory);
        }
    });

    
}

function createlistGUI(list) {
    const container = document.querySelector(".item-container");
    const hierarchy = document.querySelectorAll(".hierarchy-root"); 
    const user = hierarchy[0];
    let parentDirectory = user;
    const pathSplit = nowDirectory.split("/");
    
    if(pathSplit[0] != "") {
        for(let i = 0; i < pathSplit.length; i++) {
            let isFind = false;
            const ulElement = parentDirectory.querySelector("ul");
            const list = ulElement.childNodes;
            for(let j = 0; j < list.length; j++) {
                let pathName = list[j].firstChild.getAttribute("name");
                // pathName = pathName.replace("ㄴ", "");
                if(pathName == pathSplit[i]) {
                    parentDirectory = list[j];
                    isFind = true;
                    break;
                }
            }
            if(!isFind)
                break;
        }
    }

    const ulElement = document.createElement("ul");

    for(let file of list) {
        let name = file.name;
        const type = file.type;
        const wrap = document.createElement("div");
        wrap.classList.add("item-wrap");
        const item = document.createElement("div");
        item.classList.add("item");
        const img = document.createElement("img");
        item.setAttribute("name", name);
        let extension = "";
        if(type == "file") {
            img.src = "/asset/file.png";
            img.style.height = "80%";
            const split = name.split(".");
            extension = split[split.length - 1];
            const regex = new RegExp(extension + "$");
            name = name.replace(regex, "");
        }
        else {
            img.src = "/asset/folder.png";
            const liElement = document.createElement("li");
            const pElement = document.createElement("p");
            pElement.textContent = "ㄴ " + name;
            pElement.setAttribute("name", name)
            liElement.appendChild(pElement);
            ulElement.appendChild(liElement);
        }
        item.appendChild(img);
        wrap.append(item);
        const p = document.createElement("p");
        let weight = 0;
        if(name.length > 7) {
            let cut = 0;
            for(let i = 0; i < name.length; i++) {
                const s = name.charAt(i);
                if(s == " " || !isNaN(s))
                    weight += 1;
                else
                    weight += 2;
                if(weight >= 14) {
                    if(i != name.length - 1) {
                        cut = i + 1;
                    }
                    break;
                }
            }
            if(cut != 0) {
                name = name.slice(0, cut) + "...";
            }
        }
        name += extension;
        p.textContent = name;
        wrap.appendChild(p);
        container.appendChild(wrap);
    }

    parentDirectory.appendChild(ulElement);
}

function goToFolder(folder) { //매개변수가 <P> or <div> 태그 요소임
    let path;
    let hierarchy;
    if(folder.tagName == "P" || folder.tagName == "H2") {
        path = getPath(folder);
        hierarchy = folder;
    }
    else {
        let folderName = folder.getAttribute("name");
        if(nowDirectory != "")
            folderName = `${nowDirectory}/${folderName}`;
        path = folderName;
        hierarchy = getHierarchy(path);
    }
    if(path == nowDirectory)
        return;
    if(nowDirectoryElement != null) {
        nowDirectoryElement.classList.remove("hierarchy-now");
    }
    hierarchy.classList.add("hierarchy-now");
    nowDirectoryElement = hierarchy;
    if(visitedDirectory.has(path)) {
        const element = visitedDirectory.get(path);
        const itemContainer = document.querySelector(".item-container");
        itemContainer.innerHTML = element.innerHTML;
        nowDirectory = path;
    }
    else {
        loadFiles(path);
    }
} 

function getPath(target) {
    let path = target.getAttribute("name");
    if(path == null)
        return "";
    let parent = target.parentElement.parentElement;
    while(parent.className != "hierarchy-root") {
        if(parent.tagName == "UL") {
            parent = parent.parentElement;
        }
        else if(parent.tagName == "LI") {
            path = parent.querySelector("p").getAttribute("name") + "/" + path;
            parent = parent.parentElement;
        }
    }
    return path;
}

function getHierarchy(path) {
    const hierarchy = document.querySelectorAll(".hierarchy-root"); 
    const user = hierarchy[0];
    let nextDirectory = user;
    const pathSplit = path.split("/");
    console.log(path);
    
    if(pathSplit[0] != "") {
        for(let i = 0; i < pathSplit.length; i++) {
            let isFind = false;
            const ulElement = nextDirectory.querySelector("ul");
            const list = ulElement.childNodes;
            for(let j = 0; j < list.length; j++) {
                let pathName = list[j].firstChild.getAttribute("name");
                if(pathName == pathSplit[i]) {
                    nextDirectory = list[j];
                    isFind = true;
                    break;
                }
            }
            if(!isFind)
                break;
        }
    }

    return nextDirectory.querySelector("p");
}

function downloadFile(url, fileName) {
    const a = document.createElement("a");
    a.href = url;
    // a.download = fileName;
    a.click();
}

function main() {
    loadFiles("");

    const dropArea = document.querySelector(".mainWrap");
    dropArea.addEventListener("dragover", function(e) {
        e.preventDefault(); 
        e.stopPropagation();
        e.dataTransfer.dropEffect = 'copy'; // 드랍 가능한 요소를 보여주는 시각적 피드백
    });

    dropArea.addEventListener("drop", function(e) {
        e.preventDefault(); 
        e.stopPropagation();

        const files = e.dataTransfer.files; 
        handleFiles(files); 
    });

    const uploadBtn = document.querySelector("#uploadBtn");
    uploadBtn.addEventListener("click", function() {
        const fileInput = document.querySelector("#fileInput");
        fileInput.click();
    });

    const fileInput = document.querySelector("#fileInput");
    fileInput.addEventListener("change", function(event) {
        if(event.target.files.length > 0) {
           handleFiles(event.target.files);
        }
    });

    const hierarchy = document.querySelector(".hierarchyWrap");
    hierarchy.addEventListener("click", (event) => {
        const target = event.target;
        if(target.tagName == "P") {
            goToFolder(target);
        }
        else if(target.tagName == "H2") {
            goToFolder(target);
        }
    });

    const itemContainer = document.querySelector(".item-container");
    itemContainer.addEventListener("click", (event) => {
        const target = event.target;
        let item = null;
        if(target.tagName == "IMG") {
            item = target.parentElement;
        }
        else if(target.tagName == "P") {
            item = target.parentElement.querySelector(".item");
        }
        else if(target.className == "item") {
            item = target;
        }
        if(item != null) {
            console.log(item.getAttribute('name'));
            selectItem(item);
        }
    });
    
    itemContainer.addEventListener("dblclick", (event) => {
        const target = event.target;
        let item = null;
        if(target.tagName == "IMG") {
            item = target.parentElement;
        }
        else if(target.tagName == "P") {
            item = target.parentElement.querySelector(".item");
        }
        else if(target.className == "item") {
            item = target;
        }
        if(item != null) {
            const img = item.querySelector("img");
            const split = img.src.split("/");
            const type = split[split.length - 1];
            if(type == "folder.png") {
                goToFolder(item);
            }
            for(let i = 0; i < selectedItems.size(); i++) {
                selectedItems.get(i).style.border = "2px solid #F8E5D3";
            }
            selectedItems.clear();
        }
    });

    const downloadBtn = document.querySelector("#downloadBtn");
    downloadBtn.addEventListener("click", () => {
        let url = "/download?";
        for(let i = 0; i < selectedItems.size(); i++) {
            const item = selectedItems.get(i);
            const name = item.getAttribute("name");
            url += `fileName=${encodeURIComponent(name)}&`;
        }
        url += `path=${encodeURIComponent(nowDirectory)}`;
        downloadFile(url, name);
    });
}

main();

