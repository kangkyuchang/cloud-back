import {ArrayList} from "./util.js";
const selectedItems = new ArrayList();

function selectItem(element) {
    if(selectedItems.contains(element)) {
        element.style.border = "2px solid gray";
        selectedItems.removeObject(element);
    }
    else {
        element.style.border = "2px solid #166aec";
        selectedItems.add(element);
    }
}

function handleFiles(files) {
    for (let i = 0; i < files.length; i++) {
        let file = files[i];
        console.log('Dropped file:', file.name);
    }
}

function main() {
    let itemElement = document.getElementsByClassName("item-wrap");
    for(let i = 0; i < itemElement.length; i++) {
        const element = itemElement[i];
        element.addEventListener("click", function() {
            selectItem(element.firstElementChild);
        });
    }

    let dropArea = document.querySelector(".mainWrap");
    dropArea.addEventListener("dragover", function(e) {
        e.preventDefault(); 
        e.stopPropagation();
        e.dataTransfer.dropEffect = 'copy'; // 드랍 가능한 요소를 보여주는 시각적 피드백
    });

    dropArea.addEventListener("drop", function(e) {
        e.preventDefault(); 
        e.stopPropagation();

        let files = e.dataTransfer.files; 
        handleFiles(files); 
    });
}

main();

